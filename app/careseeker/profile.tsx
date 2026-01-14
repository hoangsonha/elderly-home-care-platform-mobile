import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useCallback } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { SimpleNavBar } from '@/components/navigation/SimpleNavBar';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';
import { useBottomNavPadding } from '@/hooks/useBottomNavPadding';
import { mainService } from '@/services/main.service';

interface MenuItem {
    id: string;
    title: string;
    icon: string;
    route?: string;
    action?: () => void;
    badge?: number;
    color?: string;
}

interface CareSeekerProfileData {
    careSeekerProfileId: string;
    fullName: string;
    phoneNumber: string;
    location: string;
    birthDate: string;
    age: number;
    gender: string;
    profileData: string | object;
    accountId: string;
    email: string;
    avatarUrl: string;
    enabled: boolean;
    nonLocked: boolean;
    totalElderlyProfiles: number;
    totalCompletedBookings: number;
    elderlyProfiles: Array<any>;
}

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const bottomNavPadding = useBottomNavPadding();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [profile, setProfile] = useState<CareSeekerProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await mainService.getCareSeekerProfile();
            
            if (response.status === 'Success' && response.data) {
                setProfile(response.data);
            } else {
                setError(response.message || 'Không thể tải thông tin profile');
            }
        } catch (err: any) {
            console.error('Error fetching profile:', err);
            setError(err.message || 'Có lỗi xảy ra khi tải thông tin');
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, [fetchProfile])
    );

    const handleLogout = () => {
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc chắn muốn đăng xuất?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đăng xuất',
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoggingOut(true);
                        await logout();
                        router.replace('/login');
                    },
                },
            ]
        );
    };

    const menuSections = [
        {
            title: 'Quản lý',
            items: [
                {
                    id: 'elderly',
                    title: 'Hồ sơ người già',
                    icon: 'people',
                    route: '/careseeker/elderly-list',
                    badge: profile?.totalElderlyProfiles || 0,
                    color: '#68C2E8',
                },
                {
                    id: 'hired',
                    title: 'Người chăm sóc đã thuê',
                    icon: 'person-add',
                    route: '/careseeker/hired-caregivers',
                    color: '#10B981',
                },
            ],
        },
        {
            title: 'Hoạt động',
            items: [
                {
                    id: 'appointments',
                    title: 'Lịch hẹn',
                    icon: 'calendar',
                    route: '/careseeker/appointments',
                    color: '#3B82F6',
                },
                {
                    id: 'history',
                    title: 'Lịch sử thuê',
                    icon: 'time',
                    route: '/careseeker/hiring-history',
                    color: '#F59E0B',
                },
                {
                    id: 'reviews',
                    title: 'Đánh giá của tôi',
                    icon: 'star',
                    route: '/careseeker/reviews',
                    color: '#FFB648',
                },
            ],
        },
        {
            title: 'Hỗ trợ',
            items: [
                {
                    id: 'complaints',
                    title: 'Khiếu nại',
                    icon: 'alert-circle',
                    route: '/careseeker/complaints',
                    color: '#EF4444',
                },
                {
                    id: 'system-info',
                    title: 'Về hệ thống',
                    icon: 'information-circle',
                    route: '/careseeker/system-info',
                    color: '#6B7280',
                },
            ],
        },
        {
            title: 'Tài khoản',
            items: [
                {
                    id: 'settings',
                    title: 'Cài đặt',
                    icon: 'settings',
                    route: '/careseeker/in-progress',
                    color: '#6B7280',
                },
                {
                    id: 'logout',
                    title: 'Đăng xuất',
                    icon: 'log-out',
                    action: handleLogout,
                    color: '#EF4444',
                },
            ],
        },
    ];

    const handleMenuPress = (item: MenuItem) => {
        if (item.action) {
            item.action();
        } else if (item.route) {
            router.push(item.route as any);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#68C2E8" />
                    <ThemedText style={styles.loadingText}>Đang tải thông tin...</ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.errorContainer}>
                    <ThemedText style={styles.errorText}>{error}</ThemedText>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
                        <ThemedText style={styles.retryButtonText}>Thử lại</ThemedText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const displayName = profile?.fullName || user?.name || 'Người dùng';
    const displayAvatar = profile?.avatarUrl || user?.avatar;
    const totalElderlyProfiles = profile?.totalElderlyProfiles || 0;
    const totalCompletedBookings = profile?.totalCompletedBookings || 0;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header with Profile Info */}
            <View style={styles.header}>
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        {displayAvatar ? (
                            <Image
                                source={{ uri: displayAvatar }}
                                style={styles.avatar}
                            />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <ThemedText style={styles.avatarText}>
                                    {displayName.charAt(0).toUpperCase()}
                                </ThemedText>
                            </View>
                        )}
                        <TouchableOpacity style={styles.editAvatarButton}>
                            <Ionicons name="camera" size={16} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.userInfo}>
                        <ThemedText style={styles.userName}>
                            {displayName}
                        </ThemedText>
                        <View style={styles.roleBadge}>
                            <ThemedText style={styles.roleText}>Người thuê</ThemedText>
                        </View>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <ThemedText style={styles.statValue}>{totalElderlyProfiles}</ThemedText>
                        <ThemedText style={styles.statLabel}>Người già</ThemedText>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <ThemedText style={styles.statValue}>{totalCompletedBookings}</ThemedText>
                        <ThemedText style={styles.statLabel}>Lịch hẹn</ThemedText>
                    </View>
                </View>
            </View>

            {/* Menu Sections */}
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomNavPadding }]}
            >
                {menuSections.map((section, sectionIndex) => (
                    <View key={sectionIndex} style={styles.menuSection}>
                        <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
                        <View style={styles.menuList}>
                            {section.items.map((item, itemIndex) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.menuItem,
                                        itemIndex === section.items.length - 1 && styles.menuItemLast,
                                    ]}
                                    onPress={() => handleMenuPress(item)}
                                    activeOpacity={0.7}
                                    disabled={isLoggingOut && item.id === 'logout'}
                                >
                                    <View style={styles.menuItemLeft}>
                                        <View
                                            style={[
                                                styles.menuIcon,
                                                { backgroundColor: item.color + '20' },
                                            ]}
                                        >
                                            <Ionicons
                                                name={item.icon as any}
                                                size={20}
                                                color={item.color}
                                            />
                                        </View>
                                        <ThemedText style={styles.menuItemText}>
                                            {item.title}
                                        </ThemedText>
                                        {item.badge && item.badge > 0 && (
                                            <View style={styles.badge}>
                                                <ThemedText style={styles.badgeText}>
                                                    {item.badge}
                                                </ThemedText>
                                            </View>
                                        )}
                                    </View>
                                    <Ionicons
                                        name="chevron-forward"
                                        size={20}
                                        color="#9CA3AF"
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {/* App Version */}
                <View style={styles.versionContainer}>
                    <ThemedText style={styles.versionText}>
                        Elder Care Connect v1.0.0
                    </ThemedText>
                    <ThemedText style={styles.copyrightText}>
                        © 2025 All rights reserved
                    </ThemedText>
                </View>
            </ScrollView>

            <SimpleNavBar />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F9FD',
    },
    header: {
        backgroundColor: 'white',
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#68C2E8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '700',
        color: 'white',
    },
    editAvatarButton: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#68C2E8',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#12394A',
        marginBottom: 8,
    },
    roleBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#E0F2FE',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#0284C7',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#12394A',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#E5E7EB',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    menuSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#6B7280',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    menuList: {
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    menuItemLast: {
        borderBottomWidth: 0,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    menuItemText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#12394A',
        flex: 1,
    },
    badge: {
        backgroundColor: '#EF4444',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 8,
        minWidth: 20,
        alignItems: 'center',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    versionContainer: {
        alignItems: 'center',
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    versionText: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 4,
    },
    copyrightText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6B7280',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 14,
        color: '#EF4444',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#68C2E8',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
});

