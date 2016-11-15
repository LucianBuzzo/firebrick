const Rainbow = require('rainbowvis.js');

const setDisplay = () => {
  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const height = 300;
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

const start = (src) => {
  const display = setDisplay();
  var ctx = new AudioContext();
  var audio = new Audio(src);
  var audioSrc = ctx.createMediaElementSource(audio);
  var analyser = ctx.createAnalyser();
  // we have to connect the MediaElementSource with the analyser
  audioSrc.connect(analyser);
  audioSrc.connect(ctx.destination);
  // we could configure the analyser: e.g. analyser.fftSize (for further infos read the spec)

  // frequencyBinCount tells you how many values you'll receive from the analyser
  var frequencyData = new Uint8Array(analyser.frequencyBinCount);

  // we're ready to receive some data!
  // loop
  function renderFrame() {
    requestAnimationFrame(renderFrame);
    // update data in frequencyData
    analyser.getByteFrequencyData(frequencyData);
    // render frame based on values in frequencyData
    display.draw(frequencyData);
  }
  audio.play();
  renderFrame();
};

module.exports = {
  start,
};
