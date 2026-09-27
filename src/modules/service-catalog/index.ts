import { listServices } from "./application/list-services";
import { localServiceCatalog } from "./infrastructure/local-service-catalog";

export function getServices() {
  return listServices(localServiceCatalog);
}

export { ServicesSection } from "./presentation/services-section";
export { CabinetPaintingDetail } from "./presentation/cabinet-painting-detail";
export { cabinetPaintingContent } from "./content/cabinet-painting-content";
