"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { siteAssets } from "@/shared/config/assets";
import { cabinetPaintingContent as content } from "../content/cabinet-painting-content";

const KitchenScene = dynamic(
  () => import("@/shared/ui/kitchen-scene").then((module) => module.KitchenScene),
  { ssr: false },
);

const stages = [
  {
    id: "cabinet-process-existing", number: "01", title: "Inspect the existing kitchen", label: "Inspection",
    detail: "Understand the starting surface",
    copy: "We assess the cabinet material, existing finish, condition and access, then identify the doors, drawers, frames and panels proposed for painting. Colour, sheen, repairs and exclusions are agreed for the project.",
    image: siteAssets.frontStoryExisting,
  },
  {
    id: "cabinet-process-remove", number: "02", title: "Remove doors and hardware", label: "Removal",
    detail: "Keep each part accounted for",
    copy: "Cabinet doors are removed for spray painting and drying in a separate booth. Drawer fronts, handles, hinges, labelling and refitting are discussed as part of the agreed scope; fixed surfaces are assessed separately.",
    image: siteAssets.frontStoryRemoved,
  },
  {
    id: "cabinet-process-clean", number: "03", title: "Clean before coating", label: "Cleaning",
    detail: "Remove residues that affect adhesion",
    copy: "Kitchen surfaces can hold grease and everyday residue. Cleaning and degreasing form part of preparation where required by the assessed material and selected coating system.",
    image: siteAssets.cinematicCleaning,
  },
  {
    id: "cabinet-process-prepare", number: "04", title: "Prepare and repair", label: "Surface preparation",
    detail: "Create a sound base",
    copy: "Suitable surfaces may be sanded and small chips or dents patched under the agreed preparation scope. Lifting coverings, swelling or underlying damage need separate assessment and may call for another approach.",
    image: siteAssets.frontStoryPrepared,
  },
  {
    id: "cabinet-process-mask", number: "05", title: "Protect the surroundings", label: "Masking",
    detail: "Define the work area",
    copy: "Adjacent benchtops, walls, floors and appliances are protected as needed for the agreed work. Any fixed frames or panels to be coated are identified before work begins.",
    image: siteAssets.cinematicMasking,
  },
  {
    id: "cabinet-process-undercoat", number: "06", title: "Build the foundation", label: "Primer / undercoat",
    detail: "Surface → preparation → base coat",
    copy: "A compatible primer or undercoat may form the base for the selected finish. The actual product and method depend on the cabinet surface, its existing coating and manufacturer instructions.",
    image: siteAssets.storyUndercoat,
  },
  {
    id: "cabinet-process-finish", number: "07", title: "Apply the finish", label: "Finish coats",
    detail: "Colour and sheen take shape",
    copy: "L&K uses Dulux Aqua Enamel and spray-paints removable cabinet doors in a separate booth. The exact product, number of coats, colour, sheen and treatment of fixed surfaces are confirmed for your kitchen.",
    image: siteAssets.frontStoryCoatTwo,
  },
  {
    id: "cabinet-process-cure", number: "08", title: "Allow time to dry", label: "Drying & curing",
    detail: "Care continues after application",
    copy: "Drying between stages and full curing are different. L&K generally allows 3–7 days for work and drying, and recommends careful use for 7 days after reinstallation. Your schedule and care instructions depend on the project.",
    image: siteAssets.frontStoryCoatTwo,
  },
  {
    id: "cabinet-process-reassemble", number: "09", title: "Reassemble and check", label: "Reassembly",
    detail: "Bring the kitchen back together",
    copy: "When the finish is ready, the agreed doors and hardware are refitted. Alignment, operation and painted surfaces are reviewed against the agreed scope.",
    image: siteAssets.frontStoryFinished,
  },
  {
    id: "cabinet-process-complete", number: "09", title: "The same kitchen, refreshed", label: "Finished kitchen",
    detail: "Existing layout, new finish direction",
    copy: "The original kitchen layout remains. This generated concept illustrates how a new cabinet finish could change its character; the actual result depends on the surfaces, colour and work agreed for your home.",
    image: siteAssets.frontStoryFinished,
  },
] as const;

function interpolateProgress(nodes: HTMLElement[], viewportHeight: number) {
  const target = viewportHeight * 0.52;
  const centres = nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    return rect.top + rect.height / 2;
  });
  if (target <= centres[0]) return 0;
  for (let index = 0; index < centres.length - 1; index += 1) {
    if (target <= centres[index + 1]) {
      const span = centres[index + 1] - centres[index];
      return index + (span > 0 ? (target - centres[index]) / span : 0);
    }
  }
  return centres.length - 1;
}

function alignChapterToViewport(chapter: HTMLElement) {
  const rect = chapter.getBoundingClientRect();
  const top = window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2;
  window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
}

export function CabinetCinematicStory() {
  const rootRef = useRef<HTMLElement>(null);
  const chaptersRef = useRef<(HTMLElement | null)[]>([]);
  const pendingChapterRef = useRef<{ index: number; staticMode: boolean } | null>(null);
  const staticReadingRef = useRef(0);
  const toolbarFocusedRef = useRef(false);
  const activeRef = useRef(0);
  const staticModeRef = useRef(false);
  const eligibleRef = useRef(false);
  const initialHashRestoredRef = useRef(false);
  const [eligible, setEligible] = useState(false);
  const [staticMode, setStaticMode] = useState(false);
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);
  const enhanced = eligible && !staticMode && !unavailable;

  useLayoutEffect(() => {
    const pending = pendingChapterRef.current;
    if (!pending || pending.staticMode !== staticMode) return;
    const chapter = chaptersRef.current[pending.index];
    if (!chapter) return;
    alignChapterToViewport(chapter);
    const frame = requestAnimationFrame(() => {
      alignChapterToViewport(chapter);
      chapter.focus({ preventScroll: true });
      pendingChapterRef.current = null;
    });
    return () => cancelAnimationFrame(frame);
  }, [staticMode, eligible, unavailable]);

  useLayoutEffect(() => {
    if (!enhanced || initialHashRestoredRef.current) return;
    initialHashRestoredRef.current = true;
    if (pendingChapterRef.current) return;
    const hash = window.location.hash.slice(1);
    const index = stages.findIndex((stage) => stage.id === hash);
    const chapter = chaptersRef.current[index];
    if (index < 0 || !chapter) return;
    activeRef.current = index;
    alignChapterToViewport(chapter);
    const frame = requestAnimationFrame(() => alignChapterToViewport(chapter));
    return () => cancelAnimationFrame(frame);
  }, [enhanced]);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)");
    let initialized = false;
    const update = () => {
      const next = query.matches;
      const chapterVisible = chaptersRef.current.some((chapter) => {
        if (!chapter) return false;
        const rect = chapter.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < window.innerHeight;
      });
      if (initialized && next !== eligibleRef.current && chapterVisible) {
        const index = eligibleRef.current && !staticModeRef.current ? activeRef.current : staticReadingRef.current;
        pendingChapterRef.current = { index, staticMode: staticModeRef.current };
        activeRef.current = index;
        setActive(index);
        setProgress(Math.min(9, index + 0.4));
      }
      eligibleRef.current = next;
      setEligible(next);
      initialized = true;
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enhanced || !rootRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      if (!entry.isIntersecting) setReady(false);
    }, { rootMargin: "50% 0px" });
    observer.observe(rootRef.current);
    return () => { observer.disconnect(); setInView(false); setReady(false); };
  }, [enhanced]);

  useEffect(() => {
    if (!enhanced) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const root = rootRef.current;
      if (!root) return;
      const bounds = root.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > window.innerHeight) return;
      const nodes = chaptersRef.current.filter((node): node is HTMLElement => node !== null);
      if (nodes.length !== stages.length) return;
      const next = Math.min(9, Math.max(0, interpolateProgress(nodes, window.innerHeight) + 0.4));
      setProgress((previous) => Math.abs(previous - next) > 0.006 ? next : previous);
      const index = Math.min(9, Math.max(0, Math.floor(next)));
      activeRef.current = index;
      setActive(index);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enhanced]);

  useEffect(() => {
    if (enhanced) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      if (toolbarFocusedRef.current) return;
      const target = window.innerHeight * 0.5;
      const visibleIndex = chaptersRef.current.findIndex((chapter) => {
        if (!chapter) return false;
        const rect = chapter.getBoundingClientRect();
        return rect.top <= target && rect.bottom >= target;
      });
      if (visibleIndex >= 0) staticReadingRef.current = visibleIndex;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enhanced]);

  const handleReady = useCallback(() => { setReady(true); setUnavailable(false); }, []);
  const handleUnavailable = useCallback(() => {
    const index = activeRef.current;
    pendingChapterRef.current = { index, staticMode: true };
    staticReadingRef.current = index;
    staticModeRef.current = true;
    setUnavailable(true);
    setReady(false);
    setStaticMode(true);
  }, []);
  const current = stages[active];
  const switchView = (nextStatic: boolean) => {
    const measuredIndex = chaptersRef.current.reduce((best, node, index) => {
      if (!node) return best;
      const bounds = node.getBoundingClientRect();
      const distance = Math.abs(bounds.top + bounds.height / 2 - window.innerHeight * 0.5);
      return distance < best.distance ? { index, distance } : best;
    }, { index: active, distance: Number.POSITIVE_INFINITY }).index;
    const readingIndex = nextStatic ? measuredIndex : staticReadingRef.current;
    if (nextStatic) staticReadingRef.current = readingIndex;
    pendingChapterRef.current = { index: readingIndex, staticMode: nextStatic };
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    activeRef.current = readingIndex;
    staticModeRef.current = nextStatic;
    setActive(readingIndex);
    setProgress(Math.min(9, readingIndex + 0.4));
    setReady(false);
    setStaticMode(nextStatic);
  };

  return (
    <section id="cabinet-process" ref={rootRef} className="kcp-story" data-enhanced={enhanced} aria-labelledby="cabinet-process-title">
      <div className="kcp-wrap kcp-story-intro">
        <p className="kcp-kicker">The transformation / 01—09</p>
        <h2 id="cabinet-process-title">Every finish begins long before the colour.</h2>
        <p>{content.process.introduction}</p>
        <div className="kcp-story-intro-actions">
          <a href="#cabinet-process-existing" className="kcp-link">Explore the process <span aria-hidden="true">↘</span></a>
          <a href="#cabinet-transformation" className="kcp-link">Skip the story <span aria-hidden="true">↓</span></a>
        </div>
        <p className="kcp-small">Illustrative process and generated imagery. The exact preparation and coating system is confirmed for your cabinets.</p>
      </div>
      {staticMode && eligible ? <div className="kcp-static-toolbar"><div className="kcp-wrap"><span>{unavailable ? "3D unavailable — static process view" : "Static process view"}</span>{!unavailable ? <button type="button" onFocus={() => { toolbarFocusedRef.current = true; }} onBlur={() => { toolbarFocusedRef.current = false; }} onPointerDown={() => { toolbarFocusedRef.current = true; }} onKeyDown={() => { toolbarFocusedRef.current = true; }} onClick={() => switchView(false)}>Return to 3D story ↑</button> : null}</div></div> : null}
      <div className="kcp-story-stage" aria-hidden={!enhanced}>
        <div className="kcp-stage-visual">
          <Image src={current.image.src} alt="" width={current.image.width} height={current.image.height} sizes="(min-width: 1024px) 100vw, 1px" className={`kcp-stage-poster ${ready && enhanced && inView && !unavailable ? "is-ready" : ""}`} />
          {enhanced && inView && !unavailable ? (
            <KitchenScene progress={progress} mode="story" className="kcp-stage-canvas" onReady={handleReady} onUnavailable={handleUnavailable} />
          ) : null}
          <div className="kcp-stage-veil" />
        </div>
        <div className="kcp-stage-top kcp-wrap">
          <span>Kitchen Cabinet Painting</span>
          <span>Illustrative 3D concept</span>
        </div>
        <nav className="kcp-stage-nav kcp-wrap" aria-label="Cabinet painting process steps">
          <div className="kcp-stage-nav-current">
            <span>{current.number} / 09</span>
            <span>{current.title}</span>
          </div>
          <ol style={{ "--kcp-track": `${progress / 9 * 100}%` } as CSSProperties}>
            {stages.slice(0, 9).map((stage, index) => (
              <li key={stage.id}>
                <a href={`#${stage.id}`} aria-label={`Step ${stage.number}: ${stage.label}`} aria-current={active === index ? "step" : undefined} title={stage.label}>
                  <span className="kcp-nav-tick" />
                </a>
              </li>
            ))}
          </ol>
          <div className="kcp-stage-nav-actions">
            <button type="button" onClick={() => switchView(true)}>Static view</button>
            <a href="#cabinet-transformation">Skip <span aria-hidden="true">↓</span></a>
          </div>
        </nav>
      </div>
      <ol className="kcp-chapters">
        {stages.map((stage, index) => (
          <li key={stage.id}>
            <article id={stage.id} ref={(node) => { chaptersRef.current[index] = node; }} className="kcp-chapter" tabIndex={-1} aria-labelledby={`${stage.id}-title`}>
              <div className="kcp-wrap kcp-chapter-inner">
                <div className="kcp-chapter-copy">
                  <p className="kcp-chapter-count">{index === 9 ? "The reveal" : `${stage.number} / 09`} <span>{stage.label}</span></p>
                  <h3 id={`${stage.id}-title`}>{stage.title}</h3>
                  <p>{stage.copy}</p>
                  {index === 5 ? <ol className="kcp-layer-guide" aria-label="Illustrative coating layers"><li>Existing surface</li><li>Preparation</li><li>Compatible base</li><li>Finish coats</li></ol> : null}
                  <p className="kcp-chapter-detail"><span aria-hidden="true">—</span> {stage.detail}</p>
                </div>
                <figure className="kcp-chapter-figure">
                  <Image src={stage.image.src} alt={stage.image.alt} width={stage.image.width} height={stage.image.height} sizes="(min-width: 768px) 80vw, 100vw" loading="lazy" />
                  <figcaption>Generated process concept. Actual method and result depend on the assessed kitchen.</figcaption>
                </figure>
              </div>
            </article>
          </li>
        ))}
      </ol>
      <div className="kcp-story-outro kcp-wrap">
        <p>{content.process.confirmations.join(" ")}</p>
        {staticMode && eligible && !unavailable ? <button type="button" className="kcp-link" onClick={() => switchView(false)}>Return to animated story ↑</button> : null}
      </div>
    </section>
  );
}
