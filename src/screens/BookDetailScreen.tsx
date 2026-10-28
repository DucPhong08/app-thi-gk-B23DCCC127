import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../components/Button';
import { useBooks } from '../context/BookContext';
import { ui } from '../constants/theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'BookDetail'>;

export default function BookDetailScreen({ route, navigation }: Props) {
  const { books, borrowBook, returnBook, deleteBook } = useBooks();
  // Câu 4: lấy sách theo ID từ state để chi tiết luôn cập nhật.
  const book = books.find(item => item.id === route.params.bookId);

  if (!book) {
    return (
      <View style={ui.content}>
        <Text style={ui.text}>Không tìm thấy sách!</Text>
      </View>
    );
  }

  // Số cuốn còn có thể cho mượn = tổng số cuốn - số đang mượn.
  const remaining = book.quantity - book.borrowed;

  return (
    <SafeAreaView style={ui.container} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={ui.content}>
        <View style={ui.card}>
          <Text style={ui.title}>{book.title}</Text>
          <Text style={ui.text}>Mã sách: {book.id}</Text>
          <Text style={ui.text}>Tác giả: {book.author}</Text>
          <Text style={ui.text}>Thể loại: {book.category}</Text>
          <Text style={ui.text}>Năm xuất bản: {book.year}</Text>
          <Text style={ui.text}>Tổng số cuốn: {book.quantity}</Text>
          <Text style={ui.text}>Đang mượn: {book.borrowed}</Text>
          <Text style={[ui.text, remaining === 0 && ui.danger]}>
            Còn lại: {remaining}
            {remaining === 0 ? ' — Hết sách' : ''}
          </Text>
        </View>
        {/* Câu 4: nút mượn/trả bị khoá và đổi màu xám khi không hợp lệ. */}
        <Button
          title="Cho mượn (+1)"
          disabled={remaining <= 0}
          onPress={() => borrowBook(book.id)}
        />
        <Button
          title="Nhận trả (-1)"
          style={ui.successButton}
          disabled={book.borrowed === 0}
          onPress={() => returnBook(book.id)}
        />
        <Button
          title="Sửa thông tin"
          onPress={() => navigation.navigate('BookForm', { book })}
        />
        <Button
          title="Xoá sách"
          style={ui.dangerButton}
          onPress={() => deleteBook(book.id, () => navigation.goBack())}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
