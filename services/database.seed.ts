import { createCaregiver } from './caregiver.repository';
import { createElderlyProfile } from './elderly.repository';
import { createAppointment } from './appointment.repository';
import { createReview } from './review.repository';
import { openDatabase } from './database.service';

/**
 * Seed sample caregivers
 */
export const seedCaregivers = async (): Promise<string[]> => {
  await openDatabase();
  
  const caregiverIds: string[] = [];
  
  const caregivers = [
    {
      name: 'Trần Văn Nam',
      age: 35,
      gender: 'male' as const,
      avatar: 'https://via.placeholder.com/150',
      phone: '0901234567',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      experience_years: 8,
      rating: 4.8,
      total_reviews: 156,
      hourly_rate: 50000,
      specializations: ['Chăm sóc người già', 'Vật lý trị liệu', 'Chế độ ăn dinh dưỡng'],
      certificates: ['Chứng chỉ điều dưỡng viên', 'Chứng chỉ sơ cấp cứu'],
      languages: ['Tiếng Việt', 'Tiếng Anh'],
      bio: 'Tôi có 8 năm kinh nghiệm chăm sóc người cao tuổi với sự tận tâm và chu đáo.',
      is_verified: true,
      is_available: true,
    },
    {
      name: 'Nguyễn Thị Mai',
      age: 28,
      gender: 'female' as const,
      avatar: 'https://via.placeholder.com/150',
      phone: '0912345678',
      address: '456 Đường XYZ, Quận 2, TP.HCM',
      experience_years: 5,
      rating: 4.5,
      total_reviews: 89,
      hourly_rate: 45000,
      specializations: ['Chăm sóc người già', 'Massage trị liệu'],
      certificates: ['Chứng chỉ điều dưỡng viên'],
      languages: ['Tiếng Việt'],
      bio: 'Nhiệt tình, chu đáo, có kinh nghiệm chăm sóc người cao tuổi.',
      is_verified: true,
      is_available: true,
    },
    {
      name: 'Phạm Văn Hùng',
      age: 42,
      gender: 'male' as const,
      avatar: 'https://via.placeholder.com/150',
      phone: '0923456789',
      address: '789 Đường DEF, Quận 3, TP.HCM',
      experience_years: 12,
      rating: 4.9,
      total_reviews: 234,
      hourly_rate: 60000,
      specializations: ['Chăm sóc người già', 'Vật lý trị liệu', 'Y tá'],
      certificates: ['Bằng điều dưỡng', 'Chứng chỉ vật lý trị liệu', 'Chứng chỉ sơ cấp cứu'],
      languages: ['Tiếng Việt', 'Tiếng Anh', 'Tiếng Pháp'],
      bio: 'Với hơn 12 năm kinh nghiệm, tôi cam kết mang đến dịch vụ chăm sóc chất lượng cao nhất.',
      is_verified: true,
      is_available: true,
    },
  ];
  
  for (const caregiver of caregivers) {
    const id = await createCaregiver(caregiver);
    caregiverIds.push(id);
  }
  
  console.log('✅ Seeded caregivers successfully');
  return caregiverIds;
};

/**
 * Seed sample elderly profiles
 */
export const seedElderlyProfiles = async (userId: string): Promise<string[]> => {
  await openDatabase();
  
  const profileIds: string[] = [];
  
  const profiles = [
    {
      user_id: userId,
      name: 'Bà Nguyễn Thị Lan',
      age: 75,
      gender: 'female' as const,
      avatar: 'https://via.placeholder.com/150',
      address: '123 Lê Lợi, P. Bến Thành, Q.1, TP.HCM',
      phone: '0901234567',
      blood_type: 'O+',
      health_condition: 'Tiểu đường, Huyết áp cao',
      underlying_diseases: ['Tiểu đường type 2', 'Huyết áp cao'],
      medications: [
        { name: 'Metformin 500mg', dosage: '1 viên', frequency: '2 lần/ngày (sáng, tối)' },
        { name: 'Losartan 50mg', dosage: '1 viên', frequency: '1 lần/ngày (sáng)' },
      ],
      allergies: ['Penicillin'],
      special_conditions: ['Cần theo dõi đường huyết thường xuyên', 'Chế độ ăn ít muối, ít đường'],
      independence_level: {
        eating: 'assisted' as const,
        bathing: 'dependent' as const,
        mobility: 'assisted' as const,
        toileting: 'assisted' as const,
        dressing: 'dependent' as const,
      },
      living_environment: {
        houseType: 'apartment' as const,
        livingWith: ['Con trai', 'Con dâu'],
        accessibility: ['Có thang máy', 'Không có bậc thềm', 'Tay vịn phòng tắm'],
      },
      hobbies: ['Nghe nhạc trữ tình', 'Xem truyền hình', 'Làm vườn'],
      favorite_activities: ['Trò chuyện', 'Đọc báo'],
      food_preferences: ['Cháo', 'Rau luộc', 'Cá hấp'],
      emergency_contact: {
        name: 'Nguyễn Văn A',
        relationship: 'Con trai',
        phone: '0912345678',
      },
    },
    {
      user_id: userId,
      name: 'Ông Trần Văn Bình',
      age: 82,
      gender: 'male' as const,
      avatar: 'https://via.placeholder.com/150',
      address: '456 Nguyễn Huệ, P. Bến Nghé, Q.1, TP.HCM',
      phone: '0902345678',
      blood_type: 'A+',
      health_condition: 'Suy tim, Tiểu đường',
      underlying_diseases: ['Suy tim độ 2', 'Tiểu đường type 2'],
      medications: [
        { name: 'Digoxin 0.25mg', dosage: '1 viên', frequency: '1 lần/ngày (sáng)' },
        { name: 'Insulin', dosage: '10 đơn vị', frequency: '2 lần/ngày (sáng, tối)' },
      ],
      allergies: ['Aspirin'],
      special_conditions: ['Cần theo dõi nhịp tim', 'Kiểm tra đường huyết 3 lần/ngày'],
      independence_level: {
        eating: 'independent' as const,
        bathing: 'assisted' as const,
        mobility: 'assisted' as const,
        toileting: 'independent' as const,
        dressing: 'assisted' as const,
      },
      living_environment: {
        houseType: 'private_house' as const,
        livingWith: ['Vợ'],
        accessibility: ['Có lan can', 'Phòng tắm có ghế ngồi'],
      },
      hobbies: ['Đọc sách', 'Chơi cờ'],
      favorite_activities: ['Tản bộ buổi sáng', 'Nghe radio'],
      food_preferences: ['Cơm trắng', 'Thịt luộc', 'Canh rau'],
      emergency_contact: {
        name: 'Trần Thị B',
        relationship: 'Vợ',
        phone: '0903456789',
      },
    },
  ];
  
  for (const profile of profiles) {
    const id = await createElderlyProfile(profile);
    profileIds.push(id);
  }
  
  console.log('✅ Seeded elderly profiles successfully');
  return profileIds;
};

/**
 * Seed sample appointments
 */
export const seedAppointments = async (
  userId: string, 
  elderlyProfileIds: string[], 
  caregiverIds: string[]
): Promise<string[]> => {
  await openDatabase();
  
  const appointmentIds: string[] = [];
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const appointments = [
    {
      user_id: userId,
      caregiver_id: caregiverIds[0],
      elderly_profile_id: elderlyProfileIds[0],
      booking_type: 'immediate' as const,
      status: 'in-progress' as const,
      package_type: 'Gói Cao Cấp',
      start_date: today.toISOString().split('T')[0],
      start_time: '08:00',
      end_time: '16:00',
      duration: '8 giờ',
      work_location: '123 Lê Lợi, P. Bến Thành, Q.1, TP.HCM',
      tasks: [
        { id: 'T1', name: 'Đo huyết áp và đường huyết', completed: true, time: '08:00', required: true },
        { id: 'T2', name: 'Hỗ trợ vệ sinh cá nhân', completed: true, time: '08:30', required: true },
        { id: 'T3', name: 'Chuẩn bị bữa sáng', completed: false, time: '09:00', required: true },
      ],
      total_amount: 400000,
      payment_status: 'pending' as const,
    },
    {
      user_id: userId,
      caregiver_id: caregiverIds[1],
      elderly_profile_id: elderlyProfileIds[1],
      booking_type: 'schedule' as const,
      status: 'confirmed' as const,
      package_type: 'Gói Chuyên Nghiệp',
      start_date: tomorrow.toISOString().split('T')[0],
      start_time: '14:00',
      end_time: '18:00',
      duration: '4 giờ',
      work_location: '456 Nguyễn Huệ, P. Bến Nghé, Q.1, TP.HCM',
      tasks: [],
      total_amount: 180000,
      payment_status: 'pending' as const,
    },
  ];
  
  for (const appointment of appointments) {
    const id = await createAppointment(appointment);
    appointmentIds.push(id);
  }
  
  console.log('✅ Seeded appointments successfully');
  return appointmentIds;
};

/**
 * Seed sample reviews
 */
export const seedReviews = async (
  userId: string,
  appointmentIds: string[],
  caregiverIds: string[]
) => {
  await openDatabase();
  
  const reviews = [
    {
      appointment_id: appointmentIds[0] || 'apt_1',
      user_id: userId,
      caregiver_id: caregiverIds[0],
      rating: 5,
      comment: 'Rất hài lòng với dịch vụ, nhân viên tận tâm và chu đáo!',
    },
  ];
  
  for (const review of reviews) {
    await createReview(review);
  }
  
  console.log('✅ Seeded reviews successfully');
};

/**
 * Seed all data
 */
export const seedAllData = async (userId: string) => {
  const caregiverIds = await seedCaregivers();
  const elderlyProfileIds = await seedElderlyProfiles(userId);
  const appointmentIds = await seedAppointments(userId, elderlyProfileIds, caregiverIds);
  await seedReviews(userId, appointmentIds, caregiverIds);
  console.log('✅ All data seeded successfully');
};

export default {
  seedCaregivers,
  seedElderlyProfiles,
  seedAppointments,
  seedReviews,
  seedAllData,
};
