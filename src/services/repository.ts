/**
 * Unified Data Repository Layer
 * Manages reactive state in Mock Mode and handles persistence.
 */

import {
  PartyMember,
  ActivityStatus,
  ForeignTrip,
  DevelopmentCandidate,
  AdmissionDossier,
  OfficializationDossier,
  PolicyVersion,
  PolicyRequirement,
  DocumentTemplate,
  UserAccount,
  AuditLog,
  MemberChangeRequest,
  AppSettings,
  RefItem,
  ProvinceItem,
} from '../types';

import {
  INITIAL_PARTY_MEMBERS,
  INITIAL_FOREIGN_TRIPS,
  INITIAL_DEVELOPMENT_CANDIDATES,
  INITIAL_POLICY_VERSIONS,
  INITIAL_ADMISSION_DOSSIERS,
  INITIAL_OFFICIALIZATION_DOSSIERS,
  INITIAL_CHANGE_REQUESTS,
  INITIAL_USER_ACCOUNTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_DOCUMENT_TEMPLATES,
  INITIAL_REF_COUNTRIES,
  INITIAL_REF_PROVINCES,
  INITIAL_REF_ETHNICITIES,
  INITIAL_REF_RELIGIONS,
} from './mockData';

import { removeVietnameseAccents, normalizeFullName } from '../utils/vietnamese';

// In-memory reactive state keys for Mock Mode
const STORAGE_KEYS = {
  MEMBERS: 'qldv_party_members_v1',
  TRIPS: 'qldv_foreign_trips_v1',
  CANDIDATES: 'qldv_candidates_v1',
  ADMISSIONS: 'qldv_admissions_v1',
  OFFICIALIZATIONS: 'qldv_officializations_v1',
  CHANGE_REQUESTS: 'qldv_change_requests_v1',
  POLICY_VERSIONS: 'qldv_policy_versions_v1',
  TEMPLATES: 'qldv_document_templates_v1',
  USERS: 'qldv_users_v1',
  AUDIT_LOGS: 'qldv_audit_logs_v1',
  SETTINGS: 'qldv_app_settings_v1',
  REF_COUNTRIES: 'qldv_ref_countries_v1',
  REF_PROVINCES: 'qldv_ref_provinces_v1',
  REF_ETHNICITIES: 'qldv_ref_ethnicities_v1',
  REF_RELIGIONS: 'qldv_ref_religions_v1',
};

function loadStoredData<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item) return JSON.parse(item);
  } catch (e) {
    console.error(`Error loading storage key ${key}:`, e);
  }
  return defaultVal;
}

function saveStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving storage key ${key}:`, e);
  }
}

function ensureUniqueIds<T extends { id?: string }>(items: T[], prefix: string, storageKey?: string): T[] {
  const seen = new Set<string>();
  let hasDuplicates = false;
  const cleanList = items.map((item, idx) => {
    if (!item.id || seen.has(item.id)) {
      hasDuplicates = true;
      const newId = `${prefix}-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`;
      return { ...item, id: newId };
    }
    seen.add(item.id);
    return item;
  });

  if (hasDuplicates && storageKey) {
    saveStoredData(storageKey, cleanList);
  }

  return cleanList;
}

function ensureUniqueUids<T extends { uid?: string }>(items: T[], storageKey?: string): T[] {
  const seen = new Set<string>();
  let hasDuplicates = false;
  const cleanList = items.map((item, idx) => {
    if (!item.uid || seen.has(item.uid)) {
      hasDuplicates = true;
      const newUid = `uid-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`;
      return { ...item, uid: newUid };
    }
    seen.add(item.uid);
    return item;
  });

  if (hasDuplicates && storageKey) {
    saveStoredData(storageKey, cleanList);
  }

  return cleanList;
}

export class DataRepository {
  // --- DATE CALCULATIONS ---
  static calculateDaysRemaining(dateStr: string): number {
    try {
      const parts = dateStr.split('/');
      let targetDate: Date;
      if (parts.length === 3) {
        targetDate = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
      } else {
        targetDate = new Date(dateStr);
      }
      const today = new Date();
      const diffTime = targetDate.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 30;
    }
  }

  // --- PARTY MEMBERS ---
  static getPartyMembers(): PartyMember[] {
    const list = loadStoredData<PartyMember[]>(STORAGE_KEYS.MEMBERS, INITIAL_PARTY_MEMBERS);
    const active = list.filter((m) => !m.deletedAt);
    return ensureUniqueIds(active, 'pm', STORAGE_KEYS.MEMBERS);
  }

  static getPartyMemberById(id: string): PartyMember | undefined {
    return this.getPartyMembers().find((m) => m.id === id);
  }

  static savePartyMember(member: Partial<PartyMember>, actorEmail: string): PartyMember {
    const members = loadStoredData<PartyMember[]>(STORAGE_KEYS.MEMBERS, INITIAL_PARTY_MEMBERS);
    const normalizedName = removeVietnameseAccents(member.fullName || '');
    const fullNameUpper = normalizeFullName(member.fullName || '');

    let savedMember: PartyMember;
    const existingIndex = member.id ? members.findIndex((m) => m.id === member.id) : -1;

    if (existingIndex >= 0) {
      savedMember = {
        ...members[existingIndex],
        ...member,
        fullName: fullNameUpper || members[existingIndex].fullName,
        normalizedName: normalizedName || members[existingIndex].normalizedName,
        updatedAt: new Date().toISOString(),
        updatedBy: actorEmail,
      };
      members[existingIndex] = savedMember;
    } else {
      savedMember = {
        id: member.id || `pm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        stt: members.length + 1,
        fullName: fullNameUpper,
        normalizedName,
        gender: member.gender || 'Nam',
        dateOfBirth: member.dateOfBirth || '01/01/1990',
        ethnicityId: member.ethnicityId || '1',
        ethnicityName: member.ethnicityName || 'Kinh',
        religionId: member.religionId || '1',
        religionName: member.religionName || 'Không',
        personalId: member.personalId || '000000000000',
        partyCardNumber: member.partyCardNumber || '000000000000',
        partyOrganization: member.partyOrganization || 'Chi bộ Khoa học cơ bản',
        birthRegistration: member.birthRegistration || { country: 'Việt Nam', province: 'Cần Thơ', detail: '' },
        hometown: member.hometown || { country: 'Việt Nam', province: 'Cần Thơ', detail: '' },
        permanentResidence: member.permanentResidence || { country: 'Việt Nam', province: 'Cần Thơ', detail: '' },
        partyAdmissionDate: member.partyAdmissionDate || '01/01/2020',
        activityStatus: member.activityStatus || 'Đang sinh hoạt Đảng',
        deleteRequested: false,
        validationResult: 'HỢP LỆ',
        validationDetails: 'Hồ sơ mới tạo',
        staffCode: member.staffCode || '000000',
        createdAt: new Date().toISOString(),
        createdBy: actorEmail,
        updatedAt: new Date().toISOString(),
        updatedBy: actorEmail,
        ...member,
      };
      members.push(savedMember);
    }

    saveStoredData(STORAGE_KEYS.MEMBERS, members);
    this.addAuditLog(
      actorEmail,
      existingIndex >= 0 ? 'UPDATE_PARTY_MEMBER' : 'CREATE_PARTY_MEMBER',
      'PARTY_MEMBER',
      savedMember.id,
      `Cập nhật/Tạo hồ sơ đảng viên ${savedMember.fullName}`
    );
    return savedMember;
  }

  static adjustPartyMemberName(
    id: string,
    newFullName: string,
    otherName: string | undefined,
    reason: string,
    actorEmail: string
  ): PartyMember | undefined {
    const members = loadStoredData<PartyMember[]>(STORAGE_KEYS.MEMBERS, INITIAL_PARTY_MEMBERS);
    const index = members.findIndex((m) => m.id === id);
    if (index >= 0) {
      const oldName = members[index].fullName;
      const normalizedName = removeVietnameseAccents(newFullName || '');
      const fullNameUpper = normalizeFullName(newFullName || '');

      members[index] = {
        ...members[index],
        fullName: fullNameUpper,
        normalizedName,
        otherName: otherName !== undefined ? otherName : members[index].otherName,
        updatedAt: new Date().toISOString(),
        updatedBy: actorEmail,
      };

      saveStoredData(STORAGE_KEYS.MEMBERS, members);
      this.addAuditLog(
        actorEmail,
        'ADJUST_MEMBER_NAME',
        'PARTY_MEMBER',
        id,
        `Điều chỉnh tên Đảng viên từ "${oldName}" thành "${fullNameUpper}". Lý do: ${reason}`
      );
      return members[index];
    }
    return undefined;
  }

  static softDeletePartyMember(id: string, reason: string, actorEmail: string): boolean {
    return this.deletePartyMember(id, false, reason, actorEmail);
  }

  static deletePartyMember(
    id: string,
    isPermanent: boolean,
    reason: string,
    actorEmail: string,
    newStatus?: ActivityStatus
  ): boolean {
    const members = loadStoredData<PartyMember[]>(STORAGE_KEYS.MEMBERS, INITIAL_PARTY_MEMBERS);
    const index = members.findIndex((m) => m.id === id);

    if (index >= 0) {
      const memberName = members[index].fullName;

      if (isPermanent) {
        members.splice(index, 1);
        saveStoredData(STORAGE_KEYS.MEMBERS, members);
        this.addAuditLog(
          actorEmail,
          'PERMANENT_DELETE_MEMBER',
          'PARTY_MEMBER',
          id,
          `Xóa vĩnh viễn Đảng viên ${memberName}. Lý do: ${reason}`
        );
      } else {
        members[index].deletedAt = new Date().toISOString();
        members[index].deleteReason = reason;
        members[index].deleteRequested = true;
        if (newStatus) {
          members[index].activityStatus = newStatus;
        } else if (reason.includes('Chuyển sinh hoạt')) {
          members[index].activityStatus = 'Gián đoạn sinh hoạt';
        } else if (reason.includes('Rời khỏi')) {
          members[index].activityStatus = 'Rời khỏi Đảng';
        } else if (reason.includes('Từ trần')) {
          members[index].activityStatus = 'Từ trần';
        }
        members[index].updatedAt = new Date().toISOString();
        members[index].updatedBy = actorEmail;

        saveStoredData(STORAGE_KEYS.MEMBERS, members);
        this.addAuditLog(
          actorEmail,
          'SOFT_DELETE_MEMBER',
          'PARTY_MEMBER',
          id,
          `Xóa mềm/Chuyển sinh hoạt Đảng viên ${memberName}. Lý do: ${reason}`
        );
      }
      return true;
    }
    return false;
  }

  static restorePartyMember(id: string, actorEmail: string): boolean {
    const members = loadStoredData<PartyMember[]>(STORAGE_KEYS.MEMBERS, INITIAL_PARTY_MEMBERS);
    const index = members.findIndex((m) => m.id === id);
    if (index >= 0 && members[index].deletedAt) {
      delete members[index].deletedAt;
      delete members[index].deleteReason;
      members[index].deleteRequested = false;
      members[index].activityStatus = 'Đang sinh hoạt Đảng';
      members[index].updatedAt = new Date().toISOString();
      members[index].updatedBy = actorEmail;

      saveStoredData(STORAGE_KEYS.MEMBERS, members);
      this.addAuditLog(actorEmail, 'RESTORE_MEMBER', 'PARTY_MEMBER', id, `Khôi phục hồ sơ Đảng viên ${members[index].fullName}`);
      return true;
    }
    return false;
  }

  // --- FOREIGN TRIPS ---
  static getForeignTrips(): ForeignTrip[] {
    const list = loadStoredData<ForeignTrip[]>(STORAGE_KEYS.TRIPS, INITIAL_FOREIGN_TRIPS);
    return ensureUniqueIds(list, 'ft', STORAGE_KEYS.TRIPS);
  }

  static saveForeignTrip(trip: Partial<ForeignTrip>, actorEmail: string): ForeignTrip {
    const trips = this.getForeignTrips();
    let saved: ForeignTrip;
    const index = trip.id ? trips.findIndex((t) => t.id === trip.id) : -1;

    if (index >= 0) {
      saved = {
        ...trips[index],
        ...trip,
        updatedAt: new Date().toISOString(),
      };
      trips[index] = saved;
    } else {
      saved = {
        id: trip.id || `ft-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        memberId: trip.memberId || '',
        memberFullName: trip.memberFullName || '',
        staffCode: trip.staffCode || '',
        purposes: trip.purposes || ['Học tập'],
        relativesAbroard: trip.relativesAbroard || [],
        startDate: trip.startDate || '01/01/2026',
        endDate: trip.endDate || '10/01/2026',
        destinationCountry: trip.destinationCountry || 'Việt Nam',
        approvalStatus: trip.approvalStatus || 'PENDING',
        tripStatus: trip.tripStatus || 'UPCOMING',
        createdAt: new Date().toISOString(),
        createdBy: actorEmail,
        updatedAt: new Date().toISOString(),
        ...trip,
      };
      trips.push(saved);
    }
    saveStoredData(STORAGE_KEYS.TRIPS, trips);
    this.addAuditLog(actorEmail, 'SAVE_FOREIGN_TRIP', 'FOREIGN_TRIP', saved.id, `Lưu thông tin chuyến đi nước ngoài`);
    return saved;
  }

  static deleteForeignTrip(id: string, actorEmail: string): boolean {
    const trips = this.getForeignTrips();
    const index = trips.findIndex((t) => t.id === id);
    if (index >= 0) {
      const removed = trips.splice(index, 1)[0];
      saveStoredData(STORAGE_KEYS.TRIPS, trips);
      this.addAuditLog(
        actorEmail,
        'DELETE_FOREIGN_TRIP',
        'FOREIGN_TRIP',
        id,
        `Xóa chuyến đi nước ngoài của ${removed.memberFullName} (${removed.destinationCountry})`
      );
      return true;
    }
    return false;
  }

  static importForeignTrips(tripsData: Partial<ForeignTrip>[], actorEmail: string): number {
    const existing = this.getForeignTrips();
    let count = 0;
    const now = new Date().toISOString();

    tripsData.forEach((t) => {
      const newTrip: ForeignTrip = {
        id: `ft-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        memberId: t.memberId || '',
        memberFullName: t.memberFullName || 'CHƯA RÕ HỌ TÊN',
        staffCode: t.staffCode || '000000',
        purposes: t.purposes || ['Đi công tác'],
        relativesAbroard: t.relativesAbroard || [],
        startDate: t.startDate || '01/01/2026',
        endDate: t.endDate || '10/01/2026',
        destinationCountry: t.destinationCountry || 'Việt Nam',
        city: t.city || '',
        agency: t.agency || '',
        details: t.details || '',
        approvalStatus: 'APPROVED',
        tripStatus: t.tripStatus || 'UPCOMING',
        createdAt: now,
        createdBy: actorEmail,
        updatedAt: now,
      };
      existing.push(newTrip);
      count++;
    });

    saveStoredData(STORAGE_KEYS.TRIPS, existing);
    this.addAuditLog(actorEmail, 'IMPORT_FOREIGN_TRIPS', 'FOREIGN_TRIP', 'IMPORT', `Import thành công ${count} bản ghi chuyến đi/nhân thân nước ngoài từ file Excel/CSV`);
    return count;
  }

  // --- DEVELOPMENT CANDIDATES ---
  static getDevelopmentCandidates(): DevelopmentCandidate[] {
    const list = loadStoredData<DevelopmentCandidate[]>(STORAGE_KEYS.CANDIDATES, INITIAL_DEVELOPMENT_CANDIDATES);
    return ensureUniqueIds(list, 'cand', STORAGE_KEYS.CANDIDATES);
  }

  static getDevelopmentCandidateById(id: string): DevelopmentCandidate | undefined {
    return this.getDevelopmentCandidates().find((c) => c.id === id);
  }

  static saveDevelopmentCandidate(cand: Partial<DevelopmentCandidate>, actorEmail: string): DevelopmentCandidate {
    const candidates = this.getDevelopmentCandidates();
    let saved: DevelopmentCandidate;
    const index = cand.id ? candidates.findIndex((c) => c.id === cand.id) : -1;

    if (index >= 0) {
      saved = {
        ...candidates[index],
        ...cand,
        updatedAt: new Date().toISOString(),
      };
      candidates[index] = saved;
    } else {
      saved = {
        id: cand.id || `cand-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        trackingYear: cand.trackingYear || new Date().getFullYear(),
        fullName: normalizeFullName(cand.fullName || ''),
        normalizedName: removeVietnameseAccents(cand.fullName || ''),
        dateOfBirth: cand.dateOfBirth || '01/01/1995',
        birthPlace: cand.birthPlace || '',
        personalId: cand.personalId || '000000000000',
        personalIdDate: cand.personalIdDate || '',
        personalIdPlace: cand.personalIdPlace || '',
        hometown: cand.hometown || { country: 'Việt Nam', province: 'Cần Thơ', detail: '' },
        residence: cand.residence || { country: 'Việt Nam', province: 'Cần Thơ', detail: '' },
        educationLevel: cand.educationLevel || '12/12',
        professionalLevel: cand.professionalLevel || '',
        workplace: cand.workplace || 'Chi bộ Khoa học cơ bản',
        jobTitle: cand.jobTitle || 'Giảng viên',
        email: cand.email || '',
        phone: cand.phone || '',
        trackingStartDate: cand.trackingStartDate || '01/01/2026',
        stage: cand.stage || 'TRACKING',
        personalHistories: cand.personalHistories || [],
        otherOrganizationHistories: cand.otherOrganizationHistories || [],
        familyMembers: cand.familyMembers || [],
        politicalHistories: cand.politicalHistories || [],
        mentorReviews: cand.mentorReviews || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...cand,
      };
      candidates.push(saved);
    }

    saveStoredData(STORAGE_KEYS.CANDIDATES, candidates);
    this.addAuditLog(actorEmail, 'SAVE_CANDIDATE', 'DEVELOPMENT_CANDIDATE', saved.id, `Lưu hồ sơ phát triển Đảng: ${saved.fullName}`);
    return saved;
  }

  static deleteDevelopmentCandidate(id: string, actorEmail: string): boolean {
    const candidates = this.getDevelopmentCandidates();
    const index = candidates.findIndex((c) => c.id === id);
    if (index >= 0) {
      const removed = candidates.splice(index, 1)[0];
      saveStoredData(STORAGE_KEYS.CANDIDATES, candidates);
      this.addAuditLog(
        actorEmail,
        'DELETE_CANDIDATE',
        'DEVELOPMENT_CANDIDATE',
        id,
        `Xóa hồ sơ nguồn phát triển Đảng: ${removed.fullName}`
      );
      return true;
    }
    return false;
  }

  // --- ADMISSION DOSSIERS ---
  static getAdmissionDossiers(): AdmissionDossier[] {
    const list = loadStoredData<AdmissionDossier[]>(STORAGE_KEYS.ADMISSIONS, INITIAL_ADMISSION_DOSSIERS);
    return ensureUniqueIds(list, 'adm', STORAGE_KEYS.ADMISSIONS);
  }

  static saveAdmissionDossier(dossier: AdmissionDossier, actorEmail: string): AdmissionDossier {
    const dossiers = this.getAdmissionDossiers();
    const index = dossier.id ? dossiers.findIndex((d) => d.id === dossier.id) : -1;
    dossier.updatedAt = new Date().toISOString();

    if (index >= 0) {
      dossiers[index] = dossier;
    } else {
      dossiers.push(dossier);
    }
    saveStoredData(STORAGE_KEYS.ADMISSIONS, dossiers);
    this.addAuditLog(actorEmail, 'SAVE_ADMISSION_DOSSIER', 'ADMISSION_DOSSIER', dossier.id, `Cập nhật hồ sơ kết nạp Đảng`);
    return dossier;
  }

  static deleteAdmissionDossier(id: string, actorEmail: string): boolean {
    const dossiers = this.getAdmissionDossiers();
    const index = dossiers.findIndex((d) => d.id === id);
    if (index >= 0) {
      const removed = dossiers.splice(index, 1)[0];
      saveStoredData(STORAGE_KEYS.ADMISSIONS, dossiers);
      this.addAuditLog(actorEmail, 'DELETE_ADMISSION_DOSSIER', 'ADMISSION_DOSSIER', id, `Xóa hồ sơ kết nạp Đảng: ${removed.candidateFullName}`);
      return true;
    }
    return false;
  }

  static toggleArchiveAdmissionDossier(id: string, archive: boolean, actorEmail: string): boolean {
    const dossiers = this.getAdmissionDossiers();
    const index = dossiers.findIndex((d) => d.id === id);
    if (index >= 0) {
      (dossiers[index] as any).isArchived = archive;
      dossiers[index].updatedAt = new Date().toISOString();
      saveStoredData(STORAGE_KEYS.ADMISSIONS, dossiers);
      this.addAuditLog(actorEmail, archive ? 'ARCHIVE_ADMISSION_DOSSIER' : 'UNARCHIVE_ADMISSION_DOSSIER', 'ADMISSION_DOSSIER', id, `${archive ? 'Lưu trữ' : 'Khôi phục lưu trữ'} hồ sơ kết nạp: ${dossiers[index].candidateFullName}`);
      return true;
    }
    return false;
  }

  // --- OFFICIALIZATION DOSSIERS ---
  static getOfficializationDossiers(): OfficializationDossier[] {
    const list = loadStoredData<OfficializationDossier[]>(STORAGE_KEYS.OFFICIALIZATIONS, INITIAL_OFFICIALIZATION_DOSSIERS);
    return ensureUniqueIds(list, 'off', STORAGE_KEYS.OFFICIALIZATIONS);
  }

  static saveOfficializationDossier(dossier: OfficializationDossier, actorEmail: string): OfficializationDossier {
    const dossiers = this.getOfficializationDossiers();
    const index = dossier.id ? dossiers.findIndex((d) => d.id === dossier.id) : -1;
    dossier.updatedAt = new Date().toISOString();

    if (index >= 0) {
      dossiers[index] = dossier;
    } else {
      dossiers.push(dossier);
    }
    saveStoredData(STORAGE_KEYS.OFFICIALIZATIONS, dossiers);
    this.addAuditLog(actorEmail, 'SAVE_OFFICIALIZATION_DOSSIER', 'OFFICIALIZATION_DOSSIER', dossier.id, `Cập nhật hồ sơ công nhận chính thức`);
    return dossier;
  }

  static deleteOfficializationDossier(id: string, actorEmail: string): boolean {
    const dossiers = this.getOfficializationDossiers();
    const index = dossiers.findIndex((d) => d.id === id);
    if (index >= 0) {
      const removed = dossiers.splice(index, 1)[0];
      saveStoredData(STORAGE_KEYS.OFFICIALIZATIONS, dossiers);
      this.addAuditLog(actorEmail, 'DELETE_OFFICIALIZATION_DOSSIER', 'OFFICIALIZATION_DOSSIER', id, `Xóa hồ sơ công nhận chính thức: ${removed.memberFullName}`);
      return true;
    }
    return false;
  }

  static toggleArchiveOfficializationDossier(id: string, archive: boolean, actorEmail: string): boolean {
    const dossiers = this.getOfficializationDossiers();
    const index = dossiers.findIndex((d) => d.id === id);
    if (index >= 0) {
      (dossiers[index] as any).isArchived = archive;
      dossiers[index].updatedAt = new Date().toISOString();
      saveStoredData(STORAGE_KEYS.OFFICIALIZATIONS, dossiers);
      this.addAuditLog(actorEmail, archive ? 'ARCHIVE_OFFICIALIZATION_DOSSIER' : 'UNARCHIVE_OFFICIALIZATION_DOSSIER', 'OFFICIALIZATION_DOSSIER', id, `${archive ? 'Lưu trữ' : 'Khôi phục lưu trữ'} hồ sơ công nhận chính thức: ${dossiers[index].memberFullName}`);
      return true;
    }
    return false;
  }

  // --- CHANGE REQUESTS ---
  static getMemberChangeRequests(): MemberChangeRequest[] {
    const list = loadStoredData<MemberChangeRequest[]>(STORAGE_KEYS.CHANGE_REQUESTS, INITIAL_CHANGE_REQUESTS);
    return ensureUniqueIds(list, 'cr', STORAGE_KEYS.CHANGE_REQUESTS);
  }

  static saveMemberChangeRequest(req: MemberChangeRequest, actorEmail: string): MemberChangeRequest {
    const requests = this.getMemberChangeRequests();
    const index = req.id ? requests.findIndex((r) => r.id === req.id) : -1;
    if (index >= 0) {
      requests[index] = req;
    } else {
      requests.push(req);
    }
    saveStoredData(STORAGE_KEYS.CHANGE_REQUESTS, requests);
    this.addAuditLog(actorEmail, 'SAVE_CHANGE_REQUEST', 'MEMBER_CHANGE_REQUEST', req.id, `Tạo/Cập nhật yêu cầu thay đổi hồ sơ`);
    return req;
  }

  // --- POLICY VERSIONS & REQUIREMENTS ---
  static getPolicyVersions(): PolicyVersion[] {
    const list = loadStoredData<PolicyVersion[]>(STORAGE_KEYS.POLICY_VERSIONS, INITIAL_POLICY_VERSIONS);
    return ensureUniqueIds(list, 'pol', STORAGE_KEYS.POLICY_VERSIONS);
  }

  static getPolicyRequirements(): PolicyRequirement[] {
    return [
      {
        id: 'pol-01',
        code: '06-HD/TW',
        title: 'Hướng dẫn số 06-HD/TW của Ban Tổ chức Trung ương',
        issuedDate: '19/05/2026',
        issuedBy: 'Ban Tổ chức Trung ương',
        isCurrentActive: true,
        summary: 'Hướng dẫn một số vấn đề cụ thể về thi hành Điều lệ Đảng và quy trình quản lý hồ sơ kết nạp',
        admissionGroupA: [
          { code: 'A1', title: 'Lý lịch của người xin vào Đảng (Mẫu 2-ĐC)' },
          { code: 'A2', title: 'Văn bản thẩm tra lý lịch của cấp ủy' },
          { code: 'A3', title: 'Giấy giới thiệu người vào Đảng (02 đảng viên chính thức)' },
        ],
        admissionGroupB: [
          { code: 'B1', title: 'Nghị quyết giới thiệu của Đoàn TNCS / Công đoàn' },
          { code: 'B2', title: 'Nghị quyết xét kết nạp của Chi bộ' },
          { code: 'B3', title: 'Quyết định kết nạp Đảng viên' },
        ],
        admissionGroupC: [
          { code: 'C1', title: 'Giấy chứng nhận bồi dưỡng nhận thức về Đảng' },
          { code: 'C2', title: 'Đơn xin vào Đảng (Viết tay)' },
        ],
        officializationItems: [
          { code: 'OFF-01', title: 'Bản tự kiểm điểm của Đảng viên dự bị (Mẫu 10-KNĐ)' },
          { code: 'OFF-02', title: 'Bản nhận xét đảng viên dự bị của Người hướng dẫn' },
          { code: 'OFF-03', title: 'Nghị quyết đề nghị công nhận chính thức của Chi bộ' },
        ],
      },
    ];
  }

  static savePolicyVersion(pv: PolicyVersion, actorEmail: string): PolicyVersion {
    const versions = this.getPolicyVersions();
    const index = versions.findIndex((v) => v.id === pv.id);
    if (index >= 0) {
      versions[index] = pv;
    } else {
      versions.push(pv);
    }
    saveStoredData(STORAGE_KEYS.POLICY_VERSIONS, versions);
    this.addAuditLog(actorEmail, 'SAVE_POLICY_VERSION', 'POLICY_VERSION', pv.id, `Cập nhật phiên bản quy định ${pv.code}`);
    return pv;
  }

  // --- DOCUMENT TEMPLATES ---
  static getDocumentTemplates(): DocumentTemplate[] {
    const list = loadStoredData<DocumentTemplate[]>(STORAGE_KEYS.TEMPLATES, INITIAL_DOCUMENT_TEMPLATES);
    return ensureUniqueIds(list, 'tpl', STORAGE_KEYS.TEMPLATES);
  }

  // --- USER ACCOUNTS ---
  static getUsers(): UserAccount[] {
    const list = loadStoredData<UserAccount[]>(STORAGE_KEYS.USERS, INITIAL_USER_ACCOUNTS);
    return ensureUniqueUids(list, STORAGE_KEYS.USERS);
  }

  static saveUser(user: UserAccount, actorEmail: string): UserAccount {
    const users = this.getUsers();
    const index = user.uid ? users.findIndex((u) => u.uid === user.uid) : -1;
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    saveStoredData(STORAGE_KEYS.USERS, users);
    this.addAuditLog(actorEmail, 'SAVE_USER', 'USER_ACCOUNT', user.uid, `Cập nhật tài khoản người dùng ${user.email}`);
    return user;
  }

  static saveUserAccount(user: Partial<UserAccount>): UserAccount {
    const users = this.getUsers();
    const index = user.uid ? users.findIndex((u) => u.uid === user.uid) : -1;
    let saved: UserAccount;
    if (index >= 0) {
      saved = { ...users[index], ...user };
      users[index] = saved;
    } else {
      saved = {
        uid: user.uid || `uid-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        email: user.email || 'user@ctump.edu.vn',
        fullName: user.fullName || 'Người dùng mới',
        role: user.role || 'PARTY_MEMBER',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        ...user,
      };
      users.push(saved);
    }
    saveStoredData(STORAGE_KEYS.USERS, users);
    return saved;
  }

  static deleteUser(uid: string, actorEmail: string): boolean {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.uid === uid);
    if (index >= 0) {
      const removed = users.splice(index, 1)[0];
      saveStoredData(STORAGE_KEYS.USERS, users);
      this.addAuditLog(actorEmail, 'DELETE_USER', 'USER_ACCOUNT', uid, `Xóa tài khoản người dùng ${removed.email} (${removed.fullName})`);
      return true;
    }
    return false;
  }

  // --- AUDIT LOGS ---
  static getAuditLogs(): AuditLog[] {
    const list = loadStoredData<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    return ensureUniqueIds(list, 'log', STORAGE_KEYS.AUDIT_LOGS);
  }

  static addAuditLog(actorEmail: string, action: string, resourceType: string, resourceId: string, maskedSummary: string): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      actorUid: 'current-user-uid',
      actorEmail,
      performedByEmail: actorEmail,
      action,
      resourceType,
      targetCollection: resourceType,
      resourceId,
      targetId: resourceId,
      timestamp: new Date().toISOString(),
      performedAt: new Date().toISOString(),
      requestId: `req-${Date.now()}`,
      maskedSummary,
      details: maskedSummary,
    };
    logs.unshift(newLog); // newest first
    saveStoredData(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 500)); // cap at 500
  }

  // --- APP SETTINGS ---
  static getSettings(): AppSettings {
    return loadStoredData<AppSettings>(STORAGE_KEYS.SETTINGS, {
      organizationName: 'ĐẢNG UỶ TRƯỜNG ĐẠI HỌC Y DƯỢC CẦN THƠ',
      partyCellName: 'CHI BỘ KHOA HỌC CƠ BẢN',
      universityName: 'TRƯỜNG ĐẠI HỌC Y DƯỢC CẦN THƠ',
      bootstrapAdminEmails: ['chibokhcb@ctump.edu.vn', 'admin@ctump.edu.vn'],
      allowedDomains: ['ctump.edu.vn'],
      autoApproveFields: [],
      sessionTimeoutMinutes: 20,
      maxFileUploadMb: 20,
      disclaimerConfirmed: true,
    });
  }

  static saveSettings(settings: AppSettings, actorEmail: string): void {
    saveStoredData(STORAGE_KEYS.SETTINGS, settings);
    this.addAuditLog(actorEmail, 'SAVE_SETTINGS', 'APP_SETTINGS', 'global', `Cập nhật cấu hình hệ thống`);
  }

  // --- REFERENCE DICTIONARIES ---
  static getRefCountries(): RefItem[] {
    return loadStoredData<RefItem[]>(STORAGE_KEYS.REF_COUNTRIES, INITIAL_REF_COUNTRIES);
  }

  static getRefProvinces(): ProvinceItem[] {
    return loadStoredData<ProvinceItem[]>(STORAGE_KEYS.REF_PROVINCES, INITIAL_REF_PROVINCES);
  }

  static getRefEthnicities(): RefItem[] {
    return loadStoredData<RefItem[]>(STORAGE_KEYS.REF_ETHNICITIES, INITIAL_REF_ETHNICITIES);
  }

  static getRefReligions(): RefItem[] {
    return loadStoredData<RefItem[]>(STORAGE_KEYS.REF_RELIGIONS, INITIAL_REF_RELIGIONS);
  }
}
