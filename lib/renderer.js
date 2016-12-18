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

let currentAudioSource = null;
let currentAudioPath = null;
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
      console.log('SENDING ======>');
      console.log(msg, data);
      $rootScope.$broadcast(msg, data);
    }
  };
});

firebrickApp.service('playAudioService', function(broadcastService) {
  const play = (audio) => {
    if (currentAudio) {
      currentAudio.stop();
    }

    currentAudioSource = audio.source;
    currentAudioPath = audio.path;
    currentAudio = visualizer.start(audio);

    console.log(currentAudio.path);

    currentAudioSource.onended = function() {
      console.log('ENDED');
      broadcastService.send('trackEnded', currentAudioPath);
    };
  };

  return { play };
});


firebrickApp.service('playlistService', function(broadcastService, playAudioService) {
  const trackList = [];

  const addTrack = newTrack => {
    trackList.push(newTrack);
    console.log(trackList);
    broadcastService.send('newTrackInPlaylist');
  };

  const getTracks = () => trackList;

  const playNext = path => {
    console.log('playing next', path);
    let index = 0;
    for (let track of trackList) {
      console.log(track);
      if (track.path === path) {
        break;
      }
      index++;
    }

    if (!trackList[index + 1]) {
      return;
    }

    let track = trackList[index + 1];

    if (track.sourceLocation === 'youtube') {
      DOMTitle.innerText = track.name;

      let wrapper = new YoutubeSourceWrapper(track.path);
      wrapper.onReady(() => {
        playAudioService.play(wrapper);
      });
    } else {
      DOMTitle.innerText = '';
      meta.detect(track.path)
      .then((data) => {
        DOMTitle.innerText = data.artist.join(', ') + ' - ' + data.title;
      });

      var audio = new Audio(track.path);

      audio.source = audio;
      audio.path = track.path;

      playAudioService.play(audio);
    }
  };

  return {
    addTrack,
    getTracks,
    playNext
  };

});

firebrickApp.controller('TrackBrowserController', function TrackBrowserController($scope, playlistService, playAudioService) {
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
      playAudioService.play(wrapper);
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

    playAudioService.play(audio);
  };

  $scope.browserLibraryChange = function() {
    console.log($scope.browserLibrary);
    if ($scope.browserLibrary) {
      $scope.tracks = flattenTree($scope.folderTree);
    }
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

        console.log(path, track);

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

firebrickApp.controller('PlaylistController', function PlaylistController($scope, playlistService, playAudioService) {
  $scope.playlist = [];

  $scope.$on('newTrackInPlaylist', () => {
    $scope.playlist = playlistService.getTracks();
    console.log('Received newTrackInPlaylist event', $scope.playlist);
    $scope.$apply();
  });

  $scope.$on('trackEnded', (event, data) => {
    console.log(data);
    playlistService.playNext(data);
  });


  $scope.playTrack = track => {
    if (track.sourceLocation === 'youtube') {
      DOMTitle.innerText = track.name;

      let wrapper = new YoutubeSourceWrapper(track.path);
      wrapper.onReady(() => {
        playAudioService.play(wrapper);
      });
    } else {
      DOMTitle.innerText = '';
      meta.detect(track.path)
      .then((data) => {
        DOMTitle.innerText = data.artist.join(', ') + ' - ' + data.title;
      });

      var audio = new Audio(track.path);

      audio.source = audio;

      playAudioService.play(audio);
    }
  };
});

document.querySelector('canvas').addEventListener('click', function() {
  if (!currentAudio) {
    return;
  }

  currentAudio.isPaused() ? currentAudio.play() : currentAudio.pause();
}, false);

