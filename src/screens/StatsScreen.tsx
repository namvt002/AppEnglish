import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { statsForMonthContaining, statsForWeekContaining } from '../db/repository';
import { colors } from '../theme';

type Mode = 'week' | 'month';

export function StatsScreen() {
  const [mode, setMode] = useState<Mode>('week');
  const [days, setDays] = useState(0);
  const [minutes, setMinutes] = useState(0);

  const load = useCallback(async () => {
    const now = new Date();
    const s =
      mode === 'week' ? await statsForWeekContaining(now) : await statsForMonthContaining(now);
    setDays(s.daysStudied);
    setMinutes(s.totalMinutes);
  }, [mode]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <View style={styles.root}>
      <View style={styles.toggle}>
        <Pressable
          onPress={() => setMode('week')}
          style={[styles.toggleBtn, mode === 'week' && styles.toggleOn]}
        >
          <Text style={[styles.toggleText, mode === 'week' && styles.toggleTextOn]}>Tuần này</Text>
        </Pressable>
        <Pressable
          onPress={() => setMode('month')}
          style={[styles.toggleBtn, mode === 'month' && styles.toggleOn]}
        >
          <Text style={[styles.toggleText, mode === 'month' && styles.toggleTextOn]}>Tháng này</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.big}>{days}</Text>
        <Text style={styles.caption}>ngày đã điểm danh</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.big}>{minutes}</Text>
        <Text style={styles.caption}>tổng phút học (đã nhập)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  toggle: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  toggleOn: { backgroundColor: colors.accentMuted, borderColor: colors.accent },
  toggleText: { color: colors.muted, fontWeight: '600' },
  toggleTextOn: { color: colors.accent },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  big: { fontSize: 40, fontWeight: '800', color: colors.text },
  caption: { marginTop: 8, color: colors.muted, fontSize: 15 },
});
