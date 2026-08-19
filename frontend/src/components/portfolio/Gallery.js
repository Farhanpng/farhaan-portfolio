import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play } from "lucide-react";
import { api, imgSrc } from "../../lib/api";

const DEFAULT_PHOTOS = [
  // Fashion
  { id: "fashion-1", title: "Sun & Style", category: "Fashion", src: "/images/11.png" },
  { id: "fashion-2", title: "Poolside in Pink", category: "Fashion", src: "/images/12.png" },
  { id: "fashion-3", title: "Fuchsia Sunshine Edit", category: "Fashion", src: "/images/13.png" },
  { id: "fashion-4", title: "Block Print Blues", category: "Fashion", src: "/images/14.png" },
  { id: "fashion-5", title: "Summer State of Mind", category: "Fashion", src: "/images/15.png" },
  { id: "fashion-6", title: "Backdrop in the Wild", category: "Fashion", src: "/images/16.png" },
  { id: "fashion-7", title: "Blooming Streets", category: "Fashion", src: "/images/17.png" },
  { id: "fashion-8", title: "Off the Line", category: "Fashion", src: "/images/18.png" },
  { id: "fashion-9", title: "Indigo Hour", category: "Fashion", src: "/images/19.png" },

  // Concert
  { id: "concert-1", title: "Parmish Verma Live", category: "Concert", src: "/images/1.png" },
  { id: "concert-2", title: "Pyro & Soul", category: "Concert", src: "/images/2.png" },
  { id: "concert-3", title: "Kartik Aaryan", category: "Concert", src: "/images/3.png" },
  { id: "concert-4", title: "Farhan Akhtar Ignite", category: "Concert", src: "/images/4.png" },
  { id: "concert-5", title: "Farhan Akhtar Acoustic", category: "Concert", src: "/images/5.png" },

  // Jewellery
  { id: "jewellery-1", title: "Ratnatray Signature", category: "Jewellery", src: "/images/6.png" },
  { id: "jewellery-2", title: "A Drop of Midnight", category: "Jewellery", src: "/images/7.png" },
  { id: "jewellery-3", title: "Pavé Gold Radiance", category: "Jewellery", src: "/images/20.png" },

  // Food
  { id: "food-1", title: "Woodfired Artisan Pizza", category: "Food", src: "/images/8.png" },
  { id: "food-2", title: "Kaefin Coffee", category: "Food", src: "/images/9.png" },
  { id: "food-3", title: "Layered Iced Espresso", category: "Food", src: "/images/10.png" },
];

const DEFAULT_REELS = [
  { id: "reel-1", title: "Telugu Wedding", reel_id: "DZXUnYGqYR4", cover: "/images/reel-1-telugu-wedding.png" },
  { id: "reel-2", title: "Bride's Outfit Deserves a Spotlight", reel_id: "DYBufRPhy46", cover: "/images/reel-2-brides-outfit.png" },
  { id: "reel-3", title: "Rambagh Palace Jaipur", reel_id: "DVqC7lZAVmF", cover: "/images/reel-3-rambagh-palace.png" },
  { id: "reel-4", title: "Dreamy Varmala", reel_id: "DUiXdM0gdbQ", cover: "/images/reel-4-dreamy-varmala.png" },
  { id: "reel-5", title: "South Indian Themed Haldi", reel_id: "DWUN5M7AaMn", cover: "/images/reel-5-south-indian-haldi.png" },
];

export default function Gallery() {
  const [photos, setPhotos] = useState(DEFAULT_PHOTOS);
  const [reels, setReels] = useState(DEFAULT_REELS);
  const [active, setActive] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    api.get("/photos")
      .then((r) => {
        if (Array.isArray(r.data) && r.data.length > 0) setPhotos(r.data);
      })
      .catch(() => {});
    api.get("/reels")
      .then((r) => {
        if (Array.isArray(r.data) && r.data.length > 0) setReels(r.data);
      })
      .catch(() => {});
  }, []);

  const photoList = Array.isArray(photos) ? photos : DEFAULT_PHOTOS;
  const reelList = Array.isArray(reels) ? reels : DEFAULT_REELS;

  const ORDER = ["Fashion", "Concert", "Jewellery", "Food"];
  const present = new Set(photoList.map((p) => p.category).filter(Boolean));
  const categories = ["All", ...ORDER.filter((c) => present.has(c))];
  const filtered = filter === "All" ? photoList : photoList.filter((p) => p.category === filter);

  return (
    <section id="gallery" data-testid="gallery-section" className="max-w-[1600px] mx-auto px-6 md:px-12 py-28 md:py-40">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="mb-16 md:mb-24 flex items-end justify-between gap-8"
      >
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-zinc-500 mb-5">— 03 / Selected Work</p>
          <h2 className="font-sans font-semibold tracking-tight text-zinc-100 text-4xl sm:text-5xl lg:text-6xl">No motion needed.</h2>
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-3 mb-12" data-testid="gallery-filters">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            data-testid={`gallery-filter-${c.toLowerCase()}`}
            className={`px-6 py-2.5 font-mono text-[10px] uppercase tracking-[0.25em] border transition-colors duration-300 ${
              filter === c ? "border-white/60 bg-white text-black" : "border-white/10 text-zinc-400 hover:text-white hover:border-white/40"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {photos.length === 0 ? (
        <p className="text-zinc-600 font-mono text-xs uppercase tracking-[0.3em]" data-testid="gallery-empty">The gallery is being curated.</p>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 md:gap-8" data-testid="gallery-grid">
          {filtered.map((p, i) => (
            <motion.button
              key={p.id}
              type="button"
              onClick={() => setActive(p)}
              data-testid={`gallery-item-${i}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.9, delay: (i % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative block w-full mb-6 md:mb-8 break-inside-avoid overflow-hidden text-left border border-white/5"
            >
              <img
                src={imgSrc(p.src)}
                alt={p.title}
                loading="lazy"
                className="w-full h-auto block transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-[transform,opacity] duration-500">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-400">{p.category}</p>
                <p className="font-serif text-xl text-zinc-100 mt-1">{p.title}</p>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {reelList.length > 0 && (
        <div className="mt-24 md:mt-36" data-testid="wedding-reels-block">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mb-10 md:mb-14 flex items-end justify-between gap-8 border-t border-white/10 pt-14"
          >
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-zinc-500 mb-4">Wedding Films</p>
              <h3 className="font-sans font-semibold tracking-tight text-zinc-100 text-2xl sm:text-3xl lg:text-4xl">Weddings, unposed.</h3>
            </div>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 md:gap-6" data-testid="reels-grid">
            {reelList.map((r, i) => (
              <motion.a
                key={r.id}
                href={`https://www.instagram.com/reel/${r.reel_id}/`}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`reel-item-${i}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.9, delay: (i % 5) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group relative block aspect-[9/16] border border-white/10 overflow-hidden bg-[#121212] transition-colors duration-500 hover:border-white/40"
              >
                {r.cover && (
                  <img src={imgSrc(r.cover)} alt={r.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="border border-white/40 bg-black/40 backdrop-blur-sm rounded-full p-4 transition-[background-color,transform] duration-500 group-hover:bg-white group-hover:scale-110">
                    <Play size={16} className="text-white fill-current transition-colors duration-500 group-hover:text-black" />
                  </span>
                </span>
                <div className="absolute bottom-0 inset-x-0 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-100 leading-relaxed">{r.title}</p>
                  <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-500 group-hover:text-zinc-400 transition-colors duration-500">Watch on Instagram ↗</p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-6 md:p-16"
            onClick={() => setActive(null)}
            data-testid="lightbox-overlay"
          >
            <button
              data-testid="lightbox-close"
              onClick={() => setActive(null)}
              className="absolute top-6 right-6 md:top-10 md:right-10 text-zinc-400 hover:text-white border border-white/20 hover:border-white/60 p-3 transition-colors duration-300"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <motion.figure
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={imgSrc(active.src)} alt={active.title} className="w-full max-h-[80vh] object-contain" data-testid="lightbox-image" />
              <figcaption className="mt-5 flex items-baseline justify-between">
                <span className="font-serif text-2xl text-zinc-100">{active.title}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">{active.category}</span>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
