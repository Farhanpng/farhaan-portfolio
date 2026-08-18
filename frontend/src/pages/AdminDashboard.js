import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Trash2, Upload, Plus, LogOut } from "lucide-react";
import { api, imgSrc, formatApiError } from "../lib/api";

const TABS = ["photos", "videos", "reels", "messages"];
const inputCls = "w-full bg-transparent border border-white/10 focus:border-white/40 focus:ring-1 focus:ring-white/30 focus:outline-none text-zinc-100 placeholder:text-zinc-600 px-4 py-3 text-sm transition-colors duration-300";
const btnCls = "border border-white/20 px-8 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-100 hover:bg-white hover:text-black transition-colors duration-300 disabled:opacity-50";

export default function AdminDashboard() {
  const [tab, setTab] = useState("photos");
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [reels, setReels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [photoForm, setPhotoForm] = useState({ title: "", category: "", file: null });
  const [videoForm, setVideoForm] = useState({ title: "", youtube_url: "", description: "" });
  const [reelForm, setReelForm] = useState({ title: "", instagram_url: "" });
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const load = useCallback(() => {
    api.get("/photos").then((r) => setPhotos(r.data)).catch(() => {});
    api.get("/videos").then((r) => setVideos(r.data)).catch(() => {});
    api.get("/reels").then((r) => setReels(r.data)).catch(() => {});
    api.get("/messages").then((r) => setMessages(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    api.get("/auth/me").then(load).catch(() => {
      localStorage.removeItem("admin_token");
      navigate("/admin");
    });
  }, [navigate, load]);

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    localStorage.removeItem("admin_token");
    navigate("/admin");
  };

  const uploadPhoto = async (e) => {
    e.preventDefault();
    if (!photoForm.file) { toast.error("Choose an image file first."); return; }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("title", photoForm.title);
      fd.append("category", photoForm.category);
      fd.append("file", photoForm.file);
      await api.post("/photos/upload", fd);
      toast.success("Photo added to the gallery.");
      setPhotoForm({ title: "", category: "", file: null });
      e.target.reset();
      load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally { setBusy(false); }
  };

  const deletePhoto = async (id) => {
    try {
      await api.delete(`/photos/${id}`);
      toast.success("Photo removed.");
      load();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  const addVideo = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/videos", videoForm);
      toast.success("Film added.");
      setVideoForm({ title: "", youtube_url: "", description: "" });
      load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally { setBusy(false); }
  };

  const deleteVideo = async (id) => {
    try {
      await api.delete(`/videos/${id}`);
      toast.success("Film removed.");
      load();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  const addReel = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/reels", reelForm);
      toast.success("Reel added.");
      setReelForm({ title: "", instagram_url: "" });
      load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally { setBusy(false); }
  };

  const deleteReel = async (id) => {
    try {
      await api.delete(`/reels/${id}`);
      toast.success("Reel removed.");
      load();
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-200" data-testid="admin-dashboard">
      <header className="border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-18 py-4 flex items-center justify-between">
          <h1 className="font-serif text-2xl tracking-tight">Studio Panel</h1>
          <button onClick={logout} data-testid="admin-logout-button" className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-400 hover:text-white transition-colors duration-300">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-wrap gap-2 mb-12">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              data-testid={`tab-${t}`}
              className={`px-6 py-3 font-mono text-[10px] uppercase tracking-[0.25em] border transition-colors duration-300 ${
                tab === t ? "border-white/60 bg-white text-black" : "border-white/10 text-zinc-400 hover:text-white hover:border-white/40"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "photos" && (
          <div data-testid="photos-panel">
            <form onSubmit={uploadPhoto} className="border border-white/10 bg-[#121212] p-6 md:p-8 mb-12 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <input value={photoForm.title} onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })} placeholder="Title" className={inputCls} data-testid="photo-title-input" />
              <input value={photoForm.category} onChange={(e) => setPhotoForm({ ...photoForm, category: e.target.value })} placeholder="Category (e.g. Portrait)" className={inputCls} data-testid="photo-category-input" />
              <input type="file" accept="image/*" onChange={(e) => setPhotoForm({ ...photoForm, file: e.target.files[0] })} className="text-sm text-zinc-400" data-testid="photo-file-input" />
              <button type="submit" disabled={busy} data-testid="photo-upload-submit" className={`${btnCls} flex items-center justify-center gap-2`}>
                <Upload size={14} /> Upload
              </button>
            </form>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="admin-photos-grid">
              {photos.map((p) => (
                <div key={p.id} className="group relative border border-white/10 overflow-hidden">
                  <img src={imgSrc(p.src)} alt={p.title} className="w-full aspect-square object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/80 backdrop-blur-sm px-3 py-2 flex items-center justify-between">
                    <span className="text-xs text-zinc-300 truncate">{p.title}</span>
                    <button onClick={() => deletePhoto(p.id)} data-testid={`photo-delete-${p.id}`} className="text-zinc-500 hover:text-red-400 transition-colors duration-300 p-1" aria-label={`Delete ${p.title}`}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "videos" && (
          <div data-testid="videos-panel">
            <form onSubmit={addVideo} className="border border-white/10 bg-[#121212] p-6 md:p-8 mb-12 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <input required value={videoForm.title} onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })} placeholder="Film title" className={inputCls} data-testid="video-title-input" />
              <input required value={videoForm.youtube_url} onChange={(e) => setVideoForm({ ...videoForm, youtube_url: e.target.value })} placeholder="YouTube link" className={`${inputCls} md:col-span-2`} data-testid="video-url-input" />
              <button type="submit" disabled={busy} data-testid="video-add-submit" className={`${btnCls} flex items-center justify-center gap-2`}>
                <Plus size={14} /> Add Film
              </button>
            </form>
            <div className="space-y-3" data-testid="admin-videos-list">
              {videos.map((v) => (
                <div key={v.id} className="border border-white/10 bg-[#121212] px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <img src={`https://i.ytimg.com/vi/${v.youtube_id}/default.jpg`} alt="" className="w-20 aspect-video object-cover border border-white/10 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-zinc-100 truncate">{v.title}</p>
                      <p className="font-mono text-[10px] text-zinc-500 tracking-widest">youtube.com/watch?v={v.youtube_id}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteVideo(v.id)} data-testid={`video-delete-${v.id}`} className="text-zinc-500 hover:text-red-400 transition-colors duration-300 p-2 shrink-0" aria-label={`Delete ${v.title}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "reels" && (
          <div data-testid="reels-panel">
            <form onSubmit={addReel} className="border border-white/10 bg-[#121212] p-6 md:p-8 mb-12 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <input required value={reelForm.title} onChange={(e) => setReelForm({ ...reelForm, title: e.target.value })} placeholder="Reel title" className={inputCls} data-testid="reel-title-input" />
              <input required value={reelForm.instagram_url} onChange={(e) => setReelForm({ ...reelForm, instagram_url: e.target.value })} placeholder="Instagram reel link" className={`${inputCls} md:col-span-2`} data-testid="reel-url-input" />
              <button type="submit" disabled={busy} data-testid="reel-add-submit" className={`${btnCls} flex items-center justify-center gap-2`}>
                <Plus size={14} /> Add Reel
              </button>
            </form>
            <div className="space-y-3" data-testid="admin-reels-list">
              {reels.map((r) => (
                <div key={r.id} className="border border-white/10 bg-[#121212] px-5 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-100 truncate">{r.title}</p>
                    <p className="font-mono text-[10px] text-zinc-500 tracking-widest">instagram.com/reel/{r.reel_id}</p>
                  </div>
                  <button onClick={() => deleteReel(r.id)} data-testid={`reel-delete-${r.id}`} className="text-zinc-500 hover:text-red-400 transition-colors duration-300 p-2 shrink-0" aria-label={`Delete ${r.title}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "messages" && (
          <div className="space-y-3" data-testid="messages-panel">
            {messages.length === 0 && <p className="text-zinc-600 font-mono text-xs uppercase tracking-[0.3em]">No enquiries yet.</p>}
            {messages.map((m) => (
              <div key={m.id} className="border border-white/10 bg-[#121212] px-5 py-4">
                <div className="flex items-baseline justify-between gap-4 mb-2">
                  <p className="text-sm text-zinc-100">{m.name} <span className="text-zinc-500">— {m.email}</span></p>
                  <p className="font-mono text-[10px] text-zinc-600 tracking-widest shrink-0">{new Date(m.created_at).toLocaleDateString()}</p>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{m.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
