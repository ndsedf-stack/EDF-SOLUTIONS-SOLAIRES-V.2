import React from 'react';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title, subtitle, className = '' }) => {
  return (
    <div className={`mb-8 ${className}`}>
      <h2 className="font-display font-bold text-3xl text-white tracking-tight mb-2">
        {title}
      </h2>
      {subtitle && (
        <p className="font-sans text-sm text-text-secondary opacity-80">
          {subtitle}
        </p>
      )}
    </div>
  );
};
