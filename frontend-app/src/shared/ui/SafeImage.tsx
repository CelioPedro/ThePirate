import { type ReactNode, useEffect, useState } from "react";

interface SafeImageProps {
  src?: string | null;
  alt: string;
  fallback: ReactNode;
  className?: string;
  loading?: "eager" | "lazy";
}

export function SafeImage({ src, alt, fallback, className, loading }: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setHasError(true)}
    />
  );
}
