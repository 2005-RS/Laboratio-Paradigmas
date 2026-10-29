function isAuthConfigured(env) {
  var source = env || process.env;
  var keys = [
    'AUTH0_SECRET',
    'AUTH0_BASE_URL',
    'AUTH0_CLIENT_ID',
    'AUTH0_ISSUER_BASE_URL',
    'AUTH0_CLIENT_SECRET'
  ];
  return keys.every(function (key) {
    return source[key] && String(source[key]).trim();
  });
}

function loginFailureReason(err) {
  var blob = [
    err && err.error,
    err && err.error_description,
    err && err.message
  ].filter(Boolean).join(' ').toLowerCase();

  if (blob.indexOf('access_denied') !== -1 || blob.indexOf('cancel') !== -1) {
    return 'cancelado';
  }
  return 'fallo';
}

function displayName(user) {
  if (!user) return 'Usuario';
  return user.name || user.nickname || user.email || 'Usuario';
}

function loginFailureMessage(reason) {
  if (reason === 'cancelado') {
    return 'Cancelaste el inicio de sesión. Puedes intentarlo de nuevo.';
  }
  return 'No se pudo iniciar sesión. Revisa la conexión e inténtalo de nuevo.';
}

module.exports = {
  isAuthConfigured: isAuthConfigured,
  loginFailureReason: loginFailureReason,
  displayName: displayName,
  loginFailureMessage: loginFailureMessage
};
