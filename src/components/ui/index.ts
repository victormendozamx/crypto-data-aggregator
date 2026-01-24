/**
 * @fileoverview Premium UI Components Index
 * 
 * Exports all UI components for easy importing.
 * 
 * @module components/ui
 * 
 * @example
 * import { Button, Card, Badge, Input } from '@/components/ui';
 */

// Button Components
export { default as Button, IconButton } from './Button';
export type { ButtonProps, IconButtonProps } from './Button';

// Card Components
export { default as Card, CardHeader, CardContent, CardFooter, StatCard, FeatureCard } from './Card';
export type { CardProps, CardHeaderProps, StatCardProps, FeatureCardProps } from './Card';

// Badge Components
export { default as Badge, PriceChangeBadge, RankBadge, StatusBadge, ChainBadge } from './Badge';
export type { BadgeProps, PriceChangeBadgeProps, RankBadgeProps, StatusBadgeProps, ChainBadgeProps } from './Badge';

// Input Components
export { default as Input, SearchInput, NumberInput, Textarea } from './Input';
export type { InputProps, SearchInputProps, NumberInputProps, TextareaProps } from './Input';

// Tooltip Component
export { default as Tooltip } from './Tooltip';
export type { TooltipProps } from './Tooltip';

// Progress Components
export { default as Progress, ProgressBar, CircularProgress } from './Progress';
export type { ProgressProps, ProgressBarProps, CircularProgressProps } from './Progress';

// Divider Component
export { default as Divider } from './Divider';
export type { DividerProps } from './Divider';

// Avatar Component
export { default as Avatar, AvatarGroup } from './Avatar';
export type { AvatarProps, AvatarGroupProps } from './Avatar';

// Skeleton Component
export { default as Skeleton } from './Skeleton';
export type { SkeletonProps } from './Skeleton';
