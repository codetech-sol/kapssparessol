import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef } from "react";
import {
  Wrench,
  Cog,
  Zap,
  Disc,
  Filter,
  Truck,
  PaintBucket,
  Gauge,
  MapPin,
  Phone,
  Mail,
  Globe,
  ShieldCheck,
  Award,
  Handshake,
  ChevronRight,
} from "lucide-react";
import { ChatAssistant } from "@/components/chat-assistant";
import { RequestForm } from "@/components/request-form";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KAPS Spares Solutions — Genuine Auto Parts & Vehicle Services in Zambia" },
      {
        name: "description",
        content:
          "KAPS Spares Solutions Ltd supplies genuine auto spare parts, tyres, lubricants and full vehicle servicing across Zambia. Branches in Lusaka, Kitwe, Solwezi & Livingstone.",
      },
      { property: "og:title", content: "KAPS Spares Solutions — Spares That Drive You" },
      {
        property: "og:description",
        content:
          "Genuine spare parts for European, Japanese, American vehicles & heavy machinery. Vehicle servicing, panel beating, diagnostics. Nationwide delivery.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const services = [
  { icon: Cog, title: "Engine Components", desc: "Genuine engine parts for European, Japanese, American vehicles." },
  { icon: Disc, title: "Brake Systems", desc: "Pads, discs and complete brake system repairs." },
  { icon: Zap, title: "Auto Electrical", desc: "Electrical components and full auto-electrical repairs." },
  { icon: Filter, title: "Filters & Service Kits", desc: "Filters, plugs and full service kits in stock." },
  { icon: Truck, title: "Heavy-Duty & Trucks", desc: "Parts for commercial trucks and heavy machinery." },
  { icon: Gauge, title: "Suspension Systems", desc: "Complete suspension components for all vehicle categories." },
];

const workshop = [
  "Panel Beating",
  "Spray Painting",
  "Engine Servicing & Repairs",
  "Gearbox Servicing & Repairs",
  "General Mechanical Repairs",
  "Auto Electrical Repairs",
  "Brake System Repairs",
  "Computerized Diagnostics",
];

const branches = [
  { city: "LUSAKA", name: "Kalambo Branch", addr: "Plot 1680 Kalambo Road, opposite Ranan Hardware", phone: "+260 977 232 820" },
  { city: "LUSAKA", name: "Freedom Way Branch", addr: "Frank & Hirsch Building, Freedom Way", phone: "+260 974 958 589" },
  { city: "LUSAKA", name: "KAPS Service Centre", addr: "Plot 5111 Lumumba Road, opposite Micmar", phone: "+260 969 506 046" },
  { city: "KITWE", name: "Kitwe Branch", addr: "Along Freedom Road, opposite The Bamboo Tree", phone: "+260 969 372 474" },
  { city: "SOLWEZI", name: "Solwezi Branch", addr: "Along Independence Avenue, behind DAPP Stores", phone: "+260 966 723 009" },
  { city: "LIVINGSTONE", name: "Livingstone Branch", addr: "Along Kapondo Street", phone: "+260 773 438 001" },
];

function Landing() {
  const formRef = useRef<HTMLDivElement>(null);
  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="min-h-screen bg-background">
      {/* NAV */}
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <a href="#top" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Wrench className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-lg font-bold uppercase tracking-tight">KAPS Spares</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Solutions Ltd</p>
            </div>
          </a>
          <nav className="hidden gap-6 text-sm font-medium md:flex">
            <a href="#services" className="hover:text-primary">Services</a>
            <a href="#workshop" className="hover:text-primary">Workshop</a>
            <a href="#branches" className="hover:text-primary">Branches</a>
            <a href="#about" className="hover:text-primary">About</a>
            <a href="#contact" className="hover:text-primary">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={scrollToForm}>Request a Part</Button>
            <Link to="/admin" className="text-xs text-muted-foreground hover:text-foreground">Admin</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="relative overflow-hidden gradient-brand text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3), transparent 50%)" }} />
        <div className="relative mx-auto max-w-7xl px-4 py-24 md:py-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              Established 2016 · Zambia
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight md:text-7xl">
              Spares That <span className="text-gradient-brand">Drive You</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/85 md:text-xl">
              Genuine auto spare parts, tyres, lubricants and full vehicle servicing for European,
              Japanese, American vehicles and heavy-duty machinery — delivered across Zambia.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" variant="secondary" onClick={scrollToForm} className="bg-white text-secondary hover:bg-white/90">
                Request a Spare Part <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
              <a href="#services">
                <Button size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">
                  Explore Services
                </Button>
              </a>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-6 text-sm">
              <Stat n="6" label="Branches nationwide" />
              <Stat n="4" label="Sourcing countries" />
              <Stat n="24hr" label="Fast fulfilment" />
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="mx-auto max-w-7xl px-4 py-20">
        <SectionHeader eyebrow="Auto Spares Supply" title="Parts for every vehicle we can source" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.title} className="group rounded-xl border bg-card p-6 transition hover:border-primary hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-xl border border-dashed bg-muted/40 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't see what you need? We source virtually any part on demand from{" "}
            <strong className="text-foreground">China, Dubai, South Africa & Japan</strong>.
          </p>
          <Button className="mt-4" onClick={scrollToForm}>Submit a Spare Parts Request</Button>
        </div>
      </section>

      {/* WORKSHOP */}
      <section id="workshop" className="bg-secondary py-20 text-secondary-foreground">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Integrated Service Centre
            </span>
            <h2 className="mt-3 font-display text-4xl font-bold uppercase leading-tight md:text-5xl">
              End-to-end vehicle service &amp; bodywork
            </h2>
            <p className="mt-4 text-white/75">
              A fully operational automotive workshop serving passenger vehicles, commercial
              fleets and heavy-duty vehicles — committed to quality, reliability and professional
              workmanship.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {workshop.map((w) => (
                <div key={w} className="flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm">
                  <Wrench className="h-4 w-4 text-primary" />
                  {w}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FeatureCard icon={PaintBucket} title="Panel Beating & Spray" desc="Full bodywork restoration" />
            <FeatureCard icon={Gauge} title="Computerised Diagnostics" desc="Precision fault finding" />
            <FeatureCard icon={Cog} title="Engine & Gearbox" desc="Servicing and repairs" />
            <FeatureCard icon={Zap} title="Auto Electrical" desc="Wiring & electronics" />
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="mx-auto max-w-7xl px-4 py-20">
        <SectionHeader eyebrow="About KAPS" title="A dependable partner in mobility" />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <ValueCard icon={ShieldCheck} title="Vision" body="To rank among Zambia's top five leading suppliers of auto replacement parts and automotive service solutions." />
          <ValueCard icon={Handshake} title="Mission" body="Provide accessible, high-quality automotive parts and services across Zambia through efficient supply and customer-focused delivery." />
          <ValueCard icon={Award} title="Certified" body="PACRA registered, ZRA tax compliant, ZPPA supplier, and NAPSA compliant employer." />
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {["Customer Commitment", "Excellence & Quality", "Innovation", "Integrity", "Teamwork"].map((v) => (
            <div key={v} className="rounded-lg border bg-card p-4 text-center text-sm font-semibold">
              {v}
            </div>
          ))}
        </div>
      </section>

      {/* BRANCHES */}
      <section id="branches" className="bg-muted/40 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeader eyebrow="Nationwide Presence" title="Find your nearest KAPS branch" />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {branches.map((b) => (
              <div key={b.name} className="rounded-xl border bg-card p-6">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                  <MapPin className="h-4 w-4" /> {b.city}
                </div>
                <h3 className="mt-2 font-display text-xl font-bold">{b.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{b.addr}</p>
                <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="mt-3 flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                  <Phone className="h-4 w-4" /> {b.phone}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REQUEST FORM */}
      <section id="request" ref={formRef} className="mx-auto max-w-4xl scroll-mt-20 px-4 py-20">
        <SectionHeader eyebrow="Submit a Request" title="Tell us what you need" />
        <p className="mt-4 text-center text-muted-foreground">
          Send us the details of your spare part or service requirement and our team will get back
          to you with pricing and availability.
        </p>
        <div className="mt-10 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <RequestForm />
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="gradient-brand text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Contact</p>
            <h3 className="mt-2 font-display text-2xl font-bold uppercase">Get in touch</h3>
          </div>
          <div className="space-y-3 text-sm">
            <a href="mailto:kapssparessolution89@gmail.com" className="flex items-center gap-2 hover:underline">
              <Mail className="h-4 w-4" /> kapssparessolution89@gmail.com
            </a>
            <a href="mailto:sales@kapssparessolutions.co.za" className="flex items-center gap-2 hover:underline">
              <Mail className="h-4 w-4" /> sales@kapssparessolutions.co.za
            </a>
            <a href="tel:+260969506046" className="flex items-center gap-2 hover:underline">
              <Phone className="h-4 w-4" /> +260 969 506 046
            </a>
            <a href="https://www.kapssparessolutions.co.za" className="flex items-center gap-2 hover:underline">
              <Globe className="h-4 w-4" /> www.kapssparessolutions.co.za
            </a>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Delivery</p>
            <p className="mt-2 text-sm text-white/85">
              Free delivery within Lusaka. Nationwide delivery available at competitive rates.
            </p>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-white/60">
            © {new Date().getFullYear()} KAPS Spares Solutions Ltd. Spares That Drive You.
          </div>
        </div>
      </section>

      <ChatAssistant onOpenForm={scrollToForm} />
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl font-bold">{n}</p>
      <p className="mt-1 text-xs uppercase tracking-widest text-white/60">{label}</p>
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <span className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</span>
      <h2 className="mt-3 font-display text-4xl font-bold uppercase leading-tight md:text-5xl">{title}</h2>
    </div>
  );
}

function ValueCard({ icon: Icon, title, body }: { icon: typeof ShieldCheck; title: string; body: string }) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-xl font-bold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: typeof Wrench; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <Icon className="h-6 w-6 text-primary" />
      <h4 className="mt-3 font-display text-lg font-bold">{title}</h4>
      <p className="mt-1 text-xs text-white/70">{desc}</p>
    </div>
  );
}
