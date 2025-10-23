import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ServiceRequests } from './ServiceRequests';

interface RequestTabsProps {
  onChatPress?: (caregiver: any) => void;
  onBookPress?: (caregiver: any) => void;
}

export function RequestTabs({ onChatPress, onBookPress }: RequestTabsProps) {
  return (
    <View style={styles.container}>
      {/* Tab Content - Direct render without tab headers */}
      <View style={styles.content}>
        <ServiceRequests onChatPress={onChatPress} onBookPress={onBookPress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
});
