// Danh sách 4 thể loại sách theo đề bài
export const BOOK_CATEGORIES = [
  'Giáo trình',
  'Tiểu thuyết',
  'Khoa học',
  'Thiếu nhi',
];

// Danh sách thể loại dùng cho bộ lọc (thêm lựa chọn 'Tất cả')
export const FILTER_CATEGORIES: string[] = ['Tất cả', ...BOOK_CATEGORIES];
