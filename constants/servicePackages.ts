export interface ServicePackage {
  id: string;
  name: string;
  duration: number; // in hours
  price: number; // in VND
  services: string[];
}

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: 'basic',
    name: 'Gói cơ bản',
    duration: 4,
    price: 400000,
    services: ['Tắm rửa', 'Cho ăn', 'Massage cơ bản', 'Trò chuyện cùng bệnh nhân']
  },
  {
    id: 'standard',
    name: 'Gói chuyên nghiệp',
    duration: 8,
    price: 750000,
    services: ['Tập vật lý trị liệu', 'Massage phục hồi chức năng', 'Theo dõi tiến trình']
  },
  {
    id: 'premium',
    name: 'Gói nâng cao',
    duration: 8,
    price: 1100000,
    services: ['Tất cả dịch vụ cơ bản', 'Nấu ăn', 'Dọn dẹp', 'Hỗ trợ y tế']
  }
];

// Helper function to get package by ID
export const getPackageById = (id: string): ServicePackage | undefined => {
  return SERVICE_PACKAGES.find(pkg => pkg.id === id);
};

// Helper function to format price
export const formatPrice = (price: number): string => {
  return `${price.toLocaleString('vi-VN')} VNĐ`;
};

