import React, { useState } from 'react';
import { DataRepository } from '../services/repository';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, UserCheck, MessageSquare, Plus, CheckCircle, Shield } from 'lucide-react';

export const CandidateDetail: React.FC<{ candidateId: string; onBack: () => void }> = ({ candidateId, onBack }) => {
  const { currentUser, canApprove } = useAuth();
  const candidates = DataRepository.getDevelopmentCandidates();
  const cand = candidates.find((c) => c.id === candidateId) || candidates[0];

  const canEditCandidate = (): boolean => {
    if (canApprove()) return true;
    if (!currentUser || currentUser.role === 'GUEST') return false;

    const userEmail = currentUser.email?.toLowerCase();
    const userName = currentUser.fullName?.toUpperCase();
    const userStaffCode = currentUser.staffCode;

    const m1 = cand?.mentor1;
    const m2 = cand?.mentor2;

    const isMentor1 = (m1?.email && m1.email.toLowerCase() === userEmail) ||
                      (m1?.fullName && m1.fullName.toUpperCase() === userName) ||
                      (m1?.email && userStaffCode && m1.email.includes(userStaffCode));

    const isMentor2 = (m2?.email && m2.email.toLowerCase() === userEmail) ||
                      (m2?.fullName && m2.fullName.toUpperCase() === userName) ||
                      (m2?.email && userStaffCode && m2.email.includes(userStaffCode));

    return Boolean(isMentor1 || isMentor2);
  };

  const [reviewQuarter, setReviewQuarter] = useState('Quý III/2026');
  const [reviewContent, setReviewContent] = useState('');
  const [reviews, setReviews] = useState(cand?.mentorReviews || []);

  if (!cand) {
    return (
      <div className="bg-white p-6 rounded-xl border text-center space-y-2">
        <p>Không tìm thấy thông tin quần chúng.</p>
        <button onClick={onBack} className="text-xs font-bold text-red-800">Quay lại</button>
      </div>
    );
  }

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewContent) return;

    const newRev = {
      quarter: reviewQuarter,
      mentorName: currentUser?.fullName || 'ĐẢNG VIÊN HƯỚNG DẪN 01',
      mentorEmail: currentUser?.email || 'chibokhcb@ctump.edu.vn',
      reviewedAt: new Date().toISOString(),
      content: reviewContent,
      recommendation: 'Đủ điều kiện tiếp tục bồi dưỡng và xét kết nạp.',
    };

    const updatedReviews = [newRev, ...reviews];
    setReviews(updatedReviews);
    cand.mentorReviews = updatedReviews;
    DataRepository.saveDevelopmentCandidate(cand, currentUser?.email || 'admin');
    setReviewContent('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-extrabold text-red-950 uppercase">{cand.fullName}</h2>
              <StatusBadge status={cand.stage} type="stage" />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Nguồn phát triển năm {cand.trackingYear} • Đơn vị: {cand.workplace}
            </p>
          </div>
        </div>
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Mentors & History */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-gray-900 border-b pb-2 flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-red-800" />
              <span>02 Người hướng dẫn được phân công</span>
            </h3>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <p className="font-extrabold text-red-900">1. {cand.mentor1?.fullName}</p>
              <p className="text-gray-600">Số thẻ Đảng: {cand.mentor1?.partyCardNumber}</p>
              <p className="text-gray-600">Chức vụ: {cand.mentor1?.jobTitle}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <p className="font-extrabold text-red-900">2. {cand.mentor2?.fullName}</p>
              <p className="text-gray-600">Số thẻ Đảng: {cand.mentor2?.partyCardNumber}</p>
              <p className="text-gray-600">Chức vụ: {cand.mentor2?.jobTitle}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-gray-900 border-b pb-2 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-amber-700" />
              <span>Lịch sử chính trị & Nhân thân</span>
            </h3>

            <div className="text-xs space-y-2">
              <p className="font-semibold text-gray-700">Lịch sử bản thân:</p>
              <p className="p-2.5 bg-gray-50 rounded border text-gray-600 leading-relaxed">
                {cand.personalPoliticalHistory || 'Bản thân chấp hành tốt đường lối của Đảng, chính sách pháp luật.'}
              </p>

              <p className="font-semibold text-gray-700 mt-2">Lịch sử gia đình:</p>
              <p className="p-2.5 bg-gray-50 rounded border text-gray-600 leading-relaxed">
                {cand.familyPoliticalHistory || 'Gia đình chấp hành tốt pháp luật, không có tiền án tiền sự.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Mentor Reviews Feed */}
        <div className="space-y-6 lg:col-span-2">
          {/* Add review form */}
          {canEditCandidate() ? (
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-red-900 flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Ghi nhận ý kiến / Nhận xét định kỳ của Người hướng dẫn</span>
              </h3>

              <form onSubmit={handleAddReview} className="space-y-3">
                <div className="flex items-center space-x-3">
                  <label className="text-xs font-bold text-gray-700">Đợt nhận xét:</label>
                  <select
                    value={reviewQuarter}
                    onChange={(e) => setReviewQuarter(e.target.value)}
                    className="border rounded-lg px-2.5 py-1 text-xs bg-white font-bold"
                  >
                    <option value="Quý III/2026">Quý III/2026</option>
                    <option value="Quý IV/2026">Quý IV/2026</option>
                    <option value="Quý I/2027">Quý I/2027</option>
                  </select>
                </div>

                <textarea
                  required
                  rows={3}
                  placeholder="Nhập nội dung nhận xét về sự phấn đấu, nhận thức chính trị, đạo đức lối sống và kết quả công tác..."
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-red-800 hover:bg-red-900 text-white font-bold text-xs px-4 py-2 rounded-lg shadow transition flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Lưu nhận xét</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 font-semibold flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Chỉ Ban Chi ủy hoặc 02 Đảng viên hướng dẫn được phân công mới có quyền ghi nhận ý kiến nhận xét.</span>
            </div>
          )}

          {/* Timeline of reviews */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-gray-900 border-b pb-2">Lịch sử nhận xét định kỳ</h3>

            <div className="space-y-3">
              {reviews.map((rev, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between border-b pb-1.5">
                    <span className="font-extrabold text-red-900">{rev.quarter}</span>
                    <span className="text-gray-500 text-[11px]">{new Date(rev.reviewedAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <p className="text-gray-800 leading-relaxed">&quot;{rev.content}&quot;</p>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                    <span>Người nhận xét: <strong className="text-gray-800">{rev.mentorName}</strong></span>
                    <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{rev.recommendation}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
