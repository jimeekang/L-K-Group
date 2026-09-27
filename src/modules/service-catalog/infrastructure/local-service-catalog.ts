import type { ServiceCatalog } from "../domain/service";

export const localServiceCatalog = {
  products: {
    id: "products",
    name: "Products",
    description:
      "Practical touch-up paint kits and home repair products to help you maintain and refresh your home with ease.",
  },
  handyman: {
    id: "handyman",
    name: "Handyman Services",
    description:
      "From door adjustments and flyscreen replacements to minor repairs and installations, we take care of the small jobs around your home.",
  },
  "kitchen-cabinet-painting": {
    id: "kitchen-cabinet-painting",
    name: "Kitchen Cabinet Painting",
    description:
      "Give your existing kitchen or bathroom cabinets a fresh new look with professional painting and repairs—an affordable way to refresh your space.",
  },
  painting: {
    id: "painting",
    name: "Interior & Exterior Painting",
    description:
      "Refresh and protect your home inside and out with careful preparation, quality paints, and attention to detail.",
  },
} as const satisfies ServiceCatalog;
