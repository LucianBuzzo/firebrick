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

let currentAudio = null;

const firebrickApp = angular.module('firebrickApp', []);

const flattenTree = (tree, result = []) => {
  if (tree.children) {
    tree.children.forEach(child => {
      result = flattenTree(child, result);
    });
    return result;
  }

  return result.concat(tree);
};


firebrickApp.factory('broadcastService', function($rootScope) {
  return {
    send: function(msg, data) {
      $rootScope.$broadcast(msg, data);
    }
  };
});


firebrickApp.service('playlistService', function(broadcastService) {
  const trackList = [];

  const addTrack = newTrack => {
    delete newTrack.$$hashKey;
    trackList.push(newTrack);
    broadcastService.send('newTrackInPlaylist');
  };

  const getTracks = () => trackList;

  return {
    addTrack,
    getTracks
  };

});

firebrickApp.controller('TrackBrowserController', function TrackBrowserController($scope, playlistService) {
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
    playlistService.addTrack(track);

    DOMTitle.innerText = track.name;

    let wrapper = new YoutubeSourceWrapper(track.path);
    wrapper.onReady(() => {
      playAudio(wrapper);
    });
  };

  $scope.playLocalTrack = function(track) {
    playlistService.addTrack(track);

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

    $scope.folderTree = localBrowser.fileTree(path + '/');
    $scope.tracks = flattenTree($scope.folderTree);
  };

  electronContextMenu({
    prepend: (params) => [{
      label: 'Add to playlist',
      visible: (() => {
        let elementMouseIsOver = document.elementFromPoint(params.x, params.y);
        return params.linkURL && params.mediaType === 'none' &&
          elementMouseIsOver.className.includes('browser-track');
      })(),
      click() {
        let elementMouseIsOver = document.elementFromPoint(params.x, params.y);
        let path = elementMouseIsOver.dataset.path;
        let track = $scope.tracks.find(t => t.path === path);

        playlistService.addTrack(track);
      }
    }]
  });

  storage.get('folderPath', function(error, path) {
    if (error) {
      throw error;
    }

    if (typeof path === 'string') {
      $scope.folderTree = localBrowser.fileTree(path + '/');
      $scope.tracks = flattenTree($scope.folderTree);
    }
  });
});

firebrickApp.controller('PlaylistController', function PlaylistController($scope, playlistService) {
  $scope.playlist = [];

  $scope.$on('newTrackInPlaylist', () => {
    $scope.playlist = playlistService.getTracks();
    $scope.$apply();
  });

  $scope.playTrack = track => {
    if (track.sourceLocation === 'youtube') {
      DOMTitle.innerText = track.name;

      let wrapper = new YoutubeSourceWrapper(track.path);
      wrapper.onReady(() => {
        playAudio(wrapper);
      });
    } else {
      DOMTitle.innerText = '';
      meta.detect(track.path)
      .then((data) => {
        DOMTitle.innerText = data.artist.join(', ') + ' - ' + data.title;
      });

      var audio = new Audio(track.path);

      audio.source = audio;

      playAudio(audio);
    }
  };
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

