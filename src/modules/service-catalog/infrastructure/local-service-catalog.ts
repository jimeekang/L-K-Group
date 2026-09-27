import type { ServiceCatalog } from "../domain/service";

export const localServiceCatalog = {
  products: {
    id: "products",
    name: "Products",
    description:
      "Home care and touch-up product information. The range and availability are being confirmed.",
  },
  handyman: {
    id: "handyman",
    name: "Handyman",
    description:
      "Practical help with small repairs and everyday home maintenance. The work involved is confirmed before proceeding.",
  },
  "kitchen-cabinet-painting": {
    id: "kitchen-cabinet-painting",
    name: "Kitchen Cabinet Painting",
    description:
      "Surface preparation and repainting for existing kitchen cabinets. New cabinet manufacture and installation are not included.",
  },
  painting: {
    id: "painting",
    name: "Painting",
    description:
      "A fresh finish for walls, trim and other suitable surfaces. Preparation and the scope of work are discussed first.",
  },
} as const satisfies ServiceCatalog;
