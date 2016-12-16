const storage = require('electron-json-storage');
const visualizer = require('./visualizer');
const playlist = require('./playlist');
const YoutubeSourceWrapper = require('./youtube-source-wrapper');
const meta = require('./meta');
const {dialog} = require('electron').remote;
const angular = require('angular');
const youtubeSearch = require('./youtubeSearch');

// Define the `firebrickApp` module
var firebrickApp = angular.module('firebrickApp', []);

// Define the `TrackBrowserController` controller on the `phonecatApp` module
firebrickApp.controller('TrackBrowserController', function TrackBrowserController($scope) {
  $scope.searchTerm = '';
  $scope.tracks = [];

  $scope.searchSubmit = function() {
    if (!$scope.searchTerm) {
      return;
    }

    youtubeSearch($scope.searchTerm)
    .then(results => {
      $scope.tracks = results;
      $scope.$apply();
    })
    .catch(err => {
      console.error(err);
    });
  };

  $scope.playTrack = function(track) {
    let wrapper = new YoutubeSourceWrapper(track.url);
    wrapper.onReady(() => {
      playAudio(wrapper);
    });
  };
});


let currentAudio = null;

const domList = document.querySelector('.file-tree');

const createStruct = (element, item) => {
  if (!item || !item.children) {
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

  var audio = new Audio(path);

  playAudio(audio);
};

const selectMusicFolder = function() {
  const [path] = dialog.showOpenDialog({
      properties: ['openDirectory']
  });

  storage.set('folderPath', path);

  domList.innerHTML = '';

  createStruct(domList, playlist.fileTree(path + '/'));
};

const playAudio = (source) => {
  if (currentAudio) {
    currentAudio.stop();
  }

  currentAudio = visualizer.start(source);
};

document.querySelector('canvas').addEventListener('click', function() {
  if (!currentAudio) {
    return;
  }

  currentAudio.isPaused() ? currentAudio.play() : currentAudio.pause();
}, false);

document.querySelector('.open-folder').addEventListener('click', selectMusicFolder, false);

const init = () => {
  storage.get('folderPath', function(error, path) {
    if (error) {
      throw error;
    }

    if (typeof path === 'string') {
      createStruct(domList, playlist.fileTree(path + '/'));
    }
  });
};

init();

/*
document.querySelector('input').addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') {
    return;
  }

  let url = e.target.value;

  let wrapper = new YoutubeSourceWrapper(url);
  wrapper.onReady(() => {
    console.log(wrapper);
    playAudio(wrapper);
  });

  e.target.value = '';

});
*/
