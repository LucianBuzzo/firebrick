const Rainbow = require('rainbowvis.js');
const ctx = new AudioContext();

const setDisplay = () => {
  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const height = 200;
  const colors = new Rainbow();
  colors.setNumberRange(0, 255);
  colors.setSpectrum('yellow', 'red');
  canvas.width = 1024;
  canvas.height = height;

  return {
    draw: (frequencyData) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      frequencyData.forEach((val, index) => {
        ctx.fillStyle = '#' + colors.colourAt(index / 8 + val / 2);
        ctx.fillRect(index, height - val / 2, 1, val / 2);
      });
    }
  };
};

const start = (source, type = 'audio') => {
  console.log(source);
  const display = setDisplay();
  var isPaused = false;
  var audioSrc = ctx.createMediaElementSource(source);
  var analyser = ctx.createAnalyser();
  // we have to connect the MediaElementSource with the analyser
  audioSrc.connect(analyser);
  audioSrc.connect(ctx.destination);
  // we could configure the analyser: e.g. analyser.fftSize (for further infos read the spec)

  // frequencyBinCount tells you how many values you'll receive from the analyser
  var frequencyData = new Uint8Array(analyser.frequencyBinCount);

  // we're ready to receive some data!
  // loop
  const renderFrame = function renderFrame() {
    requestAnimationFrame(renderFrame);
    // update data in frequencyData
    analyser.getByteFrequencyData(frequencyData);
    // render frame based on values in frequencyData
    if (!isPaused) {
      display.draw(frequencyData);
    }
  };

  renderFrame();

  if (type === 'audio') {
    source.play();

    return {
      stop: () => source.pause(),
      pause: () => {
        isPaused = true;
        source.pause();
      },
      play: () => {
        isPaused = false;
        source.play();
      },
      isPaused: () => isPaused,
    };
  } else if (type === 'youtube') {
    source.click();

    return {
      stop: () => isPaused ? '' : source.click(),
      pause: () => {
        isPaused = true;
        source.click();
      },
      play: () => {
        isPaused = false;
        source.click();
      },
      isPaused: () => isPaused,
    };
  }
};

module.exports = {
  start,
};
