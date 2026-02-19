"use client";

import { useRef, useState, type ReactNode } from "react";
import { Trash2 } from "lucide-react";

const DELETE_THRESHOLD = 80;
const ACTION_WIDTH = 100;

interface SwipeableDeleteProps {
  onDelete: () => void;
  children: ReactNode;
}

export function SwipeableDelete({ onDelete, children }: SwipeableDeleteProps) {
  const startX = useRef(0);
  const startY = useRef(0);
  const swiping = useRef(false);
  const [offsetX, setOffsetX] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  function handleTouchStart(e: React.TouchEvent) {
    if (revealed) return;
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    swiping.current = false;
    setTransitioning(false);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (revealed) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    // Only start swiping if horizontal movement is dominant
    if (!swiping.current) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        swiping.current = true;
      } else if (Math.abs(dy) > 10) {
        // Vertical scroll — bail out
        return;
      } else {
        return;
      }
    }

    // Only allow left swipe (negative dx), clamp to -ACTION_WIDTH
    const clampedX = Math.max(-ACTION_WIDTH, Math.min(0, dx));
    setOffsetX(clampedX);
  }

  function handleTouchEnd() {
    if (revealed) return;
    setTransitioning(true);
    if (offsetX < -DELETE_THRESHOLD) {
      setOffsetX(-ACTION_WIDTH);
      setRevealed(true);
    } else {
      setOffsetX(0);
    }
  }

  function handleDelete() {
    setTransitioning(true);
    setOffsetX(0);
    setRevealed(false);
    onDelete();
  }

  function handleClose() {
    setTransitioning(true);
    setOffsetX(0);
    setRevealed(false);
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Delete action behind */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-center bg-destructive text-white"
        style={{ width: ACTION_WIDTH }}
      >
        <button
          onClick={handleDelete}
          className="flex h-full w-full flex-col items-center justify-center gap-1"
        >
          <Trash2 className="h-5 w-5" />
          <span className="text-[11px] font-semibold">Delete</span>
        </button>
      </div>

      {/* Swipeable content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={revealed ? handleClose : undefined}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: transitioning ? "transform 0.25s ease-out" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
