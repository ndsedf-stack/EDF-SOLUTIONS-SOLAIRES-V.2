// components/VocabularySignal.tsx
import React, { useEffect, useState } from "react";

interface VocabularySignalProps {
  show: boolean; // vient du hook: signal != null
  color?: string; // optionnel selon profil
}

export function VocabularySignal({
  show,
  color = "rgba(80,150,255,0.35)",
}: VocabularySignalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 250); // 250ms — OK cerveau / invisible client
    return () => clearTimeout(timer);
  }, [show]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 pointer-events-none z-[9999]">
      <div
        className="rounded-full"
        style={{
          width: "14px",
          height: "14px",
          background: color,
          boxShadow: `0 0 18px 4px ${color}`,
          opacity: 0.28,
        }}
      />
    </div>
  );
}
