import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { imgSrc } from "../../lib/api";

const HERO_IMG = "/images/hero.png";

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.22]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section ref={ref} id="top" data-testid="hero-section" className="relative min-h-screen overflow-hidden flex items-center justify-center">
      <motion.div style={{ y: imgY, scale: imgScale }} className="absolute inset-0 z-0">
        <img src={HERO_IMG} alt="Farhan Khan portrait" className="w-full h-full object-cover object-[center_30%] grayscale-[10%] brightness-[0.7]" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/40 to-[#0A0A0A]/85" />
      </motion.div>

      <motion.div style={{ opacity: fade }} className="relative z-10 w-full px-4 text-center">
        <div className="overflow-hidden mb-6">
          <motion.p
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="font-mono text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.25em] sm:tracking-[0.45em] text-amber-300"
            data-testid="hero-overline"
          >
            Photographer — Cinematographer
          </motion.p>
        </div>

        <h1 data-testid="hero-headline" className="font-display font-extrabold uppercase tracking-tight leading-[0.92] text-zinc-100">
          <span className="block overflow-hidden">
            <motion.span
              className="block text-[13vw] sm:text-[11vw] md:text-[8.5vw] lg:text-[8vw]"
              initial={{ y: "112%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1.15, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              Farhan
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              className="block text-[13vw] sm:text-[11vw] md:text-[8.5vw] lg:text-[8vw]"
              initial={{ y: "112%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1.15, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              Khan
            </motion.span>
          </span>
        </h1>

        <div className="overflow-hidden mt-7">
          <motion.p
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.9, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}
            className="font-mono text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.2em] sm:tracking-[0.35em] text-amber-300 px-2"
          >
            Every frame a sentence — every film a story
          </motion.p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 1 }} className="absolute bottom-8 right-6 md:right-12 z-10 flex flex-col items-end gap-2 text-zinc-400">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em]">See the work</span>
        <motion.span animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}>
          <ArrowDown size={14} />
        </motion.span>
      </motion.div>
    </section>
  );
}
