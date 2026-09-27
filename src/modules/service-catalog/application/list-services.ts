import { serviceOrder, type ServiceCatalog } from "../domain/service";

export function listServices(catalog: ServiceCatalog) {
  return serviceOrder.map((id) => catalog[id]);
}
