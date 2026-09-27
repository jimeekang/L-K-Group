# Current module boundaries

- `service-catalog/domain` owns the four service identifiers and catalogue shape. It is pure TypeScript. `application/list-services` applies the agreed display order to a supplied catalogue; the public entry point supplies local content from `infrastructure`.
- `service-catalog/presentation` renders the supplied catalogue and the static Kitchen Cabinet Painting detail. Service routes, icons and contact anchors are UI concerns, separate from the domain. Draft cabinet categories, scope, process, service-area guidance, example briefs and FAQs live in `service-catalog/content`; they are not purchasable packages or confirmed company claims. The page marks this provisional content for company review and keeps precise product, timing, rate and eligibility fields visibly unconfirmed.
- `company-profile` owns company copy, the pending contact state, page navigation and the related sections. Its shared header and footer use page context to link back to home sections from a detail page. Only the mobile menu is a Client Component.
- `showcase` owns the concept gallery and explicitly identifies generated imagery. It does not represent those images as completed work.
- `src/app` composes public module entry points and owns route metadata. Module internals use relative imports; imports from another module go through its `index.ts`.
- `src/shared/ui` contains content-neutral layout and links. Central image paths, dimensions and alt text are in `src/shared/config/assets.ts`; navigation targets and prototype settings are separate configuration.

There are no database repositories, external adapters, forms, prices, bookings or commerce workflows yet. Add domain/application/infrastructure layers only when they have an actual role. The prototype contact state is not a successful enquiry or a customer record. Cabinet Free Quote buttons are natively disabled with a visible coming-soon explanation; no enquiry is collected.
