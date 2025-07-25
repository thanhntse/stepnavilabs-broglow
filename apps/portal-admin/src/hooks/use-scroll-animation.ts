import { useEffect, useRef, useState } from 'react';

export const useScrollAnimation = (threshold: number = 0.1, delay: number = 0) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Add delay for staggered animations
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
          // Unobserve once animated to improve performance
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: '50px 0px -50px 0px', // Trigger animation earlier
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, delay]);

  return { ref, isVisible };
};

export const useScrollAnimationMultiple = (threshold: number = 0.1, staggerDelay: number = 150) => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const timeouts = useRef<NodeJS.Timeout[]>([]);

  const createRef = (index: number) => (el: HTMLDivElement | null) => {
    refs.current[index] = el;
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elementIndex = refs.current.indexOf(entry.target as HTMLDivElement);
            if (elementIndex !== -1) {
              // Stagger animations for multiple items
              const timeout = setTimeout(() => {
                setVisibleItems(prev => new Set(prev).add(elementIndex));
              }, elementIndex * staggerDelay);

              timeouts.current[elementIndex] = timeout;
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold,
        rootMargin: '50px 0px -50px 0px', // Trigger animation earlier
      }
    );

    refs.current.forEach((ref) => {
      if (ref) {
        observer.observe(ref);
      }
    });

    return () => {
      refs.current.forEach((ref) => {
        if (ref) {
          observer.unobserve(ref);
        }
      });
      // Clear all timeouts
      timeouts.current.forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [threshold, staggerDelay]);

  const isVisible = (index: number) => visibleItems.has(index);

  return { createRef, isVisible };
};

// New hook for counter animations
export const useCountAnimation = (targetValue: number, duration: number = 2000, threshold: number = 0.1) => {
  const [currentValue, setCurrentValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);

          // Animate the counter
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            setCurrentValue(Math.floor(targetValue * easeOutCubic));

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: '50px 0px -50px 0px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [targetValue, duration, threshold, isVisible]);

  return { ref, currentValue, isVisible };
};

// Hook for typing animation effect
export const useTypingAnimation = (text: string, speed: number = 100, threshold: number = 0.1) => {
  const [displayText, setDisplayText] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);

          let index = 0;
          const typeText = () => {
            if (index < text.length) {
              setDisplayText(text.slice(0, index + 1));
              index++;
              setTimeout(typeText, speed);
            }
          };

          typeText();
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: '50px 0px -50px 0px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [text, speed, threshold, isVisible]);

  return { ref, displayText, isVisible };
};
