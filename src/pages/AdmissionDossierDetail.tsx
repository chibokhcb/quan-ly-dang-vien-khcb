import React, { useState } from 'react';
import { DataRepository } from '../services/repository';
import { AdmissionDossierItem, DossierItemStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CheckCircle2, AlertTriangle, FileText, Upload, Paperclip, Download, ExternalLink } from 'lucide-react';

export const AdmissionDossierDetail: React.FC<{ dossierId: string; onBack: () => void }> = ({ dossierId, onBack }) => {
  const { canApprove, currentUser } = useAuth();
  const dossiers = DataRepository.getAdmissionDossiers();
  const dossier = dossiers.find((d) => d.id === dossierId) || dossiers[0];

  const [groupA, setGroupA] = useState<AdmissionDossierItem[]>(dossier?.itemsGroupA || []);
  const [groupB, setGroupB] = useState<AdmissionDossierItem[]>(dossier?.itemsGroupB || []);
  const [groupC, setGroupC] = useState<AdmissionDossierItem[]>(dossier?.itemsGroupC || []);

  if (!dossier) {
    return (
      <div className="bg-white p-6 rounded-xl border text-center space-y-2">
        <p>Không tìm thấy hồ sơ kết nạp.</p>
        <button onClick={onBack} className="text-xs font-bold text-red-800">Quay lại</button>
      </div>
    );
  }

  const saveUpdatedDossier = (updatedA: AdmissionDossierItem[], updatedB: AdmissionDossierItem[], updatedC: AdmissionDossierItem[]) => {
    dossier.itemsGroupA = updatedA;
    dossier.itemsGroupB = updatedB;
    dossier.itemsGroupC = updatedC;

    // Recalculate progress percentage
    const allItems = [...updatedA, ...updatedB, ...updatedC];
    const validCount = allItems.filter((i) => i.status === 'VALID').length;
    dossier.progressPercentage = allItems.length > 0 ? Math.round((validCount / allItems.length) * 100) : 0;
    dossier.updatedAt = new Date().toISOString();

    DataRepository.saveAdmissionDossier(dossier, currentUser?.email || 'admin');
  };

  const handleUpdateItemStatus = (groupKey: 'A' | 'B' | 'C', itemId: string, newStatus: DossierItemStatus) => {
    const updateList = (list: AdmissionDossierItem[]) =>
      list.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item));

    let updatedA = groupA;
    let updatedB = groupB;
    let updatedC = groupC;

    if (groupKey === 'A') { updatedA = updateList(groupA); setGroupA(updatedA); }
    if (groupKey === 'B') { updatedB = updateList(groupB); setGroupB(updatedB); }
    if (groupKey === 'C') { updatedC = updateList(groupC); setGroupC(updatedC); }

    saveUpdatedDossier(updatedA, updatedB, updatedC);
  };

  const handleFileUploadItem = (groupKey: 'A' | 'B' | 'C', itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const fileName = file.name;

    const updateList = (list: AdmissionDossierItem[]) =>
      list.map((item) =>
        item.id === itemId
          ? {
              ...item,
              attachedFileName: fileName,
              attachedFileUrl: fileUrl,
              status: item.status === 'NEEDS_SUPPLEMENT' ? 'UPLOADED' : item.status,
            }
          : item
      );

    let updatedA = groupA;
    let updatedB = groupB;
    let updatedC = groupC;

    if (groupKey === 'A') { updatedA = updateList(groupA); setGroupA(updatedA); }
    if (groupKey === 'B') { updatedB = updateList(groupB); setGroupB(updatedB); }
    if (groupKey === 'C') { updatedC = updateList(groupC); setGroupC(updatedC); }

    saveUpdatedDossier(updatedA, updatedB, updatedC);
  };

  const renderGroupTable = (title: string, groupKey: 'A' | 'B' | 'C', items: AdmissionDossierItem[]) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden space-y-2 p-4">
      <h3 className="font-extrabold text-sm text-red-900 uppercase border-b pb-2">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 font-bold text-gray-700">
              <th className="p-2.5">Mã tài liệu</th>
              <th className="p-2.5">Tên hồ sơ / Văn bản</th>
              <th className="p-2.5">Bắt buộc?</th>
              <th className="p-2.5">Trạng thái thẩm định</th>
              <th className="p-2.5">File đính kèm</th>
              <th className="p-2.5 text-center">Tải lên file</th>
              {canApprove() && <th className="p-2.5 text-center">Cập nhật trạng thái</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => {
              const attachedFile = item.files && item.files.length > 0 ? item.files[0] : null;
              return (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-2.5 font-mono font-bold text-gray-600">{item.code}</td>
                  <td className="p-2.5 font-semibold text-gray-900">{item.name || item.title}</td>
                  <td className="p-2.5 font-bold">{(item.mandatory ?? item.required) ? 'Bắt buộc' : 'Tùy chọn'}</td>
                  <td className="p-2.5">
                    <StatusBadge status={item.status} type="dossier" />
                  </td>
                  <td className="p-2.5">
                    {attachedFile ? (
                      <a
                        href={attachedFile.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 font-bold text-blue-800 hover:underline bg-blue-50 px-2 py-1 rounded border border-blue-200"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                        <span className="truncate max-w-[140px]">{attachedFile.originalName}</span>
                        <ExternalLink className="w-3 h-3 text-blue-500 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">Chưa có file</span>
                    )}
                  </td>
                  <td className="p-2.5 text-center">
                    <label className="cursor-pointer bg-slate-200 hover:bg-red-800 hover:text-white text-gray-800 font-bold px-2.5 py-1 rounded transition inline-flex items-center space-x-1">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.png,.jpg"
                        onChange={(e) => handleFileUploadItem(groupKey, item.id, e)}
                        className="hidden"
                      />
                    </label>
                  </td>
                  {canApprove() && (
                  <td className="p-2.5 text-center">
                    <select
                      value={item.status}
                      onChange={(e) => handleUpdateItemStatus(groupKey, item.id, e.target.value as DossierItemStatus)}
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
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-extrabold text-red-950 uppercase">{dossier.candidateFullName}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Hồ sơ xét kết nạp Đảng • Áp dụng quy định snapshot: <span className="font-bold text-red-900">{dossier.requirementsSnapshot.policyCode}</span>
            </p>
          </div>
        </div>

        <div className="text-right text-xs">
          <span className="font-extrabold text-red-800 text-base">{dossier.progressPercentage}%</span>
          <p className="text-[11px] text-gray-500">Mức độ hoàn thiện tổng thể</p>
        </div>
      </div>

      {/* Render 3 tables */}
      {renderGroupTable('1. Nhóm A: Hồ sơ Lý lịch & Lịch sử bản thân (Giấy giới thiệu 02 đảng viên)', 'A', groupA)}
      {renderGroupTable('2. Nhóm B: Văn bản Nghị quyết & Quyết định kết nạp', 'B', groupB)}
      {renderGroupTable('3. Nhóm C: Giấy chứng nhận học tập & Đơn tự nguyện', 'C', groupC)}
    </div>
  );
};
