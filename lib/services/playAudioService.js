const visualizer = require('../visualizer');
const meta = require('../meta');

let currentAudioSource = null;
let currentTrack = null;

const DOMTitle = document.querySelector('.title');

const setTitle = track => {
  DOMTitle.innerText = '';

  if (track.sourceLocation === 'youtube') {
    DOMTitle.innerText = track.name;
    return;
  }

  meta.detect(track.path)
  .then((data) => {
    DOMTitle.innerText = data.artist.join(', ') + ' - ' + data.title;
  });
};

const PlayAudioService = function(broadcastService) {
  const play = (track) => {
    console.log(track);
    if (currentAudioSource) {
      currentAudioSource.pause();
    }

    track.getPlayableMedia()
    .then(source => {

      setTitle(track);

      currentAudioSource = source;
      currentTrack = track;

      visualizer.start(source);

      source.play();

      currentAudioSource.onended = function() {
        console.log('ENDED');
        broadcastService.send('trackEnded', currentTrack.path);
      };
    });
  };

  return { play };
};

module.exports = PlayAudioService;
