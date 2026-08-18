import { motion } from "framer-motion";
import { imgSrc } from "../../lib/api";

const ABOUT_IMG = imgSrc("/api/files/cinema-portfolio/uploads/b889b259-97e5-4ed2-809d-97771d54a5ee.png");

export default function About() {
  return (
    <section id="about" data-testid="about-section" className="border-t border-white/10">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-28 md:py-40 grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-7"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-zinc-500 mb-8">— 01 / Who is Farhan?</p>
          <h2 className="font-sans font-semibold tracking-tight text-zinc-100 text-4xl sm:text-5xl lg:text-6xl leading-[1.08]">
            Behind the camera,<br />where I belong.
          </h2>
          <p className="mt-9 font-serif italic text-lg md:text-xl text-zinc-300 leading-relaxed max-w-2xl">
            "I live for the moments spent behind the lens — chasing light, framing emotion, and turning fleeting moments into visuals people fall in love with. For me, photography and filmmaking aren't just about capturing what's in front of me; they're about crafting something aesthetic, intentional, and visually striking enough to stop someone mid-scroll. Every frame I shoot is built to fascinate — to make people feel something before they even know why."
          </p>
          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">Photography — Cinematography — Direction</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5 self-center"
        >
          <div className="relative overflow-hidden border border-white/10">
            <img src={ABOUT_IMG} alt="Farhan Khan — photographer and cinematographer" loading="lazy" className="w-full aspect-[9/16] object-cover block" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
