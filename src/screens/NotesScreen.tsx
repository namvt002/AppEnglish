import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  addVocabWord,
  deleteVocabWord,
  getDailyNote,
  listVocabForDay,
  saveDailyNote,
  type VocabRow,
} from '../db/repository';
import { addDays, dateKey, formatDisplayVi } from '../utils/dateKey';
import { colors } from '../theme';

export function NotesScreen() {
  const [dayKey, setDayKey] = useState(() => dateKey(new Date()));
  const [note, setNote] = useState('');
  const [vocab, setVocab] = useState<VocabRow[]>([]);
  const [newWord, setNewWord] = useState('');

  const load = useCallback(async () => {
    setNote(await getDailyNote(dayKey));
    setVocab(await listVocabForDay(dayKey));
  }, [dayKey]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  useEffect(() => {
    void load();
  }, [load]);

  async function saveNote() {
    await saveDailyNote(dayKey, note);
    Alert.alert('Đã lưu', 'Ghi chú đã được lưu.');
  }

  async function addWord() {
    await addVocabWord(dayKey, newWord);
    setNewWord('');
    await load();
  }

  async function removeWord(id: number) {
    await deleteVocabWord(id);
    await load();
  }

  function prevDay() {
    setDayKey(dateKey(addDays(dayKey, -1)));
  }
  function nextDay() {
    const t = dateKey(new Date());
    const n = dateKey(addDays(dayKey, 1));
    if (n > t) return;
    setDayKey(n);
  }

  const today = dateKey(new Date());
  const isToday = dayKey === today;

  return (
    <View style={styles.root}>
      <View style={styles.nav}>
        <Pressable style={styles.navBtn} onPress={prevDay}>
          <Text style={styles.navBtnText}>←</Text>
        </Pressable>
        <View style={styles.navMid}>
          <Text style={styles.navDate}>{formatDisplayVi(dayKey)}</Text>
          {!isToday ? (
            <Pressable onPress={() => setDayKey(today)}>
              <Text style={styles.jumpToday}>Về hôm nay</Text>
            </Pressable>
          ) : null}
        </View>
        <Pressable style={styles.navBtn} onPress={nextDay} disabled={isToday}>
          <Text style={[styles.navBtnText, isToday && styles.disabled]}>→</Text>
        </Pressable>
      </View>

      <Text style={styles.section}>Ghi chú tự do</Text>
      <TextInput
        style={styles.noteArea}
        multiline
        textAlignVertical="top"
        placeholder="Viết lại bài học, cảm nhận, mục tiêu..."
        placeholderTextColor={colors.muted}
        value={note}
        onChangeText={setNote}
      />
      <Pressable style={styles.secondaryBtn} onPress={() => void saveNote()}>
        <Text style={styles.secondaryBtnText}>Lưu ghi chú</Text>
      </Pressable>

      <Text style={[styles.section, { marginTop: 20 }]}>Từ vựng đã học (ngày này)</Text>
      <View style={styles.addRow}>
        <TextInput
          style={styles.wordInput}
          placeholder="Thêm từ..."
          placeholderTextColor={colors.muted}
          value={newWord}
          onChangeText={setNewWord}
          autoCapitalize="none"
        />
        <Pressable style={styles.addWordBtn} onPress={() => void addWord()}>
          <Text style={styles.addWordBtnText}>Thêm</Text>
        </Pressable>
      </View>
      <FlatList
        data={vocab}
        keyExtractor={(item) => String(item.id)}
        style={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có từ cho ngày này.</Text>}
        renderItem={({ item }) => (
          <View style={styles.vrow}>
            <Text style={styles.vword}>{item.word}</Text>
            <Pressable onPress={() => void removeWord(item.id)}>
              <Text style={styles.remove}>Xoá</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  nav: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnText: { fontSize: 20, color: colors.text },
  disabled: { opacity: 0.3 },
  navMid: { flex: 1, alignItems: 'center' },
  navDate: { fontSize: 16, fontWeight: '700', color: colors.text },
  jumpToday: { color: colors.accent, marginTop: 4, fontSize: 13 },
  section: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 },
  noteArea: {
    minHeight: 120,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    fontSize: 15,
    color: colors.text,
  },
  secondaryBtn: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  secondaryBtnText: { color: colors.accent, fontWeight: '700' },
  addRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  wordInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  addWordBtn: {
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: colors.accent,
  },
  addWordBtnText: { color: '#fff', fontWeight: '700' },
  list: { flexGrow: 0 },
  empty: { color: colors.muted, marginVertical: 8 },
  vrow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  vword: { fontSize: 16, color: colors.text },
  remove: { color: colors.danger, fontWeight: '600' },
});
