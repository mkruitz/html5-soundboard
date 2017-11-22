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
  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  var source;
  var loop = false;

  this.play = function(buffer, onendedCallback) {
    onendedCallback = onendedCallback || function() {};

    source = audioCtx.createBufferSource();
    source.connect(audioCtx.destination);
    source.buffer = buffer;
    source.loop = loop;
    source.onended = onendedCallback;
    source.start();
  };

  this.stop = function() {
    if (source) { source.stop(); }
  };

  this.setLoop = function(mustLoop) {
    loop = mustLoop;
    if (source) { source.loop = mustLoop; }
  };

  return this;
}