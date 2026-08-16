import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const dot = dotRef.current;
    if (!cursor || !dot) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Move dot instantly
      gsap.to(dot, {
        x: mouseX,
        y: mouseY,
        duration: 0,
      });
    };

    const animate = () => {
      // Ease outer ring towards mouse position
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;

      gsap.set(cursor, {
        x: cursorX,
        y: cursorY,
      });

      requestAnimationFrame(animate);
    };

    const onHoverEnter = () => {
      gsap.to(cursor, { scale: 1.5, borderColor: '#E6FF00', duration: 0.3 });
      gsap.to(dot, { scale: 0, duration: 0.3 });
    };

    const onHoverLeave = () => {
      gsap.to(cursor, { scale: 1, borderColor: 'rgba(255,255,255,0.5)', duration: 0.3 });
      gsap.to(dot, { scale: 1, duration: 0.3 });
    };

    window.addEventListener('mousemove', onMouseMove);
    requestAnimationFrame(animate);

    // Add listeners to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, select');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', onHoverEnter);
      el.addEventListener('mouseleave', onHoverLeave);
    });

    // Observer for dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const el = node as Element;
            if (el.matches('a, button, input, textarea, select')) {
              el.addEventListener('mouseenter', onHoverEnter);
              el.addEventListener('mouseleave', onHoverLeave);
            }
            el.querySelectorAll('a, button, input, textarea, select').forEach((child) => {
              child.addEventListener('mouseenter', onHoverEnter);
              child.addEventListener('mouseleave', onHoverLeave);
            });
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', onHoverEnter);
        el.removeEventListener('mouseleave', onHoverLeave);
      });
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-white/50 pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 will-change-transform mix-blend-difference"
      />
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 bg-primary rounded-full pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 will-change-transform mix-blend-difference"
      />
    </>
  );
};
