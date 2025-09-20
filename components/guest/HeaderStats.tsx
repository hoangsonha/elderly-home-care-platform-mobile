import { ThemedText } from '@/components/themed-text';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface StatItemProps {
  number: string;
  label: string;
}

function StatItem({ number, label }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <ThemedText style={styles.statNumber}>{number}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );
}

interface HeaderStatsProps {
  stats: StatItemProps[];
}

export function HeaderStats({ stats }: HeaderStatsProps) {
  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <React.Fragment key={index}>
          <StatItem number={stat.number} label={stat.label} />
          {index < stats.length - 1 && <View style={styles.divider} />}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 30,
  },
});

