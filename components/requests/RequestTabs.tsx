import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { CaregiverRequests } from './CaregiverRequests';
import { FamilyRequests } from './FamilyRequests';
import { ServiceRequests } from './ServiceRequests';

type TabType = 'family' | 'video' | 'service';

interface RequestTabsProps {
  onChatPress?: (caregiver: any) => void;
  onBookPress?: (caregiver: any) => void;
}

export function RequestTabs({ onChatPress, onBookPress }: RequestTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('family');

  const tabs = [
    {
      id: 'family' as TabType,
      title: 'Gia đình',
      icon: 'home-outline',
      count: 5, // Mock count
    },
    {
      id: 'video' as TabType,
      title: 'Video tư vấn',
      icon: 'videocam-outline',
      count: 8, // Mock count
    },
    {
      id: 'service' as TabType,
      title: 'Dịch vụ',
      icon: 'business-outline',
      count: 12, // Mock count
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'family':
        return <FamilyRequests onChatPress={onChatPress} onBookPress={onBookPress} />;
      case 'video':
        return <CaregiverRequests />;
      case 'service':
        return <ServiceRequests onChatPress={onChatPress} onBookPress={onBookPress} />;
      default:
        return <FamilyRequests onChatPress={onChatPress} onBookPress={onBookPress} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Tab Headers */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.7}
          >
            <View style={styles.tabContent}>
              <Ionicons
                name={tab.icon as any}
                size={20}
                color={activeTab === tab.id ? '#4ECDC4' : '#6c757d'}
              />
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText,
                ]}
              >
                {tab.title}
              </ThemedText>
              {tab.count > 0 && (
                <View style={styles.badge}>
                  <ThemedText style={styles.badgeText}>
                    {tab.count > 99 ? '99+' : tab.count}
                  </ThemedText>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4ECDC4',
  },
  tabContent: {
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
    marginTop: 4,
  },
  activeTabText: {
    color: '#4ECDC4',
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4757',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
  },
});
