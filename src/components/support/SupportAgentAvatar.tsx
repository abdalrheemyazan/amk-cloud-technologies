export function getAgentInitials(name: string | null | undefined) {
  return (name?.trim() || "AMK")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

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
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0B1739] font-black text-white ${className} ${textClassName}`}
    >
      {imageUrl ? (
        // A future storage provider may return an arbitrary HTTPS host, so this deliberately avoids Next Image host coupling.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={`תמונת הפרופיל של ${name || "נציג התמיכה"}`} className="h-full w-full object-cover" />
      ) : (
        getAgentInitials(name)
      )}
    </span>
  );
}
