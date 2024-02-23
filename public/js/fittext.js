(function(){
    const canvas = document.createElement("canvas"); 
    const context = canvas.getContext("2d"); 

    var addEvent = function (el, type, fn) {
      if (el.addEventListener)
        el.addEventListener(type, fn, false);
          else
              el.attachEvent('on'+type, fn);
    };
    
    var extend = function(obj,ext){
      for(var key in ext)
        if(ext.hasOwnProperty(key))
          obj[key] = ext[key];
      return obj;
    };
  
    window.fitText = function (el, kompressor, options) {
  
      var settings = extend({
        'minFontSize' : -1/0,
        'maxFontSize' : 1/0,
        'font' : "monospace"
      },options);
  
      var fit = function (el) {
        var compressor = kompressor || 1;
  
        var resizer = function () {
          const bounds = el.getBoundingClientRect()
          const width = bounds.width * compressor
          const height = bounds.height * compressor

          if (bounds.width == 0)
            return setTimeout(resizer, 100)

          // 16px is the test value because it scales linearly
          const test_val = 16
          context.font = `${test_val}px ${settings.font}`
          const measure = context.measureText(el.innerHTML)
          const font_size = test_val*Math.min(width/measure.width, height/measure.height)
          el.style.fontSize = font_size+"px"
        };
  
        // Call once to set.
        resizer();

        addEvent(window, 'resize', resizer);
        addEvent(window, 'orientationchange', resizer);
      };
  
      if (el.length)
        for(var i=0; i<el.length; i++)
          fit(el[i]);
      else
        fit(el);
  
      // return set of elements
      return el;
    };
  })();