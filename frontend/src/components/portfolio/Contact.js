import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { api, formatApiError } from "../../lib/api";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/contact", form);
      toast.success("Message sent — thank you. I'll be in touch soon.");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setSending(false);
    }
  };

  const field = "w-full bg-transparent border border-white/10 focus:border-white/40 focus:ring-1 focus:ring-white/30 focus:outline-none text-zinc-100 placeholder:text-zinc-600 px-5 py-4 text-sm transition-colors duration-300";

  return (
    <section id="contact" data-testid="contact-section" className="border-t border-white/10">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-28 md:py-40">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-4xl mx-auto"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-zinc-500 mb-8">— 05 / Let's build something real —</p>
          <h2 className="font-display font-bold tracking-tight text-zinc-100 text-4xl sm:text-6xl lg:text-7xl leading-[1.08]">
            If our frames align,<br />let's talk.
          </h2>
          <p className="mt-8 text-sm md:text-base text-zinc-500 max-w-md mx-auto leading-relaxed">
            Commissions, collaborations, weddings, documentaries, branded film — if it involves light, I'm interested.
          </p>
          <a
            href="mailto:kfarhaan749@gmail.com"
            data-testid="contact-email-link"
            className="inline-block mt-9 text-lg md:text-2xl font-sans font-medium text-zinc-200 border-b border-white/30 pb-1 hover:text-white hover:border-white transition-colors duration-300"
          >
            kfarhaan749@gmail.com
          </a>
        </motion.div>

        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-5 max-w-2xl mx-auto mt-20"
          data-testid="contact-form"
        >
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className={field} data-testid="contact-name-input" />
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" className={field} data-testid="contact-email-input" />
          <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell me about your project" className={`${field} resize-none`} data-testid="contact-message-input" />
          <button
            type="submit"
            disabled={sending}
            data-testid="contact-submit-button"
            className="w-full md:w-auto border border-white/20 px-12 py-4 font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-100 hover:bg-white hover:text-black transition-colors duration-400 disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send Message"}
          </button>
        </motion.form>
      </div>
    </section>
  );
}
