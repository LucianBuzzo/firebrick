const visualizer = require('../visualizer');

let currentAudioSource = null;
let currentTrack = null;

const PlayAudioService = function(broadcastService) {
  const play = (track) => {
    console.log(track);
    if (currentAudioSource) {
      currentAudioSource.stop();
    }

    const source = track.getPlayableMedia();

    currentAudioSource = source;
    currentTrack = track;

    visualizer.start(source);

    source.play();

    currentAudioSource.onended = function() {
      console.log('ENDED');
      broadcastService.send('trackEnded', currentTrack.path);
    };
  };

  return { play };
};

module.exports = PlayAudioService;
