export const serviceOrder = [
  "products",
  "handyman",
  "kitchen-cabinet-painting",
  "painting",
] as const;

export type ServiceId = (typeof serviceOrder)[number];

export type Service = Readonly<{
  id: ServiceId;
  name: string;
  description: string;
}>;

export type ServiceCatalog = {
  readonly [Id in ServiceId]: Service & { readonly id: Id };
};
