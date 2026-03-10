import React from 'react';
import ParentSize from '@visx/responsive/lib/components/ParentSize';

interface HeroLayoutProps {
  children: (size: { width: number; height: number }) => React.ReactNode;
}

export const HeroLayout = ({ children }: HeroLayoutProps) => {
  return (
    <div className="flex-1 relative overflow-hidden rounded-xl bg-[#070B18]">
      <ParentSize>
        {({ width, height }) => (
          <div style={{ width, height }}>
            {children({ width, height })}
          </div>
        )}
      </ParentSize>
    </div>
  );
};
