import Image from "next/image";
import { Container } from "@/shared/ui/container";
import { SectionHeading } from "@/shared/ui/section-heading";
import { galleryItems } from "../content/gallery-content";

export function GallerySection() {
  return (
    <section id="gallery" tabIndex={-1} aria-labelledby="gallery-title" className="bg-surface py-12 sm:py-16">
      <Container>
        <SectionHeading id="gallery-title" description="Company-provided photos of cabinet surface preparation and spray painting.">
          Gallery
        </SectionHeading>
        <div className="mt-9 grid gap-8 md:grid-cols-2">
          {galleryItems.map((item) => (
            <figure key={item.id}>
              <Image
                src={item.image.src}
                alt={item.image.alt}
                width={item.image.width}
                height={item.image.height}
                sizes="(min-width: 1280px) 592px, (min-width: 768px) calc((100vw - 96px) / 2), (min-width: 640px) calc(100vw - 64px), calc(100vw - 40px)"
                className="aspect-4/5 h-auto w-full rounded-sm object-cover"
                loading="lazy"
              />
              <figcaption className="mt-5">
                <p className="text-xs font-semibold tracking-[0.12em] text-muted uppercase">Company-provided photograph</p>
                <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
