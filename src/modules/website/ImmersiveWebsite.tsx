"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { usePublishedContent } from "@/hooks/use-content";
import { useUIStore } from "@/store/ui-store";
import { WEBSITE_THEMES } from "@/modules/cms/types";
import { XRayOverlay, hasFeature } from "./XRayOverlay";
import { cn } from "@/lib/utils";

export function ImmersiveWebsite() {
  const viewMode = useUIStore((s) => s.viewMode);
  const setViewMode = useUIStore((s) => s.setViewMode);
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

  const { data: posts, isLoading } = usePublishedContent();
  const heroPost = posts[0];
  const selected = posts.find((p) => p.id === selectedEntryId);
  const categories = [...new Set(posts.map((p) => p.category))];
  const authors = [...new Set(posts.map((p) => p.author))];

  if (viewMode !== "explore") return null;

  const themeClasses: Record<string, string> = {
    "modern-startup": "bg-white text-neutral-900",
    "news-magazine": "bg-neutral-950 text-white",
    "ecommerce": "bg-stone-50 text-stone-900",
    "portfolio": "bg-zinc-900 text-zinc-100",
    "travel-blog": "bg-sky-50 text-sky-950",
    "saas-landing": "bg-indigo-950 text-white",
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col"
      >
        {/* Controls bar */}
        <div className="absolute top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-black/20 backdrop-blur-md">
          <button
            onClick={() => setViewMode("learn")}
            className="flex items-center gap-2 text-white text-sm hover:opacity-80"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Learn
          </button>

          <div className="flex items-center gap-3">
            {hasFeature(unlockedFeatures, "language-switcher") && (
              <div className="flex gap-1">
                {["en", "de", "fr"].map((l) => (
                  <button
                    key={l}
                    onClick={() => setActiveLocale(l)}
                    className={cn(
                      "px-2 py-1 rounded text-xs uppercase",
                      activeLocale === l ? "bg-white text-black" : "text-white/70 hover:text-white"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}

            <select
              value={activeTheme}
              onChange={(e) => setActiveTheme(e.target.value as typeof activeTheme)}
              className="text-xs bg-white/10 text-white border border-white/20 rounded-lg px-2 py-1.5 backdrop-blur"
            >
              {WEBSITE_THEMES.map((t) => (
                <option key={t.id} value={t.id} className="text-black">{t.name}</option>
              ))}
            </select>

            <button
              onClick={() => setXrayMode(!xrayMode)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                xrayMode ? "bg-violet-600 text-white" : "bg-white/10 text-white hover:bg-white/20"
              )}
            >
              {xrayMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              X-Ray
            </button>
          </div>
        </div>

        {/* Unlock celebration */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 inset-x-0 z-50 flex justify-center"
              onClick={dismissCelebration}
            >
              <div className="bg-white rounded-2xl shadow-2xl px-8 py-5 text-center cursor-pointer">
                <p className="text-2xl mb-1">🎉</p>
                <p className="font-semibold text-neutral-900">{lastUnlockMessage}</p>
                <p className="text-xs text-neutral-400 mt-1">Tap to explore your evolving website</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fullscreen website */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={cn("flex-1 overflow-y-auto pt-16", themeClasses[activeTheme])}
        >
          {!hasFeature(unlockedFeatures, "blog-homepage") ? (
            <div className="flex items-center justify-center h-full text-neutral-400">
              Complete &quot;Create a Blog Post&quot; to unlock your website
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-full">Loading your website...</div>
          ) : selected ? (
            <ArticleView post={selected} theme={activeTheme} xray={xrayMode} features={unlockedFeatures} onBack={() => setSelectedEntryId(null)} />
          ) : (
            <HomeView
              posts={posts}
              heroPost={heroPost}
              theme={activeTheme}
              xray={xrayMode}
              features={unlockedFeatures}
              categories={categories}
              authors={authors}
              onSelect={setSelectedEntryId}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function HomeView({
  posts, heroPost, theme, xray, features, categories, authors, onSelect,
}: {
  posts: import("@/modules/cms/types").ContentEntry[];
  heroPost?: import("@/modules/cms/types").ContentEntry;
  theme: string;
  xray: boolean;
  features: import("@/modules/cms/types").WebsiteFeature[];
  categories: string[];
  authors: string[];
  onSelect: (id: string) => void;
}) {
  const isDark = theme === "news-magazine" || theme === "portfolio" || theme === "saas-landing";

  return (
    <div className="min-h-full">
      {/* Navigation */}
      {hasFeature(features, "navigation") && (
        <nav className={cn("px-8 py-4 flex gap-6 text-sm border-b", isDark ? "border-white/10" : "border-neutral-200")}>
          <span className="font-semibold">Home</span>
          <span className="opacity-60">Blog</span>
          {hasFeature(features, "author-profiles") && <span className="opacity-60">Authors</span>}
        </nav>
      )}

      {/* Hero */}
      {hasFeature(features, "hero-sections") && heroPost && (
        <div className="relative">
          {heroPost.image && (
            <div className="relative h-[50vh] min-h-[320px]">
              <img src={heroPost.image} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12">
                <h1 className="text-3xl sm:text-5xl font-bold text-white max-w-2xl">{heroPost.title}</h1>
                {hasFeature(features, "author-profiles") && (
                  <p className="text-white/70 mt-2">By {heroPost.author}</p>
                )}
              </div>
              {xray && <XRayOverlay field="title" jsonPath="data[0].title" component="HeroTitle" value={heroPost.title} entry={heroPost} />}
            </div>
          )}
          {!heroPost.image && (
            <div className={cn("px-8 py-16 sm:py-24", isDark ? "bg-neutral-900" : "bg-neutral-100")}>
              <h1 className="text-4xl sm:text-6xl font-bold max-w-2xl">{heroPost.title}</h1>
            </div>
          )}
        </div>
      )}

      {/* Simple hero if no hero-sections unlocked */}
      {!hasFeature(features, "hero-sections") && heroPost && (
        <div className="px-8 py-16 sm:py-24">
          <h1 className="text-4xl sm:text-6xl font-bold max-w-2xl">{heroPost.title}</h1>
          <p className="mt-4 opacity-60 max-w-lg">{heroPost.content.replace(/<[^>]*>/g, "").slice(0, 120)}...</p>
        </div>
      )}

      {/* Category filter */}
      {hasFeature(features, "category-filter") && categories.length > 0 && (
        <div className="px-8 py-4 flex gap-2 flex-wrap">
          {categories.map((c) => (
            <span key={c} className={cn("px-3 py-1 rounded-full text-xs", isDark ? "bg-white/10" : "bg-neutral-100")}>{c}</span>
          ))}
        </div>
      )}

      {/* SEO metadata preview */}
      {hasFeature(features, "metadata-preview") && heroPost && (
        <div className={cn("mx-8 mb-6 p-4 rounded-xl border text-xs font-mono", isDark ? "border-white/10 bg-white/5" : "border-neutral-200 bg-neutral-50")}>
          <p className="text-blue-500 truncate">{heroPost.title} | Your Site</p>
          <p className="opacity-60 truncate">{heroPost.slug} — {heroPost.readingTime ?? 5} min read</p>
        </div>
      )}

      {/* Post grid */}
      <div className="px-8 py-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <button
            key={post.id}
            onClick={() => onSelect(post.id)}
            className={cn(
              "text-left rounded-2xl overflow-hidden transition-transform hover:scale-[1.02]",
              isDark ? "bg-white/5 hover:bg-white/10" : "bg-white shadow-sm border border-neutral-100 hover:shadow-md"
            )}
          >
            {hasFeature(features, "gallery") && post.image && (
              <img src={post.image} alt="" className="w-full h-40 object-cover" />
            )}
            <div className="p-5">
              {hasFeature(features, "category-filter") && (
                <span className="text-[10px] uppercase tracking-wider opacity-50">{post.category}</span>
              )}
              <h2 className="font-semibold mt-1">{post.title}</h2>
              {hasFeature(features, "author-profiles") && (
                <p className="text-xs opacity-50 mt-1">{post.author}</p>
              )}
              {hasFeature(features, "custom-components") && (
                <p className="text-sm opacity-60 mt-2 line-clamp-2">{post.content.replace(/<[^>]*>/g, "")}</p>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Author profiles section */}
      {hasFeature(features, "author-profiles") && authors.length > 0 && (
        <div className="px-8 py-12 border-t border-neutral-200/20">
          <h2 className="text-xl font-semibold mb-6">Authors</h2>
          <div className="flex gap-4">
            {authors.map((a) => (
              <div key={a} className={cn("px-5 py-4 rounded-xl", isDark ? "bg-white/5" : "bg-neutral-100")}>
                <div className="w-10 h-10 rounded-full bg-neutral-300 mb-2" />
                <p className="text-sm font-medium">{a}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ArticleView({
  post, theme, xray, features, onBack,
}: {
  post: import("@/modules/cms/types").ContentEntry;
  theme: string;
  xray: boolean;
  features: import("@/modules/cms/types").WebsiteFeature[];
  onBack: () => void;
}) {
  return (
    <div className="max-w-3xl mx-auto px-8 py-12">
      <button onClick={onBack} className="text-sm opacity-50 hover:opacity-80 mb-8">← Back</button>
      {post.image && hasFeature(features, "hero-sections") && (
        <div className="relative mb-8 rounded-2xl overflow-hidden">
          <img src={post.image} alt="" className="w-full h-64 object-cover" />
          {xray && <XRayOverlay field="image" jsonPath={`data.id.${post.id}.image`} component="ArticleHero" value={post.image} entry={post} />}
        </div>
      )}
      <h1 className="text-3xl sm:text-4xl font-bold">{post.title}</h1>
      {hasFeature(features, "author-profiles") && <p className="opacity-50 mt-2">By {post.author}</p>}
      <div className="mt-8 prose prose-neutral max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
}
