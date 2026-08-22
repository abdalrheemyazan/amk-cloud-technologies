"use client";

import { useState } from "react";

/**
 * Validates if a given URL string is a genuine image source.
 * Filters out "null", "undefined", empty strings, and non-image URI schemes.
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const trimmed = typeof url === "string" ? url.trim() : "";
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (
    lower === "null" ||
    lower === "undefined" ||
    lower === "none" ||
    lower === "[object object]" ||
    lower === "false"
  ) {
    return false;
  }
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("blob:")
  );
}

/**
 * Generates uppercase 1-2 character initials from any Hebrew, Arabic, or English name.
 * Examples:
 * - "yazan AbdAlRheem" -> "YA"
 * - "נור אלדין חסין" -> "נא"
 * - "yazan" -> "YA"
 * - null / "" -> "AMK"
 */
export function getAgentInitials(name: string | null | undefined): string {
  const clean = name?.trim();
  if (!clean) return "AMK";
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AMK";
  if (parts.length === 1) {
    const single = parts[0];
    return single.length >= 2 ? single.slice(0, 2).toUpperCase() : single.toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export const getUserInitials = getAgentInitials;

export default function SupportAgentAvatar({
  name,
  imageUrl,
  className = "h-10 w-10",
  textClassName = "text-xs",
}: {
  name: string | null | undefined;
  imageUrl?: string | null;
  className?: string;
  textClassName?: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const cleanUrl = isValidImageUrl(imageUrl) ? imageUrl!.trim() : null;
  const isFailed = Boolean(cleanUrl && failedUrl === cleanUrl);
  const showImage = Boolean(cleanUrl && !isFailed);

  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0B1739] font-black text-white select-none ${className} ${textClassName}`}
      aria-label={name ? `תמונת הפרופיל של ${name}` : "תמונת פרופיל"}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={cleanUrl}
          src={cleanUrl!}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => {
            if (cleanUrl) setFailedUrl(cleanUrl);
          }}
        />
      ) : (
        <span aria-hidden="true">{getAgentInitials(name)}</span>
      )}
    </span>
  );
}

export const UserAvatar = SupportAgentAvatar;
export const CustomerAvatar = SupportAgentAvatar;
