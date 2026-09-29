"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { siteAssets } from "@/shared/config/assets";

const KitchenScene = dynamic(
  () => import("@/shared/ui/kitchen-scene").then((module) => module.KitchenScene),
  { ssr: false },
);

const colours = [
  { name: "Warm White", hex: "#E9E4D9" },
  { name: "Natural White", hex: "#F2EFE8" },
  { name: "Soft Grey", hex: "#BFC2BD" },
  { name: "Greige", hex: "#B3A99C" },
  { name: "Charcoal", hex: "#454B49" },
  { name: "Deep Green", hex: "#4D6354" },
] as const;

const sheens = [
  { value: "low-sheen", name: "Low sheen" },
  { value: "satin", name: "Satin" },
  { value: "semi-gloss", name: "Semi-gloss" },
] as const;

type Sheen = (typeof sheens)[number]["value"];

export function BeforeAfter() {
  const [split, setSplit] = useState(50);
  const dragging = useRef(false);
  const before = siteAssets.frontStoryExisting;
  const after = siteAssets.frontStoryFinished;
  const updateFromPointer = (element: HTMLDivElement, clientX: number) => {
    const bounds = element.getBoundingClientRect();
    setSplit(Math.min(100, Math.max(0, Math.round((clientX - bounds.left) / bounds.width * 100))));
  };
  return (
    <section id="cabinet-transformation" className="kcp-transformation kcp-section" aria-labelledby="cabinet-transformation-title">
      <div className="kcp-wrap">
        <div className="kcp-section-heading">
          <p className="kcp-kicker">The reveal / same kitchen</p>
          <h2 id="cabinet-transformation-title">A new outlook. The kitchen you know.</h2>
          <p>Move the divider to compare two generated views of the same kitchen. This illustrates a possible colour change, not a completed L&K project or a promised finish.</p>
        </div>
        <div className="kcp-compare" role="group" aria-label="Before and after concept comparison">
          <div className="kcp-compare-images" role="img" aria-label="Generated concept comparison of the same kitchen before cabinet painting and with refreshed sage-grey cabinets"
            onDragStart={(event) => event.preventDefault()}
            onPointerDown={(event) => { dragging.current = true; event.currentTarget.setPointerCapture(event.pointerId); updateFromPointer(event.currentTarget, event.clientX); }}
            onPointerMove={(event) => { if (dragging.current) updateFromPointer(event.currentTarget, event.clientX); }}
            onPointerUp={(event) => { updateFromPointer(event.currentTarget, event.clientX); dragging.current = false; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
            onPointerCancel={() => { dragging.current = false; }}>
            <Image src={after.src} alt="" draggable={false} width={after.width} height={after.height} sizes="(min-width: 1200px) 1200px, 100vw" />
            <div className="kcp-compare-before" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
              <Image src={before.src} alt="" draggable={false} width={before.width} height={before.height} sizes="(min-width: 1200px) 1200px, 100vw" />
            </div>
            <span className="kcp-compare-label kcp-compare-label-before">Before concept</span>
            <span className="kcp-compare-label kcp-compare-label-after">After concept</span>
            <span className="kcp-compare-divider" style={{ left: `${split}%` }} aria-hidden="true"><span>↔</span></span>
          </div>
          <label className="kcp-compare-range-label" htmlFor="cabinet-comparison-range">Compare before and after <output htmlFor="cabinet-comparison-range">{split}% before</output></label>
          <input id="cabinet-comparison-range" className="kcp-compare-range" type="range" min="0" max="100" value={split} onChange={(event) => setSplit(Number(event.target.value))} aria-valuetext={`${split} percent of before concept visible`} />
        </div>
        <p className="kcp-caption">Generated concepts only. Colour and results vary with the actual cabinets, materials and lighting.</p>
      </div>
    </section>
  );
}

export function CabinetColourShowroom() {
  const [colour, setColour] = useState<string>(colours[0].hex);
  const [colourName, setColourName] = useState<string>(colours[0].name);
  const [sheen, setSheen] = useState<Sheen>("satin");
  const [eligible, setEligible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)");
    const update = () => setEligible(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!eligible || !sectionRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (!entry.isIntersecting) setReady(false);
    }, { rootMargin: "30% 0px" });
    observer.observe(sectionRef.current);
    return () => { observer.disconnect(); setVisible(false); setReady(false); };
  }, [eligible]);

  const handleReady = useCallback(() => { setReady(true); setUnavailable(false); }, []);
  const handleUnavailable = useCallback(() => { setReady(false); setUnavailable(true); }, []);
  const chooseCustomColour = (value: string) => {
    if (!/^#[0-9a-fA-F]{6}$/.test(value)) return;
    setColour(value);
    setColourName("Custom Colour");
  };
  const selectedSheen = sheens.find((item) => item.value === sheen)?.name ?? "Satin";
  const image = siteAssets.frontStoryFinished;

  return (
    <section id="cabinet-colours" ref={sectionRef} className="kcp-showroom kcp-section" aria-labelledby="cabinet-colours-title">
      <div className="kcp-wrap kcp-showroom-layout">
        <div className="kcp-showroom-copy">
          <p className="kcp-kicker">Explore a finish</p>
          <h2 id="cabinet-colours-title">Find a colour that feels like home.</h2>
          <p>Select a colour and sheen to explore an illustrative 3D kitchen. This is a visual guide, not an exact paint match or a specification for your project.</p>
          <fieldset className="kcp-colour-fieldset">
            <legend>Cabinet colour</legend>
            <div className="kcp-colour-options">
              {colours.map((item) => (
                <button key={item.name} type="button" className="kcp-colour-option" aria-pressed={colourName === item.name} onClick={() => { setColour(item.hex); setColourName(item.name); }}>
                  <span className="kcp-colour-chip" style={{ backgroundColor: item.hex }} aria-hidden="true" />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
            <label className="kcp-custom-colour" htmlFor="cabinet-custom-colour">Custom colour
              <input id="cabinet-custom-colour" type="color" value={colour} onInput={(event) => chooseCustomColour(event.currentTarget.value)} onChange={(event) => chooseCustomColour(event.currentTarget.value)} />
            </label>
          </fieldset>
          <fieldset className="kcp-sheen-fieldset">
            <legend>Finish sheen</legend>
            <div className="kcp-sheen-options">
              {sheens.map((item) => (
                <label key={item.value} className="kcp-sheen-option">
                  <input type="radio" name="cabinet-sheen" value={item.value} checked={sheen === item.value} onChange={() => setSheen(item.value)} />
                  <span>{item.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <p className="kcp-selection" aria-live="polite">Previewing: <strong>{colourName}</strong> / {selectedSheen}</p>
        </div>
        <figure className="kcp-showroom-visual">
          <div className="kcp-showroom-stage" style={{ backgroundColor: colour }}>
            <Image src={image.src} alt="Generated concept of a finished sage-grey kitchen; reference image for the colour preview" width={image.width} height={image.height} sizes="(min-width: 1200px) 700px, (min-width: 768px) 50vw, 100vw" className={ready && eligible && visible && !unavailable ? "is-ready" : ""} />
            {eligible && visible && !unavailable ? <KitchenScene progress={9} colour={colour} sheen={sheen} mode="showroom" className="kcp-showroom-canvas" onReady={handleReady} onUnavailable={handleUnavailable} /> : null}
            {!ready || unavailable || !eligible ? <span className="kcp-showroom-swatch" style={{ backgroundColor: colour }}>Selected colour sample</span> : null}
          </div>
          <figcaption>Illustrative 3D preview where supported. The photograph is a generated finish concept; the swatch shows your selection when 3D is unavailable. Confirm colour and sheen using physical samples and the agreed coating system.</figcaption>
        </figure>
      </div>
    </section>
  );
}
