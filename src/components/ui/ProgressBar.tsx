import React from 'react';

interface ProgressBarProps {
  percentage: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  customColor?: string;
  animate?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  showLabel = false,
  size = 'md',
  customColor,
  animate = true,
}) => {
  const clamped = Math.max(0, percentage);
  const displayPercentage = Math.min(100, clamped);

  // Dynamic status color
  let barColor = customColor;
  if (!barColor) {
    if (clamped >= 100) {
      barColor = 'bg-danger';
    } else if (clamped >= 90) {
      barColor = 'bg-danger/80';
    } else if (clamped >= 75) {
      barColor = 'bg-warning';
    } else {
      barColor = 'bg-mint';
    }
  }

  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size];

  return (
    <div className="w-full">
      <div
        className={`w-full bg-slate-100 dark:bg-navy rounded-full overflow-hidden ${heightClass}`}
      >
        <div
          className={`${heightClass} rounded-full transition-all duration-500 ease-out ${
            barColor.startsWith('bg-') ? barColor : ''
          }`}
          style={{
            width: `${displayPercentage}%`,
            backgroundColor: !barColor.startsWith('bg-') ? barColor : undefined,
          }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center mt-1 text-xs text-ink-secondary dark:text-ink-darkSecondary">
          <span>{clamped.toFixed(1)}% used</span>
          {clamped >= 100 && (
            <span className="text-danger font-semibold text-[11px]">Budget Exceeded!</span>
          )}
        </div>
      )}
    </div>
  );
};
