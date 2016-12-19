const meta = require('../meta');
const YoutubeSourceWrapper = require('../youtubeSourceWrapper');

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
};

module.exports = PlaylistService;
