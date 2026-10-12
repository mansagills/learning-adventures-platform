import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import '@fontsource/pixelify-sans/500.css';
import '@fontsource/pixelify-sans/600.css';
import '../kit/ui/kit.css';
import './lookdev.css';
import { pageParams } from './nav';
import { showSheet } from './sheet';

/**
 * Look development pages for the new game worlds (phase W0). Not part of the
 * site build: open them with `npm run dev` at /lookdev/.
 *   ?view=sheet                         the character test
 *   ?view=scene&world=star|ancient&level=a|b|c&time=day|evening
 * or the same as a #token, for example #star-day or #ancient-evening-talk.
 * Body System Heroes: #body-cast, #body-lungs, #body-blood, #body-stomach.
 */
const q = pageParams();
window.addEventListener('hashchange', () => location.reload());
const host = document.getElementById('app')!;
const view = q.get('view') ?? 'sheet';
if (view === 'scene') {
  import('./scene').then((m) => m.showScene(host, q));
} else if (view === 'body') {
  import('./body').then((m) => m.showBodyScene(host, q));
} else if (view === 'body-cast') {
  import('./body').then((m) => m.showBodyCast(host));
} else showSheet(host, q);
