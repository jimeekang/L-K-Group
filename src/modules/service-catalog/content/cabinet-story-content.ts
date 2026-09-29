import type { RegisteredLayer, ServiceStoryProps, StoryAsset } from "@/shared/ui/service-story";
import { cabinetPaintingContent } from "./cabinet-painting-content";

type CabinetStoryAssets = Readonly<{
  existing: StoryAsset;
  removed: StoryAsset;
  workshopExisting: StoryAsset;
  prepared: StoryAsset;
  undercoat: StoryAsset;
  coatOne: StoryAsset;
  coatTwo: StoryAsset;
  finished: StoryAsset;
  assembleBackground: StoryAsset;
}>;

type Point = readonly [number, number];

// Six visible fronts measured on the shared 1536 × 1024 concept-photo canvas.
// The hood's right leaf stays fixed because a pendant obscures its edge.
const photoCanvas = { width: 1536, height: 1024 } as const;
const doorRegions: readonly Readonly<{
  id: string;
  points: readonly Point[];
  travelX: number;
  travelY: number;
  travelZ: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  stagger: number;
}>[] = [
  { id: "hood-left", points: [[748, 194], [829, 187], [829, 325], [748, 327]], travelX: -1.8, travelY: -1.2, travelZ: 58, rotateX: 1, rotateY: -6, rotateZ: -0.4, stagger: 0 },
  { id: "wall-right-left", points: [[1014, 172], [1101, 166], [1101, 365], [1014, 368]], travelX: -1.6, travelY: -0.8, travelZ: 68, rotateX: 1, rotateY: -7, rotateZ: -0.3, stagger: 0.045 },
  { id: "wall-right-right", points: [[1105, 165], [1195, 158], [1195, 361], [1105, 365]], travelX: 1.8, travelY: -0.8, travelZ: 68, rotateX: 1, rotateY: 7, rotateZ: 0.3, stagger: 0.09 },
  { id: "pantry-top", points: [[1221, 121], [1369, 94], [1369, 270], [1221, 278]], travelX: 2.2, travelY: -1.1, travelZ: 78, rotateX: -0.8, rotateY: 7, rotateZ: 0.4, stagger: 0.135 },
  { id: "pantry-main", points: [[1221, 281], [1368, 273], [1368, 515], [1221, 512]], travelX: 2.4, travelY: 0.4, travelZ: 86, rotateX: 1, rotateY: 8, rotateZ: 0.5, stagger: 0.18 },
  { id: "pantry-bottom", points: [[1222, 516], [1368, 520], [1368, 682], [1222, 667]], travelX: 2.3, travelY: 1.2, travelZ: 82, rotateX: 1.4, rotateY: 7, rotateZ: 0.5, stagger: 0.225 },
];

function photoPolygon(points: readonly Point[]) {
  return `polygon(${points.map(([x, y]) => `${(x / photoCanvas.width * 100).toFixed(3)}% ${(y / photoCanvas.height * 100).toFixed(3)}%`).join(", ")})`;
}

function doorPhotoLayers(asset: StoryAsset): readonly RegisteredLayer[] {
  return doorRegions.map((region) => {
    const xs = region.points.map(([x]) => x);
    const ys = region.points.map(([, y]) => y);
    return {
      id: region.id,
      asset,
      clipPath: photoPolygon(region.points),
      travelX: region.travelX,
      travelY: region.travelY,
      travelZ: region.travelZ,
      rotateX: region.rotateX,
      rotateY: region.rotateY,
      rotateZ: region.rotateZ,
      stagger: region.stagger,
      originX: ((Math.min(...xs) + Math.max(...xs)) / 2 / photoCanvas.width) * 100,
      originY: ((Math.min(...ys) + Math.max(...ys)) / 2 / photoCanvas.height) * 100,
    };
  });
}

/** The visual grammar is reusable; these words and assets belong to this service. */
export function createCabinetStoryContent(assets: CabinetStoryAssets): ServiceStoryProps {
  return {
    id: "cabinet-process",
    title: cabinetPaintingContent.process.title,
    stageLabel: "The cabinet transformation",
    introduction: cabinetPaintingContent.process.introduction,
    conceptNotice: "Illustrative process — generated concept imagery, not a completed L&K project. The preparation and coating system are confirmed for your cabinets.",
    skipHref: "#cabinet-services",
    notes: cabinetPaintingContent.process.confirmations,
    scenes: [
      {
        id: "cabinet-process-existing",
        title: "Assess the existing cabinets",
        paragraphs: [
          "We review the material, existing finish, condition and access before agreeing which faces and components are in scope. Painting changes suitable existing surfaces while retaining the kitchen layout.",
          "The proposed colour, sheen, repairs, exclusions and price are agreed before work begins.",
        ],
        poster: assets.existing,
      },
      {
        id: "cabinet-process-remove",
        title: "Remove and protect",
        paragraphs: [
          "Cabinet doors are removed for spray painting and drying in a separate booth. The illustration follows selected cabinet fronts; handle and hinge handling, labelling and refitting are confirmed in the project scope.",
          "Adjacent kitchen areas are protected, and work on any fixed frames or panels is agreed separately.",
        ],
        poster: assets.removed,
        visual: {
          preset: "separate",
          background: assets.removed,
          registeredBase: assets.existing,
          layers: doorPhotoLayers(assets.existing),
          startPoster: assets.existing,
        },
      },
      {
        id: "cabinet-process-prepare",
        title: "Prepare the surfaces",
        paragraphs: [
          "Local chips and dents may be filled and sanded as part of the agreed preparation scope, with the method matched to the assessed cabinet material and selected coating instructions.",
          "Lifting coverings, swelling or underlying damage may need separate repair or another approach before painting is suitable.",
        ],
        poster: assets.prepared,
        visual: { preset: "reveal", background: assets.workshopExisting, states: [assets.prepared], revealFrom: "right" },
      },
      {
        id: "cabinet-process-undercoat",
        title: "Build the base",
        paragraphs: [
          "The illustration shows an undercoat appearing across the same door. The actual primer or undercoat system, and whether this stage is appropriate, depend on the cabinet material and selected finish.",
        ],
        poster: assets.undercoat,
        visual: { preset: "reveal", background: assets.prepared, states: [assets.undercoat] },
      },
      {
        id: "cabinet-process-finish",
        title: "Apply the finish",
        paragraphs: [
          "This concept shows a first and second finish coat within one stage. L&K uses Dulux Aqua Enamel and spray-paints cabinet doors in a separate booth; the exact product, preparation, coat schedule, colour and sheen are confirmed for your kitchen.",
          "Drying between work stages and full curing are different. Follow the care guidance given for your project.",
        ],
        poster: assets.coatTwo,
        visual: { preset: "reveal", background: assets.undercoat, states: [assets.coatOne, assets.coatTwo], stateLabels: ["Finish 01", "Finish 02"] },
      },
      {
        id: "cabinet-process-reassemble",
        title: "Reassemble and check",
        paragraphs: [
          "When the finish is ready, the agreed doors and hardware are refitted. We review alignment, operation and the painted surfaces against the agreed scope.",
        ],
        poster: assets.finished,
        visual: {
          preset: "assemble",
          background: assets.assembleBackground,
          registeredBase: assets.finished,
          layers: doorPhotoLayers(assets.finished),
          settleOnPoster: true,
        },
      },
      {
        id: "cabinet-process-complete",
        title: "Enjoy the refreshed kitchen",
        paragraphs: [
          "The existing kitchen layout stays in place with the agreed cabinet finish. L&K generally allows 3–7 days for work and drying, depending on the project, and recommends careful use for 7 days after reinstallation.",
          "Your actual schedule, access and return-to-use instructions are confirmed for your kitchen. Contact L&K to discuss the surfaces and finish you have in mind.",
        ],
        poster: assets.finished,
      },
    ],
  };
}
