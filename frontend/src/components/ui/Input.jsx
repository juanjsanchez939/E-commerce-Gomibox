import { cn } from '../../utils/cn.js';

export default function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors',
        className
      )}
      {...props}
    />
  );
}
