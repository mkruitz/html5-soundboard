function AudioDecoder() {
  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  this.decode = function(file, callback) {
    callback = callback || function() { };

    var reader = new FileReader();
    reader.onload = createReaderOnloadCallback(file.name, callback);

    reader.readAsArrayBuffer(file);
  };

  function createReaderOnloadCallback(filename, callback) {
    return function (e) {
      audioCtx.decodeAudioData(e.target.result, function (buffer) {
          console.log('Finished: Processing sound \'' + filename + '\'...');
          callback(buffer);
        },
        function (e) {
          console.log('Error with decoding audio data, \'' + filename + '\'.\n' + e);
        }
      );
    };
  }

  return this;
}

function Player() {
  const FADE_TIME_IN_SEC = 1;
  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  var current;
  var loop = false;

  this.play = function(buffer, onendedCallback) {
    var nextSource = createNextSource(buffer, onendedCallback);

    nextSource.source.start();

    var now = current;
    if(now) {
      var currentTime = audioCtx.currentTime;
      var timeToSwitch = currentTime + FADE_TIME_IN_SEC;

      now.gainNode.gain.value = 1;
      nextSource.gainNode.gain.value = 0;

      now.gainNode.gain.linearRampToValueAtTime(0,        timeToSwitch);
      nextSource.gainNode.gain.linearRampToValueAtTime(1, timeToSwitch);

      now.source.loop = false;
    }

    current = nextSource;
  };

  function createNextSource(buffer, onendedCallback) {
    onendedCallback = onendedCallback || function() {};

    var gainNode = audioCtx.createGain();
    var source = audioCtx.createBufferSource();
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    source.buffer = buffer;
    source.loop = loop;
    source.onended = function() { current = null; onendedCallback(); };

    return {
      source: source,
      gainNode: gainNode
    };
  }

  this.stop = function() {
    var now = current;
    if (now) { now.source.stop(); }
  };

  this.setLoop = function(mustLoop) {
    loop = mustLoop;
    var now = current;
    if (now) { now.source.loop = mustLoop; }
  };

  return this;
}