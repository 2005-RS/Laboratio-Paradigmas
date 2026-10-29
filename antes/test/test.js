var val = require('../libs/unalib');
var assert = require('assert');


describe('unalib', function(){


  describe('funcion is_valid_phone', function(){

    it('deberia devolver true para 8297-8547', function(){

      assert.equal(val.is_valid_phone('8297-8547'), true);

    });

    it('deberia devolver false para 8297p-8547', function(){

      assert.equal(val.is_valid_phone('8297p-8547'), false);

    });

  });


  describe('funcion is_valid_url_image', function(){

    it('deberia devolver true para http://image.com/image.jpg', function(){

      assert.equal(val.is_valid_url_image('http://image.com/image.jpg'), true);

    });

    it('deberia devolver true para http://image.com/image.gif', function(){

      assert.equal(val.is_valid_url_image('http://image.com/image.gif'), true);

    });
    
  });

  describe('funcion is_valid_yt_video', function(){

    it('deberia devolver true para un video de YouTube', function(){

      assert.equal(val.is_valid_yt_video('https://www.youtube.com/watch?v=qYwlqx-JLok'), true);

    });

    it('rechaza un script disfrazado de video', function(){

      assert.equal(val.is_valid_yt_video('<script>alert(1)</script>'), false);

    });

  });

  describe('validateMessage', function(){

    it('muestra una imagen cuando la URL termina en jpg', function(){

      var out = JSON.parse(val.validateMessage(JSON.stringify({
        mensaje: 'http://image.com/image.jpg'
      })));

      assert.ok(out.mensaje.indexOf('<img') === 0);
      assert.ok(out.mensaje.indexOf('http://image.com/image.jpg') !== -1);

    });

    it('inserta el reproductor cuando la URL es de YouTube', function(){

      var out = JSON.parse(val.validateMessage(JSON.stringify({
        mensaje: 'https://www.youtube.com/watch?v=qYwlqx-JLok'
      })));

      assert.ok(out.mensaje.indexOf('https://www.youtube.com/embed/qYwlqx-JLok') !== -1);

    });

    it('escapa un script para que no se ejecute', function(){

      var out = JSON.parse(val.validateMessage(JSON.stringify({
        mensaje: "<script>alert('Inyección de script');</script>"
      })));

      assert.equal(out.mensaje.indexOf('<script'), -1);
      assert.ok(out.mensaje.indexOf('&lt;script&gt;') !== -1);

    });

    it('no acepta una imagen con comillas que cierren el atributo', function(){

      assert.equal(val.is_valid_url_image('http://evil.com/a.jpg"><script>'), false);

    });

  });

});







