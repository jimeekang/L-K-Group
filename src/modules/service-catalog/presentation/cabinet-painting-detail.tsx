import Image from "next/image";
import { ArrowUpRight, Plus } from "lucide-react";
import { siteAssets } from "@/shared/config/assets";
import { siteRoutes } from "@/shared/config/navigation";
import { cabinetPaintingContent as content } from "../content/cabinet-painting-content";
import { CabinetHero } from "./cabinet-hero";
import { CabinetCinematicStory } from "./cabinet-cinematic-story";
import { BeforeAfter, CabinetColourShowroom } from "./cabinet-interactives";
import "./cabinet-cinematic.css";

const pageSections = [
  { href: "#cabinet-process", label: "Process" },
  { href: "#cabinet-transformation", label: "Transformation" },
  { href: "#cabinet-colours", label: "Colours" },
  { href: "#cabinet-services", label: "Services" },
  { href: "#cabinet-service-area", label: "Service area" },
  { href: "#cabinet-faq", label: "FAQs" },
] as const;

function Eyebrow({ children }: { children: string }) {
  return <p className="kcp-kicker">{children}</p>;
}

export function CabinetPaintingDetail() {
  return (
    <div className="kcp-page">
      <CabinetHero />
      <div className="kcp-intro-strip">
        <div className="kcp-wrap kcp-intro-grid">
          <p>{content.introduction}</p>
          <div><p>{content.scope}</p><span>{content.previewNotice}</span></div>
        </div>
      </div>
      <nav aria-label="On this page" className="kcp-page-nav">
        <div className="kcp-wrap"><span>Explore</span><ul>{pageSections.map((item) => <li key={item.href}><a href={item.href}>{item.label}</a></li>)}</ul></div>
      </nav>

      <CabinetCinematicStory />
      <BeforeAfter />
      <CabinetColourShowroom />

      <section id="cabinet-why-refinish" className="kcp-why kcp-section" aria-labelledby="cabinet-why-title">
        <div className="kcp-wrap">
          <div className="kcp-section-heading"><Eyebrow>Consider the right approach</Eyebrow><h2 id="cabinet-why-title">Refinish or replace? Start with what your kitchen needs.</h2><p>Painting can be a considered option when the existing cabinetry and layout are suitable. A kitchen with structural damage or a layout that needs changing may call for a different scope.</p></div>
          <div className="kcp-why-grid">
            <div><span className="kcp-why-index">01 / Retain</span><h3>Cabinet painting</h3><p>Refresh agreed doors, drawer fronts and visible surfaces while retaining the existing cabinet structure and layout.</p><ul><li>Focuses work on assessed existing surfaces</li><li>Can avoid removal of suitable cabinetry</li><li>Colour and sheen are selected for the project</li></ul></div>
            <div><span className="kcp-why-index">02 / Reconsider</span><h3>Cabinet replacement</h3><p>May be appropriate when the cabinet structure, layout or components need to change beyond a surface finish.</p><ul><li>Allows a different configuration or new cabinetry</li><li>May involve removal and wider building work</li><li>Scope, disruption and cost depend on the project</li></ul></div>
          </div>
          <p className="kcp-small">No price or schedule comparison is guaranteed. The right approach depends on the condition of your kitchen and your intended changes.</p>
        </div>
      </section>

      <section id="cabinet-quality" className="kcp-quality kcp-section" aria-labelledby="cabinet-quality-title">
        <div className="kcp-wrap">
          <div className="kcp-section-heading"><Eyebrow>A closer look</Eyebrow><h2 id="cabinet-quality-title">The finish is in the preparation.</h2><p>Small surface details affect how a cabinet finish looks and performs. Each layer follows the assessment and agreed scope.</p></div>
          <div className="kcp-quality-grid">
            <figure><Image src={siteAssets.frontStoryPrepared.src} alt={siteAssets.frontStoryPrepared.alt} width={siteAssets.frontStoryPrepared.width} height={siteAssets.frontStoryPrepared.height} sizes="(min-width: 1024px) 48vw, 100vw" /><figcaption>01 / Local patching and sanding concept</figcaption></figure>
            <figure><Image src={siteAssets.frontStoryCoatTwo.src} alt={siteAssets.frontStoryCoatTwo.alt} width={siteAssets.frontStoryCoatTwo.width} height={siteAssets.frontStoryCoatTwo.height} sizes="(min-width: 1024px) 48vw, 100vw" /><figcaption>02 / Finish coat concept</figcaption></figure>
          </div>
          <div className="kcp-quality-notes"><p><strong>Cleaning.</strong> Remove contamination that could interfere with adhesion.</p><p><strong>Preparation.</strong> Repair and profile surfaces where appropriate.</p><p><strong>Coating.</strong> Select primer and finish for the assessed cabinet.</p><p><strong>Care.</strong> Allow drying and follow project-specific use guidance.</p></div>
          <p className="kcp-small">Generated process images. Product, preparation and coat schedule are confirmed for the actual surfaces.</p>
        </div>
      </section>

      <section id="cabinet-services" className="kcp-services kcp-section" aria-labelledby="cabinet-services-title">
        <div className="kcp-wrap">
          <div className="kcp-section-heading"><Eyebrow>What we can discuss</Eyebrow><h2 id="cabinet-services-title">{content.categoriesTitle}</h2><p>{content.categoriesIntroduction}</p><p className="kcp-small">{content.categoriesNotice}</p></div>
          <div className="kcp-services-list">{content.categories.map((category, index) => <article key={category.id}><span className="kcp-service-index">{String(index + 1).padStart(2, "0")} / {category.kind}</span><div><h3>{category.title}</h3><p>{category.description}</p><ul>{category.notes.map((note) => <li key={note}>{note}</li>)}</ul></div></article>)}</div>
        </div>
      </section>

      <section id="cabinet-suitability" className="kcp-suitability kcp-section" aria-labelledby="cabinet-suitability-title">
        <div className="kcp-wrap kcp-side-layout"><div><Eyebrow>Start with the surface</Eyebrow><h2 id="cabinet-suitability-title">{content.suitability.title}</h2><p>{content.suitability.introduction}</p></div><div className="kcp-stacked-list">{content.suitability.items.map((item) => <article key={item.title}><h3>{item.title}</h3><p>{item.description}</p></article>)}<p className="kcp-small">{content.suitability.confirmation}</p>{content.suitability.sources.map((source) => <a key={source.href} href={source.href} className="kcp-link">{source.label} <ArrowUpRight size={16} aria-hidden="true" /></a>)}<p className="kcp-small">{content.suitability.sourcesNote}</p></div></div>
      </section>

      <section id="cabinet-inclusions" className="kcp-inclusions kcp-section" aria-labelledby="cabinet-inclusions-title">
        <div className="kcp-wrap"><div className="kcp-section-heading"><Eyebrow>Define the scope</Eyebrow><h2 id="cabinet-inclusions-title">{content.inclusions.title}</h2><p>{content.inclusions.introduction}</p></div><div className="kcp-inclusions-grid"><div><h3>{content.inclusions.includedTitle}</h3><ul>{content.inclusions.included.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h3>{content.inclusions.excludedTitle}</h3><ul>{content.inclusions.excluded.map((item) => <li key={item}>{item}</li>)}</ul></div></div><p className="kcp-small">{content.inclusions.confirmation}</p></div>
      </section>

      <section id="cabinet-examples" className="kcp-examples kcp-section" aria-labelledby="cabinet-examples-title">
        <div className="kcp-wrap kcp-examples-layout"><div className="kcp-examples-text"><Eyebrow>Design reference</Eyebrow><h2 id="cabinet-examples-title">{content.examples.title}</h2><p>{content.examples.introduction}</p><h3>{content.examples.briefTitle}</h3><p>{content.examples.briefDescription}</p><dl>{content.examples.details.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl><p className="kcp-small"><strong>{content.examples.photosStatus}.</strong> {content.examples.photosDescription}</p></div><figure><Image src={siteAssets.cabinetFinish.src} alt={siteAssets.cabinetFinish.alt} width={siteAssets.cabinetFinish.width} height={siteAssets.cabinetFinish.height} sizes="(min-width: 1024px) 50vw, 100vw" /><figcaption>{content.examples.caption}</figcaption></figure></div>
      </section>

      <section id="cabinet-service-area" className="kcp-area kcp-section" aria-labelledby="cabinet-service-area-title">
        <div className="kcp-wrap"><div className="kcp-section-heading"><Eyebrow>Local service</Eyebrow><h2 id="cabinet-service-area-title">{content.serviceArea.title}</h2><p>{content.serviceArea.introduction}</p><p className="kcp-small">{content.serviceArea.guidance}</p></div><div className="kcp-area-grid"><div className="kcp-area-radius"><span className="kcp-area-big">10<span>km</span></span><h3>{content.serviceArea.radiusLabel}</h3><p>{content.serviceArea.radiusDescription}</p><p>{content.serviceArea.addressNote}</p><a className="kcp-link" href={content.serviceArea.mapLink.href}>{content.serviceArea.mapLink.label} <ArrowUpRight size={16} aria-hidden="true" /></a></div><div className="kcp-area-groups">{content.serviceArea.groups.map((group) => <div key={group.title}><h3>{group.title}</h3><p>{group.suburbs.join(" · ")}</p></div>)}</div></div><p className="kcp-small">{content.serviceArea.boundaryNote} {content.serviceArea.confirmation}</p></div>
      </section>

      <section id="cabinet-faq" className="kcp-faq kcp-section" aria-labelledby="cabinet-faq-title"><div className="kcp-wrap kcp-faq-layout"><div><Eyebrow>Good to know</Eyebrow><h2 id="cabinet-faq-title">{content.faqTitle}</h2></div><div className="kcp-faq-list">{content.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}<Plus size={20} aria-hidden="true" /></summary><p>{faq.answer}</p></details>)}</div></div></section>

      <section id="cabinet-quote" className="kcp-quote kcp-section" aria-labelledby="cabinet-quote-title"><div className="kcp-wrap"><Eyebrow>Begin a conversation</Eyebrow><h2 id="cabinet-quote-title">Ready to transform your kitchen?</h2><p>{content.closing.description}</p><div className="kcp-quote-actions"><button type="button" disabled aria-describedby="closing-quote-status">Get My Free Quote</button><button type="button" disabled aria-describedby="closing-quote-status">Upload Kitchen Photos</button><a href={`${siteRoutes.home}#contact`}>{content.contactLabel} <ArrowUpRight size={18} aria-hidden="true" /></a></div><p id="closing-quote-status" className="kcp-small">{content.quoteStatus} {content.closing.confirmation}</p></div></section>
    </div>
  );
}
