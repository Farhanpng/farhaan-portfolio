import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const LINKS = [
  { label: "About", href: "#about" },
  { label: "Journey", href: "#journey" },
  { label: "Work", href: "#gallery" },
  { label: "Films", href: "#films" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (e, href) => {
    e.preventDefault();
    setOpen(false);
    if (window.__lenis) window.__lenis.scrollTo(href, { offset: 0, duration: 1.6 });
    else document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-[70] transition-[background-color,border-color,backdrop-filter] duration-500 ${
        scrolled ? "bg-black/60 backdrop-blur-xl border-b border-white/10" : "bg-transparent border-b border-transparent"
      }`}
      data-testid="main-nav"
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        <a href="#top" onClick={(e) => go(e, "#top")} data-testid="nav-logo" className="font-mono text-xs md:text-sm uppercase tracking-[0.35em] text-zinc-100">
          Farhan Khan
        </a>
        <nav className="hidden md:flex items-center gap-10">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => go(e, l.href)}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-400 hover:text-zinc-100 transition-colors duration-300"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <button data-testid="nav-menu-button" onClick={() => setOpen(!open)} className="md:hidden text-zinc-200 p-2" aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden bg-black/80 backdrop-blur-xl border-b border-white/10"
          >
            <div className="px-6 py-6 flex flex-col gap-5">
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => go(e, l.href)}
                  data-testid={`nav-mobile-link-${l.label.toLowerCase()}`}
                  className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-300"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
