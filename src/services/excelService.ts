/**
 * ExcelJS Import and Export Engine
 * Strictly handles 12-digit text formatting, merged 2-row headers, and exact source templates.
 */

import ExcelJS from 'exceljs';
import { PartyMember, ForeignTrip } from '../types';
import { formatDateVN, formatDateTimeVN, normalizeFullName, removeVietnameseAccents } from '../utils/vietnamese';

export class ExcelService {
  /**
   * Export Party Members according to exact template "Chi bộ Khoa học cơ bản_File nhập liệu 4.0 .xlsx"
   */
  static async exportPartyMembersToExcel(members: PartyMember[], exportTime = new Date()): Promise<Blob> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'QUẢN LÝ ĐẢNG VIÊN KHCB';
    workbook.lastModifiedBy = 'QUẢN LÝ ĐẢNG VIÊN KHCB';
    workbook.created = exportTime;

    const sheet = workbook.addWorksheet('DANH SÁCH ĐẢNG VIÊN', {
      views: [{ showGridLines: true }],
    });

    // Row 1: Header title
    sheet.mergeCells('A1:AE1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'DANH SÁCH THÔNG TIN ĐẢNG VIÊN TẠI CHI BỘ KHOA HỌC CƠ BẢN';
    titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFDA251D' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Row 2: Timestamp
    sheet.mergeCells('A2:AE2');
    const timeCell = sheet.getCell('A2');
    timeCell.value = `Ngày xuất dữ liệu: ${formatDateTimeVN(exportTime)}`;
    timeCell.font = { name: 'Calibri', size: 10, italic: true };
    timeCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Row 3-4: Instruction notes
    sheet.mergeCells('A3:AE4');
    const noteCell = sheet.getCell('A3');
    noteCell.value = 'Ghi chú: Các trường có dấu (*) là bắt buộc. Số định danh (CCCD), Số thẻ Đảng, Số CMND cũ được lưu ở dạng Chuỗi (Text) giữ nguyên 12 chữ số bao gồm số 0 ở đầu. Ngày hiển thị dạng dd/MM/yyyy.';
    noteCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF555555' } };
    noteCell.alignment = { vertical: 'middle', wrapText: true };

    // Row 5: Empty spacer
    sheet.getRow(5).height = 10;

    // Row 6 & 7: Merged Headers
    const headerRow1 = sheet.getRow(6);
    const headerRow2 = sheet.getRow(7);
    headerRow1.height = 25;
    headerRow2.height = 25;

    // Helper for styling headers
    const applyHeaderStyle = (cell: ExcelJS.Cell, bgHex = 'FFDA251D', fontHex = 'FFFFFFFF') => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: bgHex },
      };
      cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: fontHex } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    };

    // Single column merges (Row 6 to 7)
    const singleHeaders: [string, string][] = [
      ['A6:A7', 'STT'],
      ['B6:B7', 'ID (UUID)'],
      ['C6:C7', 'Họ và tên *'],
      ['D6:D7', 'Tên gọi khác'],
      ['E6:E7', 'Giới tính *'],
      ['F6:F7', 'Sinh ngày *'],
      ['G6:G7', 'Dân tộc *'],
      ['H6:H7', 'Tôn giáo *'],
      ['I6:I7', 'Số định danh cá nhân *'],
      ['J6:J7', 'Số thẻ Đảng *'],
      ['K6:K7', 'Nơi cấp thẻ Đảng'],
      ['L6:L7', 'Ngày cấp thẻ Đảng'],
      ['M6:M7', 'Số thẻ Đảng theo QĐ 85'],
      ['N6:N7', 'Tổ chức Đảng sinh hoạt *'],
      ['X6:X7', 'Ngày vào Đảng *'],
      ['Y6:Y7', 'Ngày chính thức *'],
      ['Z6:Z7', 'Số CMND cũ'],
      ['AA6:AA7', 'Trạng thái hoạt động *'],
      ['AB6:AB7', 'Ngày rời/mất/miễn SH'],
      ['AC6:AC7', 'Đề nghị xóa (Có/Không)'],
      ['AD6:AD7', 'Kết quả kiểm tra'],
      ['AE6:AE7', 'Chi tiết lỗi'],
    ];

    singleHeaders.forEach(([range, label]) => {
      sheet.mergeCells(range);
      const cell = sheet.getCell(range.split(':')[0]);
      cell.value = label;
      applyHeaderStyle(cell);
    });

    // Group headers
    const groupHeaders: [string, string, [string, string][]][] = [
      ['O6:Q6', 'Nơi đăng ký khai sinh', [['O7', 'Quốc gia'], ['P7', 'Tỉnh/Thành'], ['Q7', 'Chi tiết']]],
      ['R6:T6', 'Quê quán', [['R7', 'Quốc gia'], ['S7', 'Tỉnh/Thành'], ['T7', 'Chi tiết']]],
      ['U6:W6', 'Thường trú', [['U7', 'Quốc gia'], ['V7', 'Tỉnh/Thành'], ['W7', 'Chi tiết']]],
    ];

    groupHeaders.forEach(([range, mainLabel, subCols]) => {
      sheet.mergeCells(range);
      const mainCell = sheet.getCell(range.split(':')[0]);
      mainCell.value = mainLabel;
      applyHeaderStyle(mainCell, 'FFB71C1C');

      subCols.forEach(([cellRef, subLabel]) => {
        const subCell = sheet.getCell(cellRef);
        subCell.value = subLabel;
        applyHeaderStyle(subCell, 'FFC62828');
      });
    });

    // Populate data rows starting row 8
    members.forEach((m, idx) => {
      const rowIndex = 8 + idx;
      const row = sheet.getRow(rowIndex);

      const values = [
        idx + 1,
        m.id,
        m.fullName,
        m.otherName || '',
        m.gender,
        formatDateVN(m.dateOfBirth),
        m.ethnicityName,
        m.religionName,
        String(m.personalId || ''),
        String(m.partyCardNumber || ''),
        m.partyCardIssuer || '',
        formatDateVN(m.partyCardIssueDate),
        String(m.partyCardDecision85Number || ''),
        m.partyOrganization,
        m.birthRegistration.country,
        m.birthRegistration.province,
        m.birthRegistration.detail,
        m.hometown.country,
        m.hometown.province,
        m.hometown.detail,
        m.permanentResidence.country,
        m.permanentResidence.province,
        m.permanentResidence.detail,
        formatDateVN(m.partyAdmissionDate),
        formatDateVN(m.officialPartyDate),
        String(m.oldIdentityNumber || ''),
        m.activityStatus,
        formatDateVN(m.activityEndDate),
        m.deleteRequested ? 'Có' : 'Không',
        m.validationResult || 'HỢP LỆ',
        m.validationDetails || '',
      ];

      row.values = values;

      // Formatting text columns (I, J, M, Z) as explicit string text
      const textCols = [9, 10, 13, 26]; // I, J, M, Z
      textCols.forEach((colIdx) => {
        const cell = row.getCell(colIdx);
        cell.numFmt = '@';
        cell.value = String(values[colIdx - 1] || '');
      });

      row.eachCell((cell) => {
        cell.font = { name: 'Calibri', size: 10 };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        };
      });
    });

    // Set auto column widths
    sheet.columns.forEach((col) => {
      let maxLen = 12;
      col.eachCell?.({ includeEmpty: false }, (cell) => {
        const len = String(cell.value || '').length;
        if (len > maxLen) maxLen = Math.min(len, 40);
      });
      col.width = maxLen + 3;
    });

    // Add hidden dictionary sheets (QUOCGIA, TINH, DANTOC, TONGIAO)
    const hiddenRefSheets = ['QUOCGIA', 'TINH', 'DANTOC', 'TONGIAO'];
    hiddenRefSheets.forEach((sName) => {
      const refSheet = workbook.addWorksheet(sName);
      refSheet.state = 'hidden';
      refSheet.addRow(['Mã', 'Tên']);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  /**
   * Export Foreign Trips matching exact layout of "cong tac dang.xlsx"
   */
  static async exportForeignTripsToExcel(trips: ForeignTrip[], exportTime = new Date()): Promise<Blob> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('DANH SÁCH ĐI NƯỚC NGOÀI', { views: [{ showGridLines: true }] });

    // Title & instructions
    sheet.mergeCells('A2:M2');
    const title = sheet.getCell('A2');
    title.value = 'DANH SÁCH ĐẢNG VIÊN ĐI NƯỚC NGOÀI VÀ NHÂN THÂN Ở NƯỚC NGOÀI';
    title.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFDA251D' } };
    title.alignment = { horizontal: 'center', vertical: 'middle' };

    sheet.mergeCells('A3:M3');
    const note = sheet.getCell('A3');
    note.value = `Chi bộ Khoa học cơ bản - Ngày xuất: ${formatDateTimeVN(exportTime)}`;
    note.font = { name: 'Calibri', size: 10, italic: true };
    note.alignment = { horizontal: 'center', vertical: 'middle' };

    // 2-Tier Header Row 5 & 6
    const applyHStyle = (cell: ExcelJS.Cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDA251D' } };
      cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    };

    const singleMerges: [string, string][] = [
      ['A5:A6', 'STT'],
      ['B5:B6', 'Họ tên'],
      ['C5:C6', 'MSCB'],
      ['K5:K6', 'Ngày đi'],
      ['L5:L6', 'Ngày về'],
      ['M5:M6', 'Nơi đến'],
    ];

    singleMerges.forEach(([range, label]) => {
      sheet.mergeCells(range);
      const cell = sheet.getCell(range.split(':')[0]);
      cell.value = label;
      applyHStyle(cell);
    });

    // Group merges
    sheet.mergeCells('D5:G5');
    const grp1 = sheet.getCell('D5');
    grp1.value = 'Nội dung đi nước ngoài';
    applyHStyle(grp1);

    const subCols1: [string, string][] = [
      ['D6', 'Học tập'],
      ['E6', 'Nghiên cứu'],
      ['F6', 'Đi công tác'],
      ['G6', 'Công việc riêng'],
    ];
    subCols1.forEach(([ref, val]) => {
      const cell = sheet.getCell(ref);
      cell.value = val;
      applyHStyle(cell);
    });

    sheet.mergeCells('H5:J5');
    const grp2 = sheet.getCell('H5');
    grp2.value = 'Nhân thân ở nước ngoài';
    applyHStyle(grp2);

    const subCols2: [string, string][] = [
      ['H6', 'Cha'],
      ['I6', 'Mẹ'],
      ['J6', 'Người thân'],
    ];
    subCols2.forEach(([ref, val]) => {
      const cell = sheet.getCell(ref);
      cell.value = val;
      applyHStyle(cell);
    });

    // Populate rows starting row 7
    trips.forEach((t, idx) => {
      const rIdx = 7 + idx;
      const row = sheet.getRow(rIdx);

      const hasPurpose = (p: string) => (t.purposes.includes(p as any) ? 'X' : '');
      const hasRelative = (r: string) => (t.relativesAbroard.includes(r as any) ? 'X' : '');

      row.values = [
        idx + 1,
        t.memberFullName,
        String(t.staffCode || ''),
        hasPurpose('Học tập'),
        hasPurpose('Nghiên cứu'),
        hasPurpose('Đi công tác'),
        hasPurpose('Công việc riêng'),
        hasRelative('Cha'),
        hasRelative('Mẹ'),
        hasRelative('Người thân'),
        formatDateVN(t.startDate),
        formatDateVN(t.endDate),
        t.destinationCountry,
      ];

      row.eachCell((cell) => {
        cell.font = { name: 'Calibri', size: 10 };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });
      // Center X columns
      [4, 5, 6, 7, 8, 9, 10, 11, 12].forEach((colI) => {
        row.getCell(colI).alignment = { horizontal: 'center', vertical: 'middle' };
      });
    });

    sheet.columns.forEach((col) => {
      col.width = 16;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  /**
   * Parse uploaded Excel workbook and return array of objects or validation errors
   */
  static async parsePartyMembersExcel(fileBuffer: ArrayBuffer): Promise<{
    parsedData: Partial<PartyMember>[];
    errors: Array<{ row: number; field: string; value: string; error: string }>;
  }> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);
    const sheet = workbook.worksheets[0];

    const parsedData: Partial<PartyMember>[] = [];
    const errors: Array<{ row: number; field: string; value: string; error: string }> = [];

    if (!sheet) return { parsedData, errors };

    // Find row index where data starts (usually row 8 if template)
    let startRow = 8;
    sheet.eachRow((row, rowNumber) => {
      const col3 = String(row.getCell(3).value || '').trim();
      if (col3 === 'Họ và tên *' || col3.includes('Họ và tên')) {
        startRow = rowNumber + 1;
        // if row 6 was group header and row 7 was sub header
        if (sheet.getRow(rowNumber + 1).getCell(3).value) {
          startRow = rowNumber + 1;
        }
      }
    });

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber < startRow) return;

      const getCellStr = (colIdx: number): string => {
        const val = row.getCell(colIdx).value;
        if (val === null || val === undefined) return '';
        if (typeof val === 'object' && 'text' in val) return String(val.text).trim();
        return String(val).trim();
      };

      const fullName = getCellStr(3);
      if (!fullName) return; // Empty row

      const personalId = getCellStr(9);
      const partyCardNumber = getCellStr(10);

      if (personalId && personalId.length !== 12) {
        errors.push({
          row: rowNumber,
          field: 'CCCD',
          value: personalId,
          error: 'Số định danh cá nhân phải đủ 12 chữ số.',
        });
      }

      if (partyCardNumber && partyCardNumber.length !== 12) {
        errors.push({
          row: rowNumber,
          field: 'Thẻ Đảng',
          value: partyCardNumber,
          error: 'Số thẻ Đảng phải đủ 12 chữ số.',
        });
      }

      const item: Partial<PartyMember> = {
        fullName: normalizeFullName(fullName),
        normalizedName: removeVietnameseAccents(fullName),
        otherName: getCellStr(4),
        gender: (getCellStr(5) as any) || 'Nam',
        dateOfBirth: getCellStr(6) || '01/01/1990',
        ethnicityName: getCellStr(7) || 'Kinh',
        religionName: getCellStr(8) || 'Không',
        personalId: personalId || '000000000000',
        partyCardNumber: partyCardNumber || '000000000000',
        partyCardIssuer: getCellStr(11),
        partyCardIssueDate: getCellStr(12),
        partyCardDecision85Number: getCellStr(13),
        partyOrganization: getCellStr(14) || 'Chi bộ Khoa học cơ bản',
        birthRegistration: {
          country: getCellStr(15) || 'Việt Nam',
          province: getCellStr(16) || 'Cần Thơ',
          detail: getCellStr(17) || '',
        },
        hometown: {
          country: getCellStr(18) || 'Việt Nam',
          province: getCellStr(19) || 'Cần Thơ',
          detail: getCellStr(20) || '',
        },
        permanentResidence: {
          country: getCellStr(21) || 'Việt Nam',
          province: getCellStr(22) || 'Cần Thơ',
          detail: getCellStr(23) || '',
        },
        partyAdmissionDate: getCellStr(24) || '01/01/2020',
        officialPartyDate: getCellStr(25),
        oldIdentityNumber: getCellStr(26),
        activityStatus: (getCellStr(27) as any) || 'Đang sinh hoạt Đảng',
        activityEndDate: getCellStr(28),
        deleteRequested: getCellStr(29).toLowerCase() === 'có',
      };

      parsedData.push(item);
    });

    return { parsedData, errors };
  }

  /**
   * Parse uploaded Foreign Trips Excel file
   */
  static async parseForeignTripsExcel(fileBuffer: ArrayBuffer): Promise<{
    parsedData: Partial<ForeignTrip>[];
    errors: Array<{ row: number; field: string; value: string; error: string }>;
  }> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);
    const sheet = workbook.worksheets[0];

    const parsedData: Partial<ForeignTrip>[] = [];
    const errors: Array<{ row: number; field: string; value: string; error: string }> = [];

    if (!sheet) return { parsedData, errors };

    let startRow = 7;
    sheet.eachRow((row, rowNumber) => {
      const col2 = String(row.getCell(2).value || '').trim();
      if (col2 === 'Họ tên' || col2.includes('Họ tên')) {
        startRow = rowNumber + 1;
        if (sheet.getRow(rowNumber + 1).getCell(2).value && String(sheet.getRow(rowNumber + 1).getCell(2).value).includes('Học tập')) {
          startRow = rowNumber + 2;
        }
      }
    });

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber < startRow) return;

      const getCellStr = (colIdx: number): string => {
        const val = row.getCell(colIdx).value;
        if (val === null || val === undefined) return '';
        if (typeof val === 'object' && 'text' in val) return String(val.text).trim();
        return String(val).trim();
      };

      const fullName = getCellStr(2);
      if (!fullName || fullName.toLowerCase().includes('họ tên') || fullName.toLowerCase().includes('stt')) return;

      const staffCode = getCellStr(3);
      const isX = (v: string) => ['x', '1', 'có', 'true', 'v', '✓', 'x'].includes(v.toLowerCase());

      const purposes: any[] = [];
      if (isX(getCellStr(4))) purposes.push('Học tập');
      if (isX(getCellStr(5))) purposes.push('Nghiên cứu');
      if (isX(getCellStr(6))) purposes.push('Đi công tác');
      if (isX(getCellStr(7))) purposes.push('Công việc riêng');
      if (purposes.length === 0) purposes.push('Đi công tác');

      const relatives: any[] = [];
      if (isX(getCellStr(8))) relatives.push('Cha');
      if (isX(getCellStr(9))) relatives.push('Mẹ');
      if (isX(getCellStr(10))) relatives.push('Người thân');

      const startDate = getCellStr(11) || '01/01/2026';
      const endDate = getCellStr(12) || '10/01/2026';
      const destinationCountry = getCellStr(13) || 'Chưa rõ quốc gia';

      parsedData.push({
        memberFullName: normalizeFullName(fullName),
        staffCode: staffCode || '000000',
        purposes,
        relativesAbroard: relatives,
        startDate,
        endDate,
        destinationCountry,
        approvalStatus: 'APPROVED',
        tripStatus: 'UPCOMING',
      });
    });

    return { parsedData, errors };
  }
}
