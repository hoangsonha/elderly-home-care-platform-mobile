import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import AvailabilityModal from "@/components/schedule/AvailabilityModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAppointmentStatus,
  subscribeToStatusChanges,
} from "@/data/appointmentStore";
import { CaregiverScheduleService } from "@/services/caregiver-schedule.service";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// Parse Vietnamese date format "T5, 13 Thg 11 2025" to Date object
const parseVietnameseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;

  // Match pattern: "T5, 13 Thg 11 2025" or "CN, 16 Thg 11 2025"
  const match = dateStr.match(/(\d{1,2})\s+Thg\s+(\d{1,2})\s+(\d{4})/);
  if (match) {
    const day = parseInt(match[1]);
    const month = parseInt(match[2]) - 1; // Month is 0-indexed in Date
    const year = parseInt(match[3]);
    return new Date(year, month, day);
  }

  // If already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr);
  }

  return null;
};

// Mock data for schedule
const scheduleData = [
  {
    id: "1",
    date: new Date(2025, 9, 25), // Oct 25, 2025 (Thứ 6)
    time: "8:00 - 16:00",
    duration: "8 giờ",
    name: "Bà Nguyễn Thị Lan",
    category: "Cao Cấp",
    service: "Chăm sóc toàn diện",
    address: "123 Nguyễn Văn Linh, Q7",
    price: "1,100,000₫",
    status: "in-progress",
  },
  {
    id: "2",
    date: new Date(2025, 9, 26), // Oct 26, 2025 (Thứ 7)
    time: "8:00 - 16:00",
    duration: "8 giờ",
    name: "Ông Trần Văn Hùng",
    category: "Tiêu Chuẩn",
    service: "Hỗ trợ sinh hoạt",
    address: "456 Lê Văn Việt, Q9",
    price: "750,000₫",
    status: "pending",
  },
  {
    id: "3",
    date: new Date(2025, 10, 11), // Nov 11, 2025 (Thứ ba) - Month is 0-indexed, so 10 = November
    time: "8:00 - 12:00",
    duration: "4 giờ",
    name: "Bà Lê Thị Hoa",
    category: "Cơ Bản",
    service: "Hỗ trợ cơ bản",
    address: "789 Pasteur, Q1",
    price: "400,000₫",
    status: "new",
  },
];

export default function AvailabilityScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  // TODO: Replace with API call
  // const { appointments, loading, error, refresh } = useAppointments(user?.id || '', user?.role);
  // Mock data tạm thời
  const appointments: any[] = [
    {
      id: "apt-1",
      elderly_profile_id: "elderly-1",
      start_date: "2024-12-25",
      status: "confirmed",
    },
  ];
  const loading = false;
  const error = null;
  const refresh = async () => {};

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [availabilityData, setAvailabilityData] = useState<any[]>([]);

  const [refreshKey, setRefreshKey] = useState(0);
  const [elderlyNames, setElderlyNames] = useState<{ [key: string]: string }>(
    {}
  );

  const loadFreeSchedule = async () => {
    try {
      const res = await CaregiverScheduleService.getFreeSchedule();
      console.log("check lich ranh", res);

      const freeSchedule = res.data;

      // Rảnh toàn thời gian
      if (freeSchedule.available_all_time) {
        setAvailabilityData([
          {
            date: new Date(),
            isFullDay: true,
            timeSlots: [],
          },
        ]);
        return;
      }

      // Nếu sau này backend trả booked_slots
      if (freeSchedule.booked_slots?.length) {
        const mapped = freeSchedule.booked_slots.map((slot: any) => ({
          date: new Date(slot.date),
          isFullDay: false,
          timeSlots: [
            {
              start: slot.start_time,
              end: slot.end_time,
            },
          ],
        }));

        setAvailabilityData(mapped);
      } else {
        setAvailabilityData([]);
      }
    } catch (err) {
    }
  };

  useEffect(() => {
    loadFreeSchedule();
  }, []);

  useEffect(() => {
    const loadElderlyNames = async () => {
      const names: { [key: string]: string } = {};
      for (const apt of appointments) {
        if (apt.elderly_profile_id && !names[apt.elderly_profile_id]) {
          try {
            // Mock data tạm thời - TODO: Replace with API call
            const mockElderlyNames: { [key: string]: string } = {
              "elderly-1": "Bà Nguyễn Thị Mai",
              "elderly-2": "Ông Trần Văn Nam",
            };
            names[apt.elderly_profile_id] =
              mockElderlyNames[apt.elderly_profile_id] || "Người già";
          } catch (err) {
            console.error("Error loading elderly profile:", err);
          }
        }
      }
      setElderlyNames(names);
    };

    if (appointments.length > 0) {
      loadElderlyNames();
    }
  }, [appointments]);

  // Refresh appointments when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        refresh();
      }
    }, [user?.id, refresh])
  );

  // Handler for opening modal
  const handleOpenModal = useCallback(() => {
    console.log("Opening modal, current state:", modalVisible);
    setModalVisible(true);
  }, [modalVisible]);

  // Set up the header button to open modal
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleOpenModal}
          style={{
            marginRight: 15,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.25)",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
            gap: 6,
          }}
        >
          <MaterialCommunityIcons name="bell-outline" size={20} color="#fff" />
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
            Lịch rảnh
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleOpenModal]);

  useEffect(() => {
    const unsubscribe = subscribeToStatusChanges(() => {
      setRefreshKey((prev) => prev + 1);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Get calendar data for current month
  const getMonthData = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    return { year, month, daysInMonth, startDayOfWeek };
  };

  const { year, month, daysInMonth, startDayOfWeek } =
    getMonthData(currentDate);

  const getAvailabilityStatus = (day: number) => {
    const availability = availabilityData.find(
      (item) =>
        item.date.getDate() === day &&
        item.date.getMonth() === month &&
        item.date.getFullYear() === year
    );

    const hasAppointment = appointments.some((item) => {
      if (item.status === "cancelled" || item.status === "rejected")
        return false; // Skip cancelled/rejected
      const parsedDate = parseVietnameseDate(item.start_date);
      if (!parsedDate) return false;

      return (
        parsedDate.getDate() === day &&
        parsedDate.getMonth() === month &&
        parsedDate.getFullYear() === year
      );
    });

    if (!availability) {
      return null; // No availability set (busy by default)
    }

    // If marked as full day available
    if (availability.isFullDay) {
      return "free"; // Full day green, regardless of appointments
    }

    // If set by time slots (partial day)
    if (hasAppointment) {
      return "mixed"; // Has some free time slots, some busy - show split color
    }

    return "mixed"; // Has time slots set but no appointment - still show split color
  };

  // Get dates with schedule from real appointments (excluding cancelled and rejected)
  const getDatesWithSchedule = () => {
    const dates = new Set<string>();
    appointments.forEach((item) => {
      if (item.status === "cancelled" || item.status === "rejected") return; // Skip cancelled/rejected
      const parsedDate = parseVietnameseDate(item.start_date);
      if (parsedDate) {
        const dateStr = `${parsedDate.getDate()}-${parsedDate.getMonth()}-${parsedDate.getFullYear()}`;
        dates.add(dateStr);
      }
    });
    return dates;
  };

  const datesWithSchedule = getDatesWithSchedule();

  // Check if date has schedule
  const hasSchedule = (day: number) => {
    const dateStr = `${day}-${month}-${year}`;
    return datesWithSchedule.has(dateStr);
  };

  // Check if date is today
  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  // Check if date is selected
  const isSelectedDate = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    );
  };

  // Get schedule for selected date from real appointments (excluding cancelled and rejected)
  const getScheduleForDate = () => {
    return appointments.filter((item) => {
      if (item.status === "cancelled" || item.status === "rejected")
        return false; // Skip cancelled/rejected
      const parsedDate = parseVietnameseDate(item.start_date);
      if (!parsedDate) return false;

      return (
        parsedDate.getDate() === selectedDate.getDate() &&
        parsedDate.getMonth() === selectedDate.getMonth() &&
        parsedDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  };

  const scheduleForSelectedDate = getScheduleForDate();

  // Get availability for selected date
  const getAvailabilityForDate = () => {
    return availabilityData.find(
      (item) =>
        item.date.getDate() === selectedDate.getDate() &&
        item.date.getMonth() === selectedDate.getMonth() &&
        item.date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const availabilityForSelectedDate = getAvailabilityForDate();

  // Month navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleDateSelect = (day: number) => {
    setSelectedDate(new Date(year, month, day));
  };

  // Render calendar
  const renderCalendar = () => {
    const days = [];
    const dayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

    // Day labels
    const dayLabelRow = (
      <View key="labels" style={styles.calendarRow}>
        {dayLabels.map((label, index) => (
          <View key={index} style={styles.dayLabel}>
            <Text style={styles.dayLabelText}>{label}</Text>
          </View>
        ))}
      </View>
    );
    days.push(dayLabelRow);

    // Empty cells before first day
    let weekRow = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      weekRow.push(
        <View key={`empty-${i}`} style={styles.dayCell}>
          <Text style={styles.emptyDayText}></Text>
        </View>
      );
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const todayFlag = isToday(day);
      const selectedFlag = isSelectedDate(day);
      const hasScheduleFlag = hasSchedule(day);
      const availabilityStatus = getAvailabilityStatus(day);

      weekRow.push(
        <TouchableOpacity
          key={day}
          style={[styles.dayCell, selectedFlag && styles.dayCellSelected]}
          onPress={() => handleDateSelect(day)}
        >
          {/* Availability status background */}
          {availabilityStatus === "free" && (
            <View style={styles.dayAvailableFull} />
          )}
          {availabilityStatus === "mixed" && (
            <View style={styles.dayAvailableMixed}>
              <View style={styles.dayAvailableMixedHalf1} />
              <View style={styles.dayAvailableMixedHalf2} />
            </View>
          )}

          <View
            style={[
              styles.dayContent,
              todayFlag && styles.dayContentToday,
              selectedFlag && styles.dayContentSelected,
            ]}
          >
            <Text
              style={[
                styles.dayText,
                todayFlag && styles.dayTextToday,
                selectedFlag && styles.dayTextSelected,
              ]}
            >
              {day}
            </Text>
          </View>
          {hasScheduleFlag && (
            <View style={styles.scheduleIndicator}>
              <View style={styles.scheduleIndicatorDot} />
              {appointments.filter((item) => {
                if (item.status === "cancelled" || item.status === "rejected")
                  return false; // Skip cancelled/rejected
                const parsedDate = parseVietnameseDate(item.start_date);
                if (!parsedDate) return false;
                return (
                  parsedDate.getDate() === day &&
                  parsedDate.getMonth() === month &&
                  parsedDate.getFullYear() === year
                );
              }).length > 1 && (
                <View
                  style={[styles.scheduleIndicatorDot, { marginLeft: 2 }]}
                />
              )}
            </View>
          )}
        </TouchableOpacity>
      );

      if ((startDayOfWeek + day) % 7 === 0 || day === daysInMonth) {
        // Fill remaining cells in the last row
        while (weekRow.length < 7) {
          weekRow.push(
            <View key={`empty-end-${weekRow.length}`} style={styles.dayCell}>
              <Text style={styles.emptyDayText}></Text>
            </View>
          );
        }
        days.push(
          <View key={`week-${days.length}`} style={styles.calendarRow}>
            {weekRow}
          </View>
        );
        weekRow = [];
      }
    }

    return days;
  };

  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  const formatSelectedDate = () => {
    const dayOfWeek = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];
    return `${dayOfWeek[selectedDate.getDay()]}, ${selectedDate.getDate()} ${
      monthNames[selectedDate.getMonth()]
    }`;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar Section */}
        <View style={styles.calendarSection}>
          {/* Month Header */}
          <View style={styles.monthHeader}>
            <TouchableOpacity
              onPress={goToPreviousMonth}
              style={styles.monthButton}
            >
              <MaterialCommunityIcons
                name="chevron-left"
                size={24}
                color="#64748B"
              />
            </TouchableOpacity>

            <Text style={styles.monthTitle}>
              {monthNames[month]}, {year}
            </Text>

            <TouchableOpacity
              onPress={goToNextMonth}
              style={styles.monthButton}
            >
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>

          {/* Today Button */}
          <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
            <Text style={styles.todayButtonText}>Hôm nay</Text>
          </TouchableOpacity>

          {/* Separator */}
          <View style={styles.separator} />

          {/* Calendar Grid */}
          <View style={styles.calendar}>{renderCalendar()}</View>
        </View>

        {/* Schedule List Section */}
        <View style={styles.scheduleSection}>
          <View style={styles.scheduleDateHeader}>
            <MaterialCommunityIcons
              name="calendar-blank"
              size={24}
              color="#2196F3"
            />
            <Text style={styles.scheduleDateText}>{formatSelectedDate()}</Text>
          </View>

          {/* Availability Info */}
          {availabilityForSelectedDate && (
            <View style={styles.availabilityInfo}>
              <View style={styles.availabilityHeader}>
                <MaterialCommunityIcons
                  name="clock-check-outline"
                  size={20}
                  color="#10B981"
                />
                <Text style={styles.availabilityHeaderText}>
                  {availabilityForSelectedDate.isFullDay
                    ? "Rảnh cả ngày"
                    : "Khung giờ rảnh"}
                </Text>
              </View>

              {!availabilityForSelectedDate.isFullDay &&
                availabilityForSelectedDate.timeSlots.length > 0 && (
                  <View style={styles.availabilityTimeSlots}>
                    {availabilityForSelectedDate.timeSlots.map(
                      (slot, index) => (
                        <View key={index} style={styles.availabilityTimeSlot}>
                          <MaterialCommunityIcons
                            name="clock-outline"
                            size={16}
                            color="#64748B"
                          />
                          <Text style={styles.availabilityTimeSlotText}>
                            {slot.start} - {slot.end}
                          </Text>
                        </View>
                      )
                    )}
                  </View>
                )}
            </View>
          )}

          {scheduleForSelectedDate.length > 0 ? (
            scheduleForSelectedDate.map((item) => {
              // Get real-time status from global store
              const currentStatus =
                getAppointmentStatus(item.id) || item.status;

              // Skip cancelled and rejected appointments
              if (currentStatus === "cancelled" || currentStatus === "rejected")
                return null;

              // Get elderly name
              const elderlyName =
                elderlyNames[item.elderly_profile_id] || "Đang tải...";

              // Determine card border color based on status
              const getStatusBorderColor = () => {
                switch (currentStatus) {
                  case "new":
                    return "#3B82F6"; // Blue
                  case "pending":
                    return "#F59E0B"; // Orange
                  case "confirmed":
                    return "#10B981"; // Green
                  case "in-progress":
                    return "#8B5CF6"; // Purple
                  case "completed":
                    return "#6B7280"; // Gray
                  case "cancelled":
                    return "#EF4444"; // Red
                  case "rejected":
                    return "#DC2626"; // Dark Red
                  default:
                    return "#10B981";
                }
              };

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.scheduleCard,
                    { borderLeftColor: getStatusBorderColor() },
                  ]}
                  onPress={() =>
                    (navigation.navigate as any)("Appointment Detail", {
                      appointmentId: item.id,
                      fromScreen: "availability",
                    })
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.scheduleTime}>
                    <Text style={styles.scheduleTimeText}>
                      {item.start_time}
                    </Text>
                  </View>

                  <View style={styles.scheduleDetails}>
                    <View style={styles.scheduleAvatar}>
                      <MaterialCommunityIcons
                        name="account"
                        size={32}
                        color="#2196F3"
                      />
                    </View>

                    <View style={styles.scheduleInfo}>
                      <Text style={styles.scheduleName}>{elderlyName}</Text>

                      <View style={styles.scheduleServiceRow}>
                        <MaterialCommunityIcons
                          name="heart-pulse"
                          size={16}
                          color="#7C3AED"
                        />
                        <Text style={styles.scheduleService}>
                          {item.package_type || "Gói cơ bản"}
                        </Text>
                      </View>

                      <View style={styles.scheduleAddressRow}>
                        <MaterialCommunityIcons
                          name="map-marker"
                          size={16}
                          color="#EF4444"
                        />
                        <Text style={styles.scheduleAddress}>
                          {item.work_location || "N/A"}
                        </Text>
                      </View>

                      <View style={styles.schedulePriceRow}>
                        <MaterialCommunityIcons
                          name="cash"
                          size={16}
                          color="#F59E0B"
                        />
                        <Text style={styles.schedulePrice}>
                          {(item.total_amount || 0).toLocaleString("vi-VN")} đ
                        </Text>
                      </View>
                    </View>

                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={24}
                      color="#CBD5E1"
                    />
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptySchedule}>
              <MaterialCommunityIcons
                name="calendar-blank-outline"
                size={64}
                color="#CBD5E1"
              />
              <Text style={styles.emptyScheduleText}>
                Không có lịch làm việc
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <CaregiverBottomNav activeTab="schedule" />

      {/* Availability Modal */}
      <AvailabilityModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={async (data) => {
          try {
            const { isFullDay, timeSlots, startDate } = data;
            console.log({ startDate });
            if (isFullDay) {
              await CaregiverScheduleService.updateFreeSchedule({
                free_schedule: {
                  available_all_time: true,
                },
              });
            } else {
              const bookedSlots = timeSlots.map((slot: any) => ({
                date: startDate.toISOString().split("T")[0],
                start_time: slot.startTime,
                end_time: slot.endTime,
              }));

              await CaregiverScheduleService.updateFreeSchedule({
                free_schedule: {
                  available_all_time: false,
                  booked_slots: bookedSlots,
                },
              });
            }

            await loadFreeSchedule();
            setModalVisible(false);
          } catch (err) {
            console.log("Update free schedule error:", err);
          }
        }}
        existingSchedule={scheduleData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 350,
  },

  // Calendar Section
  calendarSection: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  monthButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginHorizontal: 20,
  },
  todayButton: {
    alignSelf: "center",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  todayButtonText: {
    color: "#2196F3",
    fontSize: 14,
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
    marginHorizontal: -16,
  },

  // Calendar Grid
  calendar: {
    marginTop: 8,
  },
  calendarRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  dayLabel: {
    width: (width - 32) / 7,
    alignItems: "center",
    paddingVertical: 8,
  },
  dayLabelText: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
  },
  dayCell: {
    width: (width - 32) / 7,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    position: "relative",
    overflow: "hidden",
  },
  dayCellSelected: {
    backgroundColor: "#F0F9FF",
    borderRadius: 8,
  },
  dayAvailableFull: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#DCFCE7", // Light green
    borderRadius: 8,
  },
  dayAvailableMixed: {
    position: "absolute",
    width: "100%",
    height: "100%",
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
  },
  dayAvailableMixedHalf1: {
    position: "absolute",
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderRightWidth: (width - 32) / 7,
    borderTopWidth: 56,
    borderRightColor: "transparent",
    borderTopColor: "#DBEAFE", // Light blue
    left: 0,
    top: 0,
  },
  dayAvailableMixedHalf2: {
    position: "absolute",
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: (width - 32) / 7,
    borderBottomWidth: 56,
    borderLeftColor: "transparent",
    borderBottomColor: "#FEF3C7", // Light yellow
    right: 0,
    bottom: 0,
  },
  dayContent: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dayContentToday: {
    backgroundColor: "#2196F3",
  },
  dayContentSelected: {
    backgroundColor: "#2196F3",
  },
  dayText: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "500",
  },
  dayTextToday: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  dayTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  emptyDayText: {
    fontSize: 16,
    color: "#CBD5E1",
  },
  scheduleIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  scheduleIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#10B981",
  },

  // Schedule Section
  scheduleSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  scheduleDateHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  scheduleDateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },

  // Schedule Card
  scheduleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scheduleTime: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scheduleTimeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#059669",
  },
  scheduleDuration: {
    fontSize: 12,
    color: "#059669",
  },
  scheduleDetails: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  scheduleAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
  },
  scheduleInfo: {
    flex: 1,
    gap: 6,
  },
  scheduleName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },
  scheduleServiceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  scheduleService: {
    fontSize: 14,
    color: "#7C3AED",
  },
  scheduleAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  scheduleAddress: {
    fontSize: 14,
    color: "#64748B",
    flex: 1,
  },
  schedulePriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  schedulePrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F59E0B",
  },

  // Empty State
  emptySchedule: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyScheduleText: {
    fontSize: 16,
    color: "#94A3B8",
    marginTop: 12,
  },
  availabilityInfo: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  availabilityHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  availabilityHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10B981",
  },
  availabilityTimeSlots: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  availabilityTimeSlot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  availabilityTimeSlotText: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "500",
  },
});
