import { useState } from 'react';
import StarField from './components/StarField';
import WarpTransition from './components/WarpTransition';
import Cockpit from './components/Cockpit';
import { slides } from './slides';

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideVisible, setSlideVisible] = useState(true);

  const navigate = (direction: 'next' | 'prev') => {
    if (isTransitioning) return;
    const nextIndex =
      direction === 'next'
        ? Math.min(currentSlide + 1, slides.length - 1)
        : Math.max(currentSlide - 1, 0);
    if (nextIndex === currentSlide) return;

    setIsTransitioning(true);
    setSlideVisible(false);

    setTimeout(() => {
      setCurrentSlide(nextIndex);
    }, 750);

    setTimeout(() => {
      setSlideVisible(true);
      setIsTransitioning(false);
    }, 1500);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <StarField isWarping={isTransitioning} />
      <WarpTransition isActive={isTransitioning} />
      <Cockpit
        currentSlide={currentSlide}
        totalSlides={slides.length}
        onNavigate={navigate}
        slideVisible={slideVisible}
        slideTitle={slides[currentSlide].title}
      >
        {slides[currentSlide].content}
      </Cockpit>
    </div>
  );
}
