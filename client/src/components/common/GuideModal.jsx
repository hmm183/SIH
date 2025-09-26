import React, { useContext, useEffect, useState } from "react";
import { GuideContext } from "../../context/GuideContext.jsx";
import { useLang } from '../../context/LangContext';

const GuideModal = () => {
  const { showGuide, currentGuide, stepIndex, nextStep, skipGuide } = useContext(GuideContext);
  const [style, setStyle] = useState({});
  // Add this new state variable:
  const [isPositionedBelow, setIsPositionedBelow] = useState(false);
  const { t } = useLang();
  const step = currentGuide[stepIndex]; // safe even if empty


  useEffect(() => {
    // Remove any existing highlights before doing anything
    document.querySelectorAll(".guide-highlight").forEach((el) => {
      el.classList.remove("guide-highlight");
    });

    if (!showGuide || !step) return;

    const el = document.querySelector(step.target);
    if (el) {
      el.classList.add("guide-highlight"); // highlight current button

      const rect = el.getBoundingClientRect();

      // --- Positioning Logic ---
      const cardWidth = 300; // Estimated width of max-w-xs
      const spaceFromEdge = 20;

      // 1. Check if positioning to the right (the default) would push the card off-screen
      const wouldGoOffScreenRight = rect.right + 10 + cardWidth > window.innerWidth - spaceFromEdge;

      // 2. Determine and set the final position
      setIsPositionedBelow(wouldGoOffScreenRight); // Position below if right-side overflow detected

      let topPos;
      let leftPos;

      if (wouldGoOffScreenRight) {
        // Position BELOW the element:

        // 💡 NEW CHECK: Check if aligning the card's LEFT edge with the target's LEFT edge 
        // would still cause the guide card's RIGHT edge to go off screen.
        const alignsToRightEdge = rect.left + cardWidth > window.innerWidth - spaceFromEdge;

        topPos = rect.bottom + 10 + window.scrollY;

        if (alignsToRightEdge) {
          // If it still overflows when starting from the left, align the card's RIGHT edge
          // with the target's RIGHT edge.
          leftPos = rect.right - cardWidth + window.scrollX;
        } else {
          // Align the card's LEFT edge with the target's LEFT edge (Original 'below' logic)
          leftPos = rect.left + window.scrollX;
        }
      } else {
        // Position to the RIGHT (Original default)
        topPos = rect.top + window.scrollY;
        leftPos = rect.right + 10 + window.scrollX;
      }

      setStyle({
        position: "absolute",
        top: topPos,
        left: leftPos,
        zIndex: 10001,
      });
    }

    // Cleanup on unmount or guide end
    return () => {
      document.querySelectorAll(".guide-highlight").forEach((el) => {
        el.classList.remove("guide-highlight");
      });
    };
  }, [step, showGuide]);

  if (!showGuide || !step) return null;
  const emojiStyle = isPositionedBelow
    ? {
      // Card is BELOW, so emoji is above the card, pointing up.
      top: (style.top || 0) - 35, // Move emoji up above the card
      left: (style.left || 0) + 10, // Align emoji with the start of the card
      transform: 'rotate(-90deg) scaleX(-1)', // Rotate and flip to point up
    }
    : {
      // Card is on the RIGHT, so emoji points left (Original logic)
      top: (style.top || 0) + 10,
      left: (style.left || 0) - 35,
      transform: 'scaleX(1)',
    };


  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-10000" />

      {/* Arrow pointing to button */}
      <div
        style={{
          position: "absolute",
          zIndex: 10002,
          fontSize: "2rem",
          color: "#fff",
          ...emojiStyle, // Apply the new dynamic style
        }}
      >
        👉
      </div>

      {/* Guide Card */}
      <div
        style={style}
        className="bg-white dark:bg-gray-900 p-4 rounded shadow-lg max-w-xs z-10001"
      >
        <p>{t(step.content)}</p>
        <div className="flex justify-end mt-2 space-x-2">
          <button onClick={skipGuide} className="px-3 py-1 rounded bg-gray-300 dark:bg-gray-700">
            {t('skip')}
          </button>
          <button onClick={nextStep} className="px-3 py-1 rounded bg-blue-600 text-white">
            {t('next')}
          </button>
        </div>
      </div>
    </>
  );
};

export default GuideModal;
