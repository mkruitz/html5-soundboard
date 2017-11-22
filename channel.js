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

      appendNewElm(channel, 'div', {'class':'channel-header'}, function (channelHeader) {
        appendNewElm(channelHeader, 'h2', {}, function (header) {
          header.innerText = settings.title;
        });

        appendNewElm(channelHeader, 'div', {'class': 'controls'}, function (controls) {
          appendNewElm(controls, 'label', {}, function (lbl) {
            appendNewElm(lbl, 'input', {'type': 'checkbox'}, function (loop) {
              loop.addEventListener('change', changeLoop, false);
            });
            appendNewElm(lbl, 'span', {}, function (lblText) {
              lblText.innerText = ' Loop';
            });
          });
        });
      });

      settings.soundbar = appendNewElm(channel, 'div', {'class': 'channel-body sound-bar drop-zone'}, function(soundBar) {
        soundBar.addEventListener('dragover', allowDroppingOfFiles, false);
        soundBar.addEventListener('drop', addSounds, false);
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
      if (!settings.soundBuffers[filename]) {
        console.log('Start: Adding sound \'' + filename + '\'...');
        audioDecoder.decode(f, onDecoded(filename));
      }
      else {
        console.log('Sound \'' + filename + '\' is already added.');
      }
    }
  }

  function onDecoded(filename) {
    var playing = false;
    var current;

    return function (buffer) {
      settings.soundBuffers[filename] = true;
      console.log('Finished: Adding sound \'' + filename + '\'...');

      appendNewElm(settings.soundbar, 'div', {'class': 'btn'}, function (btn) {
        btn.addEventListener('click', playSound, false);
        appendNewElm(btn, 'span', {}, function (text) {
          text.innerText = filename;
        });
        appendNewElm(btn, 'span', {'style':'float:right;'}, function (btnGroup) {
          btnGroup.addEventListener('click', stopEventBubbling, false);

          appendNewElm(btnGroup, 'input', {'type':'button', 'value': 'Fade out'}, function (stop) {
            stop.addEventListener('click', fadeOutAndStop, false);
          });

          appendNewElm(btnGroup, 'input', {'type':'button', 'value': 'F Stop'}, function (stop) {
            stop.addEventListener('click', forceStop, false);
          });
        });

        function playSound() {
          if (playing) { return; }
          current = player.play(buffer, clear);

          btn.classList.add('active');
          playing = true;
        }

        function fadeOutAndStop() {
          player.fadeOutAndStop(current);
        }

        function forceStop() {
          player.forceStop(current);
        }

        function clear() {
          btn.classList.remove('active');
          playing = false;
          current = null;
        }
      });

      function stopEventBubbling(evt) {
        evt.stopPropagation();
        evt.preventDefault();
      }
    };
  }

  return this;
}