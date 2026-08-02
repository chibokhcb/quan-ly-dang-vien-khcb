import React from 'react';
import { DataRepository } from '../services/repository';
import { ExcelService } from '../services/excelService';
import { BarChart3, FileSpreadsheet, Download, CheckCircle } from 'lucide-react';

export const Reports: React.FC = () => {
  const members = DataRepository.getPartyMembers();
  const trips = DataRepository.getForeignTrips();

  const handleExportMembers = async () => {
    const blob = await ExcelService.exportPartyMembersToExcel(members);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao_cao_Dang_vien_KHCB_${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
  };

  const handleExportTrips = async () => {
    const blob = await ExcelService.exportForeignTripsToExcel(trips);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bao_cao_Di_nuoc_ngoai_KHCB_${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <h2 className="text-lg font-bold text-red-900 uppercase flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-red-800" />
          <span>Thống kê & Xuất Báo cáo Excel Chuẩn hóa</span>
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Kết xuất báo cáo định kỳ theo đúng mẫu 2 dòng header và giữ nguyên chuỗi 12 số CCCD / Thẻ Đảng
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Report 1 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 text-red-800 rounded-lg flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">Báo cáo Tổng hợp Danh sách Đảng viên</h3>
              <p className="text-xs text-gray-500">Mẫu gốc File nhập liệu 4.0 Chi bộ KHCB</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Gồm đầy đủ 11 thông tin tiêu chuẩn: CCCD 12 số, Thẻ Đảng 12 số, Địa chỉ 2 cấp, Ngày vào Đảng, Trạng thái sinh hoạt.
          </p>
          <button
            onClick={handleExportMembers}
            className="w-full bg-red-800 hover:bg-red-900 text-white font-bold py-2.5 rounded-lg text-xs transition flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Tải tệp Excel báo cáo ({members.length} đảng viên)</span>
          </button>
        </div>

        {/* Report 2 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-800 rounded-lg flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">Báo cáo Công tác Đi nước ngoài</h3>
              <p className="text-xs text-gray-500">Mẫu chuẩn cong tac dang.xlsx</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Kết xuất đa cột checkbox mục đích (Học tập, Nghiên cứu, Công tác, Việc riêng) và nhân thân ở nước ngoài.
          </p>
          <button
            onClick={handleExportTrips}
            className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-2.5 rounded-lg text-xs transition flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Tải tệp Excel báo cáo ({trips.length} lượt)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
