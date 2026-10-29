var { processChatMessage } = require('../../server');

describe('backend y una-lib', function () {
  test('acepta una URL de imagen y deja el nombre de quien escribe', function () {
    var out = JSON.parse(processChatMessage(JSON.stringify({
      mensaje: 'http://image.com/image.jpg',
      color: '#0b6b3a'
    }), 'Eli'));

    expect(out.nombre).toBe('Eli');
    expect(out.mensaje).toContain('<img');
    expect(out.mensaje).toContain('http://image.com/image.jpg');
  });

  test('acepta una URL de video de YouTube', function () {
    var out = JSON.parse(processChatMessage(JSON.stringify({
      mensaje: 'https://www.youtube.com/watch?v=qYwlqx-JLok'
    }), 'Eli'));

    expect(out.mensaje).toContain('https://www.youtube.com/embed/qYwlqx-JLok');
  });

  test('sanea un script y no lo devuelve ejecutable', function () {
    var out = JSON.parse(processChatMessage(JSON.stringify({
      mensaje: "<script>alert('Inyección de script');</script>"
    }), 'Eli'));

    expect(out.mensaje).not.toContain('<script');
    expect(out.mensaje).toContain('&lt;script&gt;');
  });
});
