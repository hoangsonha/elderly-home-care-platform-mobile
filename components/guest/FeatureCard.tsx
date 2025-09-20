import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface FeatureCardProps {
  title: string;
  subtitle: string;
  icon: string;
  backgroundColor: string;
  onPress: () => void;
  width?: number;
}

export function FeatureCard({
  title,
  subtitle,
  icon,
  backgroundColor,
  onPress,
  width = 160,
}: FeatureCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, { width }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.content, { backgroundColor }]}>
        <View style={styles.icon}>
          <Ionicons 
            name={icon as any} 
            size={28} 
            color="white" 
          />
        </View>
        <ThemedText style={styles.title} numberOfLines={1}>
          {title}
        </ThemedText>
        <ThemedText style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  content: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    minHeight: 130,
    justifyContent: 'center',
  },
  icon: {
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 14,
  },
});

