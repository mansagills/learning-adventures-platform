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
 * Solar System Explorer: #space-cast, #space-observatory, #space-mars, #space-mercury, #space-jupiter.
 * Wild Lands and Ocean Depth Diver: #wild-cast, #wild-camp, #wild-camp-evening, #wild-reef (-sunlight, -twilight, -midnight).
 * Fossil Dig Adventure: #dig-cast, #dig-site, #dig-site-evening, #dig-quarry, #dig-cliff, #dig-trackway, #dig-glow, #dig-glow-uv.
 * Animal Kingdom Match: #animal-cast, #animal-camp, #animal-rainforest, #animal-desert, #animal-polar, #animal-wetland (each with -evening).
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
} else if (view === 'space') {
  import('./space').then((m) => m.showSpaceScene(host, q));
} else if (view === 'space-cast') {
  import('./space').then((m) => m.showSpaceCast(host));
} else if (view === 'space-jupiter') {
  import('./space').then((m) => m.showJupiterDive(host, q));
} else if (view === 'wild-camp') {
  import('./wild').then((m) => m.showWildCamp(host, q));
} else if (view === 'wild-cast') {
  import('./wild').then((m) => m.showWildCast(host));
} else if (view === 'wild-reef') {
  import('./wild').then((m) => m.showWildReef(host, q));
} else if (view === 'dig-site') {
  import('./dig').then((m) => m.showDigSite(host, q));
} else if (view === 'dig-cast') {
  import('./dig').then((m) => m.showDigCast(host));
} else if (view === 'dig-view') {
  import('./dig').then((m) => m.showDigView(host, q));
} else if (view === 'animal') {
  import('./animal').then((m) => m.showAnimalScene(host, q));
} else if (view === 'animal-cast') {
  import('./animal').then((m) => m.showAnimalCast(host));
} else showSheet(host, q);
