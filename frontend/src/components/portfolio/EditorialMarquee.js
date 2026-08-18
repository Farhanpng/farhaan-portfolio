import Marquee from "react-fast-marquee";

const ROLES = ["Photographer", "Cinematographer", "Visual Storyteller", "Editor", "Director of Photography", "Creative Director"];

export default function EditorialMarquee() {
  return (
    <div className="border-y border-white/10 py-6 md:py-7 overflow-hidden" data-testid="editorial-marquee">
      <Marquee speed={30} gradient={false} pauseOnHover>
        {ROLES.map((r) => (
          <span key={r} className="flex items-center">
            <span className="font-mono text-[11px] md:text-xs uppercase tracking-[0.45em] text-zinc-500 mx-8 md:mx-12">{r}</span>
            <span className="text-zinc-700 text-[10px]">✦</span>
          </span>
        ))}
      </Marquee>
    </div>
  );
}
