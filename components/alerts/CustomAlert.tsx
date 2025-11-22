import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface CustomAlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor?: string;
  buttons?: CustomAlertButton[];
  onClose?: () => void;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  icon = "information",
  iconColor = "#70C1F1",
  buttons = [{ text: "OK", style: "default" }],
  onClose,
}) => {
  const handleButtonPress = (button: CustomAlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
            <MaterialCommunityIcons name={icon} size={48} color={iconColor} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  button.style === "cancel" && styles.buttonCancel,
                  button.style === "destructive" && styles.buttonDestructive,
                  button.style === "default" && styles.buttonDefault,
                  buttons.length === 1 && styles.buttonSingle,
                ]}
                onPress={() => handleButtonPress(button)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === "cancel" && styles.buttonTextCancel,
                    button.style === "destructive" && styles.buttonTextDestructive,
                    button.style === "default" && styles.buttonTextDefault,
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  alertContainer: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSingle: {
    flex: 1,
  },
  buttonDefault: {
    backgroundColor: "#70C1F1",
  },
  buttonCancel: {
    backgroundColor: "#F3F4F6",
  },
  buttonDestructive: {
    backgroundColor: "#FEE2E2",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTextDefault: {
    color: "#fff",
  },
  buttonTextCancel: {
    color: "#6B7280",
  },
  buttonTextDestructive: {
    color: "#EF4444",
  },
});

// Helper function to show custom alert
export const showCustomAlert = (
  title: string,
  message: string,
  buttons?: CustomAlertButton[],
  options?: {
    icon?: keyof typeof MaterialCommunityIcons.glyphMap;
    iconColor?: string;
  }
) => {
  // This is a placeholder - in actual implementation, you'd use a state manager
  // or context to control the alert visibility
  return {
    title,
    message,
    buttons,
    ...options,
  };
};
