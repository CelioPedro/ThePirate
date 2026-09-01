import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ScrollableRail({
  className,
  label,
  variant = "default",
  children
}: {
  className: string;
  label: string;
  variant?: "default" | "category";
  children: React.ReactNode;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    function updateScrollState() {
      if (!rail) return;
      const maxScroll = rail.scrollWidth - rail.clientWidth;
      setCanScrollPrevious(rail.scrollLeft > 4);
      setCanScrollNext(rail.scrollLeft < maxScroll - 4);
    }

    updateScrollState();
    rail.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      rail.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [children]);

  function scrollRail(direction: "previous" | "next") {
    const rail = railRef.current;
    if (!rail) return;
    const distance = Math.max(rail.clientWidth * 0.82, 260);
    rail.scrollBy({
      left: direction === "next" ? distance : -distance,
      behavior: "smooth"
    });
  }

  return (
    <div className={`rail-frame rail-frame-${variant} ${canScrollPrevious ? "has-previous" : ""} ${canScrollNext ? "has-next" : ""}`}>
      <button
        type="button"
        className="rail-nav rail-nav-prev"
        aria-label={`${label} para esquerda`}
        disabled={!canScrollPrevious}
        onClick={() => scrollRail("previous")}
      >
        <ChevronLeft size={22} strokeWidth={2.2} />
      </button>
      <div ref={railRef} className={className} tabIndex={0}>
        {children}
      </div>
      <button
        type="button"
        className="rail-nav rail-nav-next"
        aria-label={`${label} para direita`}
        disabled={!canScrollNext}
        onClick={() => scrollRail("next")}
      >
        <ChevronRight size={22} strokeWidth={2.2} />
      </button>
    </div>
  );
}
