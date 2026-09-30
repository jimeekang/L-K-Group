export type {
  GmailEnquiryCandidate,
  GmailEnquiryPage,
  GmailLabelOption,
} from "./domain/enquiry-candidate.ts";
export {
  GmailApiError,
  listGmailLabels,
  readEnquiryMessagePage,
} from "./infrastructure/gmail-reader.ts";
export type { AuthenticatedGmailRequest, GmailErrorCode } from "./infrastructure/gmail-reader.ts";
