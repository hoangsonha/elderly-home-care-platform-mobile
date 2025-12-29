import React, { useRef, useState } from "react";
import {
    StyleSheet,
    TextInput,
    View,
} from "react-native";

interface OTPInputProps {
  length?: number;
  onComplete: (code: string) => void;
  onCodeChange?: (code: string) => void;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  onCodeChange,
}) => {
  const [code, setCode] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    // Chỉ cho phép số
    const numericText = text.replace(/[^0-9]/g, "");
    
    if (numericText.length > 1) {
      // Nếu paste nhiều số, chia ra các ô
      const digits = numericText.slice(0, length).split("");
      const newCode = [...code];
      
      digits.forEach((digit, i) => {
        if (index + i < length) {
          newCode[index + i] = digit;
        }
      });
      
      setCode(newCode);
      
      // Focus vào ô tiếp theo
      const nextIndex = Math.min(index + digits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      
      // Gọi callback
      const finalCode = newCode.join("");
      onCodeChange?.(finalCode);
      if (finalCode.length === length) {
        onComplete(finalCode);
      }
      return;
    }

    // Cập nhật giá trị
    const newCode = [...code];
    newCode[index] = numericText;
    setCode(newCode);

    // Tự động focus ô tiếp theo
    if (numericText && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Gọi callback
    const finalCode = newCode.join("");
    onCodeChange?.(finalCode);
    if (finalCode.length === length) {
      onComplete(finalCode);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Xử lý backspace
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    // Select text khi focus
    inputRefs.current[index]?.setNativeProps({ selection: { start: 0, end: code[index].length } });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={[
              styles.input,
              digit ? styles.inputFilled : styles.inputEmpty,
            ]}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            onFocus={() => handleFocus(index)}
            keyboardType="numeric"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    gap: 8,
    paddingHorizontal: 10,
  },
  input: {
    width: 45,
    height: 60,
    borderWidth: 2,
    borderRadius: 12,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    backgroundColor: "#fff",
  },
  inputEmpty: {
    borderColor: "#dee2e6",
    color: "#2c3e50",
  },
  inputFilled: {
    borderColor: "#667eea",
    color: "#667eea",
    backgroundColor: "#f0f4ff",
  },
});

