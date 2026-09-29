import Image from "next/image";
import { Container } from "@/shared/ui/container";
import { StoryMotion } from "./story-motion";
import type { ServiceStoryProps } from "./story-types";
import "./service-story.css";

export function ServiceStory({ id, title, introduction, scenes, conceptNotice, stageLabel, skipHref, notes }: ServiceStoryProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="service-story bg-surface py-14 sm:py-20">
      <Container>
        <div className="service-story-intro">
          <h2 id={`${id}-title`} className="text-section-title">{title}</h2>
          <p className="mt-5 max-w-3xl text-lead text-muted">{introduction}</p>
          {conceptNotice ? <p className="mt-4 max-w-3xl text-caption text-muted">{conceptNotice}</p> : null}
        </div>

        <nav aria-label={`${title} steps`} className="service-story-navigation mt-8">
          <ol>
            {scenes.map((scene, index) => (
              <li key={scene.id}>
                <a href={`#${scene.id}`} aria-label={`Step ${index + 1}: ${scene.title}`}>
                  {String(index + 1).padStart(2, "0")}
                </a>
              </li>
            ))}
          </ol>
          <a className="service-story-skip" href={skipHref}>Skip the process</a>
        </nav>
      </Container>

      <div className="service-story-layout mt-8">
        <StoryMotion storyId={id} scenes={scenes} stageLabel={stageLabel ?? title} conceptNotice={conceptNotice} skipHref={skipHref} />
        <ol className="service-story-steps">
          {scenes.map((scene, index) => (
            <li id={scene.id} key={scene.id} className="service-story-step" data-story-step>
              <figure className="service-story-step-figure">
                <Image
                  src={scene.poster.src}
                  alt={scene.poster.alt}
                  width={scene.poster.width}
                  height={scene.poster.height}
                  sizes="(min-width: 1024px) 52vw, (min-width: 640px) calc(100vw - 64px), calc(100vw - 40px)"
                  loading="lazy"
                  className="service-story-step-image"
                />
                <figcaption className="mt-2 text-caption text-muted">{String(index + 1).padStart(2, "0")} / {String(scenes.length).padStart(2, "0")} — illustrative process scene</figcaption>
              </figure>
              <div className="service-story-step-copy">
                <p className="service-story-step-number" aria-hidden="true">{String(index + 1).padStart(2, "0")} / {String(scenes.length).padStart(2, "0")}</p>
                <h3 className="mt-4 text-scene-title">{scene.title}</h3>
                {scene.paragraphs.map((paragraph) => <p key={paragraph} className="mt-4 text-body text-muted">{paragraph}</p>)}
              </div>
            </li>
          ))}
        </ol>
      </div>
      {notes?.length ? (
        <Container>
          <div className="service-story-notes mt-8 space-y-2 border-t border-border pt-6">
            {notes.map((note) => <p key={note} className="text-caption text-muted">{note}</p>)}
          </div>
        </Container>
      ) : null}
    </section>
  );
}
