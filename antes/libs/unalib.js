// modulo de ejemplo.

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = {


    // logica que valida si un telefono esta correcto...
    is_valid_phone: function (phone) {
      // inicializacion lazy
      var isValid = false;
      // expresion regular copiada de StackOverflow
      var re = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/i;
  
      // validacion Regex
      try {
        isValid = re.test(phone);
      } catch (e) {
        console.log(e);
      } finally {
          return isValid;
      }
      // fin del try-catch block
    },
  
    is_valid_url_image: function (url) {
      var re = /^https?:\/\/(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<>"']*)?\.(?:jpg|jpeg|png|gif|bmp)(?:\?[^\s<>"']*)?$/i;
      try {
        return re.test(url);
      } catch (e) {
        return false;
      }
    },
  
    is_valid_yt_video: function (url) {
      var re = /^https?:\/\/(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([A-Za-z0-9_-]{11})(?:[^\s<>"']*)?$/i;
      try {
        return re.test(url);
      } catch (e) {
        return false;
      }
    },
  
    getYTVideoId: function(url){
      var match = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([A-Za-z0-9_-]{11})/i);
      return match ? match[1] : '';
    },
  
    getEmbeddedCode: function (url){
      var id = this.getYTVideoId(url);
      if (!id) return escapeHtml(url);
      return '<iframe width="560" height="315" src="https://www.youtube.com/embed/' + id + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    },
  
    getImageTag: function(url){
      return '<img src="' + escapeHtml(url) + '" style="max-height: 400px;max-width: 400px;">';
    },
  
    validateMessage: function(msg){
      if (!msg || typeof msg !== 'string') {
        return JSON.stringify({ mensaje: '' });
      }

      try {
        var obj = JSON.parse(msg);
        if (!obj || typeof obj !== 'object') {
          return JSON.stringify({ mensaje: '' });
        }
        var text = typeof obj.mensaje === 'string' ? obj.mensaje.trim() : '';

        if (this.is_valid_url_image(text)) {
          obj.mensaje = this.getImageTag(text);
        } else if (this.is_valid_yt_video(text)) {
          obj.mensaje = this.getEmbeddedCode(text);
        } else {
          obj.mensaje = escapeHtml(text);
        }

        return JSON.stringify(obj);
      } catch (e) {
        return JSON.stringify({ mensaje: escapeHtml(msg) });
      }
    },

    validarMensaje: function (msg) {
      return this.validateMessage(msg);
    }
  
  
  
    
    
  
  // fin del modulo
  };
  