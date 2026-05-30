import { Link } from "@tanstack/react-router";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
      <span className="text-primary">GASPO</span>
      <span className={light ? "text-white" : "text-dark"}>STUDIOS</span>
    </Link>
  );
}