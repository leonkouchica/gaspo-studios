import { Link } from "@tanstack/react-router";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img
        src="/logo.webp"
        alt="Gaspo Studios"
        className={`h-8 md:h-10 w-auto object-contain ${light ? "brightness-0 invert" : ""}`}
      />
    </Link>
  );
}