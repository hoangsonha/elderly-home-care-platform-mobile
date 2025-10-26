import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { HiredCaregiver, Task, TaskDay } from '@/types/hired';

interface DayStatus {
  date: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  rating?: number;
  note?: string;
  location?: string;
  workingHours?: string;
  caringFor?: string;
}

export default function HiredDetailScreen() {
  const { id, name } = useLocalSearchParams();
  
  // Mock day status data - chỉ các ngày caregiver làm việc
  const mockDayStatuses: DayStatus[] = useMemo(() => {
    // Demo: Caregiver Nguyễn Thị Mai - 3 ngày: quá khứ, hiện tại, tương lai
    if (id === '1') {
      return [
        { 
          date: '2024-10-22', 
          status: 'completed', 
          rating: 4, 
          note: 'Hài lòng với dịch vụ',
          location: 'Quận 1, TP.HCM',
          workingHours: '08:00 - 17:00',
          caringFor: 'Bà Nguyễn Thị Lan'
        }, // Quá khứ
        { 
          date: '2024-10-23', 
          status: 'in_progress',
          location: 'Quận 2, TP.HCM',
          workingHours: '08:00 - 17:00',
          caringFor: 'Bà Nguyễn Thị Lan'
        }, // Hôm nay
        { 
          date: '2024-10-24', 
          status: 'upcoming',
          location: 'Quận 3, TP.HCM',
          workingHours: '08:00 - 17:00',
          caringFor: 'Bà Nguyễn Thị Lan'
        }, // Tương lai
      ];
    }
    
    // Demo: Caregiver không có lịch hôm nay, chỉ có lịch ngày 25/10
    if (id === '2') {
      return [
        { date: '2024-10-18', status: 'completed', rating: 5, note: 'Rất hài lòng với dịch vụ' },
        { date: '2024-10-19', status: 'completed', rating: 4, note: 'Tốt, có thể cải thiện thêm' },
        { date: '2024-10-20', status: 'cancelled' },
        { date: '2024-10-21', status: 'completed', rating: 5, note: 'Xuất sắc!' },
        { date: '2024-10-22', status: 'completed' }, // Chưa đánh giá
        // Không có ngày 23/10 (hôm nay)
        { date: '2024-10-25', status: 'upcoming' }, // Ngày tương lai gần nhất
        { date: '2024-10-28', status: 'upcoming' },
        { date: '2024-10-30', status: 'upcoming' },
      ];
    }
    
    // Default: Caregiver có lịch hôm nay
    return [
      { date: '2024-10-22', status: 'completed', rating: 5, note: 'Rất hài lòng với dịch vụ' }, // Quá khứ
      { date: '2024-10-23', status: 'in_progress' }, // Hôm nay
      { date: '2024-10-24', status: 'upcoming' }, // Tương lai
    ];
  }, [id]);

  // Logic chọn ngày mặc định
  const getDefaultSelectedDate = () => {
    const today = '2024-10-23'; // Ngày hôm nay trong mock data
    
    // Kiểm tra xem hôm nay có trong danh sách không
    const todayExists = mockDayStatuses.find(day => day.date === today);
    if (todayExists) {
      return today; // Nếu hôm nay có lịch thì chọn hôm nay
    }
    
    // Nếu hôm nay không có lịch, tìm ngày tương lai gần nhất
    const futureDays = mockDayStatuses.filter(day => day.date > today);
    if (futureDays.length > 0) {
      // Sắp xếp theo ngày và lấy ngày gần nhất
      futureDays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return futureDays[0].date;
    }
    
    // Fallback: lấy ngày đầu tiên trong danh sách
    return mockDayStatuses[0]?.date || today;
  };

  const [selectedDate, setSelectedDate] = useState(getDefaultSelectedDate());
  const scrollViewRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(350);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Mock data - should be fetched based on id
  const mockCaregivers: HiredCaregiver[] = [
    {
      id: '1',
      name: 'Nguyễn Thị Mai',
      age: 28,
      avatar: 'https://via.placeholder.com/60x60/4ECDC4/FFFFFF?text=NM',
      isCurrentlyCaring: true,
      currentElderly: [
        {
          id: 'elderly1',
          name: 'Bà Nguyễn Thị Lan',
          age: 75
        }
      ],
      totalTasks: 6,
      completedTasks: 3,
      pendingTasks: 3,
      hourlyRate: 200000,
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      timeSlots: ['morning', 'afternoon'],
      status: 'active'
    },
    {
      id: '2',
      name: 'Trần Văn Nam',
      age: 32,
      avatar: 'https://via.placeholder.com/60x60/FF6B6B/FFFFFF?text=TN',
      isCurrentlyCaring: true,
      currentElderly: [
        {
          id: 'elderly2',
          name: 'Ông Phạm Văn Đức',
          age: 82
        },
        {
          id: 'elderly3',
          name: 'Bà Lê Thị Bình',
          age: 78
        }
      ],
      totalTasks: 4,
      completedTasks: 2,
      pendingTasks: 2,
      hourlyRate: 180000,
      startDate: '2024-01-10',
      endDate: '2024-03-10',
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      timeSlots: ['morning', 'afternoon', 'evening'],
      status: 'active'
    },
    {
      id: '3',
      name: 'Lê Thị Hoa',
      age: 25,
      avatar: 'https://via.placeholder.com/60x60/45B7D1/FFFFFF?text=LH',
      isCurrentlyCaring: false,
      currentElderly: [
        {
          id: 'elderly4',
          name: 'Bà Lê Thị Bình',
          age: 68
        }
      ],
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      hourlyRate: 220000,
      startDate: '2024-01-05',
      endDate: '2024-01-20',
      workingDays: ['monday', 'wednesday', 'friday'],
      timeSlots: ['morning'],
      status: 'completed'
    },
    {
      id: '4',
      name: 'Phạm Văn Đức',
      age: 30,
      avatar: 'https://via.placeholder.com/60x60/9B59B6/FFFFFF?text=PD',
      isCurrentlyCaring: true,
      currentElderly: [
        {
          id: 'elderly5',
          name: 'Bà Trần Thị Hoa',
          age: 70
        }
      ],
      totalTasks: 1,
      completedTasks: 0,
      pendingTasks: 1,
      hourlyRate: 190000,
      startDate: '2024-01-20',
      endDate: '2024-02-20',
      workingDays: ['tuesday', 'thursday', 'saturday'],
      timeSlots: ['morning'],
      status: 'active'
    }
  ];

  // Find caregiver by id
  const caregiver = mockCaregivers.find(c => c.id === id) || mockCaregivers[0];

  // Mock task data for different dates and caregivers
  const getTaskDataForCaregiver = useCallback((caregiverId: string, date: string) => {
    // Check if caregiver works on this day
    const dayOfWeek = new Date(date).getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    
    // If caregiver doesn't work on this day, return empty array
    if (!caregiver.workingDays.includes(dayName)) {
      return [];
    }
    
    // Base tasks template
    const baseTasks = [
      {
        id: '1',
        title: 'Nhắc nhở uống thuốc buổi sáng',
        description: 'Kiểm tra và đảm bảo người già uống đúng thuốc theo đơn của bác sĩ vào buổi sáng.',
        scheduledTime: `${date}T09:00:00Z`,
        duration: 10,
        priority: 'high' as const,
        category: 'Task cố định',
        tags: ['Thuốc', 'Sức khỏe', 'Buổi sáng'],
        isRecurring: true,
        recurringPattern: 'daily' as const,
        assignedTo: { id: caregiverId, name: caregiver.name },
        elderly: { id: caregiver.currentElderly[0].id, name: caregiver.currentElderly[0].name },
        createdAt: '2024-01-20T08:00:00Z',
        updatedAt: '2024-01-20T09:10:00Z',
        location: 'Phòng ngủ',
        equipment: ['Cốc nước', 'Thuốc', 'Đơn thuốc'],
        instructions: [
          'Kiểm tra đơn thuốc trước khi cho uống',
          'Đảm bảo uống đúng liều lượng',
          'Theo dõi phản ứng sau khi uống',
          'Ghi chú vào sổ theo dõi'
        ]
      },
      {
        id: '2',
        title: 'Chuẩn bị bữa trưa',
        description: 'Nấu ăn và chuẩn bị bữa trưa phù hợp với chế độ dinh dưỡng của người già.',
        scheduledTime: `${date}T12:00:00Z`,
        duration: 45,
        priority: 'high' as const,
        category: 'Task cố định',
        tags: ['Ăn uống', 'Dinh dưỡng', 'Nấu ăn'],
        isRecurring: true,
        recurringPattern: 'daily' as const,
        assignedTo: { id: caregiverId, name: caregiver.name },
        elderly: { id: caregiver.currentElderly[0].id, name: caregiver.currentElderly[0].name },
        createdAt: '2024-01-20T08:00:00Z',
        updatedAt: '2024-01-20T11:45:00Z',
        location: 'Nhà bếp',
        equipment: ['Bếp gas', 'Nồi cơm điện', 'Chảo', 'Dao thớt', 'Đĩa bát'],
        instructions: [
          'Kiểm tra nguyên liệu có sẵn trong tủ lạnh',
          'Rửa sạch rau củ trước khi chế biến',
          'Nấu chín kỹ thức ăn để dễ tiêu hóa',
          'Trình bày đẹp mắt trên đĩa',
          'Kiểm tra nhiệt độ thức ăn trước khi phục vụ'
        ],
        notes: 'Người già thích ăn cháo và súp. Cần chú ý đến việc cắt nhỏ thức ăn để dễ nhai.'
      },
      {
        id: '3',
        title: 'Tập thể dục nhẹ',
        description: 'Hướng dẫn và cùng tập các bài tập thể dục nhẹ nhàng phù hợp với sức khỏe người già.',
        scheduledTime: `${date}T08:00:00Z`,
        duration: 30,
        priority: 'medium' as const,
        category: 'Task linh hoạt',
        tags: ['Thể dục', 'Sức khỏe', 'Vận động'],
        isRecurring: true,
        recurringPattern: 'daily' as const,
        assignedTo: { id: caregiverId, name: caregiver.name },
        elderly: { id: caregiver.currentElderly[0].id, name: caregiver.currentElderly[0].name },
        createdAt: '2024-01-20T08:00:00Z',
        updatedAt: '2024-01-20T08:30:00Z',
        location: 'Phòng khách',
        equipment: ['Thảm tập', 'Ghế hỗ trợ', 'Nước uống'],
        instructions: [
          'Kiểm tra sức khỏe người già trước khi tập',
          'Khởi động nhẹ nhàng trong 5 phút',
          'Thực hiện các bài tập tay chân đơn giản',
          'Nghỉ ngơi khi cần thiết',
          'Kết thúc bằng các động tác thư giãn'
        ],
        notes: 'Người già tập rất tích cực và không có dấu hiệu mệt mỏi. Cần duy trì cường độ tập luyện này.'
      },
      {
        id: '4',
        title: 'Trò chuyện và giải trí',
        description: 'Trò chuyện, đọc sách hoặc xem TV cùng người già để giải trí và giảm cô đơn.',
        scheduledTime: `${date}T15:00:00Z`,
        duration: 60,
        priority: 'medium' as const,
        category: 'Task linh hoạt',
        tags: ['Giải trí', 'Tâm lý', 'Giao tiếp'],
        isRecurring: true,
        recurringPattern: 'daily' as const,
        assignedTo: { id: caregiverId, name: caregiver.name },
        elderly: { id: caregiver.currentElderly[0].id, name: caregiver.currentElderly[0].name },
        createdAt: '2024-01-20T08:00:00Z',
        updatedAt: '2024-01-20T08:00:00Z',
        location: 'Phòng khách',
        equipment: ['TV', 'Sách báo', 'Trà nước'],
        instructions: [
          'Hỏi thăm sức khỏe và tâm trạng',
          'Chọn chương trình TV phù hợp',
          'Khuyến khích người già chia sẻ câu chuyện',
          'Lắng nghe và phản hồi tích cực',
          'Tạo không khí thoải mái và vui vẻ'
        ],
        notes: 'Người già rất thích kể về thời trẻ và gia đình. Cần kiên nhẫn lắng nghe.'
      },
      {
        id: '5',
        title: 'Dọn dẹp phòng',
        description: 'Dọn dẹp và sắp xếp lại phòng ngủ, phòng khách để tạo không gian sạch sẽ, thoáng mát.',
        scheduledTime: `${date}T14:00:00Z`,
        duration: 30,
        priority: 'low' as const,
        category: 'Task tùy chọn',
        tags: ['Dọn dẹp', 'Vệ sinh', 'Sắp xếp'],
        isRecurring: false,
        assignedTo: { id: caregiverId, name: caregiver.name },
        elderly: { id: caregiver.currentElderly[0].id, name: caregiver.currentElderly[0].name },
        createdAt: '2024-01-20T08:00:00Z',
        updatedAt: '2024-01-20T08:00:00Z',
        location: 'Phòng ngủ, Phòng khách',
        equipment: ['Chổi', 'Khăn lau', 'Nước lau sàn', 'Túi rác'],
        instructions: [
          'Thu dọn đồ đạc cá nhân',
          'Lau bụi trên bàn ghế',
          'Quét và lau sàn nhà',
          'Sắp xếp lại đồ đạc gọn gàng',
          'Thay ga giường nếu cần'
        ],
        notes: 'Người già rất quan tâm đến việc giữ gìn vệ sinh. Cần làm nhẹ nhàng để không làm phiền.'
      },
      {
        id: '6',
        title: 'Mua sắm đồ dùng',
        description: 'Đi mua các đồ dùng cần thiết như thực phẩm, thuốc men, đồ dùng cá nhân nếu có thời gian.',
        scheduledTime: `${date}T16:00:00Z`,
        duration: 90,
        priority: 'low' as const,
        category: 'Task tùy chọn',
        tags: ['Mua sắm', 'Thực phẩm', 'Thuốc men'],
        isRecurring: false,
        assignedTo: { id: caregiverId, name: caregiver.name },
        elderly: { id: caregiver.currentElderly[0].id, name: caregiver.currentElderly[0].name },
        createdAt: '2024-01-20T08:00:00Z',
        updatedAt: '2024-01-20T08:00:00Z',
        location: 'Siêu thị, Nhà thuốc',
        equipment: ['Danh sách mua sắm', 'Tiền mặt', 'Túi đựng'],
        instructions: [
          'Kiểm tra danh sách mua sắm',
          'Đến siêu thị mua thực phẩm',
          'Ghé nhà thuốc mua thuốc nếu cần',
          'Kiểm tra hạn sử dụng sản phẩm',
          'Cất giữ đồ mua về đúng chỗ'
        ],
        notes: 'Cần mua thêm sữa và bánh mì. Thuốc huyết áp còn đủ dùng đến tuần sau.'
      }
    ];

    // Return different task statuses based on date
    if (caregiverId === '1') {
      // Nguyễn Thị Mai - 6 tasks với status khác nhau theo ngày
      if (date === '2024-10-22') {
        // Quá khứ - 4 completed, 2 failed
        return baseTasks.map((task, index) => ({
          ...task,
          status: index < 4 ? 'completed' as const : 'failed' as const,
          completedAt: index < 4 ? `${date}T${task.scheduledTime.split('T')[1]}` : undefined,
          notes: index < 4 ? (task.notes || 'Task đã hoàn thành') : 'Task không hoàn thành'
        }));
      } else if (date === '2024-10-23') {
        // Hôm nay - 4 completed, 2 pending
        return baseTasks.map((task, index) => ({
          ...task,
          status: index < 4 ? 'completed' as const : 'pending' as const,
          completedAt: index < 4 ? `${date}T${task.scheduledTime.split('T')[1]}` : undefined,
          notes: index < 4 ? (task.notes || 'Task đã hoàn thành') : undefined
        }));
      } else if (date === '2024-10-24') {
        // Tương lai - tất cả pending
        return baseTasks.map(task => ({
          ...task,
          status: 'pending' as const,
          notes: undefined
        }));
      }
    }
    
    // Default: return tasks based on caregiver
    if (caregiverId === '2') return baseTasks.slice(0, 4); // Trần Văn Nam - 4 tasks
    if (caregiverId === '3') return []; // Lê Thị Hoa - 0 tasks
    if (caregiverId === '4') return baseTasks.slice(0, 1); // Phạm Văn Đức - 1 task
    return baseTasks;
  }, [caregiver.currentElderly, caregiver.name, caregiver.workingDays]);

  // Generate task data for multiple days - chỉ các ngày caregiver làm việc
  const generateTaskDays = useCallback(() => {
    const days: TaskDay[] = [];
    
    // Chỉ tạo data cho các ngày có trong mockDayStatuses
    mockDayStatuses.forEach(dayStatus => {
      const tasks = getTaskDataForCaregiver(caregiver.id, dayStatus.date);
      
      days.push({
        date: dayStatus.date,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(task => task.status === 'completed').length,
        failedTasks: tasks.filter(task => task.status === 'failed').length,
        pendingTasks: tasks.filter(task => task.status === 'pending' || task.status === 'in_progress').length,
        tasks: tasks
      });
    });
    
    return days;
  }, [caregiver.id, getTaskDataForCaregiver, mockDayStatuses]);

  const taskDays = useMemo(() => generateTaskDays(), [generateTaskDays]);

  const currentDayData = taskDays.find(day => day.date === selectedDate);
  const currentDayTasks = currentDayData?.tasks || [];

  // Find today's date in taskDays
  const todayDate = '2024-10-23'; // Ngày hôm nay trong mock data

  // Scroll to selected date when component mounts or selectedDate changes
  const [hasScrolledToToday, setHasScrolledToToday] = useState(false);
  
  // Reset scroll flag when selectedDate changes
  useEffect(() => {
    setHasScrolledToToday(false);
  }, [selectedDate]);
  
  useEffect(() => {
    if (taskDays.length > 0 && containerWidth > 0 && !hasScrolledToToday) {
      const defaultDateIndex = taskDays.findIndex(day => day.date === selectedDate);
      if (defaultDateIndex !== -1 && scrollViewRef.current) {
        // Calculate scroll position to center the default selected date
        const buttonWidth = 68; // 60 (minWidth) + 8 (marginRight)
        const totalWidth = taskDays.length * buttonWidth;
        const centerOffset = containerWidth / 2;
        
        // Calculate the position of the selected date button
        const selectedDatePosition = (defaultDateIndex * buttonWidth) + (buttonWidth / 2);
        
        // Calculate scroll position to center the selected date
        const scrollPosition = Math.max(0, selectedDatePosition - centerOffset);
        
        // Ensure we don't scroll beyond the content
        const maxScroll = Math.max(0, totalWidth - containerWidth);
        const finalScrollPosition = Math.min(scrollPosition, maxScroll);
        
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            x: finalScrollPosition,
            animated: true
          });
          setHasScrolledToToday(true);
        }, 100);
      }
    }
  }, [taskDays, selectedDate, containerWidth, hasScrolledToToday]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4ECDC4';
      case 'paused': return '#FECA57';
      case 'completed': return '#6C757D';
      default: return '#6C757D';
    }
  };

  // Helper functions for day status
  const getDayStatus = (date: string): DayStatus | undefined => {
    return mockDayStatuses.find(day => day.date === date);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Đang tới';
      case 'in_progress': return 'Đang thực hiện';
      case 'completed': return 'Đã hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getStatusColorForDay = (status: string) => {
    switch (status) {
      case 'upcoming': return '#FECA57';
      case 'in_progress': return '#4ECDC4';
      case 'completed': return '#27AE60';
      case 'cancelled': return '#E74C3C';
      default: return '#6C757D';
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={16} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={16} color="#FFD700" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={16} color="#FFD700" />
      );
    }

    return stars;
  };




  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const handleChatPress = () => {
    router.push({
      pathname: '/chat',
      params: {
        caregiverId: caregiver.id,
        caregiverName: caregiver.name
      }
    });
  };

  const handleProfilePress = () => {
    // Navigate to caregiver detail page
    router.push({
      pathname: '/caregiver-detail',
      params: {
        caregiverId: caregiver.id,
        caregiverName: caregiver.name,
      }
    });
  };

  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  // Hàm xác định status của task dựa trên ngày
  const getTaskStatusText = (task: Task, taskDate: string) => {
    const today = '2024-10-23'; // Ngày hôm nay trong mock data
    const taskDateOnly = taskDate.split('T')[0];
    
    if (taskDateOnly < today) {
      // Ngày quá khứ
      return task.status === 'completed' ? 'Đã hoàn thành' : 'Không hoàn thành';
    } else if (taskDateOnly === today) {
      // Ngày hôm nay
      return task.status === 'completed' ? 'Đã hoàn thành' : 'Đang chờ';
    } else {
      // Ngày tương lai
      return 'Đang chờ';
    }
  };

  // Hàm xác định màu status của task
  const getTaskStatusColor = (task: Task, taskDate: string) => {
    const today = '2024-10-23'; // Ngày hôm nay trong mock data
    const taskDateOnly = taskDate.split('T')[0];
    
    if (taskDateOnly < today) {
      // Ngày quá khứ
      return task.status === 'completed' ? '#27AE60' : '#E74C3C';
    } else if (taskDateOnly === today) {
      // Ngày hôm nay
      return task.status === 'completed' ? '#27AE60' : '#FECA57';
    } else {
      // Ngày tương lai
      return '#FECA57';
    }
  };

  const renderTaskItem = (task: Task) => {
    const statusText = getTaskStatusText(task, selectedDate);
    const statusColor = getTaskStatusColor(task, selectedDate);
    
    return (
      <TouchableOpacity key={task.id} style={styles.taskItem} onPress={() => handleTaskPress(task)}>
        <View style={styles.taskLeft}>
          <View style={styles.taskStatusIcon}>
            {task.status === 'completed' ? (
              <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
            ) : statusText === 'Đang chờ' ? (
              <Ionicons name="ellipse" size={20} color="#FECA57" />
            ) : (
              <Ionicons name="close-circle" size={20} color="#E74C3C" />
            )}
          </View>
        <View style={styles.taskContent}>
          <ThemedText style={styles.taskTitle}>{task.title}</ThemedText>
          <View style={styles.taskMeta}>
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={14} color="#4ECDC4" />
              <ThemedText style={styles.taskTime}>{formatTime(task.scheduledTime)}</ThemedText>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.taskRight}>
        <View style={[styles.taskCategoryBadge, { backgroundColor: statusColor }]}>
          <ThemedText style={styles.taskCategoryBadgeText}>{statusText}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Chi tiết người đang thuê</ThemedText>
          <ThemedText style={styles.headerSubtitle}>{name || caregiver.name}</ThemedText>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleChatPress}>
            <Ionicons name="chatbubble-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.profileHeader}
            onPress={handleProfilePress}
            activeOpacity={0.7}
          >
            <View style={[styles.avatar, { backgroundColor: getStatusColor(caregiver.status) }]}>
              <ThemedText style={styles.avatarText}>
                {caregiver.name ? caregiver.name.split(' ').map(n => n[0]).join('') : '?'}
              </ThemedText>
            </View>
            <View style={styles.profileInfo}>
              <ThemedText style={styles.profileName}>{caregiver.name}</ThemedText>
              <ThemedText style={styles.profileAge}>{caregiver.age} tuổi</ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Date Selector */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Chọn ngày</ThemedText>
          <View 
            style={styles.dateSelector}
            onLayout={(event) => {
              const { width } = event.nativeEvent.layout;
              setContainerWidth(width);
            }}
          >
            <ScrollView 
              ref={scrollViewRef}
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.dateScrollView}
            >
              {taskDays.map((day, index) => {
                const isSelected = day.date === selectedDate;
                const isToday = day.date === todayDate;
                const dayName = new Date(day.date).toLocaleDateString('vi-VN', { weekday: 'short' });
                const dayNumber = new Date(day.date).getDate();
                const month = new Date(day.date).getMonth() + 1;
                const dayStatus = getDayStatus(day.date);
                
                return (
                  <TouchableOpacity
                    key={day.date}
                    style={[styles.dateButton, isSelected && styles.selectedDateButton]}
                    onPress={() => setSelectedDate(day.date)}
                  >
                    <ThemedText style={[styles.dateDayName, isSelected && styles.selectedDateText]}>
                      {dayName}
                    </ThemedText>
                    <ThemedText style={[styles.dateDayNumber, isSelected && styles.selectedDateText]}>
                      {dayNumber}/{month}
                    </ThemedText>
                    {dayStatus && (
                      <View style={[styles.statusIndicator, { backgroundColor: getStatusColorForDay(dayStatus.status) }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* Day Details */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Thông tin ngày</ThemedText>
          <View style={styles.dayDetailsContainer}>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={16} color="#4ECDC4" />
                <ThemedText style={styles.detailLabel}>Địa chỉ</ThemedText>
                <ThemedText style={styles.detailValue}>Nhà tôi (Quận 1, TP.HCM)</ThemedText>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={16} color="#4ECDC4" />
                <ThemedText style={styles.detailLabel}>Giờ làm</ThemedText>
                <ThemedText style={styles.detailValue}>08:00 - 17:00</ThemedText>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Ionicons name="person-outline" size={16} color="#4ECDC4" />
                <ThemedText style={styles.detailLabel}>Chăm sóc</ThemedText>
                <ThemedText style={styles.detailValue}>Bà Nguyễn Thị Lan</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Task Stats */}
        <View style={styles.section}>
          <View style={styles.statsHeader}>
            <ThemedText style={styles.sectionTitle}>Thống kê task</ThemedText>
            <View style={styles.dateBadge}>
              <Ionicons name="calendar-outline" size={14} color="#4ECDC4" />
              <ThemedText style={styles.dateBadgeText}>
                {new Date(selectedDate).toLocaleDateString('vi-VN')}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            {/* Dòng 1: Tổng task và Đã hoàn thành */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, styles.totalStatCard]}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="list-outline" size={20} color="#2c3e50" />
                </View>
                <View style={styles.statContent}>
                  <ThemedText style={styles.statNumber}>{currentDayData?.totalTasks || 0}</ThemedText>
                  <ThemedText style={styles.statLabel}>Tổng task</ThemedText>
                </View>
              </View>
              
              <View style={[styles.statCard, styles.completedStatCard]}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#27AE60" />
                </View>
                <View style={styles.statContent}>
                  <ThemedText style={[styles.statNumber, { color: '#27AE60' }]}>
                    {currentDayData?.completedTasks || 0}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Đã hoàn thành</ThemedText>
                </View>
              </View>
            </View>
            
            {/* Dòng 2: Không hoàn thành và Đang chờ */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, styles.failedStatCard]}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="close-circle-outline" size={20} color="#E74C3C" />
                </View>
                <View style={styles.statContent}>
                  <ThemedText style={[styles.statNumber, { color: '#E74C3C' }]}>
                    {currentDayData?.failedTasks || 0}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Không hoàn thành</ThemedText>
                </View>
              </View>
              
              <View style={[styles.statCard, styles.pendingStatCard]}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="ellipse-outline" size={20} color="#FECA57" />
                </View>
                <View style={styles.statContent}>
                  <ThemedText style={[styles.statNumber, { color: '#FECA57' }]}>
                    {currentDayData?.pendingTasks || 0}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Đang chờ</ThemedText>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Tasks List */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Danh sách task</ThemedText>
          {currentDayTasks.length > 0 ? (
            <View style={styles.tasksList}>
              {currentDayTasks.map(renderTaskItem)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#6C757D" />
              <ThemedText style={styles.emptyText}>Không có task nào trong ngày này</ThemedText>
            </View>
          )}
        </View>

        {/* Day Status */}
        <View style={[styles.section, styles.dayStatusSection]}>
          <View style={styles.statsHeader}>
            <ThemedText style={styles.sectionTitle}>Trạng thái ngày</ThemedText>
            <View style={styles.dateBadge}>
              <Ionicons name="calendar-outline" size={14} color="#4ECDC4" />
              <ThemedText style={styles.dateBadgeText}>
                {new Date(selectedDate).toLocaleDateString('vi-VN')}
              </ThemedText>
            </View>
          </View>
          
          {(() => {
            const dayStatus = getDayStatus(selectedDate);
            if (!dayStatus) return null;
            
            return (
              <View style={styles.dayStatusContainer}>
                <View style={styles.dayStatusRow}>
                  <View style={styles.statusBadgeContainer}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColorForDay(dayStatus.status) }]}>
                      <ThemedText style={styles.statusText}>{getStatusText(dayStatus.status)}</ThemedText>
                    </View>
                  </View>
                  
                  {dayStatus.status === 'completed' && (
                    <View style={styles.ratingContainer}>
                      {dayStatus.rating ? (
                        <View style={styles.ratingDisplay}>
                          <View style={styles.stars}>
                            {renderStars(dayStatus.rating)}
                          </View>
                          <ThemedText style={styles.ratingText}>{dayStatus.rating}/5</ThemedText>
                        </View>
                      ) : (
                        <TouchableOpacity style={styles.rateButton}>
                          <ThemedText style={styles.rateButtonText}>Đánh giá</ThemedText>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
                
                {dayStatus.note && (
                  <View style={styles.noteContainer}>
                    <ThemedText style={styles.noteText}>&ldquo;{dayStatus.note}&rdquo;</ThemedText>
                  </View>
                )}
                
                <View style={styles.actionButtonsContainer}>
                  {dayStatus.status === 'completed' && !dayStatus.rating ? (
                    <>
                      <TouchableOpacity style={styles.actionButtonSecondary}>
                        <ThemedText style={styles.actionButtonSecondaryText}>Đánh giá</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionButtonPrimary}
                        onPress={() => router.push({
                          pathname: '/caregiver-detail',
                          params: {
                            caregiverId: caregiver.id,
                            caregiverName: caregiver.name,
                            openBooking: 'true'
                          }
                        })}
                      >
                        <ThemedText style={styles.actionButtonPrimaryText}>Thuê lại</ThemedText>
                      </TouchableOpacity>
                    </>
                  ) : dayStatus.status === 'completed' && dayStatus.rating ? (
                    <TouchableOpacity 
                      style={styles.actionButtonPrimary}
                      onPress={() => router.push({
                        pathname: '/caregiver-detail',
                        params: {
                          caregiverId: caregiver.id,
                          caregiverName: caregiver.name,
                          openBooking: 'true'
                        }
                      })}
                    >
                      <ThemedText style={styles.actionButtonPrimaryText}>Thuê lại</ThemedText>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            );
          })()}
        </View>
      </ScrollView>

      {/* Task Detail Modal */}
      <Modal
        visible={showTaskModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseTaskModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Chi tiết Task</ThemedText>
              <TouchableOpacity onPress={handleCloseTaskModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#6c757d" />
              </TouchableOpacity>
            </View>
            
            {selectedTask ? (
              <View style={styles.modalBody}>
                <View style={styles.taskDetailSection}>
                  <ThemedText style={styles.taskDetailTitle}>{selectedTask.title}</ThemedText>
                  <ThemedText style={styles.taskDetailDescription}>{selectedTask.description}</ThemedText>
                </View>
              </View>
            ) : (
              <View style={styles.modalBody}>
                <View style={styles.emptyState}>
                  <ThemedText style={styles.emptyText}>Không có thông tin task</ThemedText>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#4ECDC4',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  profileAge: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  caringForContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  caringForLabel: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '500',
    marginRight: 4,
  },
  caringForNames: {
    flex: 1,
  },
  caringForName: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '500',
    marginBottom: 2,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  dateBadgeText: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '500',
    marginLeft: 4,
  },
  statsContainer: {
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    width: '48%',
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  totalStatCard: {
    backgroundColor: '#f8f9fa',
    borderColor: '#4ECDC4',
  },
  completedStatCard: {
    backgroundColor: '#f0f9ff',
    borderColor: '#27AE60',
  },
  failedStatCard: {
    backgroundColor: '#fef2f2',
    borderColor: '#E74C3C',
  },
  pendingStatCard: {
    backgroundColor: '#fffbeb',
    borderColor: '#FECA57',
  },
  emptyStatCard: {
    backgroundColor: '#f8f9fa',
    borderColor: '#6c757d',
  },
  statIconContainer: {
    marginRight: 12,
  },
  statContent: {
    flex: 1,
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateScrollView: {
    flexGrow: 0,
    width: '100%',
  },
  dateButton: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    minWidth: 60,
  },
  selectedDateButton: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  dateDayName: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  dateDayNumber: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: 'bold',
    marginTop: 2,
  },
  selectedDateText: {
    color: 'white',
  },
  todayIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff6b6b',
  },
  statusIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dayStatusContainer: {
    gap: 12,
  },
  dayStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadgeContainer: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  ratingDisplay: {
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  rateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#4ECDC4',
  },
  rateButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  noteContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  noteText: {
    fontSize: 14,
    color: '#2c3e50',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButtonPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
  },
  actionButtonPrimaryText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  actionButtonSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4ECDC4',
    alignItems: 'center',
  },
  actionButtonSecondaryText: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  dayStatusSection: {
    marginBottom: 100, // Thêm margin bottom để tránh đụng navigation bar
  },
  dayDetailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4ECDC4',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
    flex: 1,
  },
  tasksList: {
    gap: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskStatusIcon: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  taskTime: {
    fontSize: 12,
    color: '#4ECDC4',
    marginLeft: 4,
  },
  taskRight: {
    alignItems: 'flex-end',
  },
  taskCategoryBadge: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  taskCategoryBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    maxHeight: '85%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    maxHeight: '80%',
    paddingHorizontal: 0,
  },
  taskDetailSection: {
    padding: 20,
  },
  taskDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  taskDetailStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDetailStatusText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  taskDetailCategory: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  taskDetailCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  taskDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  taskDetailDescription: {
    fontSize: 16,
    color: '#6c757d',
    lineHeight: 24,
    marginBottom: 20,
  },
  taskDetailInfo: {
    gap: 16,
  },
  taskDetailInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDetailInfoContent: {
    marginLeft: 12,
    flex: 1,
  },
  taskDetailInfoLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  taskDetailInfoValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
    marginTop: 2,
  },
  taskDetailTags: {
    marginTop: 20,
  },
  taskDetailTagsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  taskDetailTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  taskDetailTag: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  taskDetailTagText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  taskDetailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    marginTop: 20,
  },
  taskDetailList: {
    gap: 8,
  },
  taskDetailListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  taskDetailListNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginRight: 8,
    minWidth: 20,
  },
  taskDetailListItemText: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
    marginLeft: 8,
  },
  taskDetailNotes: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  taskDetailNotesText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
});
