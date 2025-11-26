/**
 * Perspective API Types
 * Based on: https://developers.perspectiveapi.com/s/about-the-api-attributes-and-languages
 */

/**
 * Perspective API attribute names
 */
export enum PerspectiveAttribute {
  TOXICITY = 'TOXICITY',
  SEVERE_TOXICITY = 'SEVERE_TOXICITY',
  IDENTITY_ATTACK = 'IDENTITY_ATTACK',
  INSULT = 'INSULT',
  PROFANITY = 'PROFANITY',
  THREAT = 'THREAT',
  SEXUALLY_EXPLICIT = 'SEXUALLY_EXPLICIT',
  FLIRTATION = 'FLIRTATION',
  ATTACK_ON_AUTHOR = 'ATTACK_ON_AUTHOR',
  ATTACK_ON_COMMENTER = 'ATTACK_ON_COMMENTER',
  INCOHERENT = 'INCOHERENT',
  INFLAMMATORY = 'INFLAMMATORY',
  LIKELY_TO_REJECT = 'LIKELY_TO_REJECT',
  OBSCENE = 'OBSCENE',
  SPAM = 'SPAM',
  UNSUBSTANTIAL = 'UNSUBSTANTIAL',
}

/**
 * Score value and type
 */
export interface PerspectiveScore {
  value: number;
  type: string;
}

/**
 * Span score for a specific text range
 */
export interface PerspectiveSpanScore {
  begin: number;
  end: number;
  score: PerspectiveScore;
}

/**
 * Attribute score containing summary and span scores
 */
export interface PerspectiveAttributeScore {
  summaryScore: PerspectiveScore;
  spanScores: PerspectiveSpanScore[];
}

/**
 * Comment object in request
 */
export interface PerspectiveComment {
  text: string;
  type?: string;
}

/**
 * Requested attributes configuration
 * Key is the attribute name, value is an empty object (can be extended with threshold, etc.)
 */
export interface PerspectiveRequestedAttributes {
  [attributeName: string]: Record<string, unknown>;
}

/**
 * Analyze comment request payload
 */
export interface PerspectiveAnalyzeCommentRequest {
  comment: PerspectiveComment;
  requestedAttributes: PerspectiveRequestedAttributes;
  languages?: string[];
  doNotStore?: boolean;
  clientToken?: string;
  sessionId?: string;
  communityId?: string;
  spanAnnotations?: boolean;
}

/**
 * Analyze comment response
 */
export interface PerspectiveAnalyzeCommentResponse {
  attributeScores: {
    [attributeName: string]: PerspectiveAttributeScore;
  };
  languages: string[];
  clientToken?: string;
}

/**
 * Perspective API error response
 */
export interface PerspectiveErrorResponse {
  error: {
    code: number;
    message: string;
    status: string;
    details?: unknown[];
  };
}
