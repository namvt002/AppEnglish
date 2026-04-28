import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listCheckInsDesc, type CheckInRow } from '../db/repository';
import { formatDisplayVi } from '../utils/dateKey';
import { colors } from '../theme';

export function HistoryScreen() {
  const [rows, setRows] = useState<CheckInRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        setRows(await listCheckInsDesc(200));
      })();
    }, [])
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.date_key}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Chưa có lịch sử điểm danh.</Text>
        }
        renderItem={({ item }) => {
          const t = new Date(item.checked_at);
          const timeStr = t.toLocaleString('vi-VN', {
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit',
          });
          const min =
            item.study_minutes != null ? `${item.study_minutes} phút học` : 'Không ghi phút';
          return (
            <View style={styles.row}>
              <Text style={styles.rowTitle}>{formatDisplayVi(item.date_key)}</Text>
              <Text style={styles.rowSub}>{timeStr}</Text>
              <Text style={styles.rowSub}>{min}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  list: { padding: 16, paddingBottom: 32 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
  row: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  rowSub: { fontSize: 14, color: colors.muted, marginTop: 4 },
});
