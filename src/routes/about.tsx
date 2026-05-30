import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Cpu, UserCheck, Instagram, Linkedin } from "lucide-react";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Gaspo Studios" },
      { name: "description", content: "Meet the team behind Gaspo Studios — award-winning photographers blending technology and artistry." },
      { property: "og:title", content: "About — Gaspo Studios" },
      { property: "og:description", content: "Where technology meets artistry in photography." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

import { TeamMember } from "../types";

const team: TeamMember[] = [
  { name: "Marco Gaspari", role: "Founder & Lead Photographer", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80", bio: "Two-time Sony World Photography finalist. Marco founded Gaspo in 2014." },
  { name: "Elena Vasquez", role: "Creative Director", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80", bio: "Crafts the visual language of every brand and bride we work with." },
  { name: "Daniel Okonkwo", role: "Senior Photographer", role2: true, img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80", bio: "Specialist in editorial and commercial campaigns." },
  { name: "Aisha Patel", role: "Post-Production Lead", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=80", bio: "The eye behind every color grade and final retouch." },
];

function AboutPage() {
  return (
    <>
      <PageHeader 
        title="About Gaspo Studios" 
        crumb="About" 
        subtitle="Where technology meets artistry in photography." 
        image="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1920&q=80"
      />

      <section className="py-20 md:py-28">
        <div className="container-x grid md:grid-cols-2 gap-12 items-center">
          <img src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=900&q=80" alt="Studio team" className="rounded-2xl w-full h-[560px] object-cover" />
          <div>
            <p className="uppercase text-xs tracking-[0.25em] text-primary font-medium">Our Story</p>
            <h2 className="text-3xl md:text-5xl font-bold text-dark mt-3">Where Technology Meets Artistry in Photography</h2>
            <div className="space-y-4 mt-6 text-muted-foreground leading-relaxed">
              <p className="text-lg">
                Welcome to Gaspo Studios — a place where technology meets artistry in photography. Established by a group of passionate photographers, our studio has grown to become a cornerstone in the photography community, known for our commitment to quality and creativity.
              </p>
              <p>
                What started as a small studio has blossomed into a premiere photography destination. Over the years, we've expanded our services, continuously improving our techniques and adopting the latest technology to enhance our photographic output.
              </p>
            </div>

            <div className="mt-8 p-6 bg-muted/50 rounded-2xl border-l-4 border-primary shadow-sm">
              <h4 className="font-bold text-primary uppercase tracking-[0.2em] text-xs">Our Commitment</h4>
              <p className="text-muted-foreground mt-2 leading-relaxed">
                At Gaspo Studios, we are committed to sustainability and community involvement. We strive to minimize our environmental impact and actively participate in community projects, believing that great businesses can also be great neighbors.
              </p>
            </div>

            <Link to="/gallery" className="inline-flex items-center gap-2 mt-8 border border-dark text-dark rounded-full px-7 py-3 font-medium hover:bg-dark hover:text-white transition-all group">
              View Our Work <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-muted/40">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto">
            <p className="uppercase text-xs tracking-[0.25em] text-primary font-medium">Our Team</p>
            <h2 className="text-3xl md:text-5xl font-bold text-dark mt-3">Meet Our Team</h2>
            <p className="text-muted-foreground mt-4">Award-winning photographers, visionary stylists, and attentive support staff working in collaboration.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {team.map((m) => (
              <div key={m.name} className="group">
                <div className="overflow-hidden rounded-2xl aspect-[3/4]">
                  <img src={m.img} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <h3 className="text-xl font-bold text-dark mt-4">{m.name}</h3>
                <p className="text-primary text-sm font-medium">{m.role}</p>
                <p className="text-muted-foreground text-sm mt-2">{m.bio}</p>
                <div className="flex gap-2 mt-3">
                  <a href="#" className="w-8 h-8 rounded-full bg-dark/5 hover:bg-primary hover:text-white text-dark flex items-center justify-center"><Instagram size={14} /></a>
                  <a href="#" className="w-8 h-8 rounded-full bg-dark/5 hover:bg-primary hover:text-white text-dark flex items-center justify-center"><Linkedin size={14} /></a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-dark text-white">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto">
            <p className="uppercase text-xs tracking-[0.25em] text-primary font-medium">Why Us</p>
            <h2 className="text-3xl md:text-5xl font-bold mt-3">Why Choose Gaspo Studios</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              { icon: Sparkles, t: "Professional Expertise", d: "With years of experience and a keen eye for detail, we ensure that your photos are nothing short of spectacular." },
              { icon: Cpu, t: "State-of-the-Art Technology", d: "We use the latest photography equipment and techniques to deliver consistently high-quality images." },
              { icon: UserCheck, t: "Customized Experience", d: "We tailor every photo shoot to meet your specific needs and preferences, ensuring your vision is fully realized." },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="bg-dark-secondary rounded-2xl p-8 border border-border-dark">
                <div className="w-14 h-14 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                  <Icon size={24} />
                </div>
                <h3 className="text-2xl font-bold mt-6">{t}</h3>
                <p className="text-white/70 mt-3 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}