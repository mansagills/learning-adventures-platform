import { ReactNode } from 'react';
import WelcomeSlide from './WelcomeSlide';
import DecimalPlacesSlide from './DecimalPlacesSlide';
import AddingDecimalsSlide from './AddingDecimalsSlide';
import SubtractingDecimalsSlide from './SubtractingDecimalsSlide';
import PracticeSlide from './PracticeSlide';

export interface Slide {
  title: string;
  content: ReactNode;
}

export const slides: Slide[] = [
  { title: 'WELCOME — MISSION BRIEFING', content: <WelcomeSlide /> },
  { title: 'SECTOR 1 — DECIMAL PLACES', content: <DecimalPlacesSlide /> },
  { title: 'SECTOR 2 — ADDING DECIMALS', content: <AddingDecimalsSlide /> },
  { title: 'SECTOR 3 — SUBTRACTING DECIMALS', content: <SubtractingDecimalsSlide /> },
  { title: 'SECTOR 4 — PRACTICE MISSION', content: <PracticeSlide /> },
];
