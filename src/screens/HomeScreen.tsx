import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  computeStreak,
  getCheckIn,
  getDistinctCheckInDates,
  upsertCheckIn,
} from '../db/repository';
import { dateKey, formatDisplayVi } from '../utils/dateKey';
import { colors } from '../theme';

export function HomeScreen() {
  const todayKey = dateKey(new Date());
  const [streak, setStreak] = useState(0);
  const [checkedToday, setCheckedToday] = useState(false);
  const [lastCheckDisplay, setLastCheckDisplay] = useState<string | null>(null);
  const [minutesText, setMinutesText] = useState('');

  const refresh = useCallback(async () => {
    const set = await getDistinctCheckInDates();
    setStreak(computeStreak(set));
    const row = await getCheckIn(todayKey);
    setCheckedToday(!!row);
    if (row) {
      const t = new Date(row.checked_at);
      setLastCheckDisplay(
        t.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
      );
      setMinutesText(row.study_minutes != null ? String(row.study_minutes) : '');
    } else {
      setLastCheckDisplay(null);
      setMinutesText('');
    }
  }, [todayKey]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  async function onCheckIn() {
    const trimmed = minutesText.trim();
    let study: number | null = null;
    if (trimmed !== '') {
      const n = parseInt(trimmed, 10);
      if (!Number.isFinite(n) || n < 0) {
        Alert.alert('Thời gian học', 'Nhập số phút hợp lệ hoặc để trống.');
        return;
      }
      study = n;
    }
    await upsertCheckIn(todayKey, study);
    await refresh();
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.inner}>
      <View style={styles.card}>
        <Text style={styles.label}>Hôm nay</Text>
        <Text style={styles.dateTitle}>{formatDisplayVi(todayKey)}</Text>
        <View style={styles.streakRow}>
          <Text style={styles.streakNum}>{streak}</Text>
          <Text style={styles.streakLabel}>ngày liên tiếp</Text>
        </View>
        {checkedToday ? (
          <Text style={styles.ok}>Đã điểm danh{lastCheckDisplay ? ` — ${lastCheckDisplay}` : ''}</Text>
        ) : (
          <Text style={styles.hint}>Chưa điểm danh trong ngày hôm nay.</Text>
        )}
      </View>

      <Text style={styles.fieldLabel}>Thời gian học (phút, tuỳ chọn)</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        placeholder="Ví dụ: 25"
        placeholderTextColor={colors.muted}
        value={minutesText}
        onChangeText={setMinutesText}
      />

      <Pressable style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]} onPress={() => void onCheckIn()}>
        <Text style={styles.btnText}>Điểm danh hôm nay</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  inner: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { color: colors.muted, fontSize: 13, marginBottom: 4 },
  dateTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 16 },
  streakRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 8 },
  streakNum: { fontSize: 36, fontWeight: '800', color: colors.accent },
  streakLabel: { fontSize: 16, color: colors.muted },
  ok: { color: colors.accent, fontWeight: '600', marginTop: 4 },
  hint: { color: colors.muted },
  fieldLabel: { fontSize: 14, color: colors.text, marginBottom: 8 },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnPressed: { opacity: 0.9 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
