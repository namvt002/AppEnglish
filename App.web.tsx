import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from './src/theme';

/**
 * Web: SQLite + local notifications are mobile-oriented.
 * Native bundles use App.tsx; Metro picks this file when platform is web.
 */
export default function App() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.inner}>
      <StatusBar style="dark" />
      <Text style={styles.title}>AppEnglish</Text>
      <Text style={styles.lead}>
        Điểm danh, ghi chú và dữ liệu nằm trong SQLite trên điện thoại — không chạy đầy đủ trong trình duyệt.
      </Text>
      <Text style={styles.section}>Cách xem app thật</Text>
      <Text style={styles.bullet}>• Cài Expo Go trên Android/iOS, chạy `npm start` rồi quét mã QR trong terminal.</Text>
      <Text style={styles.bullet}>• Hoặc chạy `npm run android` (máy ảo / thiết bị USB).</Text>
      <Text style={styles.section}>Về localhost:8081</Text>
      <Text style={styles.body}>
        Địa chỉ này là Metro bundler phục vụ thiết bị / Expo Go. Mở trực tiếp trong trình duyệt thường không hiển thị app.
        Bản web thử nghiệm: trong terminal Expo bấm phím w, hoặc chạy `npm run web` — bạn sẽ thấy trang hướng dẫn này.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  inner: { padding: 24, paddingTop: 48, maxWidth: 560, alignSelf: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 12 },
  lead: { fontSize: 16, lineHeight: 24, color: colors.muted, marginBottom: 24 },
  section: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 8, marginBottom: 8 },
  bullet: { fontSize: 15, lineHeight: 24, color: colors.text, marginBottom: 8, paddingLeft: 4 },
  body: { fontSize: 15, lineHeight: 24, color: colors.muted },
});
