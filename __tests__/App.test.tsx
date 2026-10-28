import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import {
  Alert,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookProvider, useBooks } from '../src/context/BookContext';
import { Book, BookContextType } from '../src/types';
import HomeScreen from '../src/screens/HomeScreen';
import BookFormScreen from '../src/screens/BookFormScreen';
import BookDetailScreen from '../src/screens/BookDetailScreen';
import Button from '../src/components/Button';
import { colors } from '../src/constants/theme';

const mockStorage = new Map<string, string>();
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (key: string) => mockStorage.get(key) ?? null),
  setItem: jest.fn(async (key: string, value: string) => {
    mockStorage.set(key, value);
  }),
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: require('react-native').View,
}));

const key = '@LIBRARY_BOOKS_DATA';
let state: BookContextType;
let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
const navigation = { navigate: jest.fn(), goBack: jest.fn() };

function Probe() {
  state = useBooks();
  return null;
}

async function mount(screen?: React.ReactNode) {
  await act(async () => {
    renderer = ReactTestRenderer.create(
      <BookProvider>
        <Probe />
        {screen}
      </BookProvider>,
    );
  });
}

function input(label: string) {
  return renderer!.root
    .findAllByType(TextInput)
    .find(item => item.props.accessibilityLabel?.startsWith(label))!;
}

function button(title: string) {
  return renderer!.root
    .findAllByType(Button)
    .find(item => item.props.title === title)!;
}

async function fillForm(year = '2020', quantity = '3') {
  await act(async () => {
    input('Tên sách').props.onChangeText('  Sách mới  ');
    input('Tác giả').props.onChangeText('  Tác giả mới  ');
    input('Năm xuất bản').props.onChangeText(year);
    input('Tổng số lượng').props.onChangeText(quantity);
  });
}

beforeEach(() => {
  mockStorage.clear();
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  act(() => renderer?.unmount());
  renderer = undefined;
  jest.restoreAllMocks();
});

test('khởi tạo và lưu ít nhất 5 sách mẫu, có sách hết và sách chưa mượn', async () => {
  await mount();
  expect(state.isLoading).toBe(false);
  expect(state.books.length).toBeGreaterThanOrEqual(5);
  expect(state.books.some(book => book.quantity === book.borrowed)).toBe(true);
  expect(state.books.some(book => book.borrowed === 0)).toBe(true);
  expect(JSON.parse(mockStorage.get(key)!)).toEqual(state.books);
});

test('thêm, sửa, mượn, trả và mở lại vẫn đọc đúng dữ liệu', async () => {
  await mount();
  await act(async () => {
    await state.addBook({
      title: 'Mới',
      author: 'A',
      category: 'Khoa học',
      year: 2020,
      quantity: 2,
    });
  });
  const book = state.books[0];
  expect(typeof book.id).toBe('string');
  expect(book.borrowed).toBe(0);
  await act(async () => {
    await state.updateBook({ ...book, title: 'Đã sửa' });
  });
  await act(async () => {
    expect(await state.borrowBook(book.id)).toBe(true);
  });
  expect(state.books[0].borrowed).toBe(1);
  await act(async () => {
    expect(await state.returnBook(book.id)).toBe(true);
  });
  expect(state.books[0].borrowed).toBe(0);
  const saved = state.books;
  act(() => renderer!.unmount());
  await mount();
  expect(state.books).toEqual(saved);
});

test('không cho mượn khi hết sách hoặc nhận trả khi chưa có ai mượn', async () => {
  await mount();
  const soldOut = state.books.find(book => book.quantity === book.borrowed)!;
  const available = state.books.find(book => book.borrowed === 0)!;
  const before = state.books;
  await act(async () => {
    expect(await state.borrowBook(soldOut.id)).toBe(false);
    expect(await state.returnBook(available.id)).toBe(false);
  });
  expect(state.books).toEqual(before);
  expect(Alert.alert).toHaveBeenCalledTimes(2);
});

test('chặn xoá sách đang mượn; chỉ xoá sách khác sau xác nhận', async () => {
  await mount();
  const borrowed = state.books.find(book => book.borrowed > 0)!;
  state.deleteBook(borrowed.id);
  expect(Alert.alert).toHaveBeenLastCalledWith(
    'Không thể xoá',
    expect.any(String),
  );
  const book = state.books.find(item => item.borrowed === 0)!;
  const onSuccess = jest.fn();
  state.deleteBook(book.id, onSuccess);
  expect(state.books).toContainEqual(book);
  const buttons = jest.mocked(Alert.alert).mock.calls.at(-1)![2]!;
  expect(buttons.some(item => item.style === 'cancel')).toBe(true);
  await act(async () => {
    await buttons.find(item => item.style === 'destructive')!.onPress!();
  });
  expect(state.books.some(item => item.id === book.id)).toBe(false);
  expect(onSuccess).toHaveBeenCalledTimes(1);
});

test('lỗi lưu không đổi danh sách, không báo thành công xoá', async () => {
  await mount();
  const book = state.books.find(item => item.borrowed === 0)!;
  const before = state.books;
  jest
    .mocked(AsyncStorage.setItem)
    .mockRejectedValueOnce(new Error('disk full'));
  await act(async () => {
    expect(await state.borrowBook(book.id)).toBe(false);
  });
  expect(state.books).toEqual(before);
  const onSuccess = jest.fn();
  state.deleteBook(book.id, onSuccess);
  const buttons = jest.mocked(Alert.alert).mock.calls.at(-1)![2]!;
  jest
    .mocked(AsyncStorage.setItem)
    .mockRejectedValueOnce(new Error('disk full'));
  await act(async () => {
    await buttons.find(item => item.style === 'destructive')!.onPress!();
  });
  expect(state.books).toEqual(before);
  expect(onSuccess).not.toHaveBeenCalled();
});

test('không khởi tạo lại dữ liệu khi danh sách đã lưu là rỗng', async () => {
  mockStorage.set(key, '[]');
  await mount();
  expect(state.books).toEqual([]);
  expect(AsyncStorage.setItem).not.toHaveBeenCalled();
});

test('tìm tên/tác giả không phân biệt hoa thường, kết hợp lọc và có trạng thái rỗng', async () => {
  await mount(
    <HomeScreen
      {...({ navigation } as unknown as React.ComponentProps<
        typeof HomeScreen
      >)}
    />,
  );
  const list = () => renderer!.root.findByType(FlatList);
  expect(list().props.data).toHaveLength(5);
  const search = renderer!.root.findByType(TextInput);
  await act(async () => {
    search.props.onChangeText('TÔ HOÀI');
  });
  expect(list().props.data.map((book: Book) => book.id)).toEqual(['2']);
  const chip = renderer!.root
    .findAllByType(TouchableOpacity)
    .find(
      item =>
        item.findAll(
          node =>
            String(node.type) === 'Text' && node.props.children === 'Khoa học',
        ).length > 0,
    )!;
  await act(async () => {
    chip.props.onPress();
  });
  expect(list().props.data).toEqual([]);
  expect(list().props.ListEmptyComponent.props.children).toBe(
    'Không tìm thấy sách phù hợp',
  );
  await act(async () => {
    search.props.onChangeText('VŨ TRỤ');
  });
  expect(list().props.data.map((book: Book) => book.id)).toEqual(['3']);
  const card = list().props.renderItem({ item: state.books[2] });
  card.props.onPress();
  expect(navigation.navigate).toHaveBeenCalledWith('BookDetail', {
    bookId: '3',
  });
  card.props.onLongPress();
  expect(Alert.alert).toHaveBeenLastCalledWith(
    'Không thể xoá',
    expect.any(String),
  );
});

test.each(['3', '2'])(
  'chi tiết %s đủ thông tin, nút không hợp lệ bị khoá màu xám',
  async id => {
    await mount(
      <BookDetailScreen
        {...({
          navigation,
          route: { params: { bookId: id } },
        } as unknown as React.ComponentProps<typeof BookDetailScreen>)}
      />,
    );
    const book = state.books.find(item => item.id === id)!;
    const borrow = button('Cho mượn (+1)');
    const returnButton = button('Nhận trả (-1)');
    expect(borrow.props.disabled).toBe(book.quantity === book.borrowed);
    expect(returnButton.props.disabled).toBe(book.borrowed === 0);
    const disabled = book.borrowed === 0 ? returnButton : borrow;
    expect(
      StyleSheet.flatten(disabled.findByType(TouchableOpacity).props.style)
        .backgroundColor,
    ).toBe(colors.disabled);
    const tree = JSON.stringify(renderer!.toJSON());
    for (const value of [
      book.title,
      book.author,
      book.category,
      book.id,
      String(book.year),
    ]) {
      expect(tree).toContain(value);
    }
    const action = book.borrowed === 0 ? borrow : returnButton;
    await act(async () => {
      await action.props.onPress();
    });
    expect(state.books.find(item => item.id === id)!.borrowed).toBe(
      book.borrowed === 0 ? 1 : book.borrowed - 1,
    );
    expect(Alert.alert).toHaveBeenCalledTimes(1);
    expect(Alert.alert).toHaveBeenLastCalledWith(
      'Thành công',
      book.borrowed === 0
        ? 'Đã cho mượn 1 cuốn sách'
        : 'Đã nhận trả 1 cuốn sách',
    );
  },
);

test('form trống báo lỗi ngay dưới ô nhập và có viền đỏ', async () => {
  await mount(
    <BookFormScreen
      {...({ navigation, route: {} } as unknown as React.ComponentProps<
        typeof BookFormScreen
      >)}
    />,
  );
  await act(async () => {
    await button('Lưu sách').props.onPress();
  });
  expect(JSON.stringify(renderer!.toJSON())).toContain(
    'Tên sách không được để trống',
  );
  expect(JSON.stringify(renderer!.toJSON())).toContain(
    'Tác giả không được để trống',
  );
  expect(StyleSheet.flatten(input('Tên sách').props.style).borderColor).toBe(
    colors.danger,
  );
  expect(state.books).toHaveLength(5);
});

test.each([
  ['20ab', '2'],
  ['1899', '2'],
  [String(new Date().getFullYear() + 1), '2'],
  ['2020', '2abc'],
  ['2020', '1.5'],
  ['2020', '0'],
  ['2020', '-1'],
  ['2020', ''],
])('form chặn năm hoặc số lượng sai: %s / %s', async (year, quantity) => {
  await mount(
    <BookFormScreen
      {...({ navigation, route: {} } as unknown as React.ComponentProps<
        typeof BookFormScreen
      >)}
    />,
  );
  await fillForm(year, quantity);
  await act(async () => {
    await button('Lưu sách').props.onPress();
  });
  expect(state.books).toHaveLength(5);
  expect(Alert.alert).not.toHaveBeenCalled();
});

test('thêm sách từ form cắt khoảng trắng, lưu số đúng kiểu và borrowed = 0', async () => {
  await mount(
    <BookFormScreen
      {...({ navigation, route: {} } as unknown as React.ComponentProps<
        typeof BookFormScreen
      >)}
    />,
  );
  await fillForm();
  await act(async () => {
    await button('Lưu sách').props.onPress();
  });
  expect(state.books[0]).toMatchObject({
    title: 'Sách mới',
    author: 'Tác giả mới',
    year: 2020,
    quantity: 3,
    borrowed: 0,
  });
  const buttons = jest.mocked(Alert.alert).mock.calls.at(-1)![2]!;
  buttons[0].onPress!();
  expect(navigation.goBack).toHaveBeenCalledTimes(1);
});

test('form sửa điền sẵn, chặn quantity < borrowed và giữ borrowed khi lưu', async () => {
  const book: Book = {
    id: 'edit',
    title: 'Cũ',
    author: 'A',
    category: 'Thiếu nhi',
    year: 2020,
    quantity: 5,
    borrowed: 3,
  };
  mockStorage.set(key, JSON.stringify([book]));
  await mount(
    <BookFormScreen
      {...({
        navigation,
        route: { params: { book } },
      } as unknown as React.ComponentProps<typeof BookFormScreen>)}
    />,
  );
  expect(input('Tên sách').props.value).toBe('Cũ');
  expect(input('Năm xuất bản').props.value).toBe('2020');
  await act(async () => {
    input('Tổng số lượng').props.onChangeText('2');
  });
  await act(async () => {
    await button('Lưu sách').props.onPress();
  });
  expect(JSON.stringify(renderer!.toJSON())).toContain(
    'Số lượng không được nhỏ hơn',
  );
  expect(state.books[0]).toEqual(book);
  await act(async () => {
    input('Tổng số lượng').props.onChangeText('3');
  });
  await act(async () => {
    await button('Lưu sách').props.onPress();
  });
  expect(state.books[0]).toMatchObject({ quantity: 3, borrowed: 3 });
});

test('form lưu thất bại không báo thành công và vẫn cho phép sửa', async () => {
  await mount(
    <BookFormScreen
      {...({ navigation, route: {} } as unknown as React.ComponentProps<
        typeof BookFormScreen
      >)}
    />,
  );
  await fillForm();
  jest
    .mocked(AsyncStorage.setItem)
    .mockRejectedValueOnce(new Error('disk full'));
  await act(async () => {
    await button('Lưu sách').props.onPress();
  });
  expect(state.books).toHaveLength(5);
  expect(Alert.alert).toHaveBeenLastCalledWith(
    'Lỗi',
    'Không thể lưu dữ liệu vào máy',
  );
  expect(navigation.goBack).not.toHaveBeenCalled();
  expect(button('Lưu sách').props.disabled).toBe(false);
});
