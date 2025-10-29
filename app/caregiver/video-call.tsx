import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function VideoCallScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [facing, setFacing] = useState<"front" | "back">("front");

  const handleEndCall = () => {
    router.back();
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <MaterialCommunityIcons name="camera-off" size={60} color="#fff" />
          <Text style={styles.permissionText}>
            Cần quyền truy cập camera để thực hiện cuộc gọi video
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Cho phép camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main Camera View - Full Screen (Seeker/Elderly - Placeholder) */}
      <View style={styles.videoContainer}>
        <View style={styles.videoPlaceholder}>
          <MaterialCommunityIcons name="account" size={80} color="#fff" />
          <Text style={styles.remoteName}>Bà Nguyễn Thị Lan</Text>
        </View>
      </View>

      {/* Top Header - Back, Speaker, Flip */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.topButton} onPress={handleEndCall}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        <TouchableOpacity 
          style={styles.topButton}
          onPress={() => setIsSpeakerOn(!isSpeakerOn)}
        >
          <Ionicons 
            name={isSpeakerOn ? "volume-high" : "volume-mute"} 
            size={28} 
            color="#fff" 
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.topButton} onPress={toggleCameraFacing}>
          <Ionicons name="camera-reverse" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Small Video - Caregiver's Camera (Bottom Right) */}
      <View style={styles.smallVideoContainer}>
        {isVideoOff ? (
          <View style={styles.smallVideoPlaceholder}>
            <MaterialCommunityIcons name="video-off" size={24} color="#fff" />
          </View>
        ) : (
          <CameraView style={styles.cameraView} facing={facing} />
        )}
      </View>

      {/* Bottom Controls Bar */}
      <View style={styles.bottomControls}>
        {/* Camera */}
        <TouchableOpacity 
          style={styles.bottomButton}
          onPress={() => setIsVideoOff(!isVideoOff)}
        >
          <Ionicons 
            name={isVideoOff ? "videocam-off" : "videocam"} 
            size={28} 
            color="#fff" 
          />
        </TouchableOpacity>

        {/* Microphone */}
        <TouchableOpacity 
          style={styles.bottomButton}
          onPress={() => setIsMuted(!isMuted)}
        >
          <Ionicons 
            name={isMuted ? "mic-off" : "mic"} 
            size={28} 
            color="#fff" 
          />
        </TouchableOpacity>

        {/* End Call */}
        <TouchableOpacity style={styles.endCallButtonBottom} onPress={handleEndCall}>
          <MaterialCommunityIcons name="phone-hangup" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  videoContainer: {
    flex: 1,
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
  },
  remoteName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginTop: 12,
  },
  cameraView: {
    flex: 1,
    width: "100%",
  },
  // Top Header
  topHeader: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    zIndex: 10,
  },
  topButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  callerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  callerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  // Small Video (Seeker/Elderly)
  smallVideoContainer: {
    position: "absolute",
    bottom: 140,
    right: 20,
    width: 140,
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "#2a2a2a",
    zIndex: 10,
  },
  smallVideo: {
    flex: 1,
  },
  smallVideoPlaceholder: {
    flex: 1,
    backgroundColor: "#3a3a3a",
    justifyContent: "center",
    alignItems: "center",
  },
  smallVideoControls: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  smallControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  // Bottom Controls
  bottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
    backgroundColor: "rgba(0,0,0,0.7)",
    zIndex: 10,
  },
  bottomButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(80,80,80,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  endCallButtonBottom: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
  },
  // Permission
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
