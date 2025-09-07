// Jaskunwar Hunjan A01195757
/* The code and comments in this file were created with the assistance of ChatGPT and Copilot */
import { messages } from '../lang/messages/en/user.js';

export class UI 
{
  constructor() 
  {
    // grab needed DOM elements once so we can reuse them
    this.countInput = document.getElementById('countInput');
    this.goBtn = document.getElementById('goBtn');
    this.messageBox = document.getElementById('messageBox');
  }

  // get the number of buttons and make sure it’s an integer from 3 to 7
  getButtonCount() {
    const raw = this.countInput.value.trim();        // read what the user typed
    const n = Number(raw);                           // convert to a number

    // check it’s a whole number and within the allowed range
    const isInteger = Number.isInteger(n);
    if (!isInteger || n < 3 || n > 7) {
      this.showError('invalidCount');                // show an error message
      return null;                                   // tell caller it’s not valid
    }

    // valid input, clear any old messages and return it
    this.clearMessage();
    return n;
  }

  // show a normal message using a key from the messages file
  showMessage(key) {
    const text = messages[key] ?? String(key);       // fall back to key if missing
    this.messageBox.textContent = text;              // put text in the message area
    this.messageBox.className = 'info';              // set style to "info"
  }

  // show an error message using a key from the messages file
  showError(key) {
    const text = messages[key] ?? String(key);       // fall back to key if missing
    this.messageBox.textContent = text;              // put text in the message area
    this.messageBox.className = 'error';             // set style to "error"
  }

  // remove any message and reset its styling
  clearMessage() {
    this.messageBox.textContent = '';
    this.messageBox.className = '';
  }

  // disable the Go button so it can't be clicked
  disableGo() {
    this.goBtn.disabled = true;
  }

  // enable the Go button so a new round can start
  enableGo() {
    this.goBtn.disabled = false;
  }
}
