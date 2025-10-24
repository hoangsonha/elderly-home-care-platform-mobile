// AvailabilityScreen.js
import React, { useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// thời gian từ 07:00 đến 22:00 (có thể chỉnh)
const START_HOUR = 7;
const END_HOUR = 22;

function pad(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

// Tạo mảng giờ ["07:00", "08:00", ...]
const generateTimeSlots = (start = START_HOUR, end = END_HOUR) => {
  const arr = [];
  for (let h = start; h <= end; h++) {
    arr.push(`${pad(h)}:00`);
  }
  return arr;
};

// Lấy mảng 7 ngày của tuần tính từ ngày bắt đầu (default: monday of current week)
const getWeekDays = (baseDate = new Date()) => {
  // tìm monday của tuần chứa baseDate
  const day = baseDate.getDay(); // 0 Sun .. 6 Sat
  // convert so Monday = 1 ... Sunday = 7
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() + diffToMon);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
};

export default function AvailabilityScreen() {
  const times = useMemo(() => generateTimeSlots(), []);
  const weekDays = useMemo(() => getWeekDays(new Date()), []);
  // selected set stores keys "dayIndex-hourIndex"
  const [selected, setSelected] = useState(new Set());

  // toggle cell
  const toggleCell = (dayIndex, hourIndex) => {
    const key = `${dayIndex}-${hourIndex}`;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const isSelected = (dayIndex, hourIndex) =>
    selected.has(`${dayIndex}-${hourIndex}`);

  // compute column widths
  const timeColWidth = 58;
  // we want 7 columns; allow small width per col but responsive
  const remaining = width - 32 - timeColWidth; // padding 16 left/right
  const dayColWidth = Math.max(80, Math.floor(remaining / 7)); // min 80

  // helper to render date label
  const renderDayLabel = (d) => {
    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const weekday = d.getDay(); // 0..6
    const displayDay = dayNames[weekday];
    const displayDate = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
    return { displayDay, displayDate };
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>Lịch làm việc trong tuần</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.weekBtn}
                onPress={() => Alert.alert("Tuần trước (chưa xử lý)")}
              >
                <Text style={styles.weekBtnText}>← Tuần trước</Text>
              </TouchableOpacity>
              <View style={styles.weekRange}>
                <Text style={styles.weekRangeText}>
                  {/* show monday - sunday */}
                  {`${pad(weekDays[0].getDate())}/${pad(
                    weekDays[0].getMonth() + 1
                  )} - ${pad(weekDays[6].getDate())}/${pad(
                    weekDays[6].getMonth() + 1
                  )}`}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.weekBtn}
                onPress={() => Alert.alert("Tuần sau (chưa xử lý)")}
              >
                <Text style={styles.weekBtnText}>Tuần sau →</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.setupBtn}
                onPress={() => Alert.alert("Thiết lập lịch rảnh (chưa xử lý)")}
              >
                <Text style={styles.setupBtnText}>Thiết lập lịch rảnh</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Grid header (hours + days) */}
          <View style={[styles.gridHeader, { paddingHorizontal: 16 }]}>
            <View style={[styles.timeColHeader, { width: timeColWidth }]}>
              <Text style={styles.timeHeaderText}>Giờ</Text>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "nowrap" }}>
              {weekDays.map((d, idx) => {
                const { displayDay, displayDate } = renderDayLabel(d);
                return (
                  <View
                    key={idx}
                    style={[styles.dayColHeader, { width: dayColWidth }]}
                  >
                    <Text style={styles.dayName}>{displayDay}</Text>
                    <Text style={styles.dayDate}>{displayDate}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Grid body: time rows */}
          <View style={{ paddingHorizontal: 16, paddingBottom: 40 }}>
            {times.map((t, hourIndex) => (
              <View key={t} style={styles.row}>
                {/* time col */}
                <View style={[styles.timeCol, { width: timeColWidth }]}>
                  <Text style={styles.timeText}>{t}</Text>
                </View>

                {/* day cols */}
                <View style={{ flexDirection: "row", flexWrap: "nowrap" }}>
                  {weekDays.map((d, dayIndex) => {
                    const selectedCell = isSelected(dayIndex, hourIndex);
                    return (
                      <TouchableOpacity
                        key={`${dayIndex}-${hourIndex}`}
                        activeOpacity={0.8}
                        style={[
                          styles.cell,
                          { width: dayColWidth },
                          selectedCell ? styles.cellSelected : styles.cellEmpty,
                        ]}
                        onPress={() => toggleCell(dayIndex, hourIndex)}
                      >
                        {/* show small indicator if selected */}
                        {selectedCell && <View style={styles.cellDot} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  screen: { flex: 1, backgroundColor: "#F8FAFC" },

  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 20, fontWeight: "700", color: "#0F172A" },

  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  weekBtn: { paddingHorizontal: 8, paddingVertical: 6, marginRight: 8 },
  weekBtnText: { color: "#2563EB", fontWeight: "600" },
  weekRange: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#EEF2F7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  weekRangeText: { color: "#0F172A", fontWeight: "600" },

  setupBtn: {
    marginLeft: 10,
    backgroundColor: "#2563EB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  setupBtnText: { color: "#fff", fontWeight: "700" },

  gridHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  timeColHeader: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
  timeHeaderText: { color: "#94A3B8", fontWeight: "600" },
  dayColHeader: {
    alignItems: "center",
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    backgroundColor: "#FFFFFF",
  },
  dayName: { fontSize: 12, color: "#64748B" },
  dayDate: { fontSize: 12, color: "#94A3B8", marginTop: 4 },

  row: {
    flexDirection: "row",
    alignItems: "stretch",
    // each row has border bottom to mimic grid lines
  },
  timeCol: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: "#F1F5F9",
  },
  timeText: { color: "#6B7280" },

  cell: {
    height: 56,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  cellEmpty: { backgroundColor: "#FFFFFF" },
  cellSelected: {
    backgroundColor: "#DCFCE7",
  },
  cellDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#059669",
  },
});