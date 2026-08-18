import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { api } from "../../lib/api";

function VideoFrame({ video, featured, index }) {
  const [playing, setPlaying] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={featured ? "md:col-span-2" : ""}
      data-testid={`film-item-${index}`}
    >
      <div className="relative aspect-video w-full border border-white/10 overflow-hidden group bg-black">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtube_id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            data-testid={`film-play-${index}`}
            className="absolute inset-0 w-full h-full"
            aria-label={`Play ${video.title}`}
          >
            <img
              src={`https://i.ytimg.com/vi/${video.youtube_id}/maxresdefault.jpg`}
              onError={(e) => { e.currentTarget.src = `https://i.ytimg.com/vi/${video.youtube_id}/hqdefault.jpg`; }}
              alt={video.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover opacity-70 transition-[opacity,transform] duration-700 group-hover:opacity-90 group-hover:scale-[1.03]"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="border border-white/40 bg-black/40 backdrop-blur-sm rounded-full p-5 md:p-7 transition-[background-color,transform] duration-500 group-hover:bg-white group-hover:scale-110">
                <Play size={22} className="text-white transition-colors duration-500 group-hover:text-black fill-current" />
              </span>
            </span>
          </button>
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="font-serif text-xl md:text-2xl text-zinc-100">{video.title}</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 shrink-0">Film {String(index + 1).padStart(2, "0")}</span>
      </div>
      {video.description && <p className="mt-1 text-sm text-zinc-500 max-w-xl">{video.description}</p>}
    </motion.div>
  );
}

export default function Films() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    api.get("/videos").then((r) => setVideos(r.data)).catch(() => {});
  }, []);

  return (
    <section id="films" data-testid="films-section" className="border-t border-white/10">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-28 md:py-40">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 md:mb-24"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-zinc-500 mb-5">— 04 / Motion</p>
          <h2 className="font-sans font-semibold tracking-tight text-zinc-100 text-4xl sm:text-5xl lg:text-6xl">Films &amp; motion.</h2>
        </motion.div>

        {videos.length === 0 ? (
          <p className="text-zinc-600 font-mono text-xs uppercase tracking-[0.3em]" data-testid="films-empty">Films are on their way.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14" data-testid="films-grid">
            {videos.map((v, i) => (
              <VideoFrame key={v.id} video={v} index={i} featured={i === 0} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
