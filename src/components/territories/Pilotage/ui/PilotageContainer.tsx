import React from 'react';

interface PilotageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PilotageContainer: React.FC<PilotageContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`w-full min-h-screen bg-[#0A0E27] p-10 ${className}`}>
      <div className="max-w-[1920px] mx-auto">
        {children}
      </div>
    </div>
  );
};
