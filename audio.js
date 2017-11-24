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
  var flow = false;

  this.play = function(buffer, onendedCallback) {
    var nextSource = createNextSource(buffer, onendedCallback);

    nextSource.source.start();

    var now = current;
    if(now && flow) {
      var timeToSwitch = audioCtx.currentTime + FADE_TIME_IN_SEC;
      this.fadeOutAndStop(now, timeToSwitch);
      nextSource.gainNode.gain.value = 0;
      nextSource.gainNode.gain.linearRampToValueAtTime(1, timeToSwitch);
    }

    current = nextSource;
    return nextSource;
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

  this.fadeOutAndStop = function(toStop, timeToSwitch) {
    timeToSwitch = timeToSwitch || audioCtx.currentTime + FADE_TIME_IN_SEC;

    toStop.gainNode.gain.value = 1;
    toStop.gainNode.gain.linearRampToValueAtTime(0, timeToSwitch);
    toStop.source.loop = false;
    window.setTimeout(createForceStopCallback(this, toStop), FADE_TIME_IN_SEC * 1000 + 200);
  };

  function createForceStopCallback(self, toStop) {
    return function() { self.forceStop(toStop); }
  }

  this.forceStop = function(source) {
    if(source && source.source) {
      source.source.stop();
    }
  };

  this.setLoop = function(mustLoop) {
    loop = mustLoop;
    var now = current;
    if (now) { now.source.loop = mustLoop; }
  };
  
  this.setChangeFlowSound = function(mustFlow) {
    flow = mustFlow;
    var now = current;
    if (now) { now.source.flow = mustFlow; }
  };

  return this;
}