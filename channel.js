function Channel(config) {
  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  var settings = {
    title: config.title || '',

    soundbar: null,
    soundBuffers: {},
    loop: false
  };

  this.getDom = function() {
    return newElm('div', {'class': 'channel'}, function(channel) {

      appendNewElm(channel, 'h2', {}, function (header) {
        header.innerText = settings.title;
      });

      appendNewElm(channel, 'div', {'class': 'controls'}, function (controls) {
        appendNewElm(controls, 'label', {}, function (lbl) {
          appendNewElm(lbl, 'input', {'type': 'checkbox'}, function (loop) {
            loop.addEventListener('change', changeLoop, false);
          });
          appendNewElm(lbl, 'span', {}, function (lblText) {
            lblText.innerText = ' Loop';
          });
        });
      });

      settings.soundbar = appendNewElm(channel, 'div', {'class': 'sound-bar'});

      appendNewElm(channel, 'div', {'class': 'drop-zone'}, function (dropzone) {
        dropzone.innerText = '+';
        dropzone.addEventListener('dragover', allowDroppingOfFiles, false);
        dropzone.addEventListener('drop', addSounds, false);
      });
    });
  };

  function appendNewElm(parent, tag, attrs, callback) {
    var elm = newElm(tag, attrs, callback);
    parent.appendChild(elm);
    return elm;
  }
  function newElm(tag, attrs, callback) {
    attrs = attrs || {};
    var elm = document.createElement(tag);
    var keys = Object.keys(attrs);
    for (var i = 0, l = keys.length; i < l; ++i) {
      var key = keys[i];
      elm.setAttribute(key, attrs[key]);
    }

    if(callback) { callback(elm); }

    return elm;
  }

  function changeLoop(evt) {
    var loop = evt.target.checked;
    console.log(settings.title, loop);
    settings.loop = loop;
  }

  function allowDroppingOfFiles(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
  }

  function addSounds(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files;

    for (var i = 0, f; f = files[i]; i++) {
      var filename = f.name;
      var sound = settings.soundBuffers[filename];
      if (!sound) {
        console.log('Start: Adding sound \'' + filename + '\'...');
        appendNewElm(settings.soundbar, 'div', {'class': 'btn'}, function (btn) {
          btn.innerText = filename;
          btn.addEventListener('click', createPlaySoundCallback(btn, filename), false);
        });

        var reader = new FileReader();
        reader.onload = createReaderOnloadCallback(filename);

        reader.readAsArrayBuffer(f);
      }
      else {
        console.log('Sound \'' + filename + '\' is already added.');
      }
    }
  }

  function createReaderOnloadCallback(filename) {
    return function (e) {
      audioCtx.decodeAudioData(e.target.result, function (buffer) {
          settings.soundBuffers[filename] = buffer;
          console.log('Finished: Adding sound \'' + filename + '\'...');
        },
        function (e) {
          console.log('Error with decoding audio data, \'' + filename + '\'' + e.err);
        }
      );
    }
  }

  function createPlaySoundCallback(self, filename) {
    var playing = false;
    var source;

    function playSound() {
      source = audioCtx.createBufferSource();
      source.connect(audioCtx.destination);
      source.buffer = settings.soundBuffers[filename];
      source.loop = settings.loop;
      source.onended = clear;
      source.start();

      self.classList.add('active');

      playing = true;
    }

    function stopSound() {
      source.loop = false;
    }

    function clear() {
      self.classList.remove('active');
      playing = false;
    }

    return function (e) {
      if(playing) {
        stopSound();
      }
      else {
        playSound();
      }
    }
  }

  return this;
}