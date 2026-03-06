import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <Loader2 className={`animate-spin text-primary ${className}`} size={size} />
);

export default LoadingSpinner;
