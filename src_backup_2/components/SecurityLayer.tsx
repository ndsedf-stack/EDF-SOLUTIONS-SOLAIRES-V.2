import React, { useEffect } from 'react';
import './protected-content.css';

interface SecurityLayerProps {
  studyId?: string;
}

export const SecurityLayer: React.FC<SecurityLayerProps> = ({ studyId }) => {
  useEffect(() => {
    // 🖱️ Bloquer Clic Droit
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // ⌨️ Bloquer Raccourcis (Ctrl+C, Ctrl+P, F12)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+C / Cmd+C (Copie)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
      }
      // Ctrl+P / Cmd+P (Print)
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
      }
      // Ctrl+S / Cmd+S (Save)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
      }
      // F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
      }
    };

    // Ajouter la classe globale au body
    document.body.classList.add('protected-mode');

    // Attach Logique
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      // Nettoyage (Clean rollback)
      document.body.classList.remove('protected-mode');
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Générer le filigrane
  const watermarkText = `CONFIDENTIEL ${studyId ? `- ${studyId.slice(0, 8)}` : ''}`;
  const items = Array.from({ length: 50 }); // 50 répétitions

  return (
    <div className="watermark-container">
      {items.map((_, i) => (
        <div key={i} className="watermark-item">
          {watermarkText}
        </div>
      ))}
    </div>
  );
};
