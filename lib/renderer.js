const storage = require('electron-json-storage');
const visualizer = require('./visualizer');
const playlist = require('./playlist');
const YoutubeSourceWrapper = require('./youtubeSourceWrapper');
const meta = require('./meta');
const {dialog} = require('electron').remote;
const angular = require('angular');
const youtubeSearch = require('./youtubeSearch');
const DOMTitle = document.querySelector('.title');

// Define the `firebrickApp` module
var firebrickApp = angular.module('firebrickApp', []);

// Define the `TrackBrowserController` controller on the `phonecatApp` module
firebrickApp.controller('TrackBrowserController', function TrackBrowserController($scope) {
  $scope.searchTerm = '';
  $scope.tracks = [];
  $scope.browserLibrary = 'youtube';
  $scope.folderTree = {};

  $scope.searchSubmit = function() {
    if (!$scope.searchTerm) {
      return;
    }

    if ($scope.browserLibrary === 'youtube') {
      youtubeSearch($scope.searchTerm)
      .then(results => {
        $scope.tracks = results;
        $scope.$apply();
      })
      .catch(err => {
        console.error(err);
      });

      return;
    }
  };

  $scope.playYoutubeTrack = function(track) {
    DOMTitle.innerText = track.title;

    let wrapper = new YoutubeSourceWrapper(track.url);
    wrapper.onReady(() => {
      playAudio(wrapper);
    });
  };

  $scope.playLocalTrack = function(track) {
    DOMTitle.innerText = '';
    meta.detect(track.path)
    .then((data) => {
      DOMTitle.innerText = data.artist.join(', ') + ' - ' + data.title;
    });

    var audio = new Audio(track.path);

    audio.source = audio;

    playAudio(audio);
  };

  $scope.browserLibraryChange = function() {
    console.log($scope.browserLibrary);
  };

  $scope.selectMusicFolder = function() {
    const [path] = dialog.showOpenDialog({
        properties: ['openDirectory']
    });

    storage.set('folderPath', path);

    console.log(path);
    $scope.folderTree = playlist.fileTree(path + '/');
  };

  storage.get('folderPath', function(error, path) {
    if (error) {
      throw error;
    }

    if (typeof path === 'string') {
      $scope.folderTree = playlist.fileTree(path + '/');
    }
  });
});


let currentAudio = null;

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

  audio.source = audio;

  playAudio(audio);
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

