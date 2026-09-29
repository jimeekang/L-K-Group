import Image from "next/image";
import { ArrowDown, ArrowUpRight, ChevronRight } from "lucide-react";
import { siteAssets } from "@/shared/config/assets";
import { siteRoutes } from "@/shared/config/navigation";
import { cabinetPaintingContent as content } from "../content/cabinet-painting-content";

export function CabinetHero() {
  const image = siteAssets.storyKitchenFinished;
  return (
    <section id="cabinet-overview" className="kcp-hero" aria-labelledby="cabinet-title">
      <Image src={image.src} alt={image.alt} fill sizes="100vw" preload className="kcp-hero-image" />
      <div className="kcp-hero-shade" aria-hidden="true" />
      <div className="kcp-wrap kcp-hero-inner">
        <nav aria-label="Breadcrumb" className="kcp-breadcrumb">
          <ol>
            <li><a href={siteRoutes.home}>Home</a></li>
            <li aria-hidden="true"><ChevronRight size={14} /></li>
            <li><a href={`${siteRoutes.home}#services`}>Services</a></li>
            <li aria-hidden="true"><ChevronRight size={14} /></li>
            <li aria-current="page">Kitchen Cabinet Painting</li>
          </ol>
        </nav>
        <div className="kcp-hero-copy">
          <p className="kcp-kicker">Kitchen Cabinet Painting / Sydney</p>
          <h1 id="cabinet-title">Transform your kitchen. <em>Without replacing your cabinets.</em></h1>
          <p className="kcp-hero-lead">Explore a new finish for suitable existing cabinets while keeping the kitchen layout you know. L&K Group assesses your surfaces, preparation and scope before work begins.</p>
          <div className="kcp-hero-actions">
            <a href="#cabinet-process" className="kcp-hero-primary">See the process <ArrowDown size={19} aria-hidden="true" /></a>
            <button type="button" disabled aria-describedby="hero-quote-status" className="kcp-hero-disabled">Get a Free Quote</button>
            <a href={`${siteRoutes.home}#contact`} className="kcp-hero-contact">{content.contactLabel} <ArrowUpRight size={17} aria-hidden="true" /></a>
          </div>
          <p id="hero-quote-status" className="kcp-hero-status">{content.quoteStatus}</p>
        </div>
        <div className="kcp-hero-bottom">
          <a href="#cabinet-process">Scroll to see the transformation <ArrowDown size={16} aria-hidden="true" /></a>
          <span>{content.conceptCaption}</span>
        </div>
      </div>
    </section>
  );
}
