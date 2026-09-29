import { companyContent } from "@/modules/company-profile";

export const cabinetPaintingContent = {
  status: "draft-company-review",
  draftLabel: "Preview — project-specific details to confirm",
  previewNotice:
    "Website preview with company-provided service and contact information. Draft package inclusions, prices and project-specific arrangements still need confirmation. Cabinet example images are generated concepts; online quotes and bookings are not available.",
  serviceName: "Kitchen Cabinet Painting",
  title: "Kitchen Cabinet Painting in Ermington",
  metadataDescription:
    "Kitchen cabinet painting, repairs and colour changes around Ermington and Inner West Sydney. Explore spray-painted finishes, project scope and service areas with L&K Group.",
  locationLabel: "Existing kitchens · Ermington & Inner West Sydney",
  introduction:
    "Refresh your existing kitchen with cabinet painting and repairs. L&K Group serves a 10 km radius around Ermington, plus Inner West Sydney and the listed surrounding suburbs. We assess your cabinets and agree the surfaces, preparation and finish before work begins.",
  scope:
    "Keep the kitchen layout you have and explore a new finish for suitable doors, drawer fronts and visible cabinet surfaces. New cabinet manufacture and installation are not included.",
  quoteLabel: "Free Quote",
  contactLabel: `Contact ${companyContent.contact.person}`,
  quoteStatus:
    `Online quotes are coming soon. Contact ${companyContent.contact.person} by phone or email to discuss your cabinets and request a quote.`,
  conceptCaption: "Generated concept — not a completed L&K project.",
  categoriesTitle: "Cabinet painting services",
  categoriesIntroduction:
    "Start with the type of refresh you want, then identify the surfaces and preparation it involves. The first three categories describe project types; the remaining three describe work that may form part of those projects. Overlapping work is assessed together, not treated as separate automatic charges.",
  categoriesNotice:
    "L&K offers door, drawer and frame painting, handle replacement and surface repairs. The descriptions below explain possible project scopes; they are not fixed packages or a promise that every task is included in the price.",
  categories: [
    {
      id: "full-repainting",
      kind: "Project type",
      title: "Full cabinet repainting",
      description:
        "Plan a coordinated refresh across the agreed cabinet surfaces in your existing kitchen. Doors, drawer fronts, exposed frames and end panels are considered together, so the quote can identify where the new finish starts and stops.",
      notes: [
        "A complete surface list defines what ‘full’ includes.",
        "Cabinet interiors, backs and hardware are confirmed separately.",
      ],
    },
    {
      id: "partial-touch-ups",
      kind: "Project type",
      title: "Partial painting & touch-ups",
      description:
        "Focus on selected cabinet fronts or localised wear when the rest of the kitchen does not need a full repaint. The existing colour, sheen and condition are checked to judge whether a limited repair will be appropriate or a larger area needs attention.",
      notes: [
        "The affected areas and repair limits are recorded first.",
        "An exact match to an aged finish cannot be assumed.",
      ],
    },
    {
      id: "colour-changes",
      kind: "Project type",
      title: "Cabinet colour changes",
      description:
        "Explore a different cabinet colour while retaining the current kitchen layout. The plan considers how doors, drawers and visible panels work together, alongside the preparation and coating system suitable for the existing surface.",
      notes: [
        "The colour and sheen would be agreed before painting.",
        "Colour changes may form part of full or partial repainting.",
      ],
    },
    {
      id: "doors-drawers",
      kind: "Surface & preparation scope",
      title: "Cabinet door & drawer painting",
      description:
        "Give attention to the cabinet doors and drawer fronts that shape the look of the kitchen. Their material, profile and existing finish help determine the preparation required and which faces can be included in the proposed work.",
      notes: [
        "Fronts, edges and backs must be itemised in the scope.",
        "Cabinet doors are removed for spray painting; reassembly and hardware details are agreed for the project.",
      ],
    },
    {
      id: "frames-panels",
      kind: "Surface & preparation scope",
      title: "Cabinet frame & panel painting",
      description:
        "Consider exposed frames, end panels and other agreed cabinet surfaces alongside the doors. Reviewing these areas together helps avoid leaving the extent of the colour change unclear, particularly at visible edges and adjoining surfaces.",
      notes: [
        "Only the accessible surfaces listed in the scope are included.",
        "Kickboards, internal shelves and cabinet interiors need confirmation.",
      ],
    },
    {
      id: "preparation-repairs",
      kind: "Surface & preparation scope",
      title: "Surface preparation & minor repairs",
      description:
        "Identify the cleaning, surface preparation and small cosmetic repairs needed before repainting. Peeling coatings, loose coverings, swelling or other damage need separate assessment and may change whether painting is appropriate.",
      notes: [
        "Preparation is matched to the assessed material and condition.",
        "Repair allowances and additional work require an agreed scope.",
      ],
    },
  ],
  suitability: {
    title: "Which kitchen cabinets can be painted?",
    introduction:
      "L&K can discuss painting across a range of cabinet materials. Each surface still needs assessment: the material, existing coating and condition influence preparation and whether painting is suitable for that particular cabinet.",
    items: [
      {
        title: "Timber and previously painted surfaces",
        description:
          "The existing material, coating and condition need to be identified before a preparation method is selected. A previously painted cabinet still needs assessment; repainting is not automatically suitable because paint is already present.",
      },
      {
        title: "Laminate and melamine surfaces",
        description:
          "These surfaces need a compatible coating system and preparation specific to that system. Manufacturer instructions and the actual cabinet condition need to be checked before a method is proposed.",
      },
      {
        title: "Damaged or lifting surfaces",
        description:
          "Peeling finishes, loose coverings, swelling and damaged panels need separate assessment. Painting should not be presented as a repair for an underlying structural or moisture problem; another repair or replacement approach may be needed.",
      },
    ],
    confirmation: "[Company to confirm: surface-specific preparation and assessment details]",
    sources: [
      {
        label: "Manufacturer cabinet-door preparation guide (PDF)",
        href: "https://assets.ctfassets.net/j001bqnk84dk/3usIMHGIR7z9QS1koV6anY/b29cdf7cec7d249fe45defe5ab16a619/Renovation_Range_Project_Guides_-_Cabinet_Doors.pdf",
      },
    ],
    sourcesNote:
      "General material guidance only. This reference does not confirm an L&K product choice or suitability for a particular kitchen.",
  },
  inclusions: {
    title: "What is included?",
    introduction:
      "Door, drawer and frame painting, handle replacement and surface repairs are available. The draft below shows how the scope is agreed: each included surface, task and price needs to be confirmed before work starts.",
    includedTitle: "Draft scope to agree",
    included: [
      "Review the existing cabinet material, condition and requested finish.",
      "List the doors, drawer fronts, frames and panels proposed for painting.",
      "Agree preparation, minor cosmetic repairs and protection for adjacent areas.",
      "Record the selected colour, sheen and coating system.",
      "Agree door removal, reassembly, hardware handling and the final inspection.",
    ],
    excludedTitle: "Excluded or separately assessed",
    excluded: [
      "New cabinet manufacture, installation and changes to the kitchen layout are excluded.",
      "Structural repairs, moisture damage and replacement panels need separate assessment.",
      "Benchtops, splashbacks, walls, appliances, plumbing and electrical work are outside this draft cabinet scope.",
      "Door backs, edges, cabinet interiors, shelves and kickboards are not automatically included.",
      "Handle replacement is available; its price and inclusion, hinge work and new holes are agreed separately.",
    ],
    confirmation: "[Company to confirm: preparation allowance, included faces and hardware handling]",
  },
  process: {
    title: "The kitchen cabinet painting process",
    introduction:
      "Cabinet doors are removed, spray-painted and dried in a separate spray booth, reducing dust and paint odours in your home. L&K uses Dulux Aqua Enamel. Work and drying generally take 3–7 days, with careful use recommended for 7 days after reinstallation; the exact schedule and care guidance depend on your project.",
    confirmations: [
      "[Company to confirm: exact product, sheen, preparation system and coat schedule]",
      "[Company to confirm: fixed-surface work and kitchen access arrangements]",
      "The general 3–7 day work and drying range is not a fixed completion or full-curing guarantee. Confirm dates and care requirements for your kitchen.",
    ],
  },
  serviceArea: {
    ...companyContent.serviceArea,
    title: "Cabinet painting around Ermington & Inner West Sydney",
    boundaryNote:
      "Lane Cove, Drummoyne and Ashfield are included in the company’s suburb list. The broader service area is not limited to addresses inside the 10 km radius.",
    confirmation: "[Company to confirm: exact service-area starting point]",
  },
  examples: {
    title: "Cabinet painting examples",
    introduction:
      "These images help explore a possible cabinet finish and page layout. They are generated concepts, not evidence of work completed by L&K Group.",
    caption: "Generated finish concept — not a completed L&K project.",
    briefLabel: "Illustrative sample brief",
    briefTitle: "A lighter finish for an existing kitchen",
    briefDescription:
      "Imagine retaining a kitchen’s current layout and exploring a light neutral finish for suitable cabinet fronts and visible panels. The colour, sheen and included faces would be chosen after assessing the actual cabinets.",
    details: [
      { label: "Project idea", value: "Colour change using existing cabinet surfaces" },
      { label: "Finish direction", value: "Light neutral colour; coating and sheen to be confirmed" },
      { label: "Scope", value: "Illustrative only — no customer, location, price or outcome is claimed" },
    ],
    photosStatus: "Before-and-after photos pending",
    photosDescription:
      "Paired before-and-after photos and verified project details will replace this concept content after company approval and the necessary image permissions.",
  },
  faqTitle: "Questions about cabinet painting",
  faqs: [
    {
      question: "Can laminate, timber and wrapped kitchen cabinets all be painted?",
      answer:
        "L&K can discuss a range of cabinet materials, including these surfaces. The material, existing finish, adhesion and condition still need checking before preparation and coating are agreed. Loose coverings, swelling or damaged panels may need repairs or another approach; suitability cannot be guaranteed from the material name alone.",
    },
    {
      question: "When is cabinet painting different from replacing a kitchen?",
      answer:
        "Painting changes the finish of suitable existing cabinet surfaces while keeping the current layout. It does not provide new cabinets or fix a layout that no longer works for you. Damage, component replacement or structural changes need separate consideration; new cabinet manufacture and installation are outside this service.",
    },
    {
      question: "Are door backs, edges, interiors and handles included?",
      answer:
        "These are itemised in the agreed scope. L&K removes cabinet doors for booth painting, and handle replacement is available. Front faces do not automatically mean backs, edges, shelves or interiors are included. The number of included faces, refitting, hardware costs and new holes need to be agreed for the project. [Company to confirm: package inclusions and hardware allowances]",
    },
    {
      question: "How much does kitchen cabinet painting cost?",
      answer:
        "No prices are confirmed in this preview. The number and size of components, included faces, material, current condition, preparation, repairs, finish and access can affect the proposed scope. A written price should identify what is included before any work is agreed. [Company to confirm: base package and extra-work rates]",
    },
    {
      question: "What happens if extra preparation or repairs are needed?",
      answer:
        "The draft approach is to explain the additional work, its cost and any timing impact before proceeding. Any changed scope would need customer agreement rather than automatically adding overlapping service categories. [Company to confirm: repair allowances and extra-work approval process]",
    },
    {
      question: "How long will the work take, and can I use the kitchen?",
      answer:
        "L&K generally allows 3–7 days for work and drying, and recommends careful use for 7 days after reinstallation. Doors are spray-painted and dried in a separate booth. Your actual schedule, kitchen access and care instructions depend on the preparation, scope and finish. Drying is not the same as full curing, so confirm return-to-use guidance for your project.",
    },
    {
      question: "Is my address in the Ermington service area?",
      answer:
        `${companyContent.serviceArea.introduction} ${companyContent.serviceArea.addressNote} The listed suburbs are not all within the 10 km radius, and an enquiry does not reserve a date.`,
    },
    {
      question: "How do I request a free quote?",
      answer:
        `Contact ${companyContent.contact.person} on ${companyContent.contact.phone} or email ${companyContent.contact.email}. For cabinet enquiries, have the door count and a photo showing the whole cabinet area ready to discuss. Online Free Quote, photo uploads and bookings are still being prepared; this preview does not calculate prices or reserve dates.`,
    },
  ],
  closing: {
    title: "Plan a refresh for your existing kitchen",
    description:
      `Talk to ${companyContent.contact.person} about your cabinet surfaces, door count, intended finish and suburb. A photo showing the whole cabinet area can help explain the work you have in mind.`,
    confirmation: "Prices, package inclusions and project dates are confirmed through the enquiry process.",
  },
} as const;
