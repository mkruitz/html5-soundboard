window.addEventListener('load', init, false);
window.addEventListener('dragover', function(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'none';
}, false);
window.addEventListener('drop', function(evt) {
  evt.stopPropagation();
  evt.preventDefault();
}, false);

function init() {
  var channelsDom = document.querySelector('.channels');

  var backgrounds = new Channel({ title: 'Backgrounds' });
  channelsDom.appendChild(backgrounds.getDom());

  var effects = new Channel({ title: 'Effects' });
  channelsDom.appendChild(effects.getDom());
}