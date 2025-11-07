import { ThemedText } from "@/components/themed-text";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Star Rating Component
interface StarRatingProps {
    rating: number;
    onRatingChange: (rating: number) => void;
    leftLabel: string;
    rightLabel: string;
}

const StarRating: React.FC<StarRatingProps> = ({
    rating,
    onRatingChange,
    leftLabel,
    rightLabel,
}) => {
    const maxStars = 5;

    return (
        <View style={styles.ratingContainer}>
            <View style={styles.ratingLabels}>
                <Text style={styles.ratingLabelLeft}>{leftLabel}</Text>
                <Text style={styles.ratingValue}>
                    {rating > 0 ? `${rating}/5` : "Chưa đánh giá"}
                </Text>
                <Text style={styles.ratingLabelRight}>{rightLabel}</Text>
            </View>
            <View style={styles.starsContainer}>
                {Array.from({ length: maxStars }, (_, index) => {
                    const starValue = index + 1;
                    return (
                        <TouchableOpacity
                            key={starValue}
                            onPress={() => onRatingChange(starValue)}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={starValue <= rating ? "star" : "star-outline"}
                                size={32}
                                color={starValue <= rating ? "#FFD700" : "#E0E0E0"}
                                style={styles.star}
                            />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

export default function VideoQualityReviewScreen() {
    const navigation = useNavigation();

    // Star rating values (0-5 stars, 0 = not rated)
    const [imageClarity, setImageClarity] = useState(0);
    const [audioQuality, setAudioQuality] = useState(0);
    const [lighting, setLighting] = useState(0);
    const [cameraAngle, setCameraAngle] = useState(0);
    const [connectionStability, setConnectionStability] = useState(0);

    // Radio button values
    const [connectionIssueFrequency, setConnectionIssueFrequency] = useState<string>("");
    const [easeOfUse, setEaseOfUse] = useState<string>("");
    const [privacyConcern, setPrivacyConcern] = useState<string>("");

    // Text inputs
    const [technicalIssues, setTechnicalIssues] = useState("");
    const [suggestions, setSuggestions] = useState("");

    const handleSubmit = () => {
        // Validate required fields
        if (
            imageClarity === 0 ||
            audioQuality === 0 ||
            lighting === 0 ||
            cameraAngle === 0 ||
            connectionStability === 0 ||
            !connectionIssueFrequency ||
            !easeOfUse ||
            !privacyConcern
        ) {
            Alert.alert(
                "Thông báo",
                "Vui lòng điền đầy đủ thông tin đánh giá, bao gồm tất cả các tiêu chí chất lượng video"
            );
            return;
        }

        // Here you would send the data to your backend
        console.log("Review submitted:", {
            imageClarity,
            audioQuality,
            lighting,
            cameraAngle,
            connectionStability,
            connectionIssueFrequency,
            easeOfUse,
            privacyConcern,
            technicalIssues,
            suggestions,
        });

        Alert.alert(
            "Cảm ơn bạn!",
            "Đánh giá của bạn đã được gửi thành công.",
            [
                {
                    text: "OK",
                    onPress: () => {
                        // Navigate to home
                        navigation.navigate("Trang chủ" as never);
                    },
                },
            ]
        );
    };

    const renderRadioButton = (
        label: string,
        value: string,
        selectedValue: string,
        onSelect: (value: string) => void
    ) => {
        const isSelected = selectedValue === value;
        return (
            <TouchableOpacity
                style={styles.radioButton}
                onPress={() => onSelect(value)}
                activeOpacity={0.7}
            >
                <View style={styles.radioCircle}>
                    {isSelected && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioLabel}>{label}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerIcon}>
                        <LinearGradient
                            colors={["#4ECDC4", "#44A08D"]}
                            style={styles.iconGradient}
                        >
                            <MaterialCommunityIcons
                                name="video-outline"
                                size={32}
                                color="#fff"
                            />
                        </LinearGradient>
                    </View>
                    <ThemedText style={styles.headerTitle} numberOfLines={2}>
                        Đánh giá Chất lượng Video
                    </ThemedText>
                    <ThemedText style={styles.headerSubtitle} numberOfLines={3}>
                        Đánh giá chất lượng kỹ thuật và trải nghiệm sử dụng hệ thống video giám sát
                    </ThemedText>
                </View>

                {/* Section 1: Video Quality Sliders */}
                <View style={styles.section}>
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconContainer, { backgroundColor: "#E3F2FD" }]}>
                                <Ionicons name="eye-outline" size={24} color="#2196F3" />
                            </View>
                            <View style={styles.cardTitleContainer}>
                                <ThemedText style={styles.cardTitle}>
                                    Độ rõ nét hình ảnh
                                </ThemedText>
                                <ThemedText style={styles.cardSubtitle}>
                                    Mức độ rõ ràng, sắc nét của hình ảnh video
                                </ThemedText>
                            </View>
                        </View>
                        <StarRating
                            rating={imageClarity}
                            onRatingChange={setImageClarity}
                            leftLabel="Rất mờ"
                            rightLabel="Rất rõ nét"
                        />
                    </View>

                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconContainer, { backgroundColor: "#E8F5E9" }]}>
                                <Ionicons name="volume-high-outline" size={24} color="#4CAF50" />
                            </View>
                            <View style={styles.cardTitleContainer}>
                                <ThemedText style={styles.cardTitle}>
                                    Chất lượng âm thanh
                                </ThemedText>
                                <ThemedText style={styles.cardSubtitle}>
                                    Độ rõ ràng và chất lượng của âm thanh
                                </ThemedText>
                            </View>
                        </View>
                        <StarRating
                            rating={audioQuality}
                            onRatingChange={setAudioQuality}
                            leftLabel="Nhiều tạp âm"
                            rightLabel="Rất rõ ràng"
                        />
                    </View>

                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconContainer, { backgroundColor: "#FFF3E0" }]}>
                                <Ionicons name="bulb-outline" size={24} color="#FF9800" />
                            </View>
                            <View style={styles.cardTitleContainer}>
                                <ThemedText style={styles.cardTitle}>Ánh sáng</ThemedText>
                                <ThemedText style={styles.cardSubtitle}>
                                    Độ phù hợp của ánh sáng trong video (không quá tối/sáng)
                                </ThemedText>
                            </View>
                        </View>
                        <StarRating
                            rating={lighting}
                            onRatingChange={setLighting}
                            leftLabel="Tối/Chói"
                            rightLabel="Hoàn hảo"
                        />
                    </View>
                </View>

                {/* Section 2: Camera and Connection */}
                <View style={styles.section}>
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconContainer, { backgroundColor: "#E3F2FD" }]}>
                                <Ionicons name="videocam-outline" size={24} color="#2196F3" />
                            </View>
                            <View style={styles.cardTitleContainer}>
                                <ThemedText style={styles.cardTitle}>Góc quay camera</ThemedText>
                                <ThemedText style={styles.cardSubtitle}>
                                    Vị trí và góc nhìn của camera có phù hợp để theo dõi
                                </ThemedText>
                            </View>
                        </View>
                        <StarRating
                            rating={cameraAngle}
                            onRatingChange={setCameraAngle}
                            leftLabel="Không phù hợp"
                            rightLabel="Rất phù hợp"
                        />
                    </View>

                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconContainer, { backgroundColor: "#E8F5E9" }]}>
                                <Ionicons name="wifi-outline" size={24} color="#4CAF50" />
                            </View>
                            <View style={styles.cardTitleContainer}>
                                <ThemedText style={styles.cardTitle}>
                                    Độ ổn định kết nối
                                </ThemedText>
                                <ThemedText style={styles.cardSubtitle}>
                                    Video có bị giật lag, mất kết nối không?
                                </ThemedText>
                            </View>
                        </View>
                        <StarRating
                            rating={connectionStability}
                            onRatingChange={setConnectionStability}
                            leftLabel="Thường xuyên giật lag"
                            rightLabel="Rất ổn định"
                        />
                    </View>

                    {/* Connection Issue Frequency */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <ThemedText style={styles.cardTitle}>
                                Tần suất sự cố kết nối
                            </ThemedText>
                        </View>
                        <ThemedText style={styles.cardSubtitle}>
                            Bạn gặp sự cố kết nối bao nhiêu lần trong thời gian sử dụng?
                        </ThemedText>
                        <View style={styles.radioGroup}>
                            {renderRadioButton(
                                "Không bao giờ - Luôn hoạt động ổn định",
                                "never",
                                connectionIssueFrequency,
                                setConnectionIssueFrequency
                            )}
                            {renderRadioButton(
                                "Hiếm khi - 1-2 lần/tháng",
                                "rare",
                                connectionIssueFrequency,
                                setConnectionIssueFrequency
                            )}
                            {renderRadioButton(
                                "Thỉnh thoảng - 1-2 lần/tuần",
                                "occasional",
                                connectionIssueFrequency,
                                setConnectionIssueFrequency
                            )}
                            {renderRadioButton(
                                "Thường xuyên - Gần như mỗi ngày",
                                "frequent",
                                connectionIssueFrequency,
                                setConnectionIssueFrequency
                            )}
                            {renderRadioButton(
                                "Liên tục - Nhiều lần trong ngày",
                                "continuous",
                                connectionIssueFrequency,
                                setConnectionIssueFrequency
                            )}
                        </View>
                    </View>
                </View>

                {/* Section 3: Usability and Privacy */}
                <View style={styles.section}>
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <ThemedText style={styles.cardTitle}>Tính dễ sử dụng</ThemedText>
                        </View>
                        <ThemedText style={styles.cardSubtitle}>
                            Giao diện và tính năng video có dễ sử dụng không?
                        </ThemedText>
                        <View style={styles.radioGroup}>
                            {renderRadioButton(
                                "Rất dễ - Trực quan, không cần hướng dẫn",
                                "very_easy",
                                easeOfUse,
                                setEaseOfUse
                            )}
                            {renderRadioButton(
                                "Dễ - Cần làm quen một chút",
                                "easy",
                                easeOfUse,
                                setEaseOfUse
                            )}
                            {renderRadioButton(
                                "Trung bình - Cần hướng dẫn ban đầu",
                                "average",
                                easeOfUse,
                                setEaseOfUse
                            )}
                            {renderRadioButton(
                                "Khó - Nhiều tính năng phức tạp",
                                "difficult",
                                easeOfUse,
                                setEaseOfUse
                            )}
                        </View>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <ThemedText style={styles.cardTitle}>
                                Mối quan ngại về quyền riêng tư
                            </ThemedText>
                        </View>
                        <ThemedText style={styles.cardSubtitle}>
                            Có vấn đề gì về quyền riêng tư khi sử dụng video không?
                        </ThemedText>
                        <View style={styles.radioGroup}>
                            {renderRadioButton(
                                "Không có - Hoàn toàn tin tưởng hệ thống",
                                "none",
                                privacyConcern,
                                setPrivacyConcern
                            )}
                            {renderRadioButton(
                                "Nhỏ - Một số lo ngại nhưng chấp nhận được",
                                "minor",
                                privacyConcern,
                                setPrivacyConcern
                            )}
                            {renderRadioButton(
                                "Trung bình - Cần thêm tính năng bảo mật",
                                "moderate",
                                privacyConcern,
                                setPrivacyConcern
                            )}
                            {renderRadioButton(
                                "Nghiêm trọng - Rất lo ngại về an toàn dữ liệu",
                                "serious",
                                privacyConcern,
                                setPrivacyConcern
                            )}
                        </View>
                    </View>
                </View>

                {/* Section 4: Text Inputs */}
                <View style={styles.section}>
                    <View style={styles.card}>
                        <ThemedText style={styles.cardTitle}>
                            Vấn đề kỹ thuật gặp phải
                        </ThemedText>
                        <ThemedText style={styles.cardSubtitle}>
                            Mô tả chi tiết các vấn đề kỹ thuật bạn gặp phải (nếu có)
                        </ThemedText>
                        <TextInput
                            style={styles.textInput}
                            multiline
                            numberOfLines={4}
                            placeholder="Ví dụ: Video bị giật vào buổi tối, âm thanh có tiếng vọng, mất kết nối khi chuyển mạng..."
                            placeholderTextColor="#9E9E9E"
                            value={technicalIssues}
                            onChangeText={setTechnicalIssues}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.card}>
                        <ThemedText style={styles.cardTitle}>Đề xuất cải thiện</ThemedText>
                        <ThemedText style={styles.cardSubtitle}>
                            Các tính năng hoặc cải tiến bạn mong muốn cho hệ thống video
                        </ThemedText>
                        <TextInput
                            style={styles.textInput}
                            multiline
                            numberOfLines={4}
                            placeholder="Ví dụ: Thêm tính năng zoom, cải thiện chất lượng ban đêm, tính năng ghi lại video tự động..."
                            placeholderTextColor="#9E9E9E"
                            value={suggestions}
                            onChangeText={setSuggestions}
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={["#68C2E8", "#44A08D"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.submitButtonGradient}
                    >
                        <ThemedText style={styles.submitButtonText}>Gửi đánh giá</ThemedText>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.bottomSpacing} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    header: {
        alignItems: "center",
        paddingTop: 20,
        paddingBottom: 30,
        paddingHorizontal: 20,
    },
    headerIcon: {
        marginBottom: 16,
    },
    iconGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#2c3e50",
        marginBottom: 8,
        textAlign: "center",
        paddingHorizontal: 16,
        lineHeight: 32,
        flexShrink: 1,
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#6c757d",
        textAlign: "center",
        lineHeight: 20,
        paddingHorizontal: 20,
    },
    section: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    cardTitleContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2c3e50",
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 13,
        color: "#6c757d",
        lineHeight: 18,
        marginBottom: 12,
    },
    ratingContainer: {
        marginTop: 8,
    },
    ratingLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    ratingLabelLeft: {
        fontSize: 12,
        color: "#6c757d",
        flex: 1,
    },
    ratingValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#2c3e50",
        marginHorizontal: 12,
        minWidth: 80,
        textAlign: "center",
    },
    ratingLabelRight: {
        fontSize: 12,
        color: "#6c757d",
        flex: 1,
        textAlign: "right",
    },
    starsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    star: {
        marginHorizontal: 2,
    },
    radioGroup: {
        marginTop: 8,
    },
    radioButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 4,
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#2196F3",
        marginRight: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    radioSelected: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#2196F3",
    },
    radioLabel: {
        fontSize: 14,
        color: "#2c3e50",
        flex: 1,
    },
    textInput: {
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: "#2c3e50",
        minHeight: 100,
        backgroundColor: "#FAFAFA",
        marginTop: 8,
    },
    submitButton: {
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 12,
        overflow: "hidden",
    },
    submitButtonGradient: {
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    bottomSpacing: {
        height: 20,
    },
});
