import React, { useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../components/Button';
import { useBooks } from '../context/BookContext';
import { colors, ui } from '../constants/theme';
import { FILTER_CATEGORIES } from '../constants/categories';
import { Book, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { books, deleteBook } = useBooks();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const query = search.trim().toLowerCase();
  const totalBorrowed = books.reduce((sum, book) => sum + book.borrowed, 0);

  // Cả điều kiện tìm kiếm và thể loại phải đúng.
  const filteredBooks = books.filter(
    book =>
      (book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)) &&
      (category === 'Tất cả' || book.category === category),
  );

  function renderBook({ item }: { item: Book }) {
    const remaining = item.quantity - item.borrowed;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={ui.card}
        onPress={() => navigation.navigate('BookDetail', { bookId: item.id })}
        onLongPress={() => deleteBook(item.id)}
      >
        <Text style={styles.bookTitle}>{item.title}</Text>
        <Text style={ui.text}>Tác giả: {item.author}</Text>
        <Text style={ui.muted}>{item.category}</Text>
        <Text style={[ui.text, remaining === 0 && ui.danger]}>
          {remaining === 0 ? 'Hết sách' : `Còn ${remaining} cuốn`}
        </Text>
        <Text style={ui.muted}>
          Tổng: {item.quantity} | Đang mượn: {item.borrowed}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={ui.container} edges={['left', 'right', 'bottom']}>
      <View style={ui.content}>
        <Text style={ui.text}>
          Tổng đầu sách: {books.length} | Đang mượn: {totalBorrowed}
        </Text>
        <TextInput
          style={ui.input}
          placeholder="Tìm theo tên sách hoặc tác giả..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={ui.row}>
            {FILTER_CATEGORIES.map(item => (
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
        </ScrollView>
        <Button
          title="+ Thêm sách"
          onPress={() => navigation.navigate('BookForm')}
        />
        <Text style={ui.muted}>Nhấn để xem chi tiết, nhấn giữ để xoá.</Text>
      </View>
      <FlatList
        data={filteredBooks}
        keyExtractor={item => item.id}
        renderItem={renderBook}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={ui.content}
        ListEmptyComponent={
          <Text style={ui.muted}>Không tìm thấy sách phù hợp</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
  },
});
