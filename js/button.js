// Jaskunwar Hunjan A01195757
/* The code and comments in this file were created with the assistance of ChatGPT and Copilot */
export class Button {
    constructor(id, color) {
        // store the button's number and color
        this.id = id;
        this.color = color;

        // make the actual <button> element
        this.element = document.createElement('button');

        // basic look; position absolute lets me place it anywhere inside the container
        this.element.style.position = 'absolute';
        this.element.style.backgroundColor = color;
        this.element.style.border = '1px solid black';
        this.element.style.fontSize = '1.2em';

        // show the number during the memorize phase
        this.element.innerText = id;

        // css hook so I can style all game buttons in style.css
        this.element.classList.add('memory-button');

        // put this button inside the game area (not directly on the body)
        const container = document.getElementById('gameContainer');
        container.appendChild(this.element);
    }

    // move button to an exact (x, y) position (in pixels) inside the container
    moveTo(x, y) {
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
    }

    // place the button at a random spot that still fits inside the container
    moveToRandom(containerWidth, containerHeight) {
        const buttonWidth = this.element.offsetWidth;   // real width after CSS
        const buttonHeight = this.element.offsetHeight; // real height after CSS

        const maxX = containerWidth - buttonWidth;      // farthest safe left position
        const maxY = containerHeight - buttonHeight;    // farthest safe top position

        const x = Math.floor(Math.random() * maxX);     // pick a random x within range
        const y = Math.floor(Math.random() * maxY);     // pick a random y within range

        this.moveTo(x, y);                               // actually move the element
    }

    // show the number text on the button
    showNumber() {
        this.element.innerText = this.id;
    }

    // hide the number text (only the color stays)
    hideNumber() {
        this.element.innerText = '';
    }

    // turn on clicking and call the callback with THIS button when clicked
    enable(onClick) {
        // keep a reference so I can remove the listener later
        this._clickHandler = () => onClick(this);
        this.element.addEventListener('click', this._clickHandler);
        this.element.disabled = false;
    }

    // turn off clicking and remove the stored click listener
    disable() {
        if (this._clickHandler) {
            this.element.removeEventListener('click', this._clickHandler);
        }
        this.element.disabled = true;
    }
}
