import { createFileRoute } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Gaspo Studios" },
      { name: "description", content: "Photography gear, accessories, and prints curated by the Gaspo Studios team." },
      { property: "og:title", content: "Shop — Gaspo Studios" },
      { property: "og:url", content: "/shop" },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  component: ShopPage,
});

import { Product } from "../types";

const products: Product[] = [
  { cat: "Camera", name: "Pro Mirrorless 35mm Body", price: "₦3,750,000", img: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80" },
  { cat: "Lens", name: "85mm f/1.4 Portrait Lens", price: "₦1,950,000", img: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600&q=80" },
  { cat: "Lighting", name: "Softbox Studio Kit", price: "₦735,000", img: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&q=80" },
  { cat: "Bag", name: "Weatherproof Field Bag", price: "₦345,000", img: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&q=80" },
  { cat: "Tripod", name: "Carbon Travel Tripod", price: "₦525,000", img: "https://images.unsplash.com/photo-1610917040803-1fccf9623064?w=600&q=80" },
  { cat: "Print", name: 'Signed Fine Art Print 12"x18"', price: "₦240,000", img: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&q=80" },
  { cat: "Lens", name: "24-70mm f/2.8 Zoom", price: "₦2,850,000", img: "https://images.unsplash.com/photo-1617638924751-5e0b78ed5391?w=600&q=80" },
  { cat: "Accessory", name: "Color Calibration Card", price: "₦89,000", img: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80" },
];

function ShopPage() {
  return (
    <>
      <PageHeader title="Photography Gear & Accessories" crumb="Shop" subtitle="Studio-tested equipment and signed prints, curated by the Gaspo team." />

      <section className="py-20 md:py-28">
        <div className="container-x">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <div key={p.name} className="group bg-white rounded-2xl p-4 border border-border hover:-translate-y-1 hover:shadow-lg transition-all">
                <div className="rounded-xl overflow-hidden bg-muted aspect-square">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <p className="text-xs text-primary font-medium uppercase tracking-wider mt-4">{p.cat}</p>
                <p className="font-semibold text-dark mt-1 line-clamp-2 min-h-[3rem]">{p.name}</p>
                <p className="text-lg font-bold text-dark mt-1">{p.price}</p>
                <button className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover transition-colors text-white rounded-full py-2.5 text-sm font-medium">
                  <ShoppingBag size={14} /> Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}