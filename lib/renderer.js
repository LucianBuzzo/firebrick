const storage = require('electron-json-storage');
const visualizer = require('./visualizer');
const localBrowser = require('./localBrowser');
const YoutubeSourceWrapper = require('./youtubeSourceWrapper');
const meta = require('./meta');
const {dialog} = require('electron').remote;
const angular = require('angular');
const youtubeSearch = require('./youtubeSearch');
const electronContextMenu = require('electron-context-menu');

const DOMTitle = document.querySelector('.title');

electronContextMenu({
  prepend: (params) => [{
    label: 'Add to playlist',
    visible: (() => {
      let elementMouseIsOver = document.elementFromPoint(params.x, params.y);
      return params.linkURL && params.mediaType === 'none' &&
        elementMouseIsOver.className.includes('browser-track');
    })(),
    click() {
      console.log('clicky');
      let elementMouseIsOver = document.elementFromPoint(params.x, params.y);
      console.log(elementMouseIsOver);
    }
  }]
});

let currentAudio = null;

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
    DOMTitle.innerText = track.name;

    let wrapper = new YoutubeSourceWrapper(track.path);
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
    $scope.folderTree = localBrowser.fileTree(path + '/');
  };

  storage.get('folderPath', function(error, path) {
    if (error) {
      throw error;
    }

    if (typeof path === 'string') {
      $scope.folderTree = localBrowser.fileTree(path + '/');
    }
  });
});

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

