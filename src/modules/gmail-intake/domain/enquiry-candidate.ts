/** An unverified email awaiting an operator's review, never a customer record. */
export interface GmailEnquiryCandidate {
  messageId: string;
  threadId: string;
  internalDate: string | null;
  senderName: string | null;
  senderEmail: string | null;
  /** A From header alone does not prove the sender's identity. */
  senderReviewRequired: true;
  subject: string;
  bodyText: string;
  bodyStatus: "available" | "empty" | "invalid_encoding" | "unavailable" | "truncated";
  attachments: Array<{
    filename: string | null;
    mimeType: string | null;
    size: number | null;
  }>;
  attachmentCount: number;
}

export interface GmailLabelOption {
  id: string;
  name: string;
}

export interface GmailEnquiryPage {
  messages: GmailEnquiryCandidate[];
  rejectedMessages: Array<{ messageId: string; reason: "invalid_response" | "payload_too_large" }>;
  nextPageToken: string | null;
  resultSizeEstimate: number | null;
  /** Messages deleted after listing; retrying the scan cannot recover them. */
  missingMessageCount: number;
  /** Full-message reads avoided through the caller's persisted dedupe lookup. */
  alreadyImportedCount: number;
  /** Labelled outbound messages excluded even if Gmail search returns them. */
  skippedOutboundCount: number;
}
