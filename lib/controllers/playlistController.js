const DOMTitle = document.querySelector('.title');

const YoutubeSourceWrapper = require('../youtubeSourceWrapper');
const meta = require('../meta');

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
};

module.exports = PlaylistController;
