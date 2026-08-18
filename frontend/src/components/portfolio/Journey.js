import { motion } from "framer-motion";

const ROLES = [
  {
    title: "Creative Director & DOP",
    org: "The Social Glory",
    note: "Led creative direction and cinematography across fashion, food, artist, and jewellery shoots for a Jaipur-based content production agency.",
  },
  {
    title: "Media Lead",
    org: "JECRC University",
    note: "Directed media production for the university's flagship event, delivering a fully edited aftermovie within 30 minutes of the show ending — covering artists like Farhan Akhtar, B Praak, and Zakir Khan.",
  },
  {
    title: "Wedding Content Creator",
    org: "The Social Wedding",
    note: "Shooting and directing wedding content for a Jaipur-based social media agency, focused on capturing genuine, unposed moments between couples and families.",
  },
  {
    title: "Brand Visual Strategist & DOP",
    org: "Freelance",
    note: "Delivering photography, videography, and creative direction for 15+ brands across fashion, jewellery, hospitality, and lifestyle.",
  },
];

export default function Journey() {
  return (
    <section id="journey" data-testid="journey-section" className="border-t border-white/10">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-28 md:py-40">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-zinc-500 mb-8">— 02 / The Journey</p>
          <h2 className="font-sans font-semibold tracking-tight text-zinc-100 text-4xl sm:text-5xl lg:text-6xl leading-[1.08]">
            The journey so far.
          </h2>
        </motion.div>

        <div className="mt-16 md:mt-24">
          {ROLES.map((r, i) => (
            <motion.div
              key={r.title}
              data-testid={`journey-entry-${i + 1}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.9, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="border-t border-white/10 py-10 md:py-14 grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8 items-start group"
            >
              <span className="md:col-span-1 font-mono text-xs text-zinc-600 tracking-[0.3em] pt-2">0{i + 1}</span>
              <div className="md:col-span-6">
                <h3 className="font-sans font-semibold tracking-tight text-zinc-100 text-2xl md:text-4xl transition-colors duration-500 group-hover:text-white">
                  {r.title}
                </h3>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">{r.org}</p>
              </div>
              <p className="md:col-span-5 font-serif italic text-base md:text-lg text-zinc-500 leading-relaxed">
                "{r.note}"
              </p>
            </motion.div>
          ))}
          <div className="border-t border-white/10" />
        </div>
      </div>
    </section>
  );
}
