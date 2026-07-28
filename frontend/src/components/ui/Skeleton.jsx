export default function Skeleton({ className }) {
  return <div className={`animate-pulse bg-muted rounded ${className || 'h-4 w-full'}`} />;
}
