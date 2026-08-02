import React from 'react';

type PartyLogoSize = 'sm' | 'md' | 'lg' | 'xl';
type PartyLogoVariant = 'badge' | 'flag';

interface PartyLogoProps {
  className?: string;
  size?: PartyLogoSize;
  /**
   * badge: biểu tượng dùng trong giao diện phần mềm.
   * flag: Đảng kỳ đúng tỷ lệ 3:2.
   */
  variant?: PartyLogoVariant;
}

/**
 * Đường nét Búa - Liềm được dựng lại từ mẫu tham chiếu chuẩn, không dùng
 * búa có mỏ nhổ đinh, không tạo gradient và không làm biến dạng biểu tượng.
 */
const HAMMER_AND_SICKLE_PATH =
  'M 308 49 L 284 28 L 256 12 L 225 2 L 199 0 L 226 15 L 246 30 L 262 47 L 273 62 L 286 87 L 294 112 L 297 132 L 297 153 L 292 179 L 283 199 L 182 98 L 199 80 L 219 62 L 196 39 L 185 45 L 175 48 L 147 50 L 135 60 L 85 111 L 73 121 L 73 123 L 113 164 L 115 164 L 144 135 L 245 236 L 244 238 L 217 248 L 202 251 L 183 251 L 159 248 L 133 240 L 114 231 L 93 217 L 76 202 L 45 227 L 0 267 L 2 271 L 26 298 L 78 253 L 101 271 L 122 284 L 145 294 L 161 298 L 181 301 L 206 301 L 220 299 L 255 289 L 283 274 L 310 301 L 347 264 L 321 237 L 334 212 L 344 183 L 347 167 L 347 134 L 342 109 L 336 92 L 325 71 Z';

const BADGE_SIZE_CLASSES: Record<PartyLogoSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const FLAG_SIZE_CLASSES: Record<PartyLogoSize, string> = {
  sm: 'w-9 h-6',
  md: 'w-12 h-8',
  lg: 'w-[60px] h-10',
  xl: 'w-[72px] h-12',
};

const PARTY_RED = '#DA251D';
const PARTY_YELLOW = '#FFCD00';

export const PartyLogo: React.FC<PartyLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'badge',
}) => {
  const sizeClass =
    variant === 'flag' ? FLAG_SIZE_CLASSES[size] : BADGE_SIZE_CLASSES[size];

  if (variant === 'flag') {
    return (
      <div
        className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden ${sizeClass} ${className}`}
      >
        <svg
          viewBox="0 0 150 100"
          className="block h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Đảng kỳ Đảng Cộng sản Việt Nam"
          preserveAspectRatio="xMidYMid meet"
          shapeRendering="geometricPrecision"
        >
          <title>Đảng kỳ Đảng Cộng sản Việt Nam</title>
          <rect width="150" height="100" fill={PARTY_RED} />
          <path
            d={HAMMER_AND_SICKLE_PATH}
            transform="translate(45 23.97) scale(0.172414)"
            fill={PARTY_YELLOW}
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center ${sizeClass} ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="block h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Biểu tượng Đảng Cộng sản Việt Nam"
        preserveAspectRatio="xMidYMid meet"
        shapeRendering="geometricPrecision"
      >
        <title>Biểu tượng Đảng Cộng sản Việt Nam</title>

        {/* Nền đỏ tươi, biểu tượng Búa - Liềm màu vàng tươi. */}
        <rect x="2" y="2" width="96" height="96" rx="17" fill={PARTY_RED} />

        {/* Giữ nguyên tỷ lệ và hướng của mẫu Búa - Liềm; không thêm hiệu ứng 3D. */}
        <path
          d={HAMMER_AND_SICKLE_PATH}
          transform="translate(10.88 16.78) scale(0.225)"
          fill={PARTY_YELLOW}
        />
      </svg>
    </div>
  );
};
