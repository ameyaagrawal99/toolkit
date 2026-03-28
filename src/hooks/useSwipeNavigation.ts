import { useEffect, useState, useRef } from 'react';

interface SwipeNavigationProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  threshold?: number;
}

export const useSwipeNavigation = ({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50
}: SwipeNavigationProps) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(15); // Slightly longer vibration for navigation
    }
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const onTouchStart = (e: TouchEvent) => {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > threshold;
      const isRightSwipe = distance < -threshold;

      if (isLeftSwipe) {
        triggerHaptic();
        onSwipeLeft();
      }
      if (isRightSwipe) {
        triggerHaptic();
        onSwipeRight();
      }

      setTouchStart(null);
      setTouchEnd(null);
    };

    element.addEventListener('touchstart', onTouchStart);
    element.addEventListener('touchmove', onTouchMove);
    element.addEventListener('touchend', onTouchEnd);

    return () => {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchend', onTouchEnd);
    };
  }, [touchStart, touchEnd, onSwipeLeft, onSwipeRight, threshold]);

  return elementRef;
};
