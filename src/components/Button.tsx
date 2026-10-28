import React from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { ui } from '../constants/theme';

type Props = TouchableOpacityProps & { title: string };

// Nút dùng chung: có hiệu ứng nhấn, bị khoá thì hiện màu xám.
export default function Button({ title, style, disabled, ...props }: Props) {
  return (
    <TouchableOpacity
      {...props}
      activeOpacity={0.7}
      disabled={disabled}
      style={[ui.button, style, disabled && ui.disabled]}
    >
      <Text style={ui.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}
