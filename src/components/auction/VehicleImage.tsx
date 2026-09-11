"use client";

import Image from "next/image";
import { useState } from "react";

import type { AuctionImage } from "@/lib/auction/types";

const UNAVAILABLE_IMAGE = "/brand.png";

export interface VehicleImageProps {
  alt: string;
  className?: string;
  image?: AuctionImage | null;
  fallbackAlt?: string;
  priority?: boolean;
  sizes?: string;
}

function isLocalAsset(url: string): boolean {
  return url.startsWith("/") && !url.startsWith("//");
}

export function VehicleImage({
  alt,
  className = "",
  fallbackAlt = "Vehicle image unavailable",
  image,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 33vw",
}: VehicleImageProps) {
  const requestedSource = image?.url?.trim() || null;
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const unavailable = requestedSource === null || failedSource === requestedSource;

  if (unavailable) {
    return (
      <div
        role="img"
        aria-label={fallbackAlt}
        className={`absolute inset-0 flex items-end justify-center overflow-hidden bg-surface-muted p-4 ${className}`}
      >
        <Image
          src={UNAVAILABLE_IMAGE}
          alt=""
          fill
          sizes={sizes}
          className="object-contain p-10 opacity-35"
        />
        <span className="relative z-10 rounded-md bg-surface-primary/90 px-3 py-1.5 text-xs font-bold text-text-secondary">
          {fallbackAlt}
        </span>
      </div>
    );
  }

  const source = requestedSource;

  if (isLocalAsset(source)) {
    return (
      <Image
        src={source}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={`object-cover ${className}`}
        onError={() => setFailedSource(requestedSource)}
      />
    );
  }

  return (
    // Unconfirmed API hosts intentionally bypass the Next image optimizer.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={source}
      alt={alt}
      width={1200}
      height={800}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
      onError={() => setFailedSource(requestedSource)}
    />
  );
}
