import { listServices } from "./application/list-services";
import { localServiceCatalog } from "./infrastructure/local-service-catalog";

export function getServices() {
  return listServices(localServiceCatalog);
}

export { ServicesSection } from "./presentation/services-section";
