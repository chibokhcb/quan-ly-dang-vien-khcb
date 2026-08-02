import React, { useState } from 'react';
import { DataRepository } from '../services/repository';
import { OfficializationDossierItem, DossierItemStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Award, Users, CheckCircle, Upload, Paperclip, ExternalLink } from 'lucide-react';

export const OfficializationDossierDetail: React.FC<{ dossierId: string; onBack: () => void }> = ({ dossierId, onBack }) => {
  const { canApprove, currentUser } = useAuth();
  const dossiers = DataRepository.getOfficializationDossiers();
  const dossier = dossiers.find((d) => d.id === dossierId) || dossiers[0];

  const [items, setItems] = useState<OfficializationDossierItem[]>(dossier?.items || []);

  if (!dossier) {
    return (
      <div className="bg-white p-6 rounded-xl border text-center space-y-2">
        <p>Không tìm thấy hồ sơ công nhận chính thức.</p>
        <button onClick={onBack} className="text-xs font-bold text-red-800">Quay lại</button>
      </div>
    );
  }

  const saveDossierChanges = (updatedItems: OfficializationDossierItem[]) => {
    setItems(updatedItems);
    dossier.items = updatedItems;

    // Recalculate progress
    const validCount = updatedItems.filter((i) => i.status === 'VALID').length;
    dossier.progressPercentage = updatedItems.length > 0 ? Math.round((validCount / updatedItems.length) * 100) : 0;
    dossier.updatedAt = new Date().toISOString();

    DataRepository.saveOfficializationDossier(dossier, currentUser?.email || 'admin');
  };

  const handleUpdateItemStatus = (itemId: string, newStatus: DossierItemStatus) => {
    const updated = items.map((it) => (it.id === itemId ? { ...it, status: newStatus } : it));
    saveDossierChanges(updated);
  };

  const handleFileUploadItem = (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const fileName = file.name;

    const updated = items.map((it) =>
      it.id === itemId
        ? {
            ...it,
            attachedFileName: fileName,
            attachedFileUrl: fileUrl,
            status: it.status === 'NEEDS_SUPPLEMENT' ? 'UPLOADED' : it.status,
          }
        : it
    );
    saveDossierChanges(updated);
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
            <h2 className="text-lg font-extrabold text-red-950 uppercase">{dossier.memberFullName}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Hồ sơ Công nhận Đảng viên Chính thức • Hạn công nhận: <span className="font-bold text-emerald-800">{dossier.expectedOfficialDate}</span>
            </p>
          </div>
        </div>

        <div className="text-right text-xs">
          <span className="font-extrabold text-emerald-800 text-base">{dossier.progressPercentage}%</span>
          <p className="text-[11px] text-gray-500">Mức độ hoàn thiện 08 văn bản</p>
        </div>
      </div>

      {/* Voting box */}
      {dossier.partyCellMeeting && (
        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl text-xs space-y-2">
          <h3 className="font-extrabold text-emerald-950 text-sm flex items-center space-x-2">
            <Users className="w-4 h-4 text-emerald-800" />
            <span>Kết quả Họp Chi bộ & Biểu quyết xét Công nhận chính thức</span>
          </h3>
          <p>
            Tổng số Đảng viên chính thức: <strong>{dossier.partyCellMeeting.totalOfficialMembers}</strong> đồng chí
          </p>
          <p>
            Số phiếu tán thành: <strong>{dossier.partyCellMeeting.votingApprovalCount}</strong> / {dossier.partyCellMeeting.totalOfficialMembers} (đạt <strong>{dossier.partyCellMeeting.votingPercentage}%</strong>)
          </p>
          <p className="text-emerald-900 font-bold flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Tỷ lệ đạt quy định &gt;= 2/3 (66.67%). Đủ điều kiện ra Nghị quyết đề nghị Đảng ủy cấp trên công nhận chính thức.</span>
          </p>
        </div>
      )}

      {/* Table 8 items */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-3">
        <h3 className="font-extrabold text-sm text-red-900 border-b pb-2">Danh mục 08 Văn bản bắt buộc trong Hồ sơ Công nhận chính thức</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 font-bold text-gray-700">
                <th className="p-2.5">STT</th>
                <th className="p-2.5">Mã văn bản</th>
                <th className="p-2.5">Tên văn bản / Hồ sơ</th>
                <th className="p-2.5">Bắt buộc?</th>
                <th className="p-2.5">Trạng thái thẩm định</th>
                <th className="p-2.5">File đính kèm</th>
                <th className="p-2.5 text-center">Tải lên file</th>
                {canApprove() && <th className="p-2.5 text-center">Cập nhật</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((it, idx) => {
                const file = it.files && it.files.length > 0 ? it.files[0] : null;
                return (
                  <tr key={it.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-gray-500">{idx + 1}</td>
                    <td className="p-2.5 font-mono font-bold text-gray-600">{it.code}</td>
                    <td className="p-2.5 font-semibold text-gray-900">{it.name || it.title}</td>
                    <td className="p-2.5 font-bold">{(it.mandatory ?? it.required) ? 'Bắt buộc' : 'Tùy chọn'}</td>
                    <td className="p-2.5">
                      <StatusBadge status={it.status} type="dossier" />
                    </td>
                    <td className="p-2.5">
                      {file ? (
                        <a
                          href={file.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 font-bold text-blue-800 hover:underline bg-blue-50 px-2 py-1 rounded border border-blue-200"
                        >
                          <Paperclip className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                          <span className="truncate max-w-[140px]">{file.originalName}</span>
                          <ExternalLink className="w-3 h-3 text-blue-500 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">Chưa có file</span>
                      )}
                    </td>
                  <td className="p-2.5 text-center">
                    <label className="cursor-pointer bg-slate-200 hover:bg-emerald-800 hover:text-white text-gray-800 font-bold px-2.5 py-1 rounded transition inline-flex items-center space-x-1">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.png,.jpg"
                        onChange={(e) => handleFileUploadItem(it.id, e)}
                        className="hidden"
                      />
                    </label>
                  </td>
                  {canApprove() && (
                    <td className="p-2.5 text-center">
                      <select
                        value={it.status}
                        onChange={(e) => handleUpdateItemStatus(it.id, e.target.value as DossierItemStatus)}
                        className="border rounded px-2 py-1 text-xs bg-white font-semibold"
                      >
                        <option value="VALID">Hợp lệ</option>
                        <option value="PENDING_REVIEW">Chờ thẩm định</option>
                        <option value="NEEDS_SUPPLEMENT">Cần bổ sung</option>
                        <option value="UPLOADED">Đã tải lên</option>
                        <option value="NOT_APPLICABLE">Không áp dụng</option>
                      </select>
                    </td>
                  )}
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
