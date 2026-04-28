import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Modal,
  Switch,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import {
  addReminderSlot,
  deleteReminderSlot,
  getNudgeConfig,
  listReminderSlots,
  setNudgeConfig,
  type ReminderSlot,
} from '../db/repository';
import {
  ensureNotificationPermission,
  rescheduleAllNotifications,
} from '../services/notifications';
import { colors } from '../theme';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function RemindersScreen() {
  const [slots, setSlots] = useState<ReminderSlot[]>([]);
  const [nudgeOn, setNudgeOn] = useState(false);
  const [nudgeTime, setNudgeTime] = useState(new Date(2020, 0, 1, 20, 0));
  const [modal, setModal] = useState<'slot' | 'nudge' | null>(null);
  const [pickerSlot, setPickerSlot] = useState(new Date(2020, 0, 1, 8, 0));

  const refresh = useCallback(async () => {
    setSlots(await listReminderSlots());
    const n = await getNudgeConfig();
    setNudgeOn(n.enabled);
    setNudgeTime(new Date(2020, 0, 1, n.hour, n.minute));
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  async function persistNotifications() {
    const ok = await ensureNotificationPermission();
    if (!ok) return;
    await rescheduleAllNotifications();
  }

  async function confirmAddSlot() {
    const d = pickerSlot;
    await addReminderSlot(d.getHours(), d.getMinutes());
    setModal(null);
    await refresh();
    await persistNotifications();
  }

  async function onRemove(id: number) {
    await deleteReminderSlot(id);
    await refresh();
    await persistNotifications();
  }

  async function toggleNudge(v: boolean) {
    setNudgeOn(v);
    const t = nudgeTime;
    await setNudgeConfig(v, t.getHours(), t.getMinutes());
    await persistNotifications();
  }

  async function confirmNudgeTime() {
    const d = nudgeTime;
    await setNudgeConfig(nudgeOn, d.getHours(), d.getMinutes());
    setModal(null);
    await persistNotifications();
  }

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Giờ học mỗi ngày</Text>
      <Text style={styles.hint}>
        Thêm một hoặc nhiều khung giờ. Thông báo cục bộ trên máy sẽ nhắc bạn (cần cấp quyền).
      </Text>
      <Pressable
        style={styles.primary}
        onPress={() => {
          setPickerSlot(new Date(2020, 0, 1, 8, 0));
          setModal('slot');
        }}
      >
        <Text style={styles.primaryText}>+ Thêm khung giờ</Text>
      </Pressable>

      <FlatList
        data={slots}
        keyExtractor={(item) => String(item.id)}
        style={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có khung giờ nào.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.time}>
              {pad(item.hour)}:{pad(item.minute)}
            </Text>
            <Pressable onPress={() => void onRemove(item.id)}>
              <Text style={styles.del}>Xoá</Text>
            </Pressable>
          </View>
        )}
      />

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.nudgeTitle}>Nhắc nếu chưa điểm danh</Text>
            <Text style={styles.nudgeSub}>
              Một thông báo mỗi ngày (ví dụ buổi tối). Mở app để điểm danh — không kiểm tra tự động
              khi thông báo tới.
            </Text>
          </View>
          <Switch value={nudgeOn} onValueChange={(v) => void toggleNudge(v)} />
        </View>
        <Pressable style={styles.timeBtn} onPress={() => setModal('nudge')}>
          <Text style={styles.timeBtnText}>
            Giờ nhắc: {pad(nudgeTime.getHours())}:{pad(nudgeTime.getMinutes())}
          </Text>
        </Pressable>
      </View>

      <Modal visible={modal === 'slot'} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Chọn giờ học</Text>
            <DateTimePicker
              value={pickerSlot}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_e, d) => {
                if (d) setPickerSlot(d);
              }}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setModal(null)}>
                <Text style={styles.cancel}>Huỷ</Text>
              </Pressable>
              <Pressable onPress={() => void confirmAddSlot()}>
                <Text style={styles.ok}>Lưu</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={modal === 'nudge'} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Giờ nhắc cuối ngày</Text>
            <DateTimePicker
              value={nudgeTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_e, d) => {
                if (d) setNudgeTime(d);
              }}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setModal(null)}>
                <Text style={styles.cancel}>Huỷ</Text>
              </Pressable>
              <Pressable onPress={() => void confirmNudgeTime()}>
                <Text style={styles.ok}>Lưu</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  title: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 6 },
  hint: { fontSize: 14, color: colors.muted, marginBottom: 12, lineHeight: 20 },
  primary: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  list: { flexGrow: 0, maxHeight: 200, marginBottom: 16 },
  empty: { color: colors.muted, marginVertical: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  time: { fontSize: 20, fontWeight: '700', color: colors.text },
  del: { color: colors.danger, fontWeight: '600' },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowBetween: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nudgeTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  nudgeSub: { fontSize: 13, color: colors.muted, marginTop: 4, lineHeight: 18 },
  timeBtn: { marginTop: 12, alignSelf: 'flex-start' },
  timeBtnText: { color: colors.accent, fontWeight: '700', fontSize: 15 },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', marginBottom: 8, color: colors.text },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
    marginTop: 8,
  },
  cancel: { fontSize: 16, color: colors.muted },
  ok: { fontSize: 16, fontWeight: '700', color: colors.accent },
});
