const {dialog} = require('electron').remote;
const electronContextMenu = require('electron-context-menu');
const youtubeSearch = require('../youtubeSearch');
const localBrowser = require('../localBrowser');
const storage = require('../storage');

const flattenTree = (tree, result = []) => {
  if (tree.children) {
    tree.children.forEach(child => {
      result = flattenTree(child, result);
    });
    return result;
  }

  return result.concat(tree);
};

const TrackBrowserController = function TrackBrowserController($scope, playlistService, playAudioService) {
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

  $scope.playTrack = function(track) {
    playlistService.addTrack(track);

    playAudioService.play(track);
  };

  $scope.browserLibraryChange = function() {
    console.log($scope.browserLibrary);
    if ($scope.browserLibrary === 'local') {
      $scope.tracks = flattenTree($scope.folderTree);
    } else {
      $scope.tracks = [];
    }
  };

  $scope.selectMusicFolder = function() {
    const [path] = dialog.showOpenDialog({
      properties: ['openDirectory']
    });

    storage.set('folderPath', path);

    $scope.folderTree = localBrowser.fileTree(path + '/');
    if ($scope.browserLibrary === 'local') {
      $scope.tracks = flattenTree($scope.folderTree);
    }
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
};

module.exports = TrackBrowserController;
