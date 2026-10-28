import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../components/Button';
import FormField from '../components/FormField';
import { useBooks } from '../context/BookContext';
import { ui } from '../constants/theme';
import { BOOK_CATEGORIES } from '../constants/categories';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'BookForm'>;
const MIN_YEAR = 1900;

export default function BookFormScreen({ navigation, route }: Props) {
  const { addBook, updateBook } = useBooks();
  const book = route.params?.book;
  const currentYear = new Date().getFullYear();
  // Có book thì điền sẵn để sửa; không có thì là form thêm.
  const [title, setTitle] = useState(book?.title ?? '');
  const [author, setAuthor] = useState(book?.author ?? '');
  const [category, setCategory] = useState(
    book?.category ?? BOOK_CATEGORIES[0],
  );
  const [year, setYear] = useState(book ? String(book.year) : '');
  const [quantity, setQuantity] = useState(book ? String(book.quantity) : '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function validateForm() {
    const newErrors: Record<string, string> = {};
    const yearNumber = Number(year);
    const quantityNumber = Number(quantity);

    if (!title.trim()) newErrors.title = 'Tên sách không được để trống';
    if (!author.trim()) newErrors.author = 'Tác giả không được để trống';
    if (
      !Number.isInteger(yearNumber) ||
      yearNumber < MIN_YEAR ||
      yearNumber > currentYear
    ) {
      newErrors.year = `Năm phải là số nguyên từ ${MIN_YEAR} đến ${currentYear}`;
    }
    if (!Number.isInteger(quantityNumber) || quantityNumber <= 0) {
      newErrors.quantity = 'Số lượng phải là số nguyên lớn hơn 0';
    } else if (book && quantityNumber < book.borrowed) {
      newErrors.quantity = `Số lượng không được nhỏ hơn số đang mượn (${book.borrowed})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!validateForm()) return;

    const data = {
      title: title.trim(),
      author: author.trim(),
      category,
      year: Number(year),
      quantity: Number(quantity),
    };
    setSaving(true);
    const success = book
      ? await updateBook({ ...book, ...data })
      : await addBook(data);
    setSaving(false);
    if (success) {
      Alert.alert(
        'Thành công',
        book ? 'Đã cập nhật sách!' : 'Đã thêm sách mới!',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    }
  }

  return (
    <SafeAreaView style={ui.container} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={ui.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={ui.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={ui.title}>
            {book ? 'Sửa thông tin sách' : 'Thêm sách mới'}
          </Text>
          <FormField
            label="Tên sách"
            value={title}
            onChangeText={setTitle}
            error={errors.title}
          />
          <FormField
            label="Tác giả"
            value={author}
            onChangeText={setAuthor}
            error={errors.author}
          />
          <Text style={ui.text}>Thể loại</Text>
          <View style={ui.row}>
            {BOOK_CATEGORIES.map(item => (
              <TouchableOpacity
                key={item}
                activeOpacity={0.7}
                style={[ui.chip, category === item && ui.selectedChip]}
                onPress={() => setCategory(item)}
              >
                <Text style={[ui.muted, category === item && ui.selectedText]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <FormField
            label={`Năm xuất bản (${MIN_YEAR} - ${currentYear})`}
            value={year}
            onChangeText={setYear}
            keyboardType="numeric"
            error={errors.year}
          />
          <FormField
            label="Tổng số lượng"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            error={errors.quantity}
          />
          {book && (
            <Text style={ui.muted}>
              Đang có {book.borrowed} cuốn được mượn.
            </Text>
          )}
          <Button
            title={saving ? 'Đang lưu...' : 'Lưu sách'}
            disabled={saving}
            onPress={handleSave}
          />
          <Button
            title="Huỷ bỏ"
            disabled={saving}
            onPress={() => navigation.goBack()}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
