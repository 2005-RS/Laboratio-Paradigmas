var assert = require('assert');
var request = require('supertest');
var gate = require('../libs/auth-gate');

describe('auth-gate', function () {
  it('reconoce una configuración completa', function () {
    assert.equal(gate.isAuthConfigured({
      AUTH0_SECRET: 's',
      AUTH0_BASE_URL: 'http://localhost:3000',
      AUTH0_CLIENT_ID: 'id',
      AUTH0_ISSUER_BASE_URL: 'https://tenant.us.auth0.com',
      AUTH0_CLIENT_SECRET: 'secret'
    }), true);
  });

  it('rechaza una configuración incompleta', function () {
    assert.equal(gate.isAuthConfigured({ AUTH0_SECRET: 's' }), false);
  });

  it('distingue una cancelación de un fallo', function () {
    assert.equal(gate.loginFailureReason({ error: 'access_denied' }), 'cancelado');
    assert.equal(gate.loginFailureReason({ message: 'user cancelled' }), 'cancelado');
    assert.equal(gate.loginFailureReason({ message: 'timeout' }), 'fallo');
  });

  it('arma el nombre visible sin inventar datos', function () {
    assert.equal(gate.displayName({ nickname: 'eli' }), 'eli');
    assert.equal(gate.displayName(null), 'Usuario');
  });
});

describe('UNA Chat sin credenciales', function () {
  var app;

  before(function () {
    this.timeout(10000);
    [
      'AUTH0_SECRET',
      'AUTH0_BASE_URL',
      'AUTH0_CLIENT_ID',
      'AUTH0_ISSUER_BASE_URL',
      'AUTH0_CLIENT_SECRET'
    ].forEach(function (key) {
      process.env[key] = ' ';
    });
    delete require.cache[require.resolve('../server')];
    app = require('../server');
  });

  it('no abre el chat si Auth0 no está configurado', function () {
    return request(app)
      .get('/')
      .expect(503)
      .expect(/configuración de Auth0/);
  });

  it('explica la cancelación y ofrece reintentar', function () {
    return request(app)
      .get('/auth-error?reason=cancelado')
      .expect(200)
      .expect(/Cancelaste el inicio de sesión/)
      .expect(/Intentar de nuevo/);
  });

  it('no entrega la identidad sin sesión', function () {
    return request(app)
      .get('/api/me')
      .expect(401);
  });
});
