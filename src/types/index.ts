/**
 * Domain Types for QUẢN LÝ ĐẢNG VIÊN KHCB
 * Chi bộ Khoa học cơ bản - Trường Đại học Y Dược Cần Thơ
 */

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'ORGANIZATION_ADMIN'
  | 'PARTY_MEMBER'
  | 'MENTOR'
  | 'CANDIDATE'
  | 'AUDITOR'
  | 'GUEST';

export type ActivityStatus =
  | 'Đang sinh hoạt Đảng'
  | 'Từ trần'
  | 'Rời khỏi Đảng'
  | 'Miễn sinh hoạt'
  | 'Đình chỉ sinh hoạt'
  | 'Gián đoạn sinh hoạt';

export type Gender = 'Nam' | 'Nữ' | 'Khác';

export interface Address2Level {
  country: string;
  province: string;
  detail: string;
}

export interface PartyMember {
  id: string;
  stt?: number;
  fullName: string; // IN HOA
  normalizedName: string; // no accents, lowercase for searching
  otherName?: string;
  gender: Gender;
  dateOfBirth: string; // dd/MM/yyyy or YYYY-MM-DD
  ethnicityId: string;
  ethnicityName: string;
  religionId: string;
  religionName: string;
  personalId: string; // CCCD 12 digits text
  partyCardNumber: string; // 12 digits text
  partyCardIssuer?: string;
  partyCardIssueDate?: string;
  partyCardDecision85Number?: string;
  partyOrganization: string; // "Chi bộ Khoa học cơ bản"
  birthRegistration: Address2Level;
  hometown: Address2Level;
  permanentResidence: Address2Level;
  partyAdmissionDate: string;
  officialPartyDate?: string;
  oldIdentityNumber?: string;
  activityStatus: ActivityStatus;
  activityEndDate?: string;
  deleteRequested: boolean;
  deleteReason?: string;
  validationResult?: 'HỢP LỆ' | 'CÓ CẢNH BÁO' | 'KHÔNG HỢP LỆ';
  validationDetails?: string;

  // Additional fields for auth & user binding
  staffCode: string; // MSCB
  workEmail?: string;
  phone?: string;
  department?: string;
  academicTitle?: string; // Chức danh khoa học/Học vị
  jobTitle?: string; // Chức vụ
  userUid?: string;

  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
  deletedAt?: string;
}

export type ChangeRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface MemberChangeRequest {
  id: string;
  memberId: string;
  memberFullName: string;
  requestedByUid: string;
  requestedByEmail: string;
  requestedAt: string;
  beforeData: Record<string, any>;
  requestedData: Record<string, any>;
  changedFields: string[];
  reason: string;
  proofFiles?: Array<{ name: string; url: string; size: number }>;
  status: ChangeRequestStatus;
  reviewComment?: string;
  reviewNotes?: string;
  reviewedByUid?: string;
  reviewedByEmail?: string;
  reviewedAt?: string;
}

export type TripPurpose = 'Học tập' | 'Nghiên cứu' | 'Đi công tác' | 'Công việc riêng';
export type TripRelative = 'Cha' | 'Mẹ' | 'Người thân';
export type TripApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type TripStatus = 'UPCOMING' | 'ABROAD' | 'RETURNED' | 'OVERDUE';

export interface ForeignTrip {
  id: string;
  memberId: string;
  memberFullName: string;
  staffCode: string; // MSCB
  purposes: TripPurpose[]; // multiple choice
  relativesAbroard: TripRelative[]; // multiple choice
  startDate: string; // dd/MM/yyyy
  endDate: string; // dd/MM/yyyy
  destinationCountry: string;
  city?: string;
  agency?: string; // Cơ quan/Cơ sở tiếp nhận
  decisionNumber?: string;
  fundingSource?: string;
  details?: string;
  notes?: string;
  attachedFiles?: Array<{ name: string; url: string; size: number }>;
  approvalStatus: TripApprovalStatus;
  tripStatus: TripStatus;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
}

export type DevelopmentStage =
  | 'TRACKING' // Đang theo dõi
  | 'ELITE_CITIZEN' // Quần chúng ưu tú
  | 'AWARENESS_CLASS' // Đã học lớp nhận thức về Đảng
  | 'DOSSIER_COMPLETION' // Đang hoàn thiện hồ sơ
  | 'PROPOSED_ADMISSION' // Đã đề nghị kết nạp
  | 'PROVISIONAL_MEMBER' // Đảng viên dự bị
  | 'OFFICIAL_MEMBER' // Đảng viên chính thức
  | 'STOPPED'; // Dừng theo dõi

export interface TimelineEntry {
  id: string;
  fromDate: string;
  toDate: string;
  organizationName: string;
  role: string;
  address: string;
  details?: string;
}

export interface FamilyMember {
  id: string;
  relationship: string; // Cha, Mẹ, Vợ/Chồng, Con, Cha/Mẹ vợ (chồng)...
  fullName: string;
  birthYear: string;
  occupation: string;
  workplace: string;
  residence: string;
  politicalHistory?: string;
  notes?: string;
  verificationFiles?: Array<{ name: string; url: string }>;
}

export interface PoliticalHistory {
  id: string;
  subject: 'SELF' | 'FAMILY';
  content: string;
  period: string;
  verificationResult: string;
  verificationAgency: string;
  verificationDate: string;
  attachedFiles?: Array<{ name: string; url: string }>;
}

export interface MentorReview {
  id: string;
  mentorUid?: string;
  mentorName: string;
  mentorSlot?: 1 | 2;
  reviewedAt: string;
  quarter: string;
  content: string;
  advantages?: string;
  limitations?: string;
  ideology?: string;
  partyAwareness?: string;
  ethicsAndLifestyle?: string;
  taskCompletion?: string;
  recommendation?: string;
  recommendations?: string;
  signedFileUrl?: string;
}

export interface MentorshipSnapshot {
  memberId: string;
  fullName: string;
  partyCardNumber: string;
  jobTitle: string;
  department: string;
  email: string;
  assignedAt: string;
}

export interface DevelopmentCandidate {
  id: string;
  trackingYear: number;
  fullName: string;
  normalizedName: string;
  otherName?: string;
  dateOfBirth: string;
  birthPlace: string;
  personalId: string;
  personalIdDate: string;
  personalIdPlace: string;
  hometown: Address2Level;
  residence: Address2Level;
  educationLevel: string; // Trình độ văn hóa
  professionalLevel: string; // Chuyên môn nghiệp vụ
  workplace: string;
  jobTitle: string;
  email: string;
  phone: string;
  trackingStartDate: string;
  trackingEndDate?: string;
  stage: DevelopmentStage;
  stopReason?: string;

  // Political histories & summary texts
  personalPoliticalHistory?: string;
  familyPoliticalHistory?: string;

  // Mentors
  mentor1?: MentorshipSnapshot;
  mentor2?: MentorshipSnapshot;

  personalHistories: TimelineEntry[];
  otherOrganizationHistories: TimelineEntry[];
  familyMembers: FamilyMember[];
  politicalHistories: PoliticalHistory[];
  mentorReviews: MentorReview[];

  createdAt: string;
  updatedAt: string;
}

export type DossierItemStatus =
  | 'NOT_STARTED'
  | 'DRAFT'
  | 'UPLOADED'
  | 'PENDING_REVIEW'
  | 'VALID'
  | 'NEEDS_SUPPLEMENT'
  | 'NOT_APPLICABLE';

export interface DossierItem {
  id: string;
  code: string;
  title?: string;
  order: number;
  group: 'GROUP_A' | 'GROUP_B' | 'GROUP_C' | 'OFFICIAL_ITEM';
  name: string;
  description: string;
  mandatory?: boolean;
  required?: boolean;
  allowNotApplicable?: boolean;
  policyVersionId?: string;
  dueDate?: string;
  status: DossierItemStatus;
  notes?: string;
  reviewComment?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  files?: Array<{
    id: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    uploadedBy: string;
    uploadedAt: string;
    version: number;
    reviewStatus: DossierItemStatus;
  }>;
  attachedTemplateId?: string;
}

export type AdmissionDossierItem = DossierItem;
export type OfficializationDossierItem = DossierItem;

export interface RequirementsSnapshot {
  policyVersionId: string;
  policyVersionName: string;
  policyCode: string;
  snapshotAt: string;
  items: Array<{
    code: string;
    order: number;
    group: string;
    name: string;
    description: string;
    mandatory: boolean;
  }>;
}

export interface AdmissionDossier {
  id: string;
  candidateId: string;
  candidateFullName: string;
  candidateEmail: string;
  requirementsSnapshot: RequirementsSnapshot;
  items: DossierItem[];
  itemsGroupA: AdmissionDossierItem[];
  itemsGroupB: AdmissionDossierItem[];
  itemsGroupC: AdmissionDossierItem[];
  progressPercentage: number;
  overallStatus: 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'NEEDS_WORK';
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VotingThresholds {
  cellThreshold: string; // "Ít nhất 2/3 đảng viên chính thức đồng ý"
  executiveCommitteeThreshold: string; // "Ít nhất 2/3 đảng ủy viên đồng ý"
  standingCommitteeThreshold: string; // "Trên 1/2 thành viên đồng ý"
}

export interface OfficializationDossier {
  id: string;
  memberId: string;
  memberFullName: string;
  partyCardNumber: string;
  provisionalAdmissionDate: string;
  expectedOfficialDate: string; // 12 months after admission
  dossierDueDate: string;
  decisionDate?: string;
  announcementDate?: string; // Ngày công bố tại kỳ sinh hoạt
  provisionalDecisionNumber?: string;
  votingThresholdsSnapshot: VotingThresholds;
  requirementsSnapshot: RequirementsSnapshot;
  items: OfficializationDossierItem[];
  progressPercentage: number;
  partyCellMeeting?: {
    totalOfficialMembers: number;
    votingApprovalCount: number;
    votingPercentage: number;
  };
  currentStatus: 'MONITORING' | 'DOSSIER_READY' | 'SUBMITTED' | 'DECISION_ISSUED' | 'ANNOUNCED' | 'REMOVAL_CONSIDERED';
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyRequirement {
  id: string;
  code: string; // e.g. "01-HD/TW"
  title: string;
  issuedDate: string;
  issuedBy: string;
  isCurrentActive: boolean;
  summary: string;
  admissionGroupA: Array<{ code: string; title: string }>;
  admissionGroupB: Array<{ code: string; title: string }>;
  admissionGroupC: Array<{ code: string; title: string }>;
  officializationItems: Array<{ code: string; title: string }>;
}

export interface PolicyVersion {
  id: string;
  code: string; // e.g. "01-HD/TW"
  name: string; // e.g. "Hướng dẫn 01-HD/TW ngày 19/05/2026"
  status: 'CURRENT_ACTIVE' | 'REPLACED_HISTORICAL' | 'DRAFT';
  replacedHistoryNote?: string;
  effectiveDate: string;
  confirmedByAdmin: boolean;
  confirmedAt?: string;
  itemsConfig: Array<{
    code: string;
    order: number;
    group: 'GROUP_A' | 'GROUP_B' | 'GROUP_C' | 'OFFICIAL_ITEM';
    name: string;
    description: string;
    mandatory: boolean;
  }>;
}

export interface DocumentTemplate {
  id: string;
  templateCode: string;
  title: string;
  category: string;
  policyVersionId: string;
  fileUrl: string;
  originalName: string;
  mimeType: string;
  version: number;
  isActive: boolean;
  uploadedAt: string;
}

export interface UserAccount {
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
  positionTitle?: string;
  staffCode?: string;
  memberId?: string;
  status: 'ACTIVE' | 'INACTIVE';
  requiresSecretaryApproval?: boolean;
  approvalNotes?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuditLog {
  id: string;
  performedByEmail: string;
  action: string;
  targetCollection: string;
  targetId: string;
  details: string;
  performedAt: string;
  actorUid?: string;
  actorEmail?: string;
  resourceType?: string;
  resourceId?: string;
  timestamp?: string;
  requestId?: string;
  maskedSummary?: string;
  beforeHash?: string;
  afterHash?: string;
}

export interface AppSettings {
  organizationName: string;
  partyCellName: string;
  universityName: string;
  bootstrapAdminEmails: string[];
  allowedDomains: string[];
  autoApproveFields: string[]; // Fields allowed for auto update
  sessionTimeoutMinutes: number;
  maxFileUploadMb: number;
  disclaimerConfirmed: boolean;
}

export interface RefItem {
  id: string;
  code: string;
  name: string;
}

export interface ProvinceItem {
  id: string;
  code: string;
  name: string;
}
