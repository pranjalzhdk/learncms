"use client";

import { usePublishedContent } from "@/hooks/use-content";
import { useUIStore } from "@/store/ui-store";
import { WEBSITE_THEMES } from "@/modules/cms/types";
import { XRayOverlay, hasFeature } from "@/modules/website/XRayOverlay";
import { cn } from "@/lib/utils";
import {
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";

const THEME_STYLES: Record<string, { bg: string; text: string; accent: string; card: string }> = {
  "modern-startup": { bg: "bg-white", text: "text-slate-900", accent: "from-violet-600 to-indigo-600", card: "bg-white shadow-lg shadow-slate-200/60 border border-slate-100" },
  "news-magazine": { bg: "bg-zinc-950", text: "text-white", accent: "from-red-600 to-orange-500", card: "bg-zinc-900 border border-zinc-800" },
  "ecommerce": { bg: "bg-stone-50", text: "text-stone-900", accent: "from-emerald-600 to-teal-500", card: "bg-white shadow-md border border-stone-100" },
  "portfolio": { bg: "bg-zinc-900", text: "text-zinc-100", accent: "from-pink-500 to-violet-500", card: "bg-zinc-800/80 border border-zinc-700" },
  "travel-blog": { bg: "bg-gradient-to-b from-sky-50 to-white", text: "text-sky-950", accent: "from-sky-500 to-cyan-400", card: "bg-white/90 shadow-lg border border-sky-100" },
  "saas-landing": { bg: "bg-indigo-950", text: "text-indigo-50", accent: "from-indigo-400 to-purple-400", card: "bg-indigo-900/50 border border-indigo-800" },
};

export function WebsitePreview() {
  const previewFullscreen = useUIStore((s) => s.previewFullscreen);
  const setPreviewFullscreen = useUIStore((s) => s.setPreviewFullscreen);
  const xrayMode = useUIStore((s) => s.xrayMode);
  const setXrayMode = useUIStore((s) => s.setXrayMode);
  const activeTheme = useUIStore((s) => s.activeTheme);
  const setActiveTheme = useUIStore((s) => s.setActiveTheme);
  const unlockedFeatures = useUIStore((s) => s.unlockedFeatures);
  const activeLocale = useUIStore((s) => s.activeLocale);
  const setActiveLocale = useUIStore((s) => s.setActiveLocale);
  const selectedEntryId = useUIStore((s) => s.selectedEntryId);
  const setSelectedEntryId = useUIStore((s) => s.setSelectedEntryId);
  const showCelebration = useUIStore((s) => s.showUnlockCelebration);
  const lastUnlockMessage = useUIStore((s) => s.lastUnlockMessage);
  const dismissCelebration = useUIStore((s) => s.dismissCelebration);

  const { data: posts, isLoading, refetch, isFetching } = usePublishedContent();
  const heroPost = posts[0];
  const selected = posts.find((p) => p.id === selectedEntryId);
  const styles = THEME_STYLES[activeTheme] ?? THEME_STYLES["modern-startup"];
  const locked = !hasFeature(unlockedFeatures, "blog-homepage");

  const chrome = (
    <div className="flex items-center gap-2 px-3 py-2 bg-[#dee1e6] border-b border-[#c8ccd1] shrink-0">
      <div className="flex gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
      </div>
      <div className="flex-1 mx-2 bg-white rounded-md px-3 py-1 text-[10px] text-neutral-500 font-mono truncate border border-neutral-200/80">
        🔒 https://your-site.com{selected ? `/blog/${selected.slug}` : ""} · live from CMS
      </div>
      <div className="flex items-center gap-1">
        {hasFeature(unlockedFeatures, "language-switcher") && (
          <div className="flex gap-0.5 mr-1">
            {["en", "de", "fr"].map((l) => (
              <button key={l} onClick={() => setActiveLocale(l)} className={cn("px-1.5 py-0.5 rounded text-[9px] uppercase", activeLocale === l ? "bg-neutral-800 text-white" : "text-neutral-500 hover:bg-neutral-200")}>{l}</button>
            ))}
          </div>
        )}
        <select value={activeTheme} onChange={(e) => setActiveTheme(e.target.value as typeof activeTheme)} className="text-[10px] border border-neutral-200 rounded px-1.5 py-0.5 bg-white max-w-[100px]">
          {WEBSITE_THEMES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <button onClick={() => refetch()} className="p-1 rounded hover:bg-neutral-200 text-neutral-500" title="Refresh">
          <RefreshCw className={cn("w-3 h-3", isFetching && "animate-spin")} />
        </button>
        <button onClick={() => setXrayMode(!xrayMode)} className={cn("p-1 rounded", xrayMode ? "bg-violet-600 text-white" : "hover:bg-neutral-200 text-neutral-500")} title="X-Ray">
          {xrayMode ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        </button>
        <button onClick={() => setPreviewFullscreen(!previewFullscreen)} className="p-1 rounded hover:bg-neutral-200 text-neutral-500" title={previewFullscreen ? "Exit fullscreen" : "Fullscreen"}>
          {previewFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );

  const body = (
    <div className={cn("flex-1 overflow-y-auto min-h-0", styles.bg, styles.text)}>
      {locked ? (
        <LockedPreview />
      ) : isLoading ? (
        <div className="flex items-center justify-center h-64 text-sm opacity-50">Loading live content…</div>
      ) : selected ? (
        <ArticleView post={selected} styles={styles} xray={xrayMode} features={unlockedFeatures} onBack={() => setSelectedEntryId(null)} />
      ) : (
        <HomeView posts={posts} heroPost={heroPost} styles={styles} xray={xrayMode} features={unlockedFeatures} onSelect={setSelectedEntryId} />
      )}
    </div>
  );

  const celebration = showCelebration && (
    <div className="absolute inset-x-4 top-14 z-20 flex justify-center pointer-events-none">
      <button onClick={dismissCelebration} className="pointer-events-auto bg-white shadow-xl rounded-xl px-5 py-3 text-center border border-emerald-100 animate-in fade-in slide-in-from-top-2">
        <p className="text-lg">🎉</p>
        <p className="text-sm font-semibold text-neutral-900">{lastUnlockMessage}</p>
      </button>
    </div>
  );

  if (previewFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[#dee1e6]">
        {chrome}
        <div className="relative flex-1 min-h-0 flex flex-col">{celebration}{body}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-xl border border-neutral-200 overflow-hidden shadow-sm bg-[#dee1e6]">
      {chrome}
      <div className="relative flex-1 min-h-0 flex flex-col">{celebration}{body}</div>
    </div>
  );
}

function LockedPreview() {
  return (
    <div className="relative min-h-[400px]">
      <div className="absolute inset-0 blur-sm opacity-40 pointer-events-none select-none">
        <div className="h-48 bg-gradient-to-br from-violet-500 to-indigo-600" />
        <div className="p-6 grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-neutral-200 rounded-xl" />)}
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
        <div className="text-center px-6 py-8 max-w-sm">
          <p className="text-3xl mb-2">🌐</p>
          <p className="font-semibold text-neutral-800">Website preview locked</p>
          <p className="text-sm text-neutral-500 mt-1">Complete <strong>Create Content</strong> to connect live CMS data to your site.</p>
        </div>
      </div>
    </div>
  );
}

function HomeView({
  posts, heroPost, styles, xray, features, onSelect,
}: {
  posts: import("@/modules/cms/types").ContentEntry[];
  heroPost?: import("@/modules/cms/types").ContentEntry;
  styles: { bg: string; text: string; accent: string; card: string };
  xray: boolean;
  features: import("@/modules/cms/types").WebsiteFeature[];
  onSelect: (id: string) => void;
}) {
  const categories = [...new Set(posts.map((p) => p.category))];

  return (
    <div className="min-h-full">
      <header className={cn("sticky top-0 z-10 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between", styles.text, "border-black/5 bg-inherit/80")}>
        <div className="flex items-center gap-2">
          <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br", styles.accent)} />
          <span className="font-bold tracking-tight">LearnCMS</span>
        </div>
        {hasFeature(features, "navigation") && (
          <nav className="hidden sm:flex gap-6 text-sm opacity-70">
            <span className="font-medium opacity-100">Home</span>
            <span>Blog</span>
            {hasFeature(features, "author-profiles") && <span>Authors</span>}
          </nav>
        )}
      </header>

      {heroPost && (
        <section className="relative overflow-hidden">
          {hasFeature(features, "hero-sections") && heroPost.image ? (
            <div className="relative h-56 sm:h-72">
              <img src={heroPost.image} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                <span className="text-[10px] uppercase tracking-widest text-white/60">{heroPost.category}</span>
                <h1 className="text-2xl sm:text-4xl font-bold text-white mt-1 max-w-xl leading-tight">{heroPost.title}</h1>
                {hasFeature(features, "author-profiles") && <p className="text-white/70 text-sm mt-2">By {heroPost.author}</p>}
              </div>
            </div>
          ) : (
            <div className={cn("px-6 py-14 sm:py-20 bg-gradient-to-br text-white", styles.accent)}>
              <span className="text-xs uppercase tracking-widest opacity-80">{heroPost.category}</span>
              <h1 className="text-3xl sm:text-5xl font-bold mt-2 max-w-2xl leading-tight">{heroPost.title}</h1>
              <p className="mt-4 opacity-90 max-w-lg text-sm sm:text-base line-clamp-2">{heroPost.content.replace(/<[^>]*>/g, "")}</p>
            </div>
          )}
        </section>
      )}

      {hasFeature(features, "category-filter") && categories.length > 0 && (
        <div className="px-6 py-4 flex gap-2 flex-wrap">
          {categories.map((c) => (
            <span key={c} className="px-3 py-1 rounded-full text-xs font-medium bg-black/5">{c}</span>
          ))}
        </div>
      )}

      {hasFeature(features, "metadata-preview") && heroPost && (
        <div className="mx-6 mb-4 p-3 rounded-lg border border-black/5 bg-black/[0.02] text-[10px] font-mono">
          <p className="text-blue-600 truncate">{heroPost.title} | LearnCMS</p>
          <p className="opacity-50 truncate">/{heroPost.slug} · {heroPost.readingTime ?? 5} min read</p>
        </div>
      )}

      <section className="px-6 py-6 grid sm:grid-cols-2 gap-5">
        {posts.map((post) => (
          <button key={post.id} onClick={() => onSelect(post.id)} className={cn("text-left rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-xl", styles.card)}>
            {(hasFeature(features, "gallery") || post.image) && post.image && (
              <img src={post.image} alt="" className="w-full h-36 object-cover" />
            )}
            <div className="p-5">
              <span className="text-[10px] uppercase tracking-wider opacity-45">{post.category}</span>
              <h2 className="font-semibold text-base mt-1 leading-snug">{post.title}</h2>
              {hasFeature(features, "author-profiles") && <p className="text-xs opacity-50 mt-2">{post.author}</p>}
              <p className="text-sm opacity-55 mt-2 line-clamp-2">{post.content.replace(/<[^>]*>/g, "")}</p>
            </div>
          </button>
        ))}
      </section>

      <footer className="px-6 py-8 mt-4 border-t border-black/5 text-center text-xs opacity-40">
        Powered by your headless CMS · Live preview
      </footer>
    </div>
  );
}

function ArticleView({
  post, styles, xray, features, onBack,
}: {
  post: import("@/modules/cms/types").ContentEntry;
  styles: { bg: string; text: string; accent: string; card: string };
  xray: boolean;
  features: import("@/modules/cms/types").WebsiteFeature[];
  onBack: () => void;
}) {
  return (
    <article className="max-w-2xl mx-auto px-6 py-10">
      <button onClick={onBack} className="text-sm opacity-50 hover:opacity-80 mb-6">← Back to home</button>
      {post.image && (
        <div className="relative mb-8 rounded-2xl overflow-hidden shadow-lg">
          <img src={post.image} alt="" className="w-full h-52 object-cover" />
          {xray && <XRayOverlay field="image" jsonPath={`data.${post.id}.image`} component="ArticleHero" value={post.image} entry={post} />}
        </div>
      )}
      <span className="text-[10px] uppercase tracking-widest opacity-45">{post.category}</span>
      <h1 className="text-3xl font-bold mt-2 leading-tight">{post.title}</h1>
      {hasFeature(features, "author-profiles") && <p className="opacity-50 mt-3 text-sm">By {post.author} · {post.readingTime ?? 5} min read</p>}
      <div className="mt-8 prose prose-neutral prose-sm max-w-none leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
