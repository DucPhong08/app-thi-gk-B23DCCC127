import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, ui } from '../constants/theme';

type Props = TextInputProps & { label: string; error?: string };

// Ô nhập dùng chung: nhãn ở trên, lỗi ở dưới và viền đỏ khi sai.
export default function FormField({ label, error, ...props }: Props) {
  return (
    <View>
      <Text style={ui.text}>{label}</Text>
      <TextInput
        {...props}
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        style={[ui.input, error && ui.inputError]}
      />
      {error ? <Text style={[ui.muted, ui.danger]}>{error}</Text> : null}
    </View>
  );
}
