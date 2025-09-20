import { ThemedText } from '@/components/themed-text';
import React, { useRef, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

interface TimePickerProps {
  visible: boolean;
  onClose: () => void;
  onTimeSelect: (time: string) => void;
  selectedTime?: string;
  availableTimes: string[]; // Danh sách thời gian có thể chọn
}

export function TimePicker({ 
  visible, 
  onClose, 
  onTimeSelect, 
  selectedTime = '06:00',
  availableTimes 
}: TimePickerProps) {
  const [tempSelectedTime, setTempSelectedTime] = useState(selectedTime);

  // Tách giờ và phút từ selectedTime
  const [selectedHour, selectedMinute] = selectedTime.split(':').map(Number);
  const [tempHour, setTempHour] = useState(selectedHour || 6);
  const [tempMinute, setTempMinute] = useState(selectedMinute || 0);

  // Tạo danh sách giờ có thể chọn (dựa trên availableTimes)
  const getAvailableHours = () => {
    const hours = new Set<number>();
    availableTimes.forEach(time => {
      const [hour] = time.split(':').map(Number);
      hours.add(hour);
    });
    return Array.from(hours).sort((a, b) => a - b);
  };

  // Tạo danh sách phút có thể chọn (dựa trên availableTimes cho giờ đã chọn)
  const getAvailableMinutes = (hour: number) => {
    const minutes = new Set<number>();
    availableTimes.forEach(time => {
      const [timeHour, timeMinute] = time.split(':').map(Number);
      if (timeHour === hour) {
        minutes.add(timeMinute);
      }
    });
    return Array.from(minutes).sort((a, b) => a - b);
  };

  // Tạo danh sách tất cả giờ từ 0-23 (24 giờ)
  const getAllAvailableHours = () => {
    const hours = [];
    for (let hour = 0; hour <= 23; hour++) {
      hours.push(hour);
    }
    console.log('getAllAvailableHours result:', hours);
    return hours;
  };

  // Tạo danh sách tất cả phút (00, 15, 30, 45) cho giờ đã chọn
  const getAllAvailableMinutes = (hour: number) => {
    const minutes = [0, 15, 30, 45];
    console.log('getAllAvailableMinutes result:', minutes);
    return minutes;
  };

  // Đảm bảo có dữ liệu mặc định nếu availableTimes rỗng
  const getDefaultAvailableTimes = () => {
    console.log('getDefaultAvailableTimes - availableTimes:', availableTimes);
    if (!availableTimes || availableTimes.length === 0) {
      const defaultTimes = [];
      for (let hour = 6; hour <= 18; hour++) {
        for (let minute of [0, 15, 30, 45]) {
          defaultTimes.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        }
      }
      console.log('Using default times:', defaultTimes);
      return defaultTimes;
    }
    console.log('Using provided times:', availableTimes);
    return availableTimes;
  };

  const safeAvailableTimes = getDefaultAvailableTimes();
  const availableHours = getAllAvailableHours();
  const availableMinutes = getAllAvailableMinutes(tempHour);

  // Debug log
  console.log('=== TimePicker Debug ===');
  console.log('availableTimes:', availableTimes);
  console.log('safeAvailableTimes:', safeAvailableTimes);
  console.log('availableHours:', availableHours);
  console.log('availableMinutes:', availableMinutes);
  console.log('tempHour:', tempHour);
  console.log('tempMinute:', tempMinute);
  console.log('========================');

  const handleConfirm = () => {
    const timeString = `${tempHour.toString().padStart(2, '0')}:${tempMinute.toString().padStart(2, '0')}`;
    
    // Kiểm tra xem thời gian được chọn có trong safeAvailableTimes không
    if (safeAvailableTimes.includes(timeString)) {
      onTimeSelect(timeString);
      onClose();
    } else {
      // Nếu không có trong safeAvailableTimes, tìm thời gian gần nhất
      const validTimes = safeAvailableTimes.filter(time => {
        const [hour] = time.split(':').map(Number);
        return hour === tempHour;
      });
      
      if (validTimes.length > 0) {
        // Chọn thời gian đầu tiên có sẵn cho giờ đó
        onTimeSelect(validTimes[0]);
        onClose();
      } else {
        // Nếu không có giờ nào phù hợp, chọn thời gian đầu tiên có sẵn
        if (safeAvailableTimes.length > 0) {
          onTimeSelect(safeAvailableTimes[0]);
          onClose();
        }
      }
    }
  };

  const handleHourChange = (hour: number) => {
    setTempHour(hour);
    // Reset minute về phút đầu tiên có sẵn cho giờ mới
    const newAvailableMinutes = getAvailableMinutes(hour);
    if (newAvailableMinutes.length > 0) {
      setTempMinute(newAvailableMinutes[0]);
    }
  };

  const handleMinuteChange = (minute: number) => {
    setTempMinute(minute);
  };

  const renderPickerColumn = (
    data: number[],
    selectedValue: number,
    onValueChange: (value: number) => void,
    label: string,
    isHourColumn: boolean = false
  ) => {
    console.log(`=== renderPickerColumn ${label} ===`);
    console.log('data:', data);
    console.log('selectedValue:', selectedValue);
    console.log('data.length:', data.length);
    console.log('===============================');
    
    const itemHeight = 50;
    const visibleItems = 3;
    const totalHeight = itemHeight * visibleItems;
    const selectedIndex = data.indexOf(selectedValue);
    const scrollViewRef = useRef<ScrollView>(null);


    const handleScroll = (event: any) => {
      const scrollY = event.nativeEvent.contentOffset.y;
      const index = Math.round(scrollY / itemHeight);
      
      if (index >= 0 && index < data.length) {
        onValueChange(data[index]);
      }
    };

    const scrollToIndex = (index: number) => {
      const scrollY = index * itemHeight;
      scrollViewRef.current?.scrollTo({ y: scrollY, animated: true });
    };

    // Scroll đến item được chọn khi component mount
    React.useEffect(() => {
      if (selectedIndex >= 0) {
        setTimeout(() => scrollToIndex(selectedIndex), 100);
      }
    }, []);

    // Kiểm tra xem giá trị có trong safeAvailableTimes không
    const isValueAvailable = (value: number) => {
      // Tạm thời cho phép tất cả để test
      return true;
      
      // if (isHourColumn) {
      //   // Kiểm tra xem có phút nào cho giờ này trong safeAvailableTimes không
      //   return safeAvailableTimes.some(time => {
      //     const [hour] = time.split(':').map(Number);
      //     return hour === value;
      //   });
      // } else {
      //   // Kiểm tra xem có giờ:phút này trong safeAvailableTimes không
      //   const timeString = `${tempHour.toString().padStart(2, '0')}:${value.toString().padStart(2, '0')}`;
      //   return safeAvailableTimes.includes(timeString);
      // }
    };

    return (
      <View style={styles.pickerColumn}>
        <ThemedText style={styles.pickerLabel}>{label}</ThemedText>
        <View style={[styles.pickerContainer, { height: totalHeight }]}>
          <View style={styles.pickerOverlay} />
          <ScrollView
            ref={scrollViewRef}
            style={styles.pickerScrollView}
            showsVerticalScrollIndicator={false}
            snapToInterval={itemHeight}
            decelerationRate="fast"
            onMomentumScrollEnd={handleScroll}
            contentContainerStyle={{
              paddingVertical: itemHeight * visibleItems / 2
            }}
          >
            {data.map((value, index) => {
              const isSelected = value === selectedValue;
              const distance = Math.abs(index - selectedIndex);
              const opacity = distance === 0 ? 1 : distance === 1 ? 0.6 : 0.3;
              const scale = distance === 0 ? 1 : distance === 1 ? 0.9 : 0.8;
              const isAvailable = isValueAvailable(value);

              return (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.pickerItem,
                    { 
                      height: itemHeight,
                      opacity: isAvailable ? opacity : opacity * 0.3,
                      transform: [{ scale }]
                    }
                  ]}
                  onPress={() => {
                    if (isAvailable) {
                      onValueChange(value);
                      scrollToIndex(index);
                    }
                  }}
                  disabled={!isAvailable}
                >
                  <ThemedText style={[
                    styles.pickerItemText,
                    isSelected && styles.pickerItemTextSelected,
                    !isAvailable && styles.pickerItemTextDisabled
                  ]}>
                    {value.toString().padStart(2, '0')}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <ThemedText style={styles.cancelButtonText}>Hủy</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.title}>Chọn giờ bắt đầu</ThemedText>
            <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
              <ThemedText style={styles.confirmButtonText}>Xong</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Picker */}
          <View style={styles.pickerRow}>
            {renderPickerColumn(
              availableHours,
              tempHour,
              handleHourChange,
              'Giờ',
              true
            )}
            <ThemedText style={styles.separator}>:</ThemedText>
            {renderPickerColumn(
              availableMinutes,
              tempMinute,
              handleMinuteChange,
              'Phút',
              false
            )}
          </View>

          {/* Preview */}
          <View style={styles.preview}>
            <ThemedText style={styles.previewText}>
              {tempHour.toString().padStart(2, '0')}:{tempMinute.toString().padStart(2, '0')}
            </ThemedText>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  confirmButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 10,
  },
  pickerContainer: {
    position: 'relative',
    width: 80,
    overflow: 'hidden',
  },
  pickerScrollView: {
    flex: 1,
  },
  pickerOverlay: {
    position: 'absolute',
    top: 50, // itemHeight = 50, overlay ở giữa item thứ 2
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: '#4ECDC4',
    opacity: 0.1,
    borderRadius: 8,
    zIndex: 1,
  },
  pickerContent: {
    flex: 1,
  },
  pickerItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#2c3e50',
  },
  pickerItemTextSelected: {
    color: '#4ECDC4',
    fontWeight: '600',
  },
  pickerItemTextDisabled: {
    color: '#adb5bd',
  },
  separator: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginHorizontal: 10,
  },
  preview: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    marginHorizontal: 20,
  },
  previewText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
});
