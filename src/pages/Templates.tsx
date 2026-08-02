import React from 'react';
import { FileText, Download, FileCheck, BookOpen } from 'lucide-react';

export const Templates: React.FC = () => {
  const formTemplates = [
    {
      code: 'BM-01',
      title: 'Lý lịch của người xin vào Đảng (Mẫu 2-ĐC)',
      description: 'Khai đầy đủ lịch sử bản thân, gia đình theo Hướng dẫn 06-HD/TW',
      category: 'Hồ sơ kết nạp',
    },
    {
      code: 'BM-02',
      title: 'Đơn xin vào Đảng (Viết tay)',
      description: 'Mẫu đơn tự nguyện xin gia nhập Đảng Cộng sản Việt Nam',
      category: 'Hồ sơ kết nạp',
    },
    {
      code: 'BM-03',
      title: 'Giấy giới thiệu người vào Đảng (02 Đảng viên chính thức)',
      description: 'Mẫu nhận xét và giới thiệu của 02 đảng viên được phân công phân công hướng dẫn',
      category: 'Hồ sơ kết nạp',
    },
    {
      code: 'BM-04',
      title: 'Nghị quyết giới thiệu của Đoàn TNCS / Công đoàn',
      description: 'Mẫu nghị quyết của tổ chức đoàn thể quần chúng xuất sắc',
      category: 'Hồ sơ kết nạp',
    },
    {
      code: 'BM-05',
      title: 'Bản tự kiểm điểm của Đảng viên dự bị (Mẫu 10-KNĐ)',
      description: 'Kiểm điểm 12 tháng rèn luyện, phấn đấu trước khi xét công nhận chính thức',
      category: 'Công nhận chính thức',
    },
    {
      code: 'BM-06',
      title: 'Bản nhận xét đảng viên dự bị của Người hướng dẫn',
      description: 'Nhận xét chi tiết ưu nhược điểm sau 12 tháng rèn luyện',
      category: 'Công nhận chính thức',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <h2 className="text-lg font-bold text-red-900 uppercase flex items-center space-x-2">
          <FileText className="w-5 h-5 text-red-800" />
          <span>Biểu mẫu & Tài liệu Mẫu Công tác Đảng</span>
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Tải xuống biểu mẫu chuẩn hóa theo Quy định 208-QĐ/TW & Hướng dẫn 06-HD/TW của Ban Tổ chức Trung ương
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {formTemplates.map((tpl) => (
          <div key={tpl.code} className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold bg-red-100 text-red-900 px-2 py-0.5 rounded uppercase">
                  {tpl.code} • {tpl.category}
                </span>
                <h3 className="font-bold text-sm text-gray-900 mt-1">{tpl.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{tpl.description}</p>
              </div>
            </div>

            <button
              onClick={() => alert(`Tải xuống biểu mẫu ${tpl.code} định dạng Word/PDF chuẩn`)}
              className="w-full bg-slate-100 hover:bg-red-800 hover:text-white font-bold py-2 rounded-lg text-xs transition flex items-center justify-center space-x-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Tải biểu mẫu (.docx)</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
