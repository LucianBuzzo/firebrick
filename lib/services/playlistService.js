const meta = require('../meta');

const DOMTitle = document.querySelector('.title');

const PlaylistService = function(broadcastService, playAudioService) {
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

  return {
    addTrack,
    getTracks,
    playNext
  };
};

module.exports = PlaylistService;
