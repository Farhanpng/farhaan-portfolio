import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/10" data-testid="site-footer">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600">© Farhan Khan</p>
        <div className="flex items-center gap-8">
          <a href="https://www.instagram.com/farh_aaaan/" target="_blank" rel="noopener noreferrer" data-testid="footer-social-instagram" className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 hover:text-zinc-100 transition-colors duration-300">
            Instagram
          </a>
          <Link to="/admin" data-testid="footer-admin-link" className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-700 hover:text-zinc-300 transition-colors duration-300">
            Admin
          </Link>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-700">Frames over words</p>
      </div>
    </footer>
  );
}
