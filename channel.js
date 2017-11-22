function Channel(config) {
  var audioDecoder = new AudioDecoder();
  var player = new Player();
  var settings = {
    title: config.title || '',

    soundbar: null,
    soundBuffers: {}
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
    player.setLoop(loop);
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
        audioDecoder.decode(f, onDecoded(filename));
      }
      else {
        console.log('Sound \'' + filename + '\' is already added.');
      }
    }
  }

  function onDecoded(filename) {
    return function (buffer) {
      settings.soundBuffers[filename] = buffer;
      console.log('Finished: Adding sound \'' + filename + '\'...');

      appendNewElm(settings.soundbar, 'div', {'class': 'btn'}, function (btn) {
        btn.innerText = filename;
        btn.addEventListener('click', createPlaySoundCallback(btn, filename), false);
      });
    };
  }

  function createPlaySoundCallback(self, filename) {
    var playing = false;

    function playSound() {
      player.play(settings.soundBuffers[filename], clear);

      self.classList.add('active');
      playing = true;
    }

    function stopSound() {
      player.stop();
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