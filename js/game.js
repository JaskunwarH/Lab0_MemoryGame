// Jaskunwar Hunjan A01195757
/* The code and comments in this file were created with the assistance of ChatGPT and Copilot */
import { Button } from './button.js';

// Colors constants
const COLORS = {
  RED: '#f4a7a7',
  LIGHT_GREEN: '#bff7bf',
  BLUE: '#c9ddff',
  YELLOW: '#fff6a5',
  ORANGE: '#ffd5b5',
  PURPLE: '#e3c8ff',
  DARK_GREEN: '#2e7d32'
};

// Base palette for each round (this is shuffled so color order changes each game)
const DEFAULT_PALETTE = [
  COLORS.RED,
  COLORS.LIGHT_GREEN,
  COLORS.BLUE,
  COLORS.YELLOW,
  COLORS.ORANGE,
  COLORS.PURPLE,
  COLORS.DARK_GREEN
];

export class Game {

  constructor(ui) {
    this.ui = ui;                    // UI helper for messages/buttons
    this.buttons = [];               // current round's Button objects
    this.isAnimating = false;        // true while scrambling (ignore clicks)
    this.palette = DEFAULT_PALETTE.slice(); // base palette
    this._boundResize = null;        // will hold the window resize handler
  }

  startGame(n) {
    this.clear();                    // remove old round and listeners
    this.ui?.showMessage?.('memorize');

    const colors = this._colors(n);  // shuffled colors for this round
    for (let i = 1; i <= n; i++) {
      const b = new Button(i, colors[i - 1]); // give each id a random color
      b.showNumber();                // show numbers during memorize phase
      b.disable();                   // clicks only allowed in play phase
      this.buttons.push(b);
    }
    this._placeInRow();              // layout inside the container

    // Reflow on resize (but not during animation)
    this._boundResize ??= () => {
      if (!this.isAnimating && this.buttons.length) {
        this._placeInRow();
        this._clampAllIntoContainer();
      }
    };
    window.addEventListener('resize', this._boundResize);
  }

  clear() {
    // remove existing button elements
    this.buttons.forEach(b => b.element?.parentNode?.removeChild(b.element));
    this.buttons = [];
    this.isAnimating = false;

    // clean up resize listener so we don’t stack handlers
    if (this._boundResize) {
      window.removeEventListener('resize', this._boundResize);
      this._boundResize = null;
    }
  }

  // ----- layout helpers -----

  // Read the container's current width/height
  _containerWH() {
    const c = document.getElementById('gameContainer');
    return { W: c.clientWidth, H: c.clientHeight };
  }

  // Place buttons left→right, wrap to next row before overflow
  _placeInRow() {
    const { W, H } = this._containerWH();
    const pad = 16, gap = 16;        // simple spacing
    let x = pad, y = pad;

    for (const b of this.buttons) {
      const bw = b.element.offsetWidth, bh = b.element.offsetHeight;
      if (x + bw > W - pad) { x = pad; y += bh + gap; }
      if (y + bh > H - pad) { y = Math.max(pad, H - pad - bh); }
      b.moveTo(x, y);
      x += bw + gap;
    }
  }

  // If window shrinks, keep all buttons fully inside the box
  _clampAllIntoContainer() {
    const { W, H } = this._containerWH();
    for (const b of this.buttons) {
      const bw = b.element.offsetWidth, bh = b.element.offsetHeight;
      const left = parseFloat(b.element.style.left) || 0;
      const top = parseFloat(b.element.style.top) || 0;
      const x = Math.min(Math.max(0, left), Math.max(0, W - bw));
      const y = Math.min(Math.max(0, top), Math.max(0, H - bh));
      if (x !== left || y !== top) b.moveTo(x, y);
    }
  }

  // ----- color + timing -----

  // Return n colors from a shuffled copy of the palette
  _colors(n) {
    const a = [...this.palette];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, n);
  }

  // Simple wait helper so we can use await
  pauseForSeconds(s) {
    return new Promise(r => setTimeout(r, s * 1000));
  }

  // ----- scramble -----

  // Move each button to a random spot that doesn’t overlap others
  _scrambleOnce() {
    const { W, H } = this._containerWH();
    const placed = [], maxTries = 200;
    const overlap = (a, b) => !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);

    for (const b of this.buttons) {
      const bw = b.element.offsetWidth, bh = b.element.offsetHeight;
      const maxX = Math.max(0, W - bw), maxY = Math.max(0, H - bh);
      let x = 0, y = 0, ok = false, tries = 0;

      // try random positions until this one fits without overlap
      while (!ok && tries < maxTries) {
        x = Math.floor(Math.random() * (maxX + 1));
        y = Math.floor(Math.random() * (maxY + 1));
        const cand = { x, y, w: bw, h: bh };
        ok = placed.every(p => !overlap(cand, p));
        tries++;
      }
      placed.push({ x, y, w: bw, h: bh });
      b.moveTo(x, y);
    }
  }

  async scrambleNTimes(n) {
    this.isAnimating = true;
    this.buttons.forEach(b => b.disable());     // no clicks while moving
    for (let i = 0; i < n; i++) {
      this._scrambleOnce();
      await this.pauseForSeconds(0.7);          // small pause so movement is visible
    }
    this.isAnimating = false;
  }

  // ----- play phase -----

  // Hide numbers and enable clicks; player must click 1..n in order
  prepareForPlay() {
    this.nextExpected = 1;
    this.buttons.forEach(b => b.hideNumber());
    this.buttons.forEach(b => b.enable(clicked => this.onButtonClick(clicked)));
    this.ui?.showMessage?.('clickInOrder');
  }

  // Check if the clicked button is the next correct number
  onButtonClick(b) {
    if (this.isAnimating) return;               // safety check
    if (b.id === this.nextExpected) {
      b.showNumber();
      if (++this.nextExpected > this.buttons.length) this._end(true);
    } else {
      this._end(false);
    }
  }

  // End the round: lock input; on failure, reveal all numbers
  _end(success) {
    this.buttons.forEach(b => b.disable());
    if (!success) this.buttons.forEach(b => b.showNumber());
    success ? this.ui?.showMessage?.('success') : this.ui?.showError?.('failure');
  }
}
