"use client";

import createGlobe, { COBEOptions } from "cobe";
import { useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

const MOVEMENT_DAMPING = 1400;

// Chennai coordinates
const CHENNAI_LAT = 13.0827;
const CHENNAI_LNG = 80.2707;

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  // Offset the view to center near Chennai
  phi: CHENNAI_LAT * (Math.PI / 180) * 0.4, // Slight vertical offset
  theta: -CHENNAI_LNG * (Math.PI / 180) * 0.4, // Slight horizontal offset
  dark: 0,  // Disable dark mode for white land
  diffuse: 1.8,  // Increase diffuse for better contrast
  mapSamples: 16000,
  mapBrightness: 2.5,  // Increase brightness for whiter land
  baseColor: [1, 1, 1],  // White base for land
  markerColor: [251 / 255, 100 / 255, 21 / 255],  // Keep the marker color
  glowColor: [0, 0, 0],  // Black glow for contrast
  markers: [
    { 
      location: [CHENNAI_LAT, CHENNAI_LNG], 
      size: 0.1,
      color: [251 / 255, 100 / 255, 21 / 255] // Orange color for the marker
    },
  ],
};

export function Globe({ className, config = GLOBE_CONFIG }: { className?: string; config?: COBEOptions }) {
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const basePhi = CHENNAI_LAT * (Math.PI / 180) * 0.4; // Base phi for Chennai
  const baseTheta = -CHENNAI_LNG * (Math.PI / 180) * 0.4; // Base theta for Chennai
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentPhi = useMotionValue(0);
  const currentTheta = useMotionValue(0);
  const phiSpring = useSpring(currentPhi, { damping: 100, stiffness: 100 });
  const thetaSpring = useSpring(currentTheta, { damping: 100, stiffness: 100 });
  // Removed unused refs

  useEffect(() => {
    if (!canvasRef.current) return;

    let width = 0;
    
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    
    window.addEventListener('resize', onResize);
    onResize();

    const handlePointerDown = (e: PointerEvent) => {
      pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grabbing';
      }
    };

    const handlePointerUp = () => {
      pointerInteracting.current = null;
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grab';
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        const delta = e.clientX - pointerInteracting.current;
        pointerInteractionMovement.current = delta;
        currentTheta.set(baseTheta + (delta / 200));
      }
    };

    canvasRef.current.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointermove', handlePointerMove);

    const globe = createGlobe(canvasRef.current, {
      ...config,
      width: width * 2,
      height: width * 2,
      phi: basePhi,
      theta: baseTheta,
      onRender: (state) => {
        // Oscillate around Chennai
        const time = Date.now() * 0.001;
        const oscillation = Math.sin(time * 0.3) * 0.15; // Gentle oscillation
        
        state.phi = basePhi + Math.sin(time * 0.1) * 0.1; // Vertical oscillation
        state.theta = baseTheta + oscillation; // Horizontal oscillation
        
        // Update motion values
        currentPhi.set(state.phi);
        currentTheta.set(state.theta);
      },
    });

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointermove', handlePointerMove);
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('pointerdown', handlePointerDown);
      }
      globe.destroy();
    };
  }, [config]);

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-full",
        className
      )}
      style={{
        cursor: 'grab',
      }}
      onPointerDown={() => {
        if (canvasRef.current) {
          canvasRef.current.style.cursor = 'grabbing';
        }
      }}
      onPointerUp={() => {
        if (canvasRef.current) {
          canvasRef.current.style.cursor = 'grab';
        }
      }}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full"
      />
    </div>
  );
}
