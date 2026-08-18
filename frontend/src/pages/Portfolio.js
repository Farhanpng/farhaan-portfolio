import { useEffect } from "react";
import Lenis from "lenis";
import Navbar from "../components/portfolio/Navbar";
import Hero from "../components/portfolio/Hero";
import EditorialMarquee from "../components/portfolio/EditorialMarquee";
import About from "../components/portfolio/About";
import Journey from "../components/portfolio/Journey";
import Gallery from "../components/portfolio/Gallery";
import Films from "../components/portfolio/Films";
import Contact from "../components/portfolio/Contact";
import Footer from "../components/portfolio/Footer";

export default function Portfolio() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.25, smoothWheel: true });
    window.__lenis = lenis;
    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  return (
    <div className="bg-[#0A0A0A] text-zinc-200 min-h-screen font-sans overflow-x-hidden">
      <div className="grain-overlay" aria-hidden="true" />
      <Navbar />
      <main>
        <Hero />
        <EditorialMarquee />
        <About />
        <Journey />
        <Gallery />
        <Films />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
