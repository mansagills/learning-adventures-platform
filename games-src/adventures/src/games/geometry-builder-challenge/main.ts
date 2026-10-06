import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import '@fontsource/pixelify-sans/500.css';
import '@fontsource/pixelify-sans/600.css';
import '../../kit/ui/kit.css';
import './geometry-builder-challenge.css';
import { Game } from './game';

function boot(): void {
  const host = document.getElementById('app')!;
  try {
    new Game(host).start();
  } catch (err) {
    console.error(err);
    host.innerHTML =
      '<div class="screen"><div class="panel title-card"><h1 class="logo">Shape Town Builders</h1><p>Sorry, this browser could not start the game. It needs WebGL, which is available in current Chrome, Edge, Safari and Firefox.</p></div></div>';
  }
}

boot();
