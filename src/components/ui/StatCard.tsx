import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  amount: string;
  subtitle?: string;
  icon: ReactNode;
  badge?: {
    text: string;
    variant: 'success' | 'danger' | 'warning' | 'neutral';
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  subtitle,
  icon,
  badge,
  onClick,
}) => {
  const badgeClasses = {
    success: 'bg-mint/10 text-mint dark:bg-mint/20',
    danger: 'bg-danger/10 text-danger dark:bg-danger/20',
    warning: 'bg-warning/10 text-warning-dark dark:bg-warning/20',
    neutral: 'bg-slate-100 text-ink-secondary dark:bg-navy-light dark:text-ink-darkSecondary',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-navy-card rounded-2xl p-5 border border-surface-border/70 dark:border-surface-darkBorder/70 shadow-card hover:shadow-card-hover transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-secondary dark:text-ink-darkSecondary">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-ink-primary dark:text-white mt-1.5 tracking-tight">
            {amount}
          </h3>
        </div>
        <div className="p-2.5 rounded-xl bg-surface-light dark:bg-navy text-primary dark:text-mint flex-shrink-0">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        {subtitle && (
          <span className="text-ink-secondary dark:text-ink-darkSecondary truncate">
            {subtitle}
          </span>
        )}
        {badge && (
          <span
            className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ml-auto ${
              badgeClasses[badge.variant]
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>
    </div>
  );
};
