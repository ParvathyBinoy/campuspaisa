import React from 'react';
import * as LucideIcons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  color?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  className = 'w-5 h-5',
  color,
  size = 20,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.Tag;

  return <IconComponent className={className} style={{ color }} size={size} />;
};

export const AVAILABLE_CATEGORY_ICONS = [
  'Utensils',
  'GraduationCap',
  'Home',
  'Bus',
  'Sparkles',
  'HeartPulse',
  'Wifi',
  'Tv',
  'ShoppingBag',
  'Film',
  'BookOpen',
  'Receipt',
  'Heart',
  'Wallet',
  'Briefcase',
  'Laptop',
  'Award',
  'Landmark',
  'Gift',
  'RotateCcw',
  'Coins',
  'Plane',
  'ShieldCheck',
  'Coffee',
  'Smartphone',
  'Book',
  'Music',
  'Tag',
  'MoreHorizontal',
];
