# Hướng dẫn thi vấn đáp quản lý thư viện

Bản hướng dẫn này đi theo code trong `LibraryApp`. Mục tiêu là hiểu luồng xử lý, biết trả lời ngắn và tìm đúng chỗ để sửa khi được hỏi. File ứng dụng dùng đuôi `.tsx` hoặc `.ts`.

## 1. Nắm luồng trước khi học từng dòng

```text
App.tsx
  ├─ BookProvider: giữ danh sách và các hàm xử lý sách
  └─ AppNavigator: chuyển giữa ba màn hình
       ├─ HomeScreen: danh sách, thống kê, tìm kiếm, lọc
       ├─ BookFormScreen: thêm hoặc sửa
       └─ BookDetailScreen: chi tiết, mượn, trả, sửa, xoá
```

Một thao tác lưu đi theo thứ tự:

```text
Nhấn nút → hàm xử lý trong BookContext → saveBooks
         → ghi AsyncStorage → setBooks → giao diện cập nhật
```

Nếu ghi thất bại, `saveBooks` báo lỗi và trả `false`. Danh sách trên giao diện chưa bị thay đổi.

Đọc ba màn hình trước để biết ứng dụng làm gì, rồi đọc `BookContext.tsx` để hiểu dữ liệu thay đổi như thế nào. Các file `types`, `theme`, `Button`, `FormField` hỗ trợ cho luồng này.

## 2. Trả lời mẫu cho bảy câu trong đề

### Câu 1. Hiển thị danh sách và thống kê

**Mở:** `src/screens/HomeScreen.tsx`.

“Em dùng `FlatList` để hiển thị danh sách. Hàm `renderBook` vẽ từng thẻ sách. Số còn lại bằng `quantity - borrowed`; bằng 0 thì hiện chữ Hết sách màu đỏ. Tổng đầu sách lấy bằng `books.length`, tổng cuốn đang mượn dùng `reduce` để cộng các giá trị `borrowed`.”

**Dòng cần tìm:** `filteredBooks`, `renderBook`, `totalBorrowed`, `ListEmptyComponent`.

### Câu 2. Dùng chung form thêm và sửa

**Mở:** `src/screens/BookFormScreen.tsx`.

“Em dùng chung một màn hình form. Nếu `route.params` có `book` thì điền sẵn dữ liệu để sửa; không có thì để trống để thêm. Khi nhấn lưu, `validateForm` kiểm tra trước. Hợp lệ thì `handleSave` gọi `updateBook` hoặc `addBook`.”

“Em kiểm tra tên và tác giả không rỗng; năm là số nguyên từ `MIN_YEAR` đến năm hiện tại; số lượng là số nguyên lớn hơn 0. Khi sửa, tổng số lượng phải lớn hơn hoặc bằng số cuốn đang mượn.”

**Hiển thị lỗi:** `validateForm` đưa lỗi vào state `errors`. `FormField` nhận lỗi để hiện chữ bên dưới và viền đỏ quanh ô nhập.

### Câu 3. Xoá có xác nhận

**Mở:** `HomeScreen.tsx` và `src/context/BookContext.tsx`.

“Em gắn `onLongPress` vào từng thẻ sách. Hàm `deleteBook` chặn xoá khi `borrowed > 0`. Với sách được phép xoá, em hiện `Alert` có nút Huỷ và Xoá; chỉ khi xác nhận mới lọc sách khỏi mảng và lưu lại.”

**Chỗ dễ bị hỏi:** `filter(item => item.id !== bookId)` tạo mảng không còn sách cần xoá. Màn chi tiết cũng gọi cùng hàm xoá nên dùng cùng điều kiện kiểm tra.

### Câu 4. Chi tiết và mượn trả

**Mở:** `src/screens/BookDetailScreen.tsx` và `BookContext.tsx`.

“Em truyền `bookId` khi mở chi tiết, rồi dùng `find` lấy sách từ danh sách hiện tại. Nút Cho mượn gọi `borrowBook`, tăng số đang mượn thêm một. Nút Nhận trả gọi `returnBook`, giảm số đang mượn một.”

“Nút mượn bị khoá khi hết sách; nút trả bị khoá khi chưa có cuốn nào được mượn. Trong context em cũng kiểm tra lại điều kiện để tránh cập nhật sai. Lưu thành công mới hiện thông báo.”

**Màu xám:** `Button.tsx` áp dụng `ui.disabled` khi thuộc tính `disabled` là `true`.

### Câu 5. Tìm kiếm kết hợp lọc

**Mở:** `HomeScreen.tsx`, tìm `filteredBooks`.

“Em dùng `toLowerCase` để tìm không phân biệt chữ hoa và chữ thường. Một sách được giữ lại khi tên hoặc tác giả chứa từ khoá, đồng thời thuộc thể loại đang chọn. Chọn Tất cả thì bỏ qua điều kiện thể loại.”

```text
(tên khớp HOẶC tác giả khớp) VÀ thể loại khớp
```

**Chỗ dễ bị hỏi:** `||` nghĩa là HOẶC, `&&` nghĩa là VÀ. Hai điều kiện cùng nằm trong `filter`, nên tìm kiếm và lọc hoạt động đồng thời.

### Câu 6. Lưu dữ liệu sau khi tắt ứng dụng

**Mở:** `BookContext.tsx`, tìm `loadBooks` và `saveBooks`.

“Khi mở app, `useEffect` gọi `loadBooks`. Em đọc dữ liệu bằng `AsyncStorage.getItem`, rồi dùng `JSON.parse` đổi chuỗi thành mảng. Nếu chưa từng lưu thì dùng năm sách mẫu. Mỗi thao tác thay đổi dữ liệu gọi `saveBooks`, dùng `JSON.stringify` đổi mảng thành chuỗi để lưu.”

**Cần phân biệt:** `null` là chưa có dữ liệu lưu; chuỗi `"[]"` là đã lưu một danh sách rỗng. Không được tự thêm lại sách mẫu khi người dùng đã xoá hết sách.

Giữ nguyên `STORAGE_KEY` để đọc được dữ liệu của bản cũ. Thay đổi sách mẫu không tự thay dữ liệu đã lưu trên thiết bị.

### Câu 7. Giao diện và trải nghiệm

**Mở:** `src/constants/theme.ts`, các màn hình và hai component dùng chung.

“Em khai báo màu chung và các kiểu bằng `StyleSheet.create`. Thẻ sách có bo góc và đổ bóng; nút có hiệu ứng nhấn và màu xám khi bị khoá. Có trạng thái không tìm thấy sách; ô nhập sai có viền đỏ và lỗi bên dưới. Form có `ScrollView`, `KeyboardAvoidingView`, bàn phím số và vùng an toàn.”

**Android:** cấu hình `adjustResize` trong `AndroidManifest.xml` hỗ trợ co vùng hiển thị khi bàn phím mở. Cần chạy trên máy ảo hoặc thiết bị để kiểm tra thực tế bàn phím và bố cục.

## 3. Các dòng code cần hiểu

| Code | Hiểu đơn giản |
| --- | --- |
| `useState` | Giữ dữ liệu đang thay đổi, ví dụ nội dung ô nhập hoặc danh sách sách. |
| `useEffect(..., [])` | Chạy phần đọc dữ liệu khi component được gắn vào ứng dụng. |
| `useContext` và `useBooks` | Cho các màn hình dùng chung danh sách và các hàm xử lý. |
| `find` | Lấy một sách theo ID. |
| `filter` | Tạo mảng chỉ giữ các sách thoả điều kiện. |
| `map` | Đi qua từng sách, thay sách cần sửa và giữ sách khác. |
| `reduce` | Cộng các giá trị `borrowed` thành tổng. |
| `{ ...book, borrowed: book.borrowed + 1 }` | Sao chép các trường của sách, rồi ghi đè trường `borrowed`. |
| `book?.title ?? ''` | Có sách thì dùng tên sách, chưa có thì dùng chuỗi rỗng. |
| `Number(year)` | Đổi chuỗi nhập thành số. |
| `Number.isInteger(...)` | Kiểm tra số nguyên; không nhận số thập phân hoặc `NaN`. |
| `async` và `await` | Cho phép đợi thao tác lưu xong trước khi xử lý tiếp. |
| `return true / false` | Cho nơi gọi biết thao tác thành công hay thất bại. |

Không dùng `parseInt` để kiểm tra toàn bộ ô nhập: `parseInt('12abc')` vẫn trả `12`, còn `Number('12abc')` trả `NaN` và bị chặn.

### Những kiểu TypeScript dễ gặp

- `Book`: quy định một sách có những trường nào và kiểu của từng trường.
- `RootStackParamList`: quy định màn hình nhận tham số gì khi chuyển trang.
- `Omit<Book, 'id' | 'borrowed'>`: dữ liệu thêm sách chưa có ID và số đang mượn; `addBook` tự bổ sung hai trường này.
- `Record<string, string>`: đối tượng lưu lỗi theo tên ô, ví dụ `errors.title`.
- `Promise<boolean>`: hàm xử lý bất đồng bộ, khi xong trả `true` hoặc `false`.
- `...props` trong `Button` và `FormField`: chuyển các thuộc tính như `onPress`, `value`, `onChangeText` xuống phần tử React Native bên trong.

## 4. Sửa trực tiếp khi vấn đáp

| Thầy cô yêu cầu | Sửa ở đâu và sửa gì |
| --- | --- |
| Đổi màu chính | Đổi `colors.primary` trong `src/constants/theme.ts`. |
| Chỉ nhận sách từ năm 1950 | Đổi `MIN_YEAR = 1900` thành `MIN_YEAR = 1950` trong `BookFormScreen.tsx`. Điều kiện kiểm tra, nhãn và thông báo lỗi cùng dùng hằng số này. |
| Thêm thể loại Truyện tranh | Thêm `'Truyện tranh'` vào `BOOK_CATEGORIES` trong `src/constants/categories.ts`. Form và bộ lọc tự có lựa chọn mới. |
| Sách mới nằm cuối danh sách | Trong `addBook`, đổi `[book, ...books]` thành `[...books, book]`. |
| Đổi dữ liệu năm sách mẫu | Sửa mảng `INITIAL_BOOKS` trong `BookContext.tsx`; dữ liệu này chỉ dùng khi chưa có dữ liệu lưu. |
| Đổi màu nút trả sách | Sửa `ui.successButton` trong `theme.ts`; màn chi tiết truyền kiểu này qua thuộc tính `style`. |

Trường `category` trong `Book` dùng kiểu `string` theo mô tả đề. Người dùng chọn thể loại từ các nút sinh bởi `BOOK_CATEGORIES`, không nhập thể loại tự do. Vì vậy danh sách lựa chọn chỉ cần khai báo ở một nơi.

### Nếu được yêu cầu cho mượn hai cuốn mỗi lần

Phải sửa đồng bộ:

1. Trong `borrowBook`: chặn khi `book.quantity - book.borrowed < 2`.
2. Khi cập nhật: tăng `borrowed` thêm `2`.
3. Trong màn chi tiết: khoá nút khi `remaining < 2`, đổi nhãn nút và nội dung thông báo tương ứng.

Không chỉ đổi phép cộng vì sẽ cho mượn quá số còn lại.

## 5. Tự chạy thử trước khi thi

1. Mở sách mẫu số `3`: đã hết sách, nút mượn phải khoá và có màu xám.
2. Mở sách mẫu số `2`: chưa ai mượn, nút nhận trả phải khoá.
3. Mượn một cuốn rồi trả: số đang mượn và số còn lại cập nhật đúng.
4. Nhấn giữ sách đang mượn: phải bị chặn xoá. Với sách chưa mượn, bấm Huỷ phải giữ sách, xác nhận Xoá mới mất sách.
5. Để trống form, nhập năm sai hoặc số lượng thập phân: có lỗi dưới ô và viền đỏ.
6. Sửa sách đang mượn ba cuốn thành tổng hai cuốn: phải bị chặn.
7. Tìm tên hoặc tác giả bằng chữ hoa rồi chọn thể loại: hai điều kiện phải cùng áp dụng.
8. Tắt và mở lại app sau thay đổi: dữ liệu còn đúng.
9. Mở bàn phím trong form, cuộn tới ô số lượng và nút lưu: phải thao tác được.

```bash
cd "/home/phong/Môn học/app-thi/LibraryApp"
npm start
# Terminal khác trong cùng thư mục, có máy ảo hoặc điện thoại kết nối:
npm run android
```

Kiểm tra mã nguồn bằng `npx tsc --noEmit`, `npm run lint` và `npm test -- --runInBand`. Các ca kiểm thử dùng bộ nhớ và vùng an toàn giả lập; vẫn cần chạy trên thiết bị để kiểm tra bàn phím, bố cục và thao tác thực tế.

Khi nộp, nén project và loại `node_modules`, `android/build`, `android/app/build`, `ios/Pods`; đặt tên `HoTen_MSSV_De1.zip` theo đề. Giữ ba màn hình riêng vì đề trừ điểm nếu gom toàn bộ ứng dụng vào một file.
