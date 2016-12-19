const visualizer = require('../visualizer');

let currentAudio = null;
let currentAudioSource = null;
let currentAudioPath = null;

const PlayAudioService = function(broadcastService) {
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
};

document.querySelector('canvas').addEventListener('click', function() {
  if (!currentAudio) {
    return;
  }

  currentAudio.isPaused() ? currentAudio.play() : currentAudio.pause();
}, false);

module.exports = PlayAudioService;
