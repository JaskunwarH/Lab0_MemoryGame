/* The code and comments in this file were created with the assistance of ChatGPT and Copilot */
import { Button } from './button.js'; // Button class for each clickable box
import { UI } from './ui.js';         // UI class to read input and show messages
import { Game } from './game.js';     // Game class that runs all game logic

const ui = new UI();                  // make one UI instance for the page
const game = new Game(ui);            // pass UI into Game so it can talk to the user

// when the user clicks Go, run the full game flow
document.getElementById('goBtn').addEventListener('click', async () => {
    const n = ui.getButtonCount();    // read and validate 3..7 from the input
    if (n === null) return;           // stop if the input is not valid

    ui.disableGo();                   // prevent spamming Go while we set up

    // Phase 1: setup
    game.startGame(n);                // create buttons and lay them out in a row
    ui.showMessage?.('memorize');     // tell the user to memorize the order

    // Phase 2: timing + scramble
    await game.pauseForSeconds(n);    // wait n seconds (same as number of buttons)
    ui.showMessage?.('scrambling');   // let the user know we are scrambling now
    await game.scrambleNTimes(n);     // move buttons around n times inside the box

    // Phase 3: play
    game.prepareForPlay();            // hide numbers and enable clicking in order

    // Re-enable Go only after a round ends (success/failure).
    // If you want Go available during play, move enableGo() earlier.
    ui.enableGo();                    // allow starting a new round again
});
