/**
 * Creates a wrapper around the youtube 'video' element that is loaded in an
 * embedded iframe.
 */

class YoutubeSourceWrapper {
  constructor(url) {
    this.isPaused = true;
    this.source = null;

    this.id = this.getYoutubeIdFromUrl(url);
    this.readyFunction = () => { };

    this.getSource()
    .then(() => {
      this.readyFunction(this);
    });
  }

  getYoutubeIdFromUrl(url) {
    const rx = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    const match = url.match(rx);

    return match[1];
  }

  getVideoElement() {
    return document.querySelector('#youtube-container iframe')
      .contentWindow.document.querySelector('video');
  }

  loadVideo() {
    let targetContainer = document.getElementById('youtube-container');
    let frame = document.createElement('iframe');
    frame.src = `https://www.youtube.com/embed/${this.id}`;
    targetContainer.innerHTML = '';
    targetContainer.appendChild(frame);

    return new Promise((resolve) => {
      const cycle = () => {
        const videoEl = this.getVideoElement();
        if (videoEl) {
          return resolve(videoEl);
        }

        return setTimeout(cycle, 100);
      };

      cycle();
    });
  }

  getSource() {
    return new Promise(resolve => {
      this.loadVideo()
      .then(el => {

        this.source = el;

        resolve();
      });
    });
  }

  stop() {
    if (!this.isPaused) {
      this.isPaused = true;
      this.source.click();
    }
  }

  pause() {
    if (!this.isPaused) {
      this.isPaused = true;
      this.source.click();
    }
  }

  play() {
    if (this.isPaused) {
      this.isPaused = false;
      this.source.click();
    }
  }

  isPaused() {
    return this.isPaused;
  }

  onReady(func) {
    this.readyFunction = func;
  }

}

module.exports = YoutubeSourceWrapper;
