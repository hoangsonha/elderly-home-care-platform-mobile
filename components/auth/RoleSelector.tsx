import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export type RoleType = "ROLE_CARE_SEEKER" | "ROLE_CAREGIVER";

interface RoleSelectorProps {
  selectedRole: RoleType | null;
  onSelectRole: (role: RoleType) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onSelectRole,
}) => {
  const roles: { value: RoleType; label: string; icon: string }[] = [
    {
      value: "ROLE_CARE_SEEKER",
      label: "Người cần dịch vụ chăm sóc",
      icon: "people",
    },
    {
      value: "ROLE_CAREGIVER",
      label: "Người cung cấp dịch vụ chăm sóc",
      icon: "heart",
    },
  ];

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>
        Vai trò <ThemedText style={styles.required}>*</ThemedText>
      </ThemedText>
      <View style={styles.roleContainer}>
        {roles.map((role) => {
          const isSelected = selectedRole === role.value;
          return (
            <TouchableOpacity
              key={role.value}
              style={[
                styles.roleCard,
                isSelected && styles.roleCardSelected,
              ]}
              onPress={() => onSelectRole(role.value)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconContainer,
                  isSelected && styles.iconContainerSelected,
                ]}
              >
                <Ionicons
                  name={role.icon as any}
                  size={20}
                  color={isSelected ? "#68C2E8" : "#6c757d"}
                />
              </View>
              <ThemedText
                style={[
                  styles.roleLabel,
                  isSelected && styles.roleLabelSelected,
                ]}
              >
                {role.label}
              </ThemedText>
              {isSelected && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={18} color="#68C2E8" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  required: {
    color: "#dc3545",
  },
  roleContainer: {
    flexDirection: "row",
    gap: 10,
  },
  roleCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#dee2e6",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#fff",
    position: "relative",
    minHeight: 70,
    justifyContent: "center",
  },
  roleCardSelected: {
    borderColor: "#68C2E8",
    backgroundColor: "#E8F6FB",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  iconContainerSelected: {
    backgroundColor: "#D4EFF8",
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#2c3e50",
    textAlign: "center",
  },
  roleLabelSelected: {
    color: "#68C2E8",
    fontWeight: "600",
  },
  checkmark: {
    position: "absolute",
    top: 4,
    right: 4,
  },
});

