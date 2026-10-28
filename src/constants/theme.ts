import { StyleSheet } from 'react-native';

// Bảng màu chung: sửa tại đây để các màn hình dùng cùng màu.
export const colors = {
  primary: '#2746afff',
  background: '#F3F4F6',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  border: '#D1D5DB',
  danger: '#DC2626',
  success: '#047857',
  disabled: '#D1D5DB',
  white: '#FFFFFF',
};

// Kiểu dùng chung giúp ba màn hình thống nhất và dễ đổi giao diện.
export const ui = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 12 },
  card: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  text: { fontSize: 16, color: colors.text },
  muted: { fontSize: 14, color: colors.textSecondary },
  danger: { color: colors.danger },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.card,
    color: colors.text,
    fontSize: 16,
  },
  inputError: { borderColor: colors.danger },
  chip: {
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.card,
  },
  selectedChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectedText: { color: colors.white },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  successButton: { backgroundColor: colors.success },
  dangerButton: { backgroundColor: colors.danger },
  disabled: { backgroundColor: colors.disabled },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
});
