"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { StoryAsset, StoryScene } from "./story-types";

type MotionProps = Readonly<{
  storyId: string;
  scenes: readonly StoryScene[];
  stageLabel: string;
  conceptNotice?: string;
  skipHref: string;
}>;

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function bounded(value: number, limit: number) {
  return Math.max(-limit, Math.min(limit, value));
}

function layerProgress(distance: number, delay: number) {
  const local = clamp((distance - delay) / (1 - delay));
  return local * local * (3 - 2 * local);
}

function writeLayerMotion(stage: HTMLElement, distance: number) {
  stage.querySelectorAll<HTMLElement>("[data-story-layer]").forEach((layer) => {
    const delay = clamp(Number(layer.dataset.delay ?? 0));
    const progress = layerProgress(distance, delay);
    layer.style.setProperty("--layer-progress", String(progress));
    layer.style.setProperty("--layer-shadow-strength", `${(progress * 24).toFixed(2)}%`);
  });
}

function StageImage({ asset, className, onLoad, onError }: {
  asset: StoryAsset;
  className: string;
  onLoad: () => void;
  onError: () => void;
}) {
  return (
    <Image
      src={asset.src}
      alt=""
      fill
      sizes="100vw"
      loading="eager"
      className={className}
      onLoad={onLoad}
      onError={onError}
    />
  );
}

function StageScene({ scene, number, count, stageLabel, conceptNotice }: {
  scene: StoryScene;
  number: number;
  count: number;
  stageLabel: string;
  conceptNotice?: string;
}) {
  const [posterLoaded, setPosterLoaded] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const [visualLoaded, setVisualLoaded] = useState<readonly string[]>([]);
  const [visualFailed, setVisualFailed] = useState(false);
  const visual = scene.visual;
  const registeredBase = !!visual?.registeredBase && !!visual.layers?.length && visual.layers.every((layer) => !!layer.clipPath);
  const visualAssets = visual ? [visual.background, ...(visual.registeredBase ? [visual.registeredBase] : []), ...(visual.layers?.map((layer) => layer.asset) ?? []), ...(visual.states ?? []), ...(visual.startPoster ? [visual.startPoster] : [])] : [];
  const visualReady = !!visual && !visualFailed && visualAssets.every((asset) => visualLoaded.includes(asset.src));
  const showPoster = !visual || !visualReady || visualFailed || !!visual.settleOnPoster;
  const markLoaded = (src: string) => setVisualLoaded((loaded) => loaded.includes(src) ? loaded : [...loaded, src]);

  return (
    <div className="service-story-stage-frame">
      <div className="service-story-stage-placeholder" aria-hidden="true">
        <span>{posterFailed ? "Visual unavailable" : "Loading visual"}</span>
      </div>
      <div
        className="service-story-photo-canvas"
        style={{ "--scene-ratio": String(scene.poster.width / scene.poster.height) } as CSSProperties}
      >
        <StageImage
          asset={scene.poster}
          className={`service-story-stage-poster${posterLoaded && showPoster ? " is-loaded" : ""}${visualReady && visual?.settleOnPoster ? " is-end-cover" : ""}`}
          onLoad={() => setPosterLoaded(true)}
          onError={() => setPosterFailed(true)}
        />
        {visual ? (
          <div className={`service-story-stage-visual${visualReady ? " is-ready" : ""}`} data-preset={visual.preset} data-reveal-from={visual.revealFrom ?? "left"}>
            {registeredBase ? (
              <>
                <StageImage asset={visual.registeredBase!} className="service-story-stage-base" onLoad={() => markLoaded(visual.registeredBase!.src)} onError={() => setVisualFailed(true)} />
                {visual.layers?.map((layer) => (
                  <div key={`${layer.id}-cavity`} className="service-story-stage-cavity" style={{ clipPath: layer.clipPath }}>
                    <StageImage asset={visual.background} className="service-story-stage-cavity-image" onLoad={() => markLoaded(visual.background.src)} onError={() => setVisualFailed(true)} />
                  </div>
                ))}
              </>
            ) : (
              <StageImage asset={visual.background} className="service-story-stage-base" onLoad={() => markLoaded(visual.background.src)} onError={() => setVisualFailed(true)} />
            )}
            {visual.layers?.map((layer, index) => {
              const delay = Math.min(0.35, Math.max(0, layer.stagger ?? index * 0.045));
              return (
                <div
                  key={layer.id}
                  className="service-story-stage-layer"
                  data-story-layer
                  data-delay={delay}
                  style={{
                    "--layer-x": `${bounded(layer.travelX, 5)}%`,
                    "--layer-y": `${bounded(layer.travelY, 5)}%`,
                    "--layer-z": `${Math.min(120, Math.max(0, layer.travelZ ?? 90))}px`,
                    "--layer-rotate-x": `${bounded(layer.rotateX ?? 0, 3)}deg`,
                    "--layer-rotate-y": `${bounded(layer.rotateY ?? 0, 12)}deg`,
                    "--layer-rotate-z": `${bounded(layer.rotateZ ?? layer.rotate ?? 0, 1.5)}deg`,
                    "--layer-origin-x": `${layer.originX ?? 50}%`,
                    "--layer-origin-y": `${layer.originY ?? 50}%`,
                  } as CSSProperties}
                >
                  <div className="service-story-stage-layer-cutout" style={{ clipPath: layer.clipPath }}>
                    <StageImage asset={layer.asset} className="service-story-stage-layer-image" onLoad={() => markLoaded(layer.asset.src)} onError={() => setVisualFailed(true)} />
                  </div>
                </div>
              );
            })}
            {visual.states?.map((asset, index) => (
              <div key={`${asset.src}-${index}`} className={`service-story-stage-state service-story-stage-state-${index + 1}`}>
                <StageImage asset={asset} className="service-story-stage-state-image" onLoad={() => markLoaded(asset.src)} onError={() => setVisualFailed(true)} />
              </div>
            ))}
          </div>
        ) : null}
        {visual?.startPoster ? (
          <StageImage
            asset={visual.startPoster}
            className={`service-story-stage-start-cover${visualReady ? " is-ready" : ""}`}
            onLoad={() => markLoaded(visual.startPoster!.src)}
            onError={() => setVisualFailed(true)}
          />
        ) : null}
      </div>
      <div className="service-story-photo-veil" />
      <div className="service-story-stage-topline">
        <span>{stageLabel}</span>
        <span>{String(number).padStart(2, "0")} / {String(count).padStart(2, "0")}</span>
      </div>
      {visual?.stateLabels?.length ? (
        <div className="service-story-stage-phase">
          {visual.stateLabels.map((label, index) => <span key={label} className={`service-story-phase-label service-story-phase-${index + 1}`}>{label}</span>)}
        </div>
      ) : null}
      {conceptNotice ? <p className="service-story-stage-notice">{conceptNotice}</p> : null}
      <div className="service-story-stage-progress"><span /></div>
    </div>
  );
}

export function StoryMotion({ storyId, scenes, stageLabel, conceptNotice, skipHref }: MotionProps) {
  const [supported, setSupported] = useState(false);
  const [staticMode, setStaticMode] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [nearStory, setNearStory] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<{ id: string; top: number } | null>(null);
  const lastMeasuredRef = useRef<{ id: string; top: number } | null>(null);
  const readingViewportRef = useRef(false);
  const lastDistanceRef = useRef(0);

  const rememberPosition = useCallback(() => {
    const root = document.getElementById(storyId);
    const bounds = root?.getBoundingClientRect();
    if (!bounds || bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
    const focusY = window.innerHeight * 0.46;
    const elements = scenes.map((scene) => document.getElementById(scene.id)).filter((element): element is HTMLElement => !!element);
    const index = elements.findIndex((element) => element.getBoundingClientRect().bottom > focusY);
    const element = elements[index < 0 ? elements.length - 1 : index];
    if (element) restoreRef.current = { id: element.id, top: element.getBoundingClientRect().top };
  }, [scenes, storyId]);

  useEffect(() => {
    const queries = [
      window.matchMedia("(min-width: 1024px)"),
      window.matchMedia("(min-height: 700px)"),
      window.matchMedia("(prefers-reduced-motion: no-preference)"),
    ];
    const requiresClips = scenes.some((scene) => scene.visual?.layers?.some((layer) => !!layer.clipPath));
    const masksSupported = !requiresClips || CSS.supports("clip-path", "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)");
    let initialized = false;
    const update = () => {
      if (initialized) {
        // Media CSS has already switched. Use the old scene only while the
        // reader is still inside this story, never from a stale footer visit.
        restoreRef.current = null;
        const bounds = document.getElementById(storyId)?.getBoundingClientRect();
        const inViewport = !!bounds && bounds.bottom > 0 && bounds.top < window.innerHeight;
        if (readingViewportRef.current && inViewport && lastMeasuredRef.current) {
          restoreRef.current = lastMeasuredRef.current;
        } else if (inViewport) {
          rememberPosition();
        }
      } else if (scenes.some((scene) => window.location.hash === `#${scene.id}`)) {
        rememberPosition();
      }
      initialized = true;
      const nextSupported = masksSupported && queries.every((query) => query.matches);
      setSupported(nextSupported);
    };
    update();
    queries.forEach((query) => query.addEventListener("change", update));
    return () => queries.forEach((query) => query.removeEventListener("change", update));
  }, [rememberPosition, scenes, storyId]);

  useLayoutEffect(() => {
    const root = document.getElementById(storyId);
    if (!root) return;
    const enhanced = supported && !staticMode;
    root.classList.toggle("story-enhanced", enhanced);
    root.classList.toggle("story-ready", supported);

    const previous = restoreRef.current;
    restoreRef.current = null;
    let correctionFrame = 0;
    if (previous) {
      const correctPosition = () => {
        const target = document.getElementById(previous.id);
        if (!target) return;
        const delta = target.getBoundingClientRect().top - previous.top;
        if (Math.abs(delta) > 1) window.scrollBy(0, delta);
      };
      correctPosition();
      correctionFrame = window.requestAnimationFrame(correctPosition);
    }
    return () => {
      if (correctionFrame) window.cancelAnimationFrame(correctionFrame);
      root.classList.remove("story-enhanced", "story-ready");
    };
  }, [storyId, supported, staticMode]);

  useLayoutEffect(() => {
    if (activeIndex === null || !stageRef.current) return;
    writeLayerMotion(stageRef.current, lastDistanceRef.current);
  }, [activeIndex, nearStory, supported, staticMode]);

  useEffect(() => {
    if (supported && !staticMode) return;
    const root = document.getElementById(storyId);
    if (!root) return;
    const steps = scenes.map((scene) => document.getElementById(scene.id)).filter((element): element is HTMLElement => !!element);
    let frame = 0;
    const measureStatic = () => {
      frame = 0;
      const bounds = root.getBoundingClientRect();
      readingViewportRef.current = bounds.bottom > 0 && bounds.top < window.innerHeight;
      if (!readingViewportRef.current || !steps.length) {
        lastMeasuredRef.current = null;
        return;
      }
      const focusY = window.innerHeight * 0.46;
      let index = steps.findIndex((step) => step.getBoundingClientRect().bottom > focusY);
      if (index < 0) index = steps.length - 1;
      const rect = steps[index].getBoundingClientRect();
      lastMeasuredRef.current = { id: steps[index].id, top: rect.top };
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(measureStatic); };
    measureStatic();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("hashchange", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("hashchange", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [storyId, scenes, supported, staticMode]);

  useEffect(() => {
    if (!supported || staticMode) return;
    const root = document.getElementById(storyId);
    const stage = stageRef.current;
    if (!root || !stage) return;
    const steps = scenes.map((scene) => document.getElementById(scene.id)).filter((element): element is HTMLElement => !!element);
    const copies = steps.map((step) => step.querySelector<HTMLElement>(".service-story-step-copy"));
    if (!steps.length) return;
    let frame = 0;
    let visible = false;
    let disposed = false;

    const measure = () => {
      frame = 0;
      const bounds = root.getBoundingClientRect();
      readingViewportRef.current = bounds.bottom > 0 && bounds.top < window.innerHeight;
      if (!readingViewportRef.current) lastMeasuredRef.current = null;
      const focusY = window.innerHeight * 0.46;
      let index = steps.findIndex((step) => step.getBoundingClientRect().bottom > focusY);
      if (index < 0) index = steps.length - 1;
      const rect = steps[index].getBoundingClientRect();
      const progress = clamp((focusY - rect.top) / Math.max(rect.height, 1));
      if (readingViewportRef.current) lastMeasuredRef.current = { id: steps[index].id, top: rect.top };
      setActiveIndex((current) => current === index ? current : index);
      stage.style.setProperty("--story-progress", String(progress));
      stage.style.setProperty("--story-total-progress", String((index + progress) / scenes.length));
      const distance = scenes[index].visual?.preset === "assemble" ? 1 - progress : progress;
      lastDistanceRef.current = distance;
      stage.style.setProperty("--story-distance", String(distance));
      writeLayerMotion(stage, distance);
      const revealOne = scenes[index].visual?.states?.length === 2 ? clamp(progress * 2) : progress;
      const revealTwo = clamp((progress - 0.5) * 2);
      const featherOne = 3 * Math.sin(Math.PI * revealOne);
      const featherTwo = 3 * Math.sin(Math.PI * revealTwo);
      stage.style.setProperty("--story-reveal-one-hard", `${Math.max(0, 100 * revealOne - featherOne)}%`);
      stage.style.setProperty("--story-reveal-one-soft", `${Math.min(100, 100 * revealOne + featherOne)}%`);
      stage.style.setProperty("--story-reveal-two-hard", `${Math.max(0, 100 * revealTwo - featherTwo)}%`);
      stage.style.setProperty("--story-reveal-two-soft", `${Math.min(100, 100 * revealTwo + featherTwo)}%`);
      const secondPhase = clamp((progress - 0.42) / 0.16);
      stage.style.setProperty("--story-phase-one", String(1 - secondPhase));
      stage.style.setProperty("--story-phase-two", String(secondPhase));
      stage.style.setProperty("--story-start-cover", String(clamp((0.12 - progress) / 0.12)));
      stage.style.setProperty("--story-end-cover", String(clamp((progress - 0.88) / 0.12)));
      const safeTop = 72;
      const safeBottom = window.innerHeight - 108;
      const copyBounds = copies.map((copy) => copy?.getBoundingClientRect());
      copies.forEach((copy, copyIndex) => {
        const copyRect = copyBounds[copyIndex];
        if (!copy || !copyRect) return;
        const topClip = Math.min(copyRect.height, Math.max(0, safeTop - copyRect.top));
        const bottomClip = Math.min(copyRect.height, Math.max(0, copyRect.bottom - safeBottom));
        copy.style.setProperty("--story-copy-clip-top", `${topClip}px`);
        copy.style.setProperty("--story-copy-clip-bottom", `${bottomClip}px`);
      });
    };
    const schedule = () => {
      if (!frame && !disposed) frame = window.requestAnimationFrame(measure);
    };
    const onScroll = () => {
      const bounds = root.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) {
        readingViewportRef.current = false;
        lastMeasuredRef.current = null;
      }
      if (visible) schedule();
    };
    const storyObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      setNearStory((current) => current === visible ? current : visible);
      if (visible) schedule();
      else if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    }, { rootMargin: "50% 0px 50% 0px" });
    const stepObserver = new IntersectionObserver(schedule, { threshold: [0, 0.25, 0.5, 0.75, 1] });
    storyObserver.observe(root);
    steps.forEach((step) => stepObserver.observe(step));
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("hashchange", schedule);
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(root);
    document.fonts?.ready.then(() => { if (!disposed) schedule(); });
    schedule();
    return () => {
      disposed = true;
      readingViewportRef.current = false;
      lastMeasuredRef.current = null;
      storyObserver.disconnect();
      stepObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [storyId, scenes, supported, staticMode]);

  const toggleMode = () => {
    rememberPosition();
    readingViewportRef.current = false;
    lastMeasuredRef.current = null;
    setStaticMode((value) => !value);
  };

  const nextScene = supported && !staticMode && nearStory && activeIndex !== null ? scenes[activeIndex + 1] : undefined;
  const nextAssets = nextScene ? [nextScene.poster, ...(nextScene.visual ? [
    nextScene.visual.background,
    ...(nextScene.visual.registeredBase ? [nextScene.visual.registeredBase] : []),
    ...(nextScene.visual.layers?.map((layer) => layer.asset) ?? []),
    ...(nextScene.visual.states ?? []),
    ...(nextScene.visual.startPoster ? [nextScene.visual.startPoster] : []),
  ] : [])].filter((asset, index, all) => all.findIndex((item) => item.src === asset.src) === index) : [];

  return (
    <div className="service-story-motion">
      <div className="service-story-motion-controls">
        <nav className="service-story-chapter-rail" aria-label="Jump to a process chapter">
          {scenes.map((scene, index) => (
            <a key={scene.id} href={`#${scene.id}`} aria-label={`Step ${index + 1}: ${scene.title}`} aria-current={activeIndex === index ? "step" : undefined}>
              {String(index + 1).padStart(2, "0")}
            </a>
          ))}
        </nav>
        <div className="service-story-control-actions">
          <button type="button" onClick={toggleMode} aria-pressed={staticMode}>
            {staticMode ? "View animated steps" : "View steps without animation"}
          </button>
          <a href={skipHref}>Skip the process</a>
        </div>
      </div>
      <div className="service-story-stage" ref={stageRef} aria-hidden="true">
        {supported && !staticMode && nearStory && activeIndex !== null ? <StageScene key={scenes[activeIndex].id} scene={scenes[activeIndex]} number={activeIndex + 1} count={scenes.length} stageLabel={stageLabel} conceptNotice={conceptNotice} /> : null}
      </div>
      {nextAssets.length ? (
        <div className="service-story-preload" aria-hidden="true">
          {nextAssets.map((asset) => (
            <span key={asset.src} className="service-story-preload-slot" style={{ position: "relative" }}>
              <Image src={asset.src} alt="" fill sizes="100vw" loading="eager" />
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
