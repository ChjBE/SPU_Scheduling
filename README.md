# CPU Scheduling Simulator

PU Scheduling Simulator là ứng dụng web mô phỏng các thuật toán điều phối CPU trong hệ điều hành (Operating System). Dự án được xây dựng nhằm hỗ trợ việc học tập, nghiên cứu và trực quan hóa nguyên lý hoạt động của các thuật toán lập lịch CPU thông qua các tình huống mô phỏng thực tế.

Hệ thống cho phép người dùng tạo và quản lý tiến trình, lựa chọn thuật toán điều phối, theo dõi quá trình cấp phát CPU và đánh giá hiệu suất thông qua biểu đồ Gantt, sơ đồ trạng thái tiến trình và các chỉ số thống kê.

---

## 1. Giới thiệu dự án (Overview)

Trong hệ điều hành, điều phối CPU (CPU Scheduling) là cơ chế quan trọng nhằm quyết định tiến trình nào được cấp quyền sử dụng CPU tại một thời điểm nhất định.

Việc nghiên cứu các thuật toán điều phối thường gặp khó khăn khi chỉ tiếp cận thông qua lý thuyết và các bài toán tính toán thủ công. Vì vậy, dự án xây dựng một môi trường mô phỏng trực quan, giúp người học quan sát sự thay đổi trạng thái của tiến trình và hiểu rõ sự khác biệt giữa các thuật toán.

### Mục tiêu dự án

- Trực quan hóa nguyên lý hoạt động của các thuật toán điều phối CPU.
- Mô phỏng vòng đời và sự chuyển đổi trạng thái của tiến trình.
- Phân tích hiệu suất và so sánh các thuật toán dựa trên dữ liệu thực tế.
- Minh họa các vấn đề thường gặp trong điều phối CPU như Convoy Effect, Starvation và Context Switch Overhead.
- Hỗ trợ người học thử nghiệm các tình huống tải CPU khác nhau.

## 2. Chức năng chính (Features)

### 2.1. Máy tính ảo (Virtual Desktop)

Cung cấp môi trường máy tính ảo để tạo và quản lý các tiến trình.

- Khởi tạo tiến trình thông qua các ứng dụng mô phỏng.
- Thêm tiến trình thủ công với các thông số tùy chỉnh.
- Quản lý thông tin tiến trình.
- Thiết lập Arrival Time, CPU Burst, I/O Burst và Priority.
- Sử dụng các bộ dữ liệu mẫu để nhanh chóng tạo kịch bản mô phỏng.

### 2.2. Mô phỏng thuật toán điều phối CPU

Hệ thống hỗ trợ 7 thuật toán điều phối:

| Thuật toán | Tên đầy đủ                    | Đặc điểm                                                             |
| ---------- | ----------------------------- | -------------------------------------------------------------------- |
| FCFS       | First-Come, First-Served      | Tiến trình đến trước được thực hiện trước.                           |
| SJF        | Shortest Job First            | Ưu tiên tiến trình có CPU Burst ngắn nhất.                           |
| SRTF       | Shortest Remaining Time First | Ưu tiên tiến trình có thời gian thực thi còn lại ngắn nhất, có ngắt. |
| Priority   | Priority Scheduling           | Điều phối dựa trên mức độ ưu tiên của tiến trình.                    |
| RR         | Round Robin                   | Phân chia CPU theo các lát thời gian (Time Quantum).                 |
| MLQ        | Multilevel Queue              | Phân chia tiến trình thành các hàng đợi có mức ưu tiên cố định.      |
| MLFQ       | Multilevel Feedback Queue     | Điều phối bằng các hàng đợi đa cấp có cơ chế phản hồi.               |

Các tùy chọn mô phỏng bao gồm:

- Chế độ điều phối có ngắt (Preemptive) và không ngắt (Non-preemptive) đối với Priority.
- Thiết lập Time Quantum cho các thuật toán sử dụng lát thời gian.
- Cơ chế Aging nhằm hạn chế tình trạng Starvation trong Priority.
- Cơ chế Priority Boost trong MLFQ.

### 2.3. Trực quan hóa quá trình mô phỏng

Hệ thống cung cấp nhiều thành phần trực quan:

- Gantt Chart: Biểu diễn tiến trình sử dụng CPU theo trục thời gian.
- Ready Queue: Theo dõi các tiến trình đang chờ được cấp CPU.
- Process State Diagram: Minh họa vòng đời của tiến trình qua 5 trạng thái New, Ready, Running, Waiting và Terminated.
- Event Log: Ghi lại các sự kiện điều phối và chuyển đổi trạng thái.
- Context Switch: Hiển thị các khoảng thời gian chuyển đổi ngữ cảnh giữa các tiến trình.

Người dùng có thể:

- Chạy mô phỏng tự động.
- Tạm dừng và tiếp tục mô phỏng.
- Thực hiện từng bước (Step-by-step).
- Điều chỉnh tốc độ mô phỏng.
- Theo dõi và điều khiển tiến trình theo mốc thời gian.

### 2.4. Phân tích và đánh giá hiệu suất

Sau khi hoàn thành mô phỏng, hệ thống tổng hợp các chỉ số đánh giá:

| Chỉ số                | Ý nghĩa                                                           |
| --------------------- | ----------------------------------------------------------------- |
| Waiting Time (WT)     | Thời gian tiến trình chờ trong hàng đợi Ready.                    |
| Turnaround Time (TAT) | Tổng thời gian từ khi tiến trình đến hệ thống đến khi hoàn thành. |
| Response Time (RT)    | Thời gian từ khi tiến trình đến đến lần đầu tiên được cấp CPU.    |
| CPU Utilization       | Tỷ lệ thời gian CPU thực hiện công việc hữu ích.                  |
| Throughput            | Số tiến trình hoàn thành trong một đơn vị thời gian.              |
| Context Switch (CS)   | Số lần chuyển đổi ngữ cảnh giữa các tiến trình.                   |

Hệ thống hỗ trợ phân tích và so sánh kết quả giữa các thuật toán, giúp người học đánh giá ưu điểm, hạn chế và hiệu quả của từng phương pháp điều phối.

### 2.5. Phân tích tải CPU (CPU Load Analysis)

Cung cấp các kịch bản mô phỏng nhằm khảo sát hành vi của hệ thống trong những điều kiện tải khác nhau:

1. Burst Arrival / Convoy Effect: Nhiều tiến trình xuất hiện gần như đồng thời.
2. CPU-Bound Overload: Hệ thống xử lý nhiều tác vụ sử dụng CPU liên tục.
3. Mixed Workload: Kết hợp tiến trình CPU-bound và I/O-bound.
4. Interactive Workload: Các tiến trình tương tác xen kẽ với hoạt động tính toán.
5. High Priority Arrival: Các tiến trình có độ ưu tiên cao liên tục xuất hiện.
6. Starvation: Mô phỏng tình trạng tiến trình phải chờ CPU trong thời gian dài.

Ngoài việc nhận diện vấn đề, hệ thống còn đưa ra các giải pháp đề xuất và cho phép áp dụng giải pháp để quan sát sự thay đổi của kết quả mô phỏng.

### 2.6. Các chức năng hỗ trợ

- Trang chủ giới thiệu hệ thống.
- Trang thông tin và giải thích các thuật toán.
- Trang giới thiệu dự án.
- Trang liên hệ và gửi góp ý.
- Kiểm tra dữ liệu đầu vào trước khi thực hiện mô phỏng.

---

## 3. Công nghệ sử dụng (Technology Stack)

Dự án được phát triển dưới dạng ứng dụng web tĩnh, sử dụng các công nghệ:

| Công nghệ  | Vai trò                                                              |
| ---------- | -------------------------------------------------------------------- |
| HTML5      | Xây dựng cấu trúc giao diện.                                         |
| CSS3       | Thiết kế giao diện, bố cục và hiệu ứng hiển thị.                     |
| JavaScript | Xây dựng thuật toán điều phối, xử lý dữ liệu và điều khiển mô phỏng. |
| SVG        | Xây dựng các biểu tượng và thành phần trực quan.                     |

Đặc điểm kỹ thuật:

- Không sử dụng framework JavaScript.
- Không yêu cầu cài đặt thư viện bên ngoài.
- Không yêu cầu công cụ build hoặc compile.
- Các module JavaScript được tổ chức thành nhiều tệp riêng biệt và sử dụng phạm vi toàn cục.

---

## 4. Cấu trúc thư mục (Project Structure)

```text
CPU-Scheduling/
│
├── index.html
├── README.md
│
│
├── css/
│   ├── base.css
│   ├── nav.css
│   ├── layout.css
│   ├── algorithm.css
│   ├── components.css
│   ├── kpi.css
│   ├── home.css
│   ├── computer.css
│   ├── gantt.css
│   ├── simulation.css
│   ├── state-diagram.css
│   ├── about.css
│   ├── contact.css
│   ├── analysis.css
│   ├── footer.css
│   ├── kpi-groups.css
│   ├── gantt-legend.css
│   ├── control-dock.css
│   ├── quick-add-modal.css
│   ├── refine-footer.css
│   ├── refine-gantt.css
│   ├── event-log.css
│   ├── typography-scale.css
│   └── refine-misc.css
│
└── js/
    ├── constants.js
    ├── state.js
    ├── algorithms.js
    ├── analysis.js
    ├── gantt.js
    ├── stateView.js
    ├── controller.js
    ├── desktop.js
    ├── loadAnalysis.js
    ├── views.js
    ├── contact.js
    └── app.js
```

### 4.1. Chức năng các module JavaScript

| Tệp               | Chức năng                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------- |
| `constants.js`    | Khai báo hằng số, biểu tượng SVG, danh sách thuật toán, dữ liệu kịch bản và bộ dữ liệu mẫu. |
| `state.js`        | Quản lý trạng thái toàn cục và các hàm tiện ích.                                            |
| `algorithms.js`   | Chứa lõi xử lý và mô phỏng các thuật toán điều phối CPU.                                    |
| `analysis.js`     | Phân tích, tổng hợp và so sánh kết quả mô phỏng.                                            |
| `gantt.js`        | Xây dựng và điều khiển biểu đồ Gantt.                                                       |
| `stateView.js`    | Hiển thị sơ đồ trạng thái và vòng đời tiến trình.                                           |
| `controller.js`   | Điều khiển quá trình chạy, dừng, tiếp tục và mô phỏng từng bước.                            |
| `desktop.js`      | Quản lý máy tính ảo, tiến trình và dữ liệu đầu vào.                                         |
| `loadAnalysis.js` | Phân tích tải CPU, nhận diện vấn đề và áp dụng giải pháp.                                   |
| `views.js`        | Xây dựng nội dung giao diện và các trang chức năng.                                         |
| `contact.js`      | Kiểm tra dữ liệu và xử lý chức năng gửi biểu mẫu liên hệ.                                   |
| `app.js`          | Khởi tạo ứng dụng và quản lý điều hướng giữa các trang.                                     |

### 4.2. Nguyên tắc tổ chức module

Các tệp JavaScript được nạp theo thứ tự phụ thuộc:

```text
constants.js
      ↓
state.js
      ↓
algorithms.js
      ↓
analysis.js
      ↓
gantt.js
      ↓
stateView.js
      ↓
controller.js
      ↓
desktop.js
      ↓
loadAnalysis.js
      ↓
views.js
      ↓
contact.js
      ↓
app.js
```

Lưu ý: Không tự ý thay đổi thứ tự nạp các tệp JavaScript và CSS trong `index.html`, vì các module có sự phụ thuộc lẫn nhau. Đặc biệt, `app.js` phải được nạp cuối cùng để đảm bảo các thành phần cần thiết đã được khởi tạo.

---

## 5. Cài đặt và khởi chạy (Installation & Setup)

### 5.1. Yêu cầu hệ thống

- Trình duyệt web hiện đại: Google Chrome, Microsoft Edge, Mozilla Firefox hoặc Safari.
- Python 3 (không bắt buộc, chỉ sử dụng khi muốn chạy local server).
- Không cần cài đặt Node.js, npm hoặc các thư viện bên ngoài.

### 5.2. Tải mã nguồn

Clone repository:

```bash
git clone <repository-url>
```

Di chuyển vào thư mục dự án:

```bash
cd CPU-Scheduling
```

### 5.3. Khởi chạy ứng dụng

**Cách 1: Mở trực tiếp**

Mở tệp `index.html` bằng trình duyệt web.

**Cách 2: Sử dụng Python Local Server (Khuyến nghị)**

Tại thư mục chứa `index.html`, chạy lệnh:

```bash
python3 -m http.server 8000
```

Sau đó mở trình duyệt và truy cập:

```text
http://localhost:8000
```

Ứng dụng sẽ được hiển thị trên trình duyệt và có thể sử dụng các chức năng mô phỏng.

---

## 6. Hướng dẫn sử dụng (Usage)

Quy trình sử dụng cơ bản:

Bước 1: Khởi tạo tiến trình

Truy cập khu vực Máy tính ảo, lựa chọn ứng dụng hoặc thêm tiến trình thủ công. Thiết lập các thông số cần thiết như Arrival Time, CPU Burst, I/O Burst và Priority.

Bước 2: Lựa chọn thuật toán

Truy cập chức năng mô phỏng, chọn thuật toán điều phối CPU muốn khảo sát.

Bước 3: Thiết lập tham số

Điều chỉnh các tham số phù hợp với thuật toán, chẳng hạn Time Quantum hoặc chế độ Preemptive/Non-preemptive.

Bước 4: Thực hiện mô phỏng

Nhấn nút chạy để bắt đầu. Quan sát biểu đồ Gantt, Ready Queue, sơ đồ trạng thái tiến trình và nhật ký điều phối.

Bước 5: Phân tích kết quả

Theo dõi các chỉ số hiệu suất và so sánh kết quả giữa những thuật toán khác nhau.

Bước 6: Khảo sát tình huống đặc biệt

Truy cập chức năng Phân tích tải CPU để thử nghiệm các kịch bản và đánh giá hiệu quả của những giải pháp được đề xuất.

---

## 7. Lưu ý kỹ thuật (Technical Notes)

### 7.1. Quản lý trạng thái

Ứng dụng sử dụng biến trạng thái toàn cục `S` để quản lý dữ liệu và trạng thái của hệ thống. Các module có thể truy cập và cập nhật dữ liệu thông qua phạm vi toàn cục.

### 7.2. Thứ tự nạp tệp

- Không tự ý đảo thứ tự các thẻ `<link>` trong `index.html`.
- Không thay đổi thứ tự các thẻ `<script>` nếu chưa kiểm tra các phụ thuộc.
- Khi bổ sung module JavaScript mới, cần khai báo trước `app.js` nếu module đó được ứng dụng sử dụng trong quá trình khởi tạo.

### 7.3. Chức năng liên hệ

Chức năng gửi biểu mẫu liên hệ sử dụng API endpoint:

```text
/api/contact
```

Endpoint được khai báo trong `js/contact.js`.

Chức năng này cần có backend tương ứng để xử lý và gửi email. Backend không được thiết kế nguồn hiện tại, do đó việc chạy ứng dụng dưới dạng website tĩnh không đồng nghĩa với việc chức năng gửi email đã hoạt động.

---

## 8. Định hướng phát triển (Future Improvements)

Một số hướng có thể tiếp tục nghiên cứu và phát triển:

- Bổ sung thêm các thuật toán điều phối CPU.
- Mở rộng khả năng cấu hình tham số mô phỏng.
- Cải thiện khả năng trực quan hóa quá trình chuyển đổi trạng thái tiến trình.
- Bổ sung các kịch bản mô phỏng tải CPU phức tạp hơn.
- Phát triển chức năng lưu trữ và xuất kết quả mô phỏng.
- Hoàn thiện backend cho chức năng liên hệ.
- Cải thiện khả năng so sánh và đánh giá hiệu suất giữa các thuật toán.

---

## 9. Đóng góp cho dự án (Contributing)

Mọi ý kiến đóng góp nhằm cải thiện chức năng, giao diện và độ chính xác của hệ thống đều được hoan nghênh.

Quy trình đóng góp:

1. Fork repository.
2. Tạo nhánh mới cho nội dung cần phát triển.
3. Thực hiện chỉnh sửa và kiểm tra chức năng.
4. Commit các thay đổi với nội dung rõ ràng.
5. Tạo Pull Request để đề xuất tích hợp vào nhánh chính.

Khi chỉnh sửa mã nguồn, cần đảm bảo không làm ảnh hưởng đến thứ tự phụ thuộc giữa các module và tính chính xác của các thuật toán mô phỏng.

---

## 10. Thông tin dự án (Project Information)

- Project Name: CPU Scheduling Simulator
- Project Type: Educational Web Application
- Domain: Operating Systems – CPU Scheduling
- Development Year: 2026
- Language: HTML, CSS, JavaScript
- License: Chưa xác định

---

_CPU Scheduling Simulator – Trực quan hóa và khám phá nguyên lý điều phối CPU trong hệ điều hành._
# SPU_Scheduling
