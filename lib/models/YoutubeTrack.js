const Track = require('./Track.js');

class YoutubeTrack extends Track {
  getPlayableMedia() {
    const rx = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    const match = this.path.match(rx);
    const youtubeId = match[1];

    let targetContainer = document.getElementById('youtube-container');
    let frame = document.createElement('iframe');
    frame.src = `https://www.youtube.com/embed/${youtubeId}`;
    targetContainer.innerHTML = '';
    targetContainer.appendChild(frame);

    return new Promise((resolve) => {
      const cycle = () => {
        const videoEl = document.querySelector('#youtube-container iframe')
        .contentWindow.document.querySelector('video');

        if (videoEl) {
          videoEl.click();
          return resolve(videoEl);
        }

        return setTimeout(cycle, 100);
      };

      cycle();
    });
  }
}

module.exports = YoutubeTrack;
