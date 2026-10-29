var fs = require('fs');
var path = require('path');
var express = require('express');
var http = require('http');
var { Server } = require('socket.io');
var { auth, requiresAuth } = require('express-openid-connect');
var validation = require('./libs/unalib');
var gate = require('./libs/auth-gate');

loadEnvFile(path.join(__dirname, '.env'));

var app = express();
var server = http.createServer(app);
var io = new Server(server);
var port = process.env.PORT || 3000;
var authReady = gate.isAuthConfigured(process.env);
var authMiddleware = null;

app.set('trust proxy', 1);

if (authReady) {
  authMiddleware = auth({
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET,
    baseURL: process.env.AUTH0_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    authorizationParams: {
      response_type: 'code',
      scope: 'openid profile email'
    },
    routes: {
      login: '/login',
      logout: '/logout',
      callback: '/callback'
    }
  });
  app.use(authMiddleware);
}

app.get('/auth-error', function (req, res) {
  var reason = req.query.reason === 'cancelado' ? 'cancelado' : 'fallo';
  res.status(200).type('html').send(errorPage(gate.loginFailureMessage(reason)));
});

app.get('/api/me', function (req, res) {
  if (!authReady || !req.oidc || !req.oidc.isAuthenticated()) {
    return res.status(401).json({ error: 'auth' });
  }
  var user = req.oidc.user || {};
  res.json({
    name: gate.displayName(user),
    email: user.email || '',
    picture: user.picture || ''
  });
});

app.get('/', function (req, res) {
  if (!authReady) {
    return res.status(503).type('html').send(setupPage());
  }
  return requiresAuth()(req, res, function () {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
});

io.use(function (socket, next) {
  if (!authReady) {
    return next(new Error('Auth0 no está configurado'));
  }
  attachSession(socket.request, function (err) {
    if (err || !socket.request.oidc || !socket.request.oidc.isAuthenticated()) {
      return next(new Error('Se requiere iniciar sesión'));
    }
    socket.data.displayName = gate.displayName(socket.request.oidc.user);
    next();
  });
});

io.on('connection', function (socket) {
  socket.on('Evento-Mensaje-Server', function (msg) {
    var parsed;
    try {
      parsed = JSON.parse(msg);
    } catch (e) {
      return;
    }
    if (!parsed || typeof parsed !== 'object') return;
    io.emit('Evento-Mensaje-Server', processChatMessage(msg, socket.data.displayName));
  });
});

app.use(function (err, req, res, next) {
  if (res.headersSent) return next(err);
  var reason = gate.loginFailureReason(err);
  res.redirect('/auth-error?reason=' + reason);
});

if (require.main === module && !process.env.VERCEL) {
  server.listen(port, function () {
    console.log('UNA Chat en http://localhost:' + port);
  });
}

module.exports = app;
module.exports.processChatMessage = processChatMessage;

function processChatMessage(msg, displayName) {
  var parsed;
  try {
    parsed = JSON.parse(msg);
  } catch (e) {
    return validation.validarMensaje(JSON.stringify({ mensaje: '' }));
  }
  if (!parsed || typeof parsed !== 'object') {
    return validation.validarMensaje(JSON.stringify({ mensaje: '' }));
  }
  parsed.nombre = displayName || 'Usuario';
  if (typeof parsed.mensaje !== 'string') parsed.mensaje = '';
  if (typeof parsed.color !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(parsed.color)) {
    parsed.color = '#0b6b3a';
  }
  return validation.validarMensaje(JSON.stringify(parsed));
}

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach(function (line) {
    var trimmed = line.trim();
    if (!trimmed || trimmed.charAt(0) === '#') return;
    var eq = trimmed.indexOf('=');
    if (eq === -1) return;
    var key = trimmed.slice(0, eq).trim();
    var value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  });
}

function attachSession(req, done) {
  if (!authMiddleware) return done(new Error('auth middleware missing'));
  var res = {
    statusCode: 200,
    headers: {},
    setHeader: function (name, value) { this.headers[name] = value; },
    getHeader: function (name) { return this.headers[name]; },
    removeHeader: function (name) { delete this.headers[name]; },
    cookie: function () {},
    clearCookie: function () {},
    append: function () {},
    redirect: function () { return this; },
    status: function (code) { this.statusCode = code; return this; },
    send: function () { return this; },
    json: function () { return this; },
    end: function () { return this; },
    write: function () { return true; },
    writeHead: function () { return this; }
  };
  authMiddleware(req, res, done);
}

function setupPage() {
  return pageShell('Falta la configuración de Auth0',
    '<p>UNA Chat no puede abrir el chat hasta que existan las variables de entorno.</p>' +
    '<p>Copia <code>.env.example</code> a <code>.env</code>, completa los valores y vuelve a iniciar el servidor.</p>' +
    '<p>No pongas secretos en el repositorio.</p>');
}

function errorPage(message) {
  return pageShell('Inicio de sesión',
    '<p>' + escapeHtml(message) + '</p>' +
    '<p><a href="/login">Intentar de nuevo</a></p>');
}

function pageShell(title, body) {
  return '<!doctype html><html lang="es"><head><meta charset="utf-8"><title>' +
    escapeHtml(title) + '</title><style>body{font:16px Georgia,serif;margin:48px auto;max-width:36rem;color:#1c1917}a{color:#0b6b3a}</style></head><body><h1>' +
    escapeHtml(title) + '</h1>' + body + '</body></html>';
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
