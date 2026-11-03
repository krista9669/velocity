
import './style.css';
import { Game } from './game/Game.js';

const gameContainer = document.querySelector('#game-container');

const game = new Game(gameContainer);

// Clean up when the page is unloaded.
window.addEventListener('beforeunload', () => {
  game.dispose();
});