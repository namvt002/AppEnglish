import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import * as Speech from 'expo-speech';
import { colors } from '../theme';

export function VocabScreen() {
  const [word, setWord] = useState('');

  function speak() {
    const w = word.trim();
    if (!w) return;
    Speech.stop();
    Speech.speak(w, {
      language: 'en-US',
      rate: 0.92,
    });
  }

  return (
    <View style={styles.root}>
      <Text style={styles.intro}>
        Nhập một từ tiếng Anh. App dùng giọng đọc có sẵn trên máy (không cần API trả phí).
      </Text>
      <TextInput
        style={styles.input}
        placeholder="example: perseverance"
        placeholderTextColor={colors.muted}
        value={word}
        onChangeText={setWord}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Pressable style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]} onPress={speak}>
        <Text style={styles.btnText}>🔊  Đọc từ</Text>
      </Pressable>
      <Pressable style={styles.stop} onPress={() => Speech.stop()}>
        <Text style={styles.stopText}>Dừng đọc</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  intro: { fontSize: 15, color: colors.muted, marginBottom: 16, lineHeight: 22 },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 18,
    color: colors.text,
    marginBottom: 16,
  },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnPressed: { opacity: 0.92 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  stop: { marginTop: 12, alignItems: 'center' },
  stopText: { color: colors.muted, fontSize: 15 },
});
