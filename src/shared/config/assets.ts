export type ImageAsset = Readonly<{
  src: `/images/${string}`;
  alt: string;
  width: number;
  height: number;
  provenance: "generated-concept";
}>;

// Replace the path, description and dimensions together when approved assets arrive.
export const siteAssets = {
  wordmark: {
    src: "/images/lk-group-wordmark-concept.png",
    alt: "L&K Group",
    width: 2172,
    height: 724,
    provenance: "generated-concept",
  },
  kitchen: {
    src: "/images/kitchen-cabinet-concept.png",
    alt: "Generated concept of a light kitchen with painted cabinet doors and timber flooring.",
    width: 1536,
    height: 1024,
    provenance: "generated-concept",
  },
  livingRoom: {
    src: "/images/living-room-concept.png",
    alt: "Generated concept of a sunlit living room with freshly painted neutral walls.",
    width: 1536,
    height: 1024,
    provenance: "generated-concept",
  },
} as const satisfies Record<string, ImageAsset>;
