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
    playAudioService.play(track);
  };
};

module.exports = PlaylistController;
