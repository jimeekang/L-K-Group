export type ImageAsset = Readonly<{
  src: `/images/${string}`;
  alt: string;
  width: number;
  height: number;
  provenance: "generated-concept" | "company-supplied-logo" | "company-supplied-artwork" | "company-supplied-photo";
}>;

// Replace the path, description and dimensions together when approved assets arrive.
export const siteAssets = {
  wordmark: {
    src: "/images/lk-group-logo.png",
    alt: "L&K Group logo",
    width: 900,
    height: 900,
    provenance: "company-supplied-logo",
  },
  companyArtwork: {
    src: "/images/lk-group-promotional-artwork.png",
    alt: "Company-provided L&K Kitchen & Bath promotional artwork showing two people, a work van and a spray booth.",
    width: 1254,
    height: 1254,
    provenance: "company-supplied-artwork",
  },
  cabinetPreparation: {
    src: "/images/cabinet-surface-preparation.jpg",
    alt: "Company-provided photograph of a worker repairing the surface of a cabinet door.",
    width: 1080,
    height: 2340,
    provenance: "company-supplied-photo",
  },
  cabinetSprayPainting: {
    src: "/images/cabinet-door-spray-painting.jpg",
    alt: "Company-provided photograph of a worker spray-painting a cabinet door in a booth.",
    width: 1080,
    height: 2340,
    provenance: "company-supplied-photo",
  },
  kitchen: {
    src: "/images/kitchen-cabinet-concept.png",
    alt: "Generated concept of a light kitchen with painted cabinet doors and timber flooring.",
    width: 1536,
    height: 1024,
    provenance: "generated-concept",
  },
  cabinetFinish: {
    src: "/images/cabinet-finish-detail-concept.png",
    alt: "Generated concept showing the painted finish and edge detail of an existing kitchen cabinet door.",
    width: 1536,
    height: 1024,
    provenance: "generated-concept",
  },
} as const satisfies Record<string, ImageAsset>;
