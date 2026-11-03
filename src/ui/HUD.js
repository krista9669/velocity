
export class HUD {
  constructor(container, callbacks = {}) {
    this.onStart = callbacks.onStart || (() => {});
    this.onRestart = callbacks.onRestart || (() => {});

    this.element = document.createElement('div');
    this.element.className = 'game-hud';

    this.element.innerHTML = `
      <div class="hud-top">
        <div class="hud-brand">
          <span class="brand-icon">V</span>
          <div>
            <strong>VELOCITY</strong>
            <small>RACING EXPERIENCE</small>
          </div>
        </div>

        <div class="race-info">
          <div id="hud-lap">LAP 0 / 1</div>
          <div id="hud-timer">00:00.000</div>
        </div>
      </div>

      <div class="race-progress">
        <div id="hud-progress-fill"></div>
      </div>

      <div class="hud-countdown" id="hud-countdown"></div>

      <div class="hud-bottom">
        <div class="speed-panel">
          <div class="speed-label">SPEED</div>
          <div class="speed-value">
            <span id="hud-speed">000</span>
            <small>KM/H</small>
          </div>
          <div class="speed-bar">
            <div id="hud-speed-fill"></div>
          </div>
        </div>

        <div class="gear-panel">
          <small>GEAR</small>
          <strong id="hud-gear">N</strong>
        </div>
      </div>

      <div class="hud-controls">
        <span>WASD / ARROWS <small>DRIVE</small></span>
        <span>SPACE <small>HANDBRAKE</small></span>
      </div>

      <div class="game-overlay" id="hud-overlay">
        <div class="overlay-card">
          <div class="overlay-brand">V</div>
          <div class="overlay-eyebrow">ARCADE RACING</div>
          <h1 id="overlay-title">VELOCITY</h1>
          <p id="overlay-description">
            Take the wheel. Complete one lap. Beat your time.
          </p>
          <div class="overlay-details">
            <span>01 LAP</span>
            <span>TIME TRIAL</span>
            <span>FREE RACING</span>
          </div>
          <button id="overlay-button">START RACE</button>
          <small class="overlay-help">
            W A S D / ARROW KEYS TO DRIVE
          </small>
        </div>
      </div>
    `;

    container.appendChild(this.element);

    this.speedElement = this.element.querySelector('#hud-speed');
    this.speedFill = this.element.querySelector('#hud-speed-fill');
    this.gearElement = this.element.querySelector('#hud-gear');

    this.timerElement = this.element.querySelector('#hud-timer');
    this.lapElement = this.element.querySelector('#hud-lap');
    this.progressFill = this.element.querySelector('#hud-progress-fill');

    this.countdownElement = this.element.querySelector('#hud-countdown');
    this.overlay = this.element.querySelector('#hud-overlay');

    this.overlayTitle = this.element.querySelector('#overlay-title');
    this.overlayDescription = this.element.querySelector('#overlay-description');
    this.overlayButton = this.element.querySelector('#overlay-button');

    this.overlayButton.addEventListener('click', () => {
      if (this.overlayButton.dataset.action === 'restart') {
        this.onRestart();
      } else {
        this.onStart();
      }
    });

    this.showStart();
  }

  formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 1000);

    return (
      `${String(minutes).padStart(2, '0')}:` +
      `${String(seconds).padStart(2, '0')}.` +
      `${String(milliseconds).padStart(3, '0')}`
    );
  }

  showStart() {
    this.overlay.style.display = 'flex';
    this.countdownElement.textContent = '';

    this.overlayTitle.textContent = 'VELOCITY';
    this.overlayDescription.textContent =
      'Take the wheel. Complete one lap. Beat your time.';

    this.overlayButton.textContent = 'START RACE';
    this.overlayButton.dataset.action = 'start';
  }

  hideOverlay() {
    this.overlay.style.display = 'none';
  }

  showCountdown(number) {
    this.overlay.style.display = 'none';

    this.countdownElement.textContent =
      number > 0 ? number : 'GO!';

    this.countdownElement.style.display = 'block';
  }

  hideCountdown() {
    this.countdownElement.textContent = '';
    this.countdownElement.style.display = 'none';
  }

  showResults(time) {
    this.overlay.style.display = 'flex';
    this.hideCountdown();

    this.overlayTitle.textContent = 'RACE COMPLETE!';
    this.overlayDescription.textContent =
      `Your finishing time: ${this.formatTime(time)}`;

    this.overlayButton.textContent = 'RACE AGAIN';
    this.overlayButton.dataset.action = 'restart';
  }

  update(speed, maxSpeed, raceTime, progress, state) {
    const kmh = Math.round(Math.abs(speed) * 3.6);

    this.speedElement.textContent =
      String(kmh).padStart(3, '0');

    const percentage = Math.min(
      Math.abs(speed) / maxSpeed * 100,
      100
    );

    this.speedFill.style.width = `${percentage}%`;

    if (speed > 1) {
      this.gearElement.textContent = 'D';
    } else if (speed < -1) {
      this.gearElement.textContent = 'R';
    } else {
      this.gearElement.textContent = 'N';
    }

    this.timerElement.textContent = this.formatTime(raceTime);

    const progressPercent = Math.max(
      0,
      Math.min(progress * 100, 100)
    );

    this.progressFill.style.width = `${progressPercent}%`;

    this.lapElement.textContent =
      state === 'finished' ? 'LAP 1 / 1' : 'LAP 0 / 1';
  }

  dispose() {
    this.element.remove();
  }
}