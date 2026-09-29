/** Serializable content contract. Business rules and company claims stay with the calling module. */
export type StoryAsset = Readonly<{
  src: string;
  alt: string;
  width: number;
  height: number;
}>;

/** A photographic layer registered to the exact canvas origin of its background. */
export type RegisteredLayer = Readonly<{
  id: string;
  asset: StoryAsset;
  /** Percentage polygon on the shared photo canvas; the source pixels remain photographic. */
  clipPath?: string;
  /** Percentage of the shared canvas; the renderer limits each axis to 5%. */
  travelX: number;
  travelY: number;
  /** Depth in pixels, limited to 120px. */
  travelZ?: number;
  /** Rotation around the layer's own registered centre. */
  rotateX?: number;
  rotate?: number;
  rotateZ?: number;
  rotateY?: number;
  originX?: number;
  originY?: number;
  /** Fraction of the scene motion reserved before this layer starts, 0–0.35. */
  stagger?: number;
}>;

export type StoryVisual = Readonly<{
  preset: "crossfade" | "separate" | "reveal" | "assemble";
  /** Clean plate for separation/assembly, or the state before a reveal. */
  background: StoryAsset;
  /** Original room frame; clean-plate pixels appear only through stationary layer masks. */
  registeredBase?: StoryAsset;
  layers?: readonly RegisteredLayer[];
  /** One reveal state, or two consecutive states in the same scene. */
  states?: readonly StoryAsset[];
  /** Direction in which a reveal state enters; left is the default. */
  revealFrom?: "left" | "right";
  /** Exact source frame used while the first portion of a scrub settles in. */
  startPoster?: StoryAsset;
  /** Fade to the scene poster at the end when a clean plate has minor image drift. */
  settleOnPoster?: boolean;
  stateLabels?: readonly string[];
}>;

export type StoryScene = Readonly<{
  id: string;
  title: string;
  paragraphs: readonly string[];
  poster: StoryAsset;
  visual?: StoryVisual;
}>;

export type ServiceStoryProps = Readonly<{
  id: string;
  title: string;
  introduction: string;
  scenes: readonly StoryScene[];
  conceptNotice?: string;
  stageLabel?: string;
  skipHref: string;
  notes?: readonly string[];
}>;
