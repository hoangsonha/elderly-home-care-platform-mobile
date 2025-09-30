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

export default function HiredDetailScreen() {
  const { id, name } = useLocalSearchParams();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
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
    
    const baseTasks = [
      {
        id: '1',
        title: 'Nhắc nhở uống thuốc buổi sáng',
        description: 'Kiểm tra và đảm bảo người già uống đúng thuốc theo đơn của bác sĩ vào buổi sáng. Bao gồm: thuốc huyết áp, thuốc tim mạch và vitamin tổng hợp. Cần kiểm tra hạn sử dụng và liều lượng chính xác.',
        scheduledTime: `${date}T09:00:00Z`,
        duration: 10,
        status: 'completed' as const,
        priority: 'high' as const,
        category: 'Task cố định',
        tags: ['Thuốc', 'Sức khỏe', 'Buổi sáng'],
        isRecurring: true,
        recurringPattern: 'daily' as const,
        assignedTo: { id: caregiverId, name: caregiver.name },
        elderly: { id: caregiver.currentElderly[0].id, name: caregiver.currentElderly[0].name },
        createdAt: '2024-01-20T08:00:00Z',
        updatedAt: '2024-01-20T09:10:00Z',
        completedAt: '2024-01-20T09:10:00Z',
        notes: 'Người già đã uống đầy đủ thuốc, không có phản ứng phụ nào. Cần tiếp tục theo dõi huyết áp sau khi uống thuốc.',
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
        description: 'Nấu ăn và chuẩn bị bữa trưa phù hợp với chế độ dinh dưỡng của người già. Cần đảm bảo thức ăn mềm, dễ tiêu hóa và đầy đủ chất dinh dưỡng. Tránh các món cay, mặn và khó tiêu.',
        scheduledTime: `${date}T12:00:00Z`,
        duration: 45,
        status: 'in_progress' as const,
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
        description: 'Hướng dẫn và cùng tập các bài tập thể dục nhẹ nhàng phù hợp với sức khỏe người già. Bao gồm các động tác khởi động, đi bộ tại chỗ, và các bài tập tay chân đơn giản để duy trì sự linh hoạt.',
        scheduledTime: `${date}T08:00:00Z`,
        duration: 30,
        status: 'completed' as const,
        priority: 'medium' as const,
        category: 'Task linh hoạt',
        tags: ['Thể dục', 'Sức khỏe', 'Vận động'],
        isRecurring: true,
        recurringPattern: 'daily' as const,
        assignedTo: { id: caregiverId, name: caregiver.name },
        elderly: { id: caregiver.currentElderly[0].id, name: caregiver.currentElderly[0].name },
        createdAt: '2024-01-20T08:00:00Z',
        updatedAt: '2024-01-20T08:30:00Z',
        completedAt: '2024-01-20T08:30:00Z',
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
        description: 'Trò chuyện, đọc sách hoặc xem TV cùng người già để giải trí và giảm cô đơn. Tạo không khí vui vẻ, chia sẻ những câu chuyện thú vị và lắng nghe những kỷ niệm của người già.',
        scheduledTime: `${date}T15:00:00Z`,
        duration: 60,
        status: 'pending' as const,
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
        description: 'Dọn dẹp và sắp xếp lại phòng ngủ, phòng khách để tạo không gian sạch sẽ, thoáng mát. Đảm bảo mọi thứ được sắp xếp gọn gàng và dễ tìm kiếm.',
        scheduledTime: `${date}T14:00:00Z`,
        duration: 30,
        status: 'pending' as const,
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
        description: 'Đi mua các đồ dùng cần thiết như thực phẩm, thuốc men, đồ dùng cá nhân nếu có thời gian. Kiểm tra danh sách mua sắm và đảm bảo mua đúng những gì cần thiết.',
        scheduledTime: `${date}T16:00:00Z`,
        duration: 90,
        status: 'pending' as const,
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

    // Return different number of tasks based on caregiver
    if (caregiverId === '1') return baseTasks.slice(0, 6); // Nguyễn Thị Mai - 6 tasks (làm hôm nay)
    if (caregiverId === '2') return baseTasks.slice(0, 4); // Trần Văn Nam - 4 tasks (làm hôm nay)
    if (caregiverId === '3') return []; // Lê Thị Hoa - 0 tasks (nghỉ hôm nay)
    if (caregiverId === '4') return baseTasks.slice(0, 1); // Phạm Văn Đức - 1 task (làm hôm nay)
    return baseTasks;
  }, [caregiver.currentElderly, caregiver.name, caregiver.workingDays]);

  // Generate task data for multiple days (7 days back and 7 days forward)
  const generateTaskDays = useCallback(() => {
    const days: TaskDay[] = [];
    const today = new Date();
    
    // Generate 7 days back and 7 days forward
    for (let i = -7; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      const tasks = getTaskDataForCaregiver(caregiver.id, dateString);
      
      days.push({
        date: dateString,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(task => task.status === 'completed').length,
        pendingTasks: tasks.filter(task => task.status === 'pending' || task.status === 'in_progress').length,
        tasks: tasks
      });
    }
    
    return days;
  }, [caregiver.id, getTaskDataForCaregiver]);

  const taskDays = useMemo(() => generateTaskDays(), [generateTaskDays]);

  const currentDayData = taskDays.find(day => day.date === selectedDate);
  const currentDayTasks = currentDayData?.tasks || [];

  // Find today's date in taskDays
  const todayDate = new Date().toISOString().split('T')[0];

  // Scroll to today's date when component mounts (only once)
  const [hasScrolledToToday, setHasScrolledToToday] = useState(false);
  
  useEffect(() => {
    if (taskDays.length > 0 && containerWidth > 0 && !hasScrolledToToday) {
      const todayIndex = taskDays.findIndex(day => day.date === todayDate);
      if (todayIndex !== -1 && scrollViewRef.current) {
        // Calculate scroll position to center today's date
        const buttonWidth = 68; // 60 (minWidth) + 8 (marginRight)
        const centerOffset = containerWidth / 2;
        const todayPosition = (todayIndex * buttonWidth) + (buttonWidth / 2); // Center of the button
        const scrollPosition = Math.max(0, todayPosition - centerOffset - 10); // -10 for fine adjustment
        
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            x: scrollPosition,
            animated: true
          });
          setHasScrolledToToday(true);
        }, 300);
      }
    }
  }, [taskDays, todayDate, containerWidth, hasScrolledToToday]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4ECDC4';
      case 'paused': return '#FECA57';
      case 'completed': return '#6C757D';
      default: return '#6C757D';
    }
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

  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  const renderTaskItem = (task: Task) => (
    <TouchableOpacity key={task.id} style={styles.taskItem} onPress={() => handleTaskPress(task)}>
      <View style={styles.taskLeft}>
        <View style={styles.taskStatusIcon}>
          {task.status === 'completed' ? (
            <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
          ) : (
            <Ionicons name="close-circle" size={20} color="#FF6B6B" />
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
        <View style={styles.taskCategoryBadge}>
          <ThemedText style={styles.taskCategoryBadgeText}>{task.category}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

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
          <ThemedText style={styles.headerTitle}>Chi tiết người chăm sóc</ThemedText>
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
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: getStatusColor(caregiver.status) }]}>
              <ThemedText style={styles.avatarText}>
                {caregiver.name ? caregiver.name.split(' ').map(n => n[0]).join('') : '?'}
              </ThemedText>
            </View>
            <View style={styles.profileInfo}>
              <ThemedText style={styles.profileName}>{caregiver.name}</ThemedText>
              <ThemedText style={styles.profileAge}>{caregiver.age} tuổi</ThemedText>
              <View style={styles.caringForContainer}>
                <ThemedText style={styles.caringForLabel}>Đang chăm sóc:</ThemedText>
                <View style={styles.caringForNames}>
                  {caregiver.currentElderly.map((elderly, index) => (
                    <ThemedText key={index} style={styles.caringForName}>
                      {elderly.name}
                    </ThemedText>
                  ))}
                </View>
              </View>
            </View>
          </View>
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
                const isToday = day.date === new Date().toISOString().split('T')[0];
                const dayName = new Date(day.date).toLocaleDateString('vi-VN', { weekday: 'short' });
                const dayNumber = new Date(day.date).getDate();
                
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
                      {dayNumber}
                    </ThemedText>
                    {isToday && <View style={styles.todayIndicator} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
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
            <View style={[styles.statCard, styles.totalStatCard]}>
              <View style={styles.statIconContainer}>
                <Ionicons name="list-outline" size={24} color="#2c3e50" />
              </View>
              <View style={styles.statContent}>
                <ThemedText style={styles.statNumber}>{currentDayData?.totalTasks || 0}</ThemedText>
                <ThemedText style={styles.statLabel}>Tổng task</ThemedText>
              </View>
            </View>
            
            <View style={styles.statsRow}>
              <View style={[styles.statCard, styles.completedStatCard]}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#4ECDC4" />
                </View>
                <View style={styles.statContent}>
                  <ThemedText style={[styles.statNumber, { color: '#4ECDC4' }]}>
                    {currentDayData?.completedTasks || 0}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Hoàn thành</ThemedText>
                </View>
              </View>
              
              <View style={[styles.statCard, styles.pendingStatCard]}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="time-outline" size={20} color="#FECA57" />
                </View>
                <View style={styles.statContent}>
                  <ThemedText style={[styles.statNumber, { color: '#FECA57' }]}>
                    {currentDayData?.pendingTasks || 0}
                  </ThemedText>
                  <ThemedText style={styles.statLabel}>Chưa xong</ThemedText>
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
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
    gap: 12,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
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
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderColor: '#4ECDC4',
  },
  completedStatCard: {
    flex: 1,
    backgroundColor: '#f0f9ff',
    borderColor: '#4ECDC4',
  },
  pendingStatCard: {
    flex: 1,
    backgroundColor: '#fffbeb',
    borderColor: '#FECA57',
  },
  statIconContainer: {
    marginRight: 12,
  },
  statContent: {
    flex: 1,
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
  },
  dateScrollView: {
    flexGrow: 0,
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
    color: '#4ECDC4',
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
