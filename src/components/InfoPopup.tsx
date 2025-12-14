import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { Info, X } from "lucide-react";

interface InfoPopupProps {
  title: string;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  iconSize?: number;
}

export const InfoPopup: React.FC<InfoPopupProps> = ({
  title,
  children,
  trigger,
  iconSize = 16,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Bloquer le scroll quand la pop-up est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Render de la pop-up
  const popupContent = isOpen ? (
    <div ref={popupRef}>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
        onClick={() => setIsOpen(false)}
      />

      {/* Popup content - CENTRÉ AU MILIEU DE L'ÉCRAN */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] sm:w-[420px] md:w-[500px] max-w-[540px] z-[9999] animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-blue-500/30 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-blue-950/30">
            <div className="flex items-center gap-2">
              <Info size={20} className="text-blue-400" />
              <h3 className="font-bold text-white text-sm">{title}</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 text-sm text-gray-300 leading-relaxed max-h-[70vh] overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Trigger - Inline */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
        aria-label="Plus d'informations"
      >
        {trigger || <Info size={iconSize} />}
      </button>

      {/* Popup Portal - MONTE DIRECTEMENT DANS <body> */}
      {popupContent && ReactDOM.createPortal(popupContent, document.body)}
    </>
  );
};
