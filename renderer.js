const visualizer = require('./visualizer');
const playlist = require('./playlist');
const meta = require('./meta');
const {dialog} = require('electron').remote;

let currentAudio = null;

const domList = document.querySelector('.file-tree');

const createStruct = (element, item) => {
  if (!item.children) {
    return;
  }
  item.children.forEach((item) => {
    if (item.name.charAt(0) === '.') {
      return;
    }
    const li = document.createElement('li');
    if (item.name.split('.').pop() === 'mp3') {
      meta.detect(item.path)
      .then((data) => {
        li.innerHTML = '<span class="label">' + data.artist.join(', ') + ' - ' + data.title + '</span>';
      });
    }
    li.innerHTML = '<span class="label">' + item.name + '</span>';
    li.setAttribute('data-path', item.path);
    element.appendChild(li);
    if (item.children) {
      let ul = document.createElement('ul');
      li.appendChild(ul);
      createStruct(ul, item);
    }
  });

  document.querySelectorAll('.file-tree li').forEach((el) => {
    el.addEventListener('click', clickItem, false);
  });
};

const clickItem = function(event) {
  event.stopPropagation();

  if (this.querySelector('ul')) {
    this.querySelector('ul').style.display = getComputedStyle(this.querySelector('ul')).getPropertyValue('display') === 'none' ?
       'block' : 'none';
    return;
  }

  let path = this.getAttribute('data-path');

  document.querySelector('.title').innerText = this.innerText;

  if (currentAudio) {
    currentAudio.stop();
  }
  currentAudio = visualizer.start(path);
};

const selectMusicFolder = function() {
  const [path] = dialog.showOpenDialog({
      properties: ['openDirectory']
  });

  domList.innerHTML = '';

  createStruct(domList, playlist.fileTree(path + '/'));
};

document.querySelector('canvas').addEventListener('click', function() {
  if (!currentAudio) {
    return;
  }

  currentAudio.isPaused() ? currentAudio.play() : currentAudio.pause();
}, false);

document.querySelector('.open-folder').addEventListener('click', selectMusicFolder, false);
