import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const [progress, setProgress] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const heartBeatAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Heart beat animation
    const heartBeat = () => {
      Animated.sequence([
        Animated.timing(heartBeatAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(heartBeatAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => heartBeat());
    };
    heartBeat();

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 15 + 5;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          // Navigate to main app after loading complete
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 200);

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 200,
      useNativeDriver: false,
    }).start();

    return () => {
      clearInterval(progressInterval);
    };
  }, [progress]);

  return (
    <View style={styles.container}>
      {/* Background Gradient Effect */}
      <View style={styles.backgroundGradient} />
      
      {/* Decorative Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Animated.View
            style={[
              styles.logoContainer,
              { transform: [{ scale: heartBeatAnim }] },
            ]}
          >
            <View style={styles.logoBackground}>
              <Ionicons name="heart" size={60} color="#FF6B6B" />
            </View>
          </Animated.View>
          
          <ThemedText style={styles.appName}>Elder Care Connect</ThemedText>
          <ThemedText style={styles.tagline}>
            Chăm sóc tận tâm, công nghệ hiện đại
          </ThemedText>
        </View>

        {/* Features Icons */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="people" size={24} color="#4ECDC4" />
            </View>
            <ThemedText style={styles.featureText}>Đội ngũ chuyên nghiệp</ThemedText>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="shield-checkmark" size={24} color="#6BCF7F" />
            </View>
            <ThemedText style={styles.featureText}>An toàn & Tin cậy</ThemedText>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name="time" size={24} color="#FFD93D" />
            </View>
            <ThemedText style={styles.featureText}>Hỗ trợ 24/7</ThemedText>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <ThemedText style={styles.loadingText}>
            Đang khởi tạo...
          </ThemedText>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                      extrapolate: 'clamp',
                    }),
                  },
                ]}
              />
            </View>
            <ThemedText style={styles.progressText}>
              {Math.round(progress)}%
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        <ThemedText style={styles.versionText}>
          Version 1.0.0
        </ThemedText>
        <ThemedText style={styles.copyrightText}>
          © 2025 Elder Care Connect
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    opacity: 0.1,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: height * 0.1,
    right: width * 0.1,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: height * 0.2,
    left: width * 0.05,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  decorativeCircle3: {
    position: 'absolute',
    top: height * 0.3,
    left: width * 0.15,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 60,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureText: {
    fontSize: 12,
    color: '#2c3e50',
    textAlign: 'center',
    fontWeight: '500',
  },
  progressSection: {
    width: '100%',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 16,
    fontWeight: '500',
  },
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '600',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: '#6c757d',
  },
});
