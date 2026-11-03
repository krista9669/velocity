
export class HUD {
  constructor(container, callbacks = {}) {
    this.onStart = callbacks.onStart || (() => {});
    this.onRestart = callbacks.onRestart || (() => {});
    this.onCarSelect = callbacks.onCarSelect || (() => {});
    this.onTrackSelect = callbacks.onTrackSelect || (() => {});

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
          <div id="hud-lap">LAP 0 / 2</div>
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

          <div id="menu-panel" class="overlay-panel">
            <h1 id="overlay-title">VELOCITY</h1>
            <p id="overlay-description">
              Choose your machine and circuit to begin the session.
            </p>

            <div class="selector-group">
              <div class="selector-label">CAR</div>
              <div class="option-grid">
                <button class="selector-btn car-option active" data-car="vortex">VORTEX</button>
                <button class="selector-btn car-option" data-car="thunder">THUNDER</button>
                <button class="selector-btn car-option" data-car="apex">APEX</button>
              </div>
            </div>

            <div class="selector-group">
              <div class="selector-label">TRACK</div>
              <div class="option-grid">
                <button class="selector-btn track-option active" data-track="classic">CLASSIC</button>
                <button class="selector-btn track-option" data-track="canyon">CANYON</button>
              </div>
            </div>

            <button id="overlay-button" data-action="start">START RACE</button>
            <small class="overlay-help">
              W A S D / ARROW KEYS TO DRIVE
            </small>
          </div>

          <div id="results-panel" class="overlay-panel" hidden>
            <h1 id="results-title">RACE COMPLETE!</h1>
            <p id="results-description"></p>
            <div id="results-laps" class="results-laps"></div>

            <button id="results-button">RACE AGAIN</button>
          </div>
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
    this.menuPanel = this.element.querySelector('#menu-panel');
    this.resultsPanel = this.element.querySelector('#results-panel');
    this.overlayTitle = this.element.querySelector('#overlay-title');
    this.overlayDescription = this.element.querySelector('#overlay-description');
    this.overlayButton = this.element.querySelector('#overlay-button');
    this.resultsTitle = this.element.querySelector('#results-title');
    this.resultsDescription = this.element.querySelector('#results-description');
    this.resultsLaps = this.element.querySelector('#results-laps');
    this.resultsButton = this.element.querySelector('#results-button');
    this.carButtons = [...this.element.querySelectorAll('.car-option')];
    this.trackButtons = [...this.element.querySelectorAll('.track-option')];

    this.overlayButton.addEventListener('click', () => {
      if (this.overlayButton.dataset.action === 'restart') {
        this.onRestart();
      } else {
        this.onStart();
      }
    });

    this.resultsButton.addEventListener('click', () => {
      this.onRestart();
    });

    this.carButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.onCarSelect(button.dataset.car);
      });
    });

    this.trackButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.onTrackSelect(button.dataset.track);
      });
    });

    this.showMenu();
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

  setMenuSelection(selectedCar, selectedTrack) {
    this.carButtons.forEach(button => {
      const isActive = button.dataset.car === selectedCar;
      button.classList.toggle('active', isActive);
    });

    this.trackButtons.forEach(button => {
      const isActive = button.dataset.track === selectedTrack;
      button.classList.toggle('active', isActive);
    });
  }

  showMenu() {
    this.overlay.style.display = 'flex';
    this.element.classList.add('overlay-visible');
    this.countdownElement.textContent = '';
    this.menuPanel.hidden = false;
    this.resultsPanel.hidden = true;
    this.overlayButton.textContent = 'START RACE';
    this.overlayButton.dataset.action = 'start';
  }

  hideOverlay() {
    this.overlay.style.display = 'none';
    this.element.classList.remove('overlay-visible');
  }

  showCountdown(number) {
    this.overlay.style.display = 'none';
    this.element.classList.remove('overlay-visible');
    this.countdownElement.textContent = number > 0 ? number : 'GO!';
    this.countdownElement.style.display = 'block';
  }

  hideCountdown() {
    this.countdownElement.textContent = '';
    this.countdownElement.style.display = 'none';
  }

  showResults(time, lapTimes, car, track) {
    this.overlay.style.display = 'flex';
    this.element.classList.add('overlay-visible');
    this.hideCountdown();
    this.menuPanel.hidden = true;
    this.resultsPanel.hidden = false;
    this.resultsTitle.textContent = 'RACE COMPLETE!';
    this.resultsDescription.textContent =
      `${car.toUpperCase()} • ${track.toUpperCase()} • ${this.formatTime(time)}`;

    if (!lapTimes.length) {
      this.resultsLaps.innerHTML = '<div class="lap-item">NO LAP DATA</div>';
    } else {
      this.resultsLaps.innerHTML = lapTimes
        .map((lapTime, index) => {
          return `<div class="lap-item">LAP ${index + 1}: ${this.formatTime(lapTime)}</div>`;
        })
        .join('');
    }
  }

  update(speed, maxSpeed, raceTime, progress, state, currentLap = 1, totalLaps = 2, completedLaps = 0) {
    const kmh = Math.round(Math.abs(speed) * 3.6);
    this.speedElement.textContent = String(kmh).padStart(3, '0');

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

    if (state === 'ready') {
      this.lapElement.textContent = `LAP 0 / ${totalLaps}`;
    } else if (state === 'finished') {
      this.lapElement.textContent = `LAP ${totalLaps} / ${totalLaps}`;
    } else {
      this.lapElement.textContent = `LAP ${Math.min(completedLaps + 1, totalLaps)} / ${totalLaps}`;
    }
  }

  dispose() {
    this.element.remove();
  }
}