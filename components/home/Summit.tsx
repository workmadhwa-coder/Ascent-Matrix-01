"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

// Speaker Card Component with 2-per-row mobile logic and colorful images
const SpeakerCard = ({ name, title, image }: { name: string; title: string; image: string }) => (
  <div className="bg-zinc-900/80 border border-white/5 rounded-2xl p-3 md:p-5 flex flex-col items-center text-center group transition-all duration-300">
    <div className="w-16 h-16 md:w-24 md:h-24 mb-3 md:mb-4 rounded-full overflow-hidden border-2 border-fuchsia-500/30">
      <img 
        src={image} 
        alt={name} 
        className="w-full h-full object-cover" // Removed grayscale
      />
    </div>
    <h5 className="text-white font-black text-[10px] md:text-sm uppercase mb-1 leading-tight">{name}</h5>
    <p className="text-fuchsia-400/80 text-[8px] md:text-[10px] leading-tight uppercase tracking-wider line-clamp-2 font-bold">{title}</p>
  </div>
);

const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div className="w-full bg-black font-sans md:px-10" ref={containerRef}>
      <div className="max-w-7xl mx-auto py-20 px-4 md:px-8 lg:px-10">
        <h2 className="text-4xl md:text-6xl font-black text-white mb-4 italic uppercase tracking-tighter">
          Event <span className="text-fuchsia-500">Timeline</span>
        </h2>
        <p className="text-neutral-400 text-sm md:text-lg max-w-sm">
          Join us through the journey of the Ascent Matrix series.
        </p>
      </div>

      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <div key={index} className="flex justify-start pt-10 md:pt-40 md:gap-10">
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-black flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-fuchsia-500 border border-fuchsia-400 p-2 shadow-[0_0_10px_rgba(219,39,119,0.5)]" />
              </div>
              <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold text-neutral-500">
                {item.title}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-neutral-500">
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}

        <div
          style={{ height: height + "px" }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-700 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{ height: heightTransform, opacity: opacityTransform }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-purple-500 via-fuchsia-500 to-transparent from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

export const Summit = () => {
  const preludeSpeakers = [
    { name: "Dr. S R Mahadeva Prasanna", title: "Director, IIIT-Dharwad", image: "https://res.cloudinary.com/dzss2fubc/image/upload/v1767538776/mahadev_prasanna_omuzez.jpg" },
     { name: "mr. R. Gopinath Rao, IEDS", title: "Dy. Director (Rtd.), MSME, Govt. of India", image: "https://res.cloudinary.com/dzss2fubc/image/upload/v1768923125/R.-Gopinath-Rao_cemuol.png" },
    { name: "Dr. Sudheendra Koushik", title: "Chairperson, IEEE-TEMS", image: "https://res.cloudinary.com/dzss2fubc/image/upload/v1767541578/sudheendra_koushik_jdkq1b.jpg" },
    { name: "Mr. Siddesh Math", title: "Corporate VP, AMD India", image: "https://res.cloudinary.com/dzss2fubc/image/upload/v1767541576/siddhesh_kth4e3.jpg" },
    { name: "Dr. Viswanathan Seshan", title: "Founder, ViSwan Consulting", image: "https://res.cloudinary.com/dzss2fubc/image/upload/v1768924779/SESHAN_fjoxdm.jpg" },
    { name: "Mr. Om Prakash", title: "Founder, Oms Patent Services", image: "https://res.cloudinary.com/dzss2fubc/image/upload/v1768986555/om_prakash_jhamz7.jpg" },
    { name: "Dr. Brinda Varma", title: "Founder, Aekam legal", image: "https://res.cloudinary.com/dzss2fubc/image/upload/v1767541551/brinda_abceq8.jpg" },
    { name: "Dr. Vijay Sarathy", title: "Head- Licensing and Analytics, SKLS", image: "https://res.cloudinary.com/dzss2fubc/image/upload/v1768924780/VIJAY_SARATHY_bcrbxn.jpg" },
    { name: "Mr. Ashok Chandavarkar", title: "Designated partner, NurtuRise Advisors", image: "https://res.cloudinary.com/dzss2fubc/image/upload/v1768924779/Ashok_Chandavarkar_qmni6b.jpg" },
    { name: "Dr. S B Bhanu Prashanth", title: "Dean - FYB, BMS College of Engineering", image: "https://res.cloudinary.com/dzss2fubc/image/upload/v1767541537/bhanuprashanth_yvb2uu.jpg" }
  ];

  const eventData: TimelineEntry[] = [
    {
      title: "Ascent Matrix Prelude",
      content: (
        <div className="bg-zinc-900/50 p-6 md:p-10 rounded-2xl border border-white/10 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-400 text-xs font-bold mb-4 uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500"></span>
                </span>
                30th January 2026
              </div>
              <h4 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Ascent Matrix - Prelude</h4>
              <p className="text-fuchsia-500 font-bold uppercase text-[10px] md:text-sm mt-2">Architecting an IP-First Innovation Ecosystem</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12">
            <div className="bg-white/5 p-5 rounded-xl border border-white/10">
              <h5 className="text-fuchsia-400 font-black text-[10px] uppercase mb-2 tracking-widest">Mission</h5>
              <p className="text-neutral-300 text-xs md:text-sm leading-relaxed">Transforming innovation to an "Asset-based" model.</p>
            </div>
            <div className="bg-white/5 p-5 rounded-xl border border-white/10">
              <h5 className="text-fuchsia-400 font-black text-[10px] uppercase mb-2 tracking-widest">Strategic Imperative</h5>
              <p className="text-neutral-300 text-xs md:text-sm leading-relaxed">The shift to Intangible Assets. Addressing the "Innovation-to-Impact" gap.</p>
            </div>
            <div className="bg-white/5 p-5 rounded-xl border border-white/10">
              <h5 className="text-fuchsia-400 font-black text-[10px] uppercase mb-2 tracking-widest">Philosophy</h5>
              <p className="text-neutral-300 text-xs md:text-sm leading-relaxed">The IP-First Paradigm: Creating strategic proprietary development culture.</p>
            </div>
          </div>

          {/* Value Matrix */}
          <div className="mb-16">
            <h5 className="text-white font-black text-lg md:text-xl mb-6 uppercase italic border-l-4 border-fuchsia-500 pl-4">Stakeholder Value Matrix</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { s: "Academia", o: "Tech Transfer", r: "Frameworks for licensing research." },
                { s: "Startups", o: "Defensive Moat", r: "IP Audit strategies; investor ready." },
                { s: "Students", o: "Market-Ready", r: "Validation of technical solutions." },
                { s: "Investors", o: "Quality Deal Flow", r: "Access to asset-protected startups." },
                { s: "Industry", o: "Open Innovation", r: "Direct access to novel solutions." },
                { s: "Incubators", o: "Portfolio Strength", r: "Enhanced metrics for IP filings." }
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-lg bg-zinc-950/50 border border-zinc-800">
                  <span className="text-fuchsia-500 font-bold text-[9px] uppercase tracking-tighter">{item.s}</span>
                  <p className="text-white text-xs md:text-sm font-bold my-1">{item.o}</p>
                  <p className="text-neutral-500 text-[10px]">{item.r}</p>
                </div>
              ))}
            </div>
          </div>

          {/* UPDATED GUEST SPEAKERS LIST - 2 PER ROW ON MOBILE */}
          <div className="mb-16">
            <h5 className="text-white font-black text-lg md:text-xl mb-6 uppercase italic border-l-4 border-fuchsia-500 pl-4">The Portfolio</h5>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
              {preludeSpeakers.map((speaker, idx) => (
                <SpeakerCard key={idx} {...speaker} />
              ))}
            </div>
          </div>

          {/* Operational Architecture */}
          <div className="mb-16">
            <h5 className="text-white font-black text-lg md:text-xl mb-6 uppercase italic border-l-4 border-fuchsia-500 pl-4">Operational Architecture</h5>
            <div className="space-y-2">
              {[
                { time: "10:30 - 11:30", event: "Inaugural", speakers: "Dr. Mahadev Prasanna, Dr. Sudheendra Koushik, Mr. Siddesh Math, Dr. Seshan and Mr. Gopinath Rao" },
                { time: "11:30 - 11:45", event: "Session 1", speakers: "Mr. Om Prakash - Problem Discovery" },
                { time: "11:45 - 12:00", event: "Session 2", speakers: "Dr. Brinda Varma - The IP Moat" },
                { time: "12:00 - 12:15", event: "Session 3", speakers: "Dr. Vijay Sarathy - Commercialization" },
                { time: "12:30 - 01:00", event: "Session 4", speakers: "Mr. Ashok Chandavarkar - Investor Focus" },
                { time: "01:00 - 01:30", event: "Report Out", speakers: "Dr. S B Bhanu Prashanth - Invention Reports" }
              ].map((slot, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 p-4 rounded-lg bg-white/5 border border-white/5">
                  <div className="text-fuchsia-400 font-mono font-bold text-[10px] md:text-xs">{slot.time}</div>
                  <div className="text-white font-black text-[10px] md:text-xs uppercase leading-tight">{slot.event}</div>
                  <div className="text-neutral-400 text-[9px] md:text-[10px] italic">{slot.speakers}</div>
                </div>
              ))}
            </div>
          </div>

          {/* HIGHLIGHTED QUOTE */}
          <div className="relative p-6 md:p-10 rounded-3xl bg-gradient-to-r from-fuchsia-600/20 to-purple-600/20 border border-fuchsia-500/30 overflow-hidden mb-8">
             <div className="absolute top-0 right-0 p-4 opacity-10 hidden md:block">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.83z" /></svg>
            </div>
            <p className="text-base md:text-2xl text-center font-black text-white italic leading-tight tracking-tight">
              "An idea without <span className="text-fuchsia-400 underline decoration-fuchsia-500/50">protection</span> is a gift to your competitors, but an idea with <span className="text-fuchsia-400 underline decoration-fuchsia-500/50">IP</span> is an asset for the world."
            </p>
          </div>

        <div className="flex justify-center">
  <a href="#/register" className="w-full md:w-auto">
    <button className="w-full md:w-auto px-12 py-5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-black rounded-2xl transition-all shadow-[0_0_30px_rgba(219,39,119,0.4)] hover:scale-105 uppercase tracking-widest text-xs md:text-sm">
      Register for Prelude
    </button>
  </a>
</div>
        </div>
      ),
    },
    {
      title: "Inaugural Summit",
      content: (
        <div className="bg-zinc-900/30 p-6 rounded-2xl border border-white/5 border-dashed">
          <h4 className="text-xl md:text-2xl font-bold text-neutral-500 italic uppercase">To Be Announced</h4>
          <p className="text-neutral-600 mt-2 text-sm">The grand vision unfolds. Stay tuned for dates and venue.</p>
        </div>
      ),
    },
    {
      title: "QUC 1",
      content: (
        <div className="bg-zinc-900/30 p-6 rounded-2xl border border-white/5 border-dashed">
          <h4 className="text-xl md:text-2xl font-bold text-neutral-500 italic uppercase">To Be Announced</h4>
          <p className="text-neutral-600 mt-2 text-sm">Interactive session and technical deep dive.</p>
        </div>
      ),
    },
  ];

  return (
    <section className="bg-black relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-fuchsia-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-10 md:pt-20 relative z-10">
        <div className="relative p-1 rounded-[1.5rem] md:rounded-[2.5rem] bg-gradient-to-br from-white/10 via-transparent to-white/5 overflow-hidden group">
          <div className="relative bg-zinc-950/90 backdrop-blur-xl rounded-[1.4rem] md:rounded-[2.4rem] p-6 md:p-20 border border-white/5">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block px-4 py-1.5 mb-6 md:mb-8 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/5 text-fuchsia-400 text-[10px] md:text-sm font-black uppercase tracking-[0.25em] italic">The Grand Series</div>
              <h2 className="text-4xl md:text-8xl font-black text-white mb-6 md:mb-10 tracking-tighter uppercase italic leading-[0.9]">
                Ascent <span className="text-fuchsia-500">Matrix</span>
              </h2>
              <p className="text-lg md:text-2xl text-gray-300 mb-8 md:mb-12">From the idea of an ecosystem to the engine of a nation.</p>
            </div>
          </div>
        </div>
      </div>

      <Timeline data={eventData} />
    </section>
  );
};

export default Summit;
