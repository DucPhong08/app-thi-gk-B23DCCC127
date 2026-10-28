import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Book, BookContextType } from '../types';

// Giữ nguyên key để đọc được dữ liệu đã lưu từ phiên bản trước.
const STORAGE_KEY = '@LIBRARY_BOOKS_DATA';

// Câu 6: năm sách mẫu dùng khi chưa có dữ liệu lưu.
const INITIAL_BOOKS: Book[] = [
  {
    id: '1',
    title: 'Giáo trình Lập trình React Native',
    author: 'Nguyễn Văn An',
    category: 'Giáo trình',
    year: 2023,
    quantity: 10,
    borrowed: 2,
  },
  {
    id: '2',
    title: 'Dế Mèn phiêu lưu ký',
    author: 'Tô Hoài',
    category: 'Thiếu nhi',
    year: 2020,
    quantity: 5,
    borrowed: 0,
  },
  {
    id: '3',
    title: 'Vũ trụ trong vỏ hạt dẻ',
    author: 'Stephen Hawking',
    category: 'Khoa học',
    year: 2018,
    quantity: 4,
    borrowed: 4,
  },
  {
    id: '4',
    title: 'Số Đỏ',
    author: 'Vũ Trọng Phụng',
    category: 'Tiểu thuyết',
    year: 2019,
    quantity: 7,
    borrowed: 1,
  },
  {
    id: '5',
    title: 'Cấu trúc dữ liệu và giải thuật',
    author: 'Trần Bình',
    category: 'Giáo trình',
    year: 2022,
    quantity: 8,
    borrowed: 0,
  },
];

// Chia sẻ danh sách và các hàm xử lý giữa các màn hình.
const BookContext = createContext<BookContextType | undefined>(undefined);

export function BookProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Câu 6: đọc dữ liệu trên máy khi mở ứng dụng.
  useEffect(() => {
    async function loadBooks() {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        // Bộ nhớ lưu chuỗi JSON; chưa có dữ liệu thì dùng sách mẫu.
        const data = json === null ? INITIAL_BOOKS : JSON.parse(json);
        if (json === null) {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
        setBooks(data);
      } catch {
        setBooks(INITIAL_BOOKS);
        Alert.alert('Lỗi', 'Không thể đọc dữ liệu đã lưu');
      } finally {
        setIsLoading(false);
      }
    }
    loadBooks();
  }, []);

  // Chỉ cập nhật giao diện và báo thành công khi đã lưu được vào máy.
  async function saveBooks(data: Book[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setBooks(data);
      return true;
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu dữ liệu vào máy');
      return false;
    }
  }

  // Câu 2: tự tạo ID, đặt số đang mượn bằng 0, thêm sách lên đầu.
  function addBook(data: Omit<Book, 'id' | 'borrowed'>) {
    const book = { ...data, id: Date.now().toString(), borrowed: 0 };
    return saveBooks([book, ...books]);
  }

  // Câu 2: thay sách cùng ID, giữ nguyên các sách còn lại.
  function updateBook(book: Book) {
    return saveBooks(books.map(item => (item.id === book.id ? book : item)));
  }

  // Câu 3: chặn xoá sách đang mượn và hỏi xác nhận trước khi xoá.
  function deleteBook(bookId: string, onSuccess?: () => void) {
    const book = books.find(item => item.id === bookId);
    if (!book) return;
    if (book.borrowed > 0) {
      Alert.alert(
        'Không thể xoá',
        `Sách đang có ${book.borrowed} cuốn được mượn.`,
      );
      return;
    }
    Alert.alert('Xác nhận xoá', `Bạn muốn xoá "${book.title}"?`, [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: async () => {
          const success = await saveBooks(
            books.filter(item => item.id !== bookId),
          );
          // Nếu xoá từ màn chi tiết, gọi thêm hàm quay lại.
          if (success) onSuccess?.();
        },
      },
    ]);
  }

  // Câu 4: còn sách mới cho mượn; tăng số đang mượn thêm 1.
  async function borrowBook(bookId: string) {
    const book = books.find(item => item.id === bookId);
    if (!book) return false;
    if (book.borrowed >= book.quantity) {
      Alert.alert('Hết sách', 'Không còn sách để cho mượn');
      return false;
    }
    const success = await updateBook({ ...book, borrowed: book.borrowed + 1 });
    if (success) Alert.alert('Thành công', 'Đã cho mượn 1 cuốn sách');
    return success;
  }

  // Câu 4: có sách đang mượn mới nhận trả; giảm số đang mượn đi 1.
  async function returnBook(bookId: string) {
    const book = books.find(item => item.id === bookId);
    if (!book) return false;
    if (book.borrowed <= 0) {
      Alert.alert('Thông báo', 'Không có cuốn nào đang được mượn');
      return false;
    }
    const success = await updateBook({ ...book, borrowed: book.borrowed - 1 });
    if (success) Alert.alert('Thành công', 'Đã nhận trả 1 cuốn sách');
    return success;
  }

  return (
    <BookContext.Provider
      value={{
        books,
        isLoading,
        addBook,
        updateBook,
        deleteBook,
        borrowBook,
        returnBook,
      }}
    >
      {children}
    </BookContext.Provider>
  );
}

// Các màn hình gọi useBooks() để lấy dữ liệu và các hàm từ context.
export function useBooks() {
  const context = useContext(BookContext);
  if (!context) throw new Error('useBooks phải dùng trong BookProvider');
  return context;
}
