import { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Calendar, CalendarMarkingProps } from "react-native-calendars";

export default function AvailabilityScreen() {
  const [markedDates, setMarkedDates] = useState<
    CalendarMarkingProps["markedDates"]
  >({
    "2025-09-23": { selected: true, selectedColor: "#4ECDC4" },
    "2025-09-25": { selected: true, selectedColor: "#4ECDC4" },
  });

  const toggleDate = (date: { dateString: string }) => {
    const newMarkedDates = { ...markedDates };
    if (newMarkedDates[date.dateString]) {
      delete newMarkedDates[date.dateString];
    } else {
      newMarkedDates[date.dateString] = {
        selected: true,
        selectedColor: "#4ECDC4",
      };
    }
    setMarkedDates(newMarkedDates);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F9FC", paddingBottom: 100 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Text style={styles.title}>Quản lý lịch</Text>

        <Calendar
          onDayPress={toggleDate}
          markedDates={markedDates}
          markingType="simple"
          style={styles.calendar}
          theme={{
            todayTextColor: "#FF6B6B",
            selectedDayBackgroundColor: "#4ECDC4",
            arrowColor: "#4ECDC4",
          }}
        />

        <View style={{ marginTop: 24 }}>
          <Text style={styles.subtitle}>Ngày bạn đã chọn:</Text>
          {Object.keys(markedDates).length === 0 ? (
            <Text style={{ color: "#555" }}>Chưa chọn ngày nào</Text>
          ) : (
            Object.keys(markedDates).map((date) => (
              <Text key={date} style={styles.dateText}>
                {date}
              </Text>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "700", marginBottom: 16, color: "#222" },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#222",
  },
  dateText: { fontSize: 16, color: "#555", marginBottom: 6 },
  calendar: {
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
});
