# SQLite Database for Care Seeker

Hệ thống database SQLite hoàn chỉnh cho ứng dụng Care Seeker.

## 📚 Cấu trúc

```
services/
├── database.service.ts      # Khởi tạo và quản lý database
├── database.types.ts         # Type definitions cho tất cả entities
├── database.seed.ts          # Seed data mẫu
├── database.index.ts         # Export tất cả services
├── elderly.repository.ts     # CRUD cho elderly profiles
├── caregiver.repository.ts   # CRUD cho caregivers
└── appointment.repository.ts # CRUD cho appointments

hooks/
├── useDatabase.ts            # Hook khởi tạo database
└── useDatabaseEntities.ts    # Hooks cho các entities
```

## 🚀 Cài đặt

Database đã được cài đặt với `expo-sqlite`. Không cần cài thêm.

## 📖 Sử dụng

### 1. Khởi tạo Database trong App

Trong file `app/_layout.tsx` hoặc root layout:

```typescript
import { useDatabase } from '@/hooks/useDatabase';

export default function RootLayout() {
  const { isReady, error } = useDatabase();

  if (!isReady) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return <YourApp />;
}
```

### 2. Seed Data (Chỉ dùng cho development/testing)

```typescript
import { useDatabaseSeeder } from '@/hooks/useDatabase';

const userId = 'user_123'; // Get from Auth Context
const shouldSeed = __DEV__; // Only seed in development

const { isSeeding, isSeeded } = useDatabaseSeeder(userId, shouldSeed);
```

### 3. Sử dụng Hooks trong Components

#### a. Quản lý Elderly Profiles

```typescript
import { useElderlyProfiles } from '@/hooks/useDatabaseEntities';

function ElderlyListScreen() {
  const userId = 'user_123'; // From Auth Context
  const { profiles, loading, addProfile, updateProfile, deleteProfile } = useElderlyProfiles(userId);

  if (loading) return <LoadingSpinner />;

  return (
    <View>
      {profiles.map(profile => (
        <ProfileCard key={profile.id} profile={profile} />
      ))}
    </View>
  );
}
```

#### b. Quản lý Caregivers

```typescript
import { useCaregivers } from '@/hooks/useDatabaseEntities';

function CaregiverSearchScreen() {
  const { caregivers, loading, searchCaregivers, filterByRating } = useCaregivers();

  const handleSearch = (term: string) => {
    searchCaregivers(term);
  };

  return (
    <View>
      <SearchBar onSearch={handleSearch} />
      {caregivers.map(caregiver => (
        <CaregiverCard key={caregiver.id} caregiver={caregiver} />
      ))}
    </View>
  );
}
```

#### c. Quản lý Appointments

```typescript
import { useAppointments } from '@/hooks/useDatabaseEntities';

function AppointmentsScreen() {
  const userId = 'user_123'; // From Auth Context
  const { 
    appointments, 
    loading, 
    getTodayAppointments,
    createAppointment,
    updateStatus 
  } = useAppointments(userId);

  return (
    <View>
      {appointments.map(apt => (
        <AppointmentCard key={apt.id} appointment={apt} />
      ))}
    </View>
  );
}
```

### 4. Sử dụng Repository Functions trực tiếp

```typescript
import * as ElderlyRepository from '@/services/elderly.repository';
import * as CaregiverRepository from '@/services/caregiver.repository';
import * as AppointmentRepository from '@/services/appointment.repository';

// Elderly
const profiles = await ElderlyRepository.getAllElderlyProfiles(userId);
const profile = await ElderlyRepository.getElderlyProfileById(id);
const newId = await ElderlyRepository.createElderlyProfile(data);
await ElderlyRepository.updateElderlyProfile(id, data);
await ElderlyRepository.deleteElderlyProfile(id);

// Caregivers
const caregivers = await CaregiverRepository.getAllCaregivers();
const available = await CaregiverRepository.getAvailableCaregivers();
const filtered = await CaregiverRepository.getCaregiversByRating(4.5);

// Appointments
const appointments = await AppointmentRepository.getAllAppointments(userId);
const today = await AppointmentRepository.getTodayAppointments(userId);
const upcoming = await AppointmentRepository.getUpcomingAppointments(userId);
await AppointmentRepository.updateAppointmentStatus(id, 'completed');
```

## 📊 Database Schema

### elderly_profiles
- id, user_id, name, age, gender, avatar, address, phone
- blood_type, health_condition, underlying_diseases (JSON)
- medications (JSON), allergies (JSON), special_conditions (JSON)
- independence_level (JSON), living_environment (JSON)
- hobbies (JSON), favorite_activities (JSON), food_preferences (JSON)
- emergency_contact (JSON)
- created_at, updated_at

### caregivers
- id, name, age, gender, avatar, phone, address
- experience_years, rating, total_reviews, hourly_rate
- specializations (JSON), certificates (JSON), languages (JSON)
- bio, is_verified, is_available
- created_at, updated_at

### appointments
- id, user_id, caregiver_id, elderly_profile_id
- booking_type, status, package_type
- start_date, end_date, start_time, end_time, duration
- work_location, tasks (JSON), notes
- total_amount, payment_status, payment_method
- created_at, updated_at

### reviews
- id, appointment_id, user_id, caregiver_id
- rating, comment
- created_at

### complaints
- id, user_id, appointment_id, caregiver_id
- title, description, category, status, priority
- response, resolved_at
- created_at, updated_at

### emergency_contacts
- id, user_id, elderly_profile_id
- name, relationship, phone, email, address
- is_primary
- created_at, updated_at

## 🛠️ Development Commands

```typescript
import { clearAllData, dropAllTables } from '@/services/database.service';

// Clear all data (keep tables)
await clearAllData();

// Drop and recreate tables
await dropAllTables();
```

## 💡 Tips

1. **Luôn sử dụng userId từ Auth Context** để filter data theo user
2. **JSON fields**: Tự động được parse khi đọc và stringify khi ghi
3. **Timestamps**: Tự động được quản lý bởi database
4. **Error handling**: Luôn wrap trong try-catch block
5. **Performance**: Sử dụng hooks để cache data và tránh re-fetch không cần thiết

## 🔄 Migration từ Mock Data

Để chuyển từ mock data sang SQLite:

1. Thay thế `useState([mockData])` bằng hooks:
   ```typescript
   // Before
   const [profiles, setProfiles] = useState(mockProfiles);
   
   // After
   const { profiles, loading } = useElderlyProfiles(userId);
   ```

2. Thay thế CRUD operations:
   ```typescript
   // Before
   setProfiles([...profiles, newProfile]);
   
   // After
   await addProfile(newProfile);
   ```

3. Handle loading states:
   ```typescript
   if (loading) return <LoadingSpinner />;
   ```

## 📝 Examples

Xem file `database.seed.ts` để tham khảo cách tạo data mẫu.

Xem các hooks trong `useDatabaseEntities.ts` để tham khảo patterns sử dụng.
