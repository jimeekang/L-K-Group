import { siteAssets, type ImageAsset } from "@/shared/config/assets";

type GalleryItem = Readonly<{
  id: string;
  title: string;
  description: string;
  image: ImageAsset;
}>;

export const galleryItems = [
  {
    id: "cabinet-preparation",
    title: "Cabinet surface preparation",
    description: "Surface repair and preparation on a cabinet door before painting.",
    image: siteAssets.cabinetPreparation,
  },
  {
    id: "cabinet-spray-painting",
    title: "Cabinet door spray painting",
    description: "Spray-painting a cabinet door in the booth.",
    image: siteAssets.cabinetSprayPainting,
  },
] as const satisfies readonly GalleryItem[];
