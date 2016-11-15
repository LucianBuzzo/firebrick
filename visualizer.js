const setDisplay = () => {
  const wrapper = document.querySelector('.visualizer');
  var bars = [];
  var i;
  for (i = 0; i < 1024; i++) {
    bars.push(document.createElement('span'));
    wrapper.appendChild(bars[i]);
  }

  bars[4].style.height = '20px';

  return {
    draw: (frequencyData) => {
      frequencyData.forEach((val, index) => {
        bars[index].style.height = val / 3 + 'px';
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
