import { cn } from '../../utils/cn.js';

const variants = {
  default: 'bg-muted text-foreground',
  primary: 'bg-primary/10 text-primary',
  sale: 'bg-red-100 text-red-700',
  new: 'bg-blue-100 text-blue-700',
};

export default function Badge({ children, variant = 'default', className }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}
