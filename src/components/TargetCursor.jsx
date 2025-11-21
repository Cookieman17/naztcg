import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './TargetCursor.css';

const TargetCursor = ({
  spinDuration = 2,
  hideDefaultCursor = true,
  parallaxOn = true,
  className = ''
}) => {
  const cursorRef = useRef(null);
  const targetRef = useRef(null);
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isInSection, setIsInSection] = useState(false);
  const mousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Don't hide cursor globally anymore

    const cursor = cursorRef.current;
    const target = targetRef.current;

    if (!cursor || !target) return;

    // Initialize GSAP animations
    const spinAnimation = gsap.to(target, {
      rotation: 360,
      duration: spinDuration,
      ease: 'none',
      repeat: -1
    });

    const handleSectionMouseEnter = () => {
      setIsInSection(true);
      setIsVisible(true);
      if (hideDefaultCursor) {
        document.body.style.cursor = 'none';
      }
    };

    const handleSectionMouseLeave = () => {
      setIsInSection(false);
      setIsVisible(false);
      setIsHovering(false);
      if (hideDefaultCursor) {
        document.body.style.cursor = 'auto';
      }
    };

    const handleMouseMove = (e) => {
      if (!isInSection) return;
      
      mousePosition.current = { x: e.clientX, y: e.clientY };

      if (parallaxOn) {
        gsap.to(cursor, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.1,
          ease: 'power2.out'
        });
      } else {
        gsap.set(cursor, {
          x: e.clientX,
          y: e.clientY
        });
      }
    };

    const handleMouseEnter = (e) => {
      if (isInSection && e.target.classList.contains('cursor-target')) {
        setIsHovering(true);
        gsap.to(cursor, {
          scale: 1.5,
          duration: 0.2,
          ease: 'power2.out'
        });
      }
    };

    const handleMouseLeave = (e) => {
      if (e.target.classList.contains('cursor-target')) {
        setIsHovering(false);
        gsap.to(cursor, {
          scale: 1,
          duration: 0.2,
          ease: 'power2.out'
        });
      }
    };

    // Get the section element (parent of cursor)
    const section = cursorRef.current?.parentElement;
    
    if (section) {
      // Add event listeners only to the section
      section.addEventListener('mouseenter', handleSectionMouseEnter);
      section.addEventListener('mouseleave', handleSectionMouseLeave);
    }
    
    // Global listeners for mouse movement and target interactions
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);

    return () => {
      // Cleanup
      const section = cursorRef.current?.parentElement;
      if (section) {
        section.removeEventListener('mouseenter', handleSectionMouseEnter);
        section.removeEventListener('mouseleave', handleSectionMouseLeave);
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
      
      // Always restore cursor on cleanup
      document.body.style.cursor = 'auto';
      
      spinAnimation.kill();
    };
  }, [spinDuration, hideDefaultCursor, parallaxOn, isVisible, isInSection]);

  return (
    <div
      ref={cursorRef}
      className={`target-cursor ${isVisible && isInSection ? 'visible' : ''} ${isHovering ? 'hovering' : ''} ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div ref={targetRef} className="target-cursor-inner">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer circle */}
          <circle
            cx="20"
            cy="20"
            r="18"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            opacity="0.6"
          />
          {/* Cross hairs */}
          <line x1="20" y1="2" x2="20" y2="8" stroke="currentColor" strokeWidth="2" />
          <line x1="20" y1="32" x2="20" y2="38" stroke="currentColor" strokeWidth="2" />
          <line x1="2" y1="20" x2="8" y2="20" stroke="currentColor" strokeWidth="2" />
          <line x1="32" y1="20" x2="38" y2="20" stroke="currentColor" strokeWidth="2" />
          {/* Center dot */}
          <circle cx="20" cy="20" r="2" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
};

export default TargetCursor;