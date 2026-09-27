import { siteAssets, type ImageAsset } from "@/shared/config/assets";

type GalleryItem = Readonly<{
  id: string;
  title: string;
  description: string;
  image: ImageAsset;
}>;

export const galleryItems = [
  {
    id: "painted-cabinets",
    title: "A fresh finish for existing cabinets",
    description: "A concept for painted cabinet doors in a light residential kitchen.",
    image: siteAssets.kitchen,
  },
  {
    id: "interior-painting",
    title: "A simple interior refresh",
    description: "A concept for a neutral wall finish in an everyday living space.",
    image: siteAssets.livingRoom,
  },
] as const satisfies readonly GalleryItem[];
