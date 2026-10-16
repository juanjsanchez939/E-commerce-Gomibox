import { cn } from '../../utils/cn.js';

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  secondary: 'bg-muted text-foreground hover:bg-border',
  outline: 'border border-border text-foreground hover:bg-muted',
  whatsapp: 'bg-whatsapp text-white hover:bg-whatsapp-dark',
  destructive: 'bg-destructive text-white hover:bg-red-600',
  ghost: 'text-foreground hover:bg-muted',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({ children, variant = 'primary', size = 'md', className, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
