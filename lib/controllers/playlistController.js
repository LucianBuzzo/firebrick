const meta = require('../meta');

const DOMTitle = document.querySelector('.title');

const PlaylistController = function PlaylistController($scope, playlistService, playAudioService) {
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

      playAudioService.play(track);
    } else {
      DOMTitle.innerText = '';
      meta.detect(track.path)
      .then((data) => {
        DOMTitle.innerText = data.artist.join(', ') + ' - ' + data.title;
      });

      playAudioService.play(track);
    }
  };
};

module.exports = PlaylistController;
