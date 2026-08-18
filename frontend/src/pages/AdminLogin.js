import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import { API, formatApiError } from "../lib/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem("admin_token", data.access_token);
      toast.success("Welcome back.");
      navigate("/admin/dashboard");
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  const field = "w-full bg-transparent border border-white/10 focus:border-white/40 focus:ring-1 focus:ring-white/30 focus:outline-none text-zinc-100 placeholder:text-zinc-600 px-5 py-4 text-sm transition-colors duration-300";

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-200 flex items-center justify-center px-6" data-testid="admin-login-page">
      <div className="grain-overlay" aria-hidden="true" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md border border-white/10 bg-[#121212] p-10 md:p-12"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-zinc-500 mb-3">Restricted</p>
        <h1 className="font-serif text-4xl text-zinc-100 tracking-tight mb-10">Studio Access</h1>
        <form onSubmit={submit} className="space-y-5" data-testid="admin-login-form">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={field} data-testid="admin-email-input" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={field} data-testid="admin-password-input" />
          {error && <p className="text-red-400 text-xs font-mono tracking-wide" data-testid="admin-login-error">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            data-testid="admin-login-submit"
            className="w-full border border-white/20 py-4 font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-100 hover:bg-white hover:text-black transition-colors duration-400 disabled:opacity-50"
          >
            {loading ? "Entering…" : "Enter Studio"}
          </button>
        </form>
        <Link to="/" data-testid="back-to-site-link" className="block mt-8 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600 hover:text-zinc-300 transition-colors duration-300">
          ← Back to portfolio
        </Link>
      </motion.div>
    </div>
  );
}
