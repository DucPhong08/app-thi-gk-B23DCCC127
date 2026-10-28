// Định nghĩa cấu trúc 1 cuốn sách
export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  year: number;
  quantity: number;
  borrowed: number;
}

// Tham số truyền giữa các màn hình trong Navigation
export type RootStackParamList = {
  Home: undefined;
  BookDetail: { bookId: string };
  BookForm: { book?: Book } | undefined;
};

// Kiểu dữ liệu và các hàm trong BookContext
export interface BookContextType {
  books: Book[];
  isLoading: boolean;
  addBook: (bookData: Omit<Book, 'id' | 'borrowed'>) => Promise<boolean>;
  updateBook: (updatedBook: Book) => Promise<boolean>;
  deleteBook: (bookId: string, onSuccess?: () => void) => void;
  borrowBook: (bookId: string) => Promise<boolean>;
  returnBook: (bookId: string) => Promise<boolean>;
}
