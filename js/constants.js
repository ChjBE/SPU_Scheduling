        /* ===== js/constants.js ===== */
        /* CPU Scheduling Simulator - Constants & Helpers */
        const IC = {
            chip: '<rect x="6" y="6" width="12" height="12" rx="2.5"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/>',
            list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r=".8"/><circle cx="3.5" cy="12" r=".8"/><circle cx="3.5" cy="18" r=".8"/>',
            clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
            check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
            nodes: '<circle cx="12" cy="5.5" r="2.5"/><circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/><path d="M10.8 7.8L6.8 15.7M13.2 7.8l4 7.9"/>',
            monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
            bars: '<path d="M5 20V13M12 20V4M19 20V9"/>',
            gauge: '<path d="M4.5 18a9 9 0 1 1 15 0"/><path d="M12 14l4-5"/><circle cx="12" cy="14" r="1"/>',
            chart: '<rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M7 15l3.5-3.5 2.5 2.5 4-5"/>',
            search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
            folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
            globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18"/>',
            calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8.5 7.5h7M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01"/>',
            play: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10.5 9.5v5l4-2.5z"/>',
            note: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
            gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>',
            arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
            x: '<path d="M6 6l12 12M18 6L6 18"/>',
            run: '<path d="M8 5.5l11 6.5-11 6.5z"/>',
            pause: '<path d="M9 5v14M15 5v14"/>',
            step: '<path d="M5 5.5l9 6.5-9 6.5zM19 5v14"/>',
            reset: '<path d="M4 12a8 8 0 1 0 2.6-5.9M4 4.5V9h4.5"/>'
        };

        const svg = (n, s = 22, w = 1.8) => `<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || IC.chip}</svg>`;
        const EM = { '🖥️': 'monitor', '📁': 'folder', '🌐': 'globe', '🧮': 'calc', '▶️': 'play', '📝': 'note', '⚙️': 'gear' };
        const ico = (e, s = 20) => svg(EM[e] || 'chip', s);

        const HERO_SVG = `<svg viewBox="0 0 520 240" fill="none" aria-hidden="true"><g stroke="#cfe0ff" stroke-width="3" stroke-linecap="round"><path d="M70 22v22M100 22v22M130 22v22M160 22v22M70 196v22M100 196v22M130 196v22M160 196v22M22 70h22M22 100h22M22 130h22M22 160h22M186 70h22M186 100h22M186 130h22M186 160h22"/></g><rect x="44" y="44" width="142" height="152" rx="18" fill="rgba(255,255,255,.08)" stroke="#8fb4ff" stroke-width="3"/><rect x="66" y="68" width="98" height="104" rx="10" fill="rgba(255,255,255,.06)" stroke="#fff" stroke-width="3"/><text x="115" y="130" text-anchor="middle" font-family="Inter,Segoe UI,sans-serif" font-size="30" font-weight="700" fill="#fff">CPU</text><rect x="236" y="30" width="268" height="180" rx="12" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/><g stroke="rgba(255,255,255,.18)"><path d="M270 44v152M320 44v152M370 44v152M420 44v152M470 44v152"/></g><rect x="262" y="56" width="62" height="16" rx="3" fill="#5b8cff"/><rect x="298" y="86" width="74" height="16" rx="3" fill="#8fb4ff"/><rect x="352" y="116" width="74" height="16" rx="3" fill="#6f9bff"/><rect x="408" y="146" width="54" height="16" rx="3" fill="#8fb4ff"/><rect x="446" y="176" width="42" height="16" rx="3" fill="#bcd2ff"/></svg>`;

        const NM = {
            FCFS: 'FCFS',
            SJF: 'SJF',
            SRTF: 'SRTF',
            PRIO: 'Priority',
            RR: 'Round Robin',
            MLQ: 'Multilevel Queue',
            MLFQ: 'Multilevel Feedback Queue'
        };

        const AL = [
            ['FCFS', 'First-Come, First-Served: Tiến trình đến trước được cấp CPU trước và thực thi đến khi hoàn tất hoặc nhường CPU (độc quyền).', 'Đơn giản, công bằng tuyệt đối theo trình tự thời gian đến, không có nguy cơ Starvation.', 'Hiệu ứng đoàn tàu (Convoy Effect): tiến trình CPU burst dài làm các tiến trình ngắn phải chờ đợi lâu, tăng AWT.'],
            ['SJF', 'Shortest Job First: Chọn tiến trình có tổng CPU Burst ngắn nhất trong hàng đợi sẵn sàng (độc quyền).', 'Đạt thời gian chờ trung bình (AWT) tối ưu trong nhóm các thuật toán độc quyền.', 'Cần dự đoán trước CPU Burst; nguy cơ bỏ đói (Starvation) đối với các tiến trình có thời gian thực thi dài.'],
            ['SRTF', 'Shortest Remaining Time First: Phiên bản có ngắt (preemptive) của SJF. Tiến trình mới đến có thời gian còn lại ngắn hơn sẽ chiếm quyền CPU ngay lập tức.', 'Tối ưu hóa thời gian chờ trung bình (AWT) và thời gian quay vòng trung bình (ATAT).', 'Số lần chuyển ngữ cảnh cao; tiến trình dài dễ bị đói tài nguyên khi hệ thống có tải tác vụ ngắn liên tục.'],
            ['PRIO', 'Priority Scheduling: Cấp CPU cho tiến trình có mức độ ưu tiên cao nhất (quy ước số nhỏ = ưu tiên cao). Hỗ trợ cả hai chế độ có ngắt (Preemptive) và không ngắt (Non-preemptive).', 'Đảm bảo các tác vụ trọng yếu và khẩn cấp của hệ điều hành luôn được xử lý kịp thời.', 'Nguy cơ Starvation với tiến trình ưu tiên thấp nếu không áp dụng cơ chế điều chỉnh độ ưu tiên động (Aging).'],
            ['RR', 'Round Robin: Phân bổ thời gian CPU luân phiên theo các lát thời gian (Time Quantum q). Hết quantum, tiến trình bị ngắt và quay về cuối hàng đợi Ready.', 'Rất công bằng, thời gian phản hồi (Response Time) tốt, cực kỳ thích hợp cho các hệ điều hành đa nhiệm tương tác.', 'Hiệu năng phụ thuộc lớn vào Time Quantum q; q quá nhỏ gây lãng phí do chuyển ngữ cảnh, q quá lớn thoái hóa thành FCFS.'],
            ['MLQ', 'Multilevel Queue: Phân chia hàng đợi sẵn sàng thành nhiều mức cố định theo bản chất tiến trình (hàng ưu tiên cao cho tác vụ tương tác, hàng thấp cho tính toán ngầm).', 'Áp dụng chính sách điều phối riêng biệt và phù hợp cho từng phân lớp tác vụ khác nhau.', 'Cố định phân lớp, tiến trình không thể di chuyển giữa các hàng đợi; hàng thấp có thể bị bỏ đói nếu hàng cao luôn bận.'],
            ['MLFQ', 'Multilevel Feedback Queue: Hệ thống hàng đợi đa cấp phản hồi linh hoạt với Quantum tăng dần (q, 2q, FCFS). Tiến trình dùng hết quantum bị giáng cấp; hỗ trợ chu kỳ Priority Boost để chống starvation.', 'Tự động thích nghi với đặc tính tiến trình mà không cần biết trước CPU Burst; tác vụ ngắn hoàn thành nhanh, tác vụ dài dần hạ cấp.', 'Cấu trúc phức tạp, đòi hỏi tinh chỉnh nhiều tham số (số lượng hàng đợi, quantum từng cấp, quy tắc nâng/hạ cấp).']
        ];

        const LIM = {
            FCFS: 'Hiệu ứng đoàn tàu (Convoy Effect), thời gian chờ trung bình cao',
            SJF: 'Cần biết trước CPU Burst; gây Starvation cho tiến trình dài',
            SRTF: 'Tần suất chuyển ngữ cảnh cao; gây Starvation cho tiến trình dài',
            PRIO: 'Nguy cơ Starvation nghiêm trọng cho tiến trình ưu tiên thấp (cần bật Aging)',
            RR: 'Phụ thuộc nhiều vào Quantum q; sinh chi phí chuyển ngữ cảnh nếu q nhỏ',
            MLQ: 'Phân nhóm cố định, hàng thấp dễ bị bỏ đói',
            MLFQ: 'Cấu trúc phức tạp, nhạy cảm với cấu hình tham số'
        };

        const APPS = [
            ['This PC', '🖥️', 'HH', 2, 0, 3, 'Khám phá hệ thống tệp và thiết bị lưu trữ.'],
            ['Thư mục', '📁', 'IO', 2, 3, 3, 'Thao tác đọc ghi tệp dữ liệu trên đĩa (nhiều giai đoạn chờ I/O).'],
            ['Trình duyệt', '🌐', 'IO', 4, 3, 3, 'Tải tài nguyên mạng và tương tác web (CPU xen kẽ I/O).'],
            ['Máy tính', '🧮', 'HH', 2, 0, 2, 'Thực hiện các thuật toán tính toán số học xác định.'],
            ['Video', '▶️', 'IO', 5, 6, 3, 'Giải mã luồng phát video đa phương tiện với thời gian I/O dài.'],
            ['Notepad', '📝', 'IO', 1, 1, 1, 'Soạn thảo văn bản, tác vụ tương tác phản hồi nhanh.'],
            ['Chạy chương trình', '⚙️', 'CPU', 10, 0, 4, 'Chương trình biên dịch hoặc xử lý dữ liệu nặng (CPU-bound).']
        ];

        const SC = [
            ['burst', 'Nhiều tiến trình đến đồng thời (Burst Arrival)'],
            ['cpu', 'Tác vụ nặng CPU kéo dài (CPU-Bound Overload)'],
            ['mixed', 'Hỗn hợp CPU-bound và I/O-bound'],
            ['inter', 'Tác vụ tương tác xen kẽ tính toán'],
            ['hiprio', 'Tác vụ ưu tiên cao xuất hiện liên tục'],
            ['starve', 'Nguy cơ đói tài nguyên (Starvation)']
        ];

        const SC_DATA = {
            burst: {
                title: 'Nhiều tiến trình đến đồng thời (Burst Arrival / Convoy Effect)',
                target: 'Khảo sát hiện tượng thắt cổ chai và hiệu ứng đoàn tàu (Convoy Effect) khi một lượng lớn tiến trình xuất hiện cùng lúc tại thời điểm ban đầu t ≈ 0.',
                theory: 'Khi nhiều tiến trình đến đồng thời, nếu hệ thống sử dụng thuật toán FCFS mà tiến trình đầu tiên có CPU Burst lớn, toàn bộ các tiến trình ngắn đến sau sẽ bị phong tỏa trong hàng đợi Ready. Hiện tượng này làm tăng vọt Thời gian chờ trung bình (AWT) và giảm hiệu quả sử dụng tài nguyên ngoại vi. Theo định lý Schrage, SJF/SRTF chứng minh toán học cho giá trị AWT nhỏ nhất trong trường hợp này.',
                setup: 'Tập dữ liệu gồm N tiến trình với Arrival Time tập trung tại t ∈ [0, 2], CPU Burst phân bổ ngẫu nhiên từ 2 đến 8 đơn vị thời gian.',
                mechanism: 'Hệ điều hành tiếp nhận đồng loạt các tiến trình vào hàng đợi Ready. Tùy thuộc vào thuật toán được lựa chọn, CPU sẽ cấp phát liên tục không ngắt (FCFS/SJF) hoặc chia nhỏ thời gian xử lý (RR/SRTF).',
                evalRule: (r, ac) => {
                    const ratio = r.wt / ac;
                    if (ratio >= 2.5) return 'Hiệu ứng Convoy nghiêm trọng: Thời gian chờ trung bình gấp ' + ratio.toFixed(1) + ' lần thời gian thực thi của chính tiến trình. FCFS khiến các tiến trình ngắn bị đình trệ quá mức.';
                    return 'Thời gian chờ được kiểm soát ở mức hợp lý (tỷ lệ chờ/burst là ' + ratio.toFixed(1) + '). Các tiến trình ngắn được giải phóng kịp thời.';
                },
                recommendations: [
                    { id: 'SRTF', label: 'Chuyển sang SRTF (Tối ưu AWT)', why: 'Cắt giảm tối đa thời gian chờ bằng cách ưu tiên tiến trình có thời gian còn lại ngắn nhất.', tradeOff: 'Tăng số lần chuyển ngữ cảnh context switch.' },
                    { id: 'RR', label: 'Chuyển sang Round Robin (Công bằng)', why: 'Chia đều thời gian xử lý qua quantum, giải phóng nhanh cảm giác nghẽn.', tradeOff: 'AWT có thể cao hơn SRTF nhưng không tiến trình nào phải chờ đợi đơn phương.' }
                ]
            },
            cpu: {
                title: 'Tải CPU cao kéo dài (CPU-Bound Overload)',
                target: 'Đánh giá khả năng thông lượng và chi phí chuyển đổi ngữ cảnh khi hệ thống chịu tải tính toán nặng nề liên tục (mã hóa, dựng hình 3D, xử lý ma trận lớn).',
                theory: 'Với các tác vụ CPU-bound, CPU hầu như bận 100%. Khi đó, chi phí chuyển đổi ngữ cảnh (Context Switch Overhead) trở thành nhân tố quyết định hiệu năng. Thuật toán có tần suất ngắt cao (như RR với quantum quá nhỏ) sẽ tiêu hao một lượng lớn chu kỳ máy chỉ để lưu và nạp thanh ghi tiến trình, làm giảm thông lượng hữu ích (Effective Throughput).',
                setup: 'N tiến trình thuộc nhóm CPU-bound thuần túy với CPU Burst lớn (10 đến 20 đơn vị thời gian), không phát sinh thời gian chờ I/O.',
                mechanism: 'CPU chạy hết công suất. Bộ điều phối cần tối đa hóa thời gian CPU hữu ích và giảm thiểu việc tráo đổi tiến trình không cần thiết.',
                evalRule: (r, ac) => {
                    if (r.cs >= r.P.length * 3) return 'Cảnh báo chi phí chuyển đổi ngữ cảnh: Xuất hiện ' + r.cs + ' lần chuyển ngữ cảnh, làm lãng phí chu kỳ CPU vào việc lưu nạp thanh ghi.';
                    return 'CPU hoạt động với hiệu suất cao (' + r.u.toFixed(1) + '%), tần suất chuyển ngữ cảnh được duy trì ở mức tối thiểu.';
                },
                recommendations: [
                    { id: 'FCFS', label: 'Sử dụng FCFS (Tối đa hóa Thông lượng)', why: 'Loại bỏ hoàn toàn chuyển ngữ cảnh giữa chừng, đảm bảo CPU đạt hiệu suất hữu ích tối đa.', tradeOff: 'Thời gian chờ của các tiến trình đến sau sẽ kéo dài.' },
                    { id: 'RR', label: 'Round Robin với Quantum lớn (q ≥ 6)', why: 'Đảm bảo tính đa nhiệm mà vẫn hạn chế số lần chuyển ngữ cảnh.', tradeOff: 'Cần chọn đúng tham số Quantum phù hợp với kích thước tiến trình.' }
                ]
            },
            mixed: {
                title: 'Tải hỗn hợp CPU-bound và I/O-bound (Heterogeneous Workload)',
                target: 'Mô phỏng môi trường máy chủ và máy trạm thực tế: cân bằng xử lý giữa tác vụ ngầm tính toán nặng và các tác vụ nhập xuất dữ liệu ngắt quãng.',
                theory: 'Tác vụ I/O-bound cần được cấp CPU ngay khi vừa hoàn thành I/O để nhanh chóng phát lệnh I/O tiếp theo, giữ cho cả CPU và thiết bị ngoại vi cùng bận rộn (chồng lấn I/O và CPU). Nếu để tác vụ CPU-bound độc chiếm vi xử lý, thiết bị ngoại vi sẽ nhàn rỗi, làm suy giảm hiệu suất tổng thể của hệ thống.',
                setup: '50% số tiến trình là I/O-bound (CPU Burst ngắn 1-4 đv, kèm I/O Burst 1-4 đv) và 50% là CPU-bound (CPU Burst dài 8-15 đv).',
                mechanism: 'Tiến trình thực thi một phần burst trên CPU, sau đó chuyển sang trạng thái Waiting để chờ I/O hoàn tất trước khi quay lại hàng đợi Ready.',
                evalRule: (r, ac) => {
                    const ioProcs = r.m.filter(p => p.type === 'IO');
                    const avgIoRt = ioProcs.length ? ioProcs.reduce((s, p) => s + p.rt, 0) / ioProcs.length : 0;
                    if (avgIoRt > 5) return 'Tác vụ I/O bị nghẽn: Thời gian phản hồi của tác vụ tương tác là ' + avgIoRt.toFixed(1) + ' đv thời gian (chậm). Tác vụ CPU-bound đang phong tỏa CPU.';
                    return 'Cân bằng tốt: Tác vụ I/O phản hồi nhanh (trung bình ' + avgIoRt.toFixed(1) + ' đv), thiết bị I/O được kích hoạt liên tục.';
                },
                recommendations: [
                    { id: 'MLFQ', label: 'Áp dụng Multilevel Feedback Queue (MLFQ)', why: 'Tự động phân lớp: tác vụ I/O ở lại hàng ưu tiên cao vì nhường CPU sớm; tác vụ CPU-bound bị đẩy xuống hàng dưới.', tradeOff: 'Cần định cấu hình các mức quantum và chu kỳ Boost.' },
                    { id: 'SRTF', label: 'Sử dụng SRTF', why: 'Tác vụ I/O có CPU burst ngắn nên tự nhiên được ưu tiên chạy trước, giải phóng thiết bị ngoại vi.', tradeOff: 'Tác vụ CPU-bound dài có thể bị gián đoạn nhiều lần.' }
                ]
            },
            inter: {
                title: 'Tác vụ tương tác người dùng (Interactive Latency-Sensitive)',
                target: 'Tối ưu hóa thời gian phản hồi (Response Time - RT) để đảm bảo trải nghiệm người dùng không bị trễ hay giật lag trên giao diện.',
                theory: 'Đối với hệ thống có người dùng trực tiếp, Response Time (thời gian từ lúc tiến trình xuất hiện đến lần đầu tiên nhận được CPU) quan trọng hơn Throughput. Một tiến trình đồ họa hay phản hồi phím phải được cấp CPU trong vòng vài tích tắc đầu tiên, ngay cả khi nó chưa hoàn tất toàn bộ công việc.',
                setup: 'Một tiến trình nền tính toán dài (CPU-bound) chiếm giữ hệ thống từ t=0, sau đó hàng loạt tác vụ tương tác ngắn xuất hiện rải rác.',
                mechanism: 'Bộ điều phối phải có khả năng ngắt tiến trình nền để nhường CPU ngay cho tác vụ tương tác vừa đến.',
                evalRule: (r, ac) => {
                    const ioProcs = r.m.filter(p => p.type === 'IO');
                    const avgIoRt = ioProcs.length ? ioProcs.reduce((s, p) => s + p.rt, 0) / ioProcs.length : 0;
                    if (avgIoRt > 3) return 'Độ trễ tương tác cao: Thời gian phản hồi trung bình ' + avgIoRt.toFixed(1) + ' đv. Người dùng sẽ cảm nhận rõ độ trễ giao diện.';
                    return 'Độ trễ phản hồi xuất sắc: Các tác vụ tương tác nhận được CPU sau trung bình ' + avgIoRt.toFixed(1) + ' đv thời gian.';
                },
                recommendations: [
                    { id: 'RR', label: 'Áp dụng Round Robin với Quantum nhỏ (q = 2 hoặc 3)', why: 'Đảm bảo mọi tiến trình mới đến đều được phân bổ một lát thời gian trong chu kỳ ngắn nhất.', tradeOff: 'Tăng nhẹ số lần chuyển ngữ cảnh nhưng đạt độ mượt mà cao.' },
                    { id: 'MLFQ', label: 'Áp dụng MLFQ', why: 'Hàng đợi cao nhất chạy Quantum nhỏ đáp ứng ngay lập tức mọi tương tác mới.', tradeOff: 'Chi phí quản trị hàng đợi đa cấp.' }
                ]
            },
            hiprio: {
                title: 'Tải ưu tiên cao xuất hiện thường xuyên (High-Priority Dominance)',
                target: 'Khảo sát cơ chế điều phối tiến trình có mức độ ưu tiên khác nhau và xử lý xung đột quyền thực thi giữa tác vụ khẩn cấp và tác vụ thông thường.',
                theory: 'Các tiến trình thời gian thực hoặc tiến trình hệ thống hạt nhân (Kernel services) cần được ưu tiên tuyệt đối. Tuy nhiên, nếu luồng tác vụ ưu tiên cao xuất hiện với tần suất dày đặc, các tác vụ thường sẽ rơi vào tình trạng đình trệ dài hạn.',
                setup: 'Các tiến trình có độ ưu tiên phân hóa: nhóm khẩn cấp (Priority = 1, 2) và nhóm thông thường (Priority = 4, 5) xuất hiện xen kẽ liên tục.',
                mechanism: 'Bộ điều phối Priority so sánh chỉ số ưu tiên (số nhỏ hơn = ưu tiên cao hơn) để chọn tiến trình thực thi tiếp theo.',
                evalRule: (r, ac) => {
                    const lowPrio = r.m.filter(p => p.pr >= 4);
                    const maxLowWt = lowPrio.length ? Math.max(...lowPrio.map(p => p.wt)) : 0;
                    if (maxLowWt >= 20) return 'Cảnh báo đình trệ tác vụ thường: Tiến trình ưu tiên thấp bị trì hoãn tới ' + maxLowWt + ' đv thời gian do các tiến trình khẩn cấp liên tục chiếm CPU.';
                    return 'Phân bổ ưu tiên hợp lý: Các tác vụ khẩn cấp được phục vụ tức thì trong khi tác vụ thường vẫn hoàn tất trong thời gian chấp nhận được.';
                },
                recommendations: [
                    { id: 'PRIO', label: 'Priority Scheduling kèm cơ chế Aging', why: 'Tự động tăng dần mức ưu tiên của tiến trình chờ lâu, ngăn chặn hoàn toàn việc bị bỏ rơi vô thời hạn.', tradeOff: 'Cần thiết lập tham số chu kỳ tăng tuổi (Aging Interval).' },
                    { id: 'MLQ', label: 'Multilevel Queue có tỷ trọng thời gian (Time-slice share)', why: 'Dành 80% thời gian cho hàng ưu tiên cao và 20% thời gian cho hàng ưu tiên thấp.', tradeOff: 'Tác vụ khẩn cấp có thể bị chia sẻ một phần nhỏ thời gian.' }
                ]
            },
            starve: {
                title: 'Hiện tượng bỏ đói tài nguyên (Process Starvation / Indefinite Blocking)',
                target: 'Tái hiện trực quan và giải quyết bài toán kinh điển trong Hệ điều hành: tiến trình ưu tiên thấp bị bỏ đói vô hạn định khi các tiến trình ưu tiên cao liên tục đến.',
                theory: 'Nguyên lý Starvation: Trong thuật toán Priority có ngắt hoặc SRTF, điều kiện chọn CPU là giá trị cực tiểu toàn cục. Nếu tốc độ đến của các tiến trình ưu tiên cao lớn hơn hoặc bằng tốc độ giải phóng CPU, tiến trình có độ ưu tiên thấp sẽ không bao giờ thỏa mãn điều kiện dispatch. Giải pháp kinh điển trong sách giáo khoa Silberschatz là kỹ thuật Lão hóa (Aging): tăng dần độ ưu tiên của tiến trình tỷ lệ thuận với thời gian nó đã chờ trong hàng đợi Ready.',
                setup: 'Tiến trình P1 có độ ưu tiên thấp nhất (Priority = 9) đến tại t=0. Ngay sau đó, hàng loạt tiến trình P2, P3... có độ ưu tiên cao vượt trội (Priority = 1) liên tục xuất hiện cách nhau 2 đơn vị thời gian.',
                mechanism: 'Nếu không có Aging, P1 liên tục bị đẩy lùi trong hàng đợi. Khi bật Aging, sau mỗi khoảng thời gian agN chờ đợi, độ ưu tiên hiệu lực của P1 tự động giảm 1 (tăng cấp), cho đến khi nó ngang bằng và vượt các tiến trình mới đến.',
                evalRule: (r, ac) => {
                    const p1 = r.m.find(p => p.pid === 1);
                    if (p1 && p1.wt >= 25) return 'Phát hiện Starvation nghiêm trọng: Tiến trình P1 (Priority 9) phải chờ ' + p1.wt + ' đv thời gian (gấp ' + (p1.wt / (r.wt || 1)).toFixed(1) + ' lần thời gian chờ trung bình) do liên tục bị các tiến trình ưu tiên cao chen ngang!';
                    return 'Cơ chế chống Starvation phát huy tác dụng: Tiến trình ưu tiên thấp được giải phóng thành công, thời gian chờ tối đa được chặn trên.';
                },
                recommendations: [
                    { id: 'PRIO_AGING', label: 'Bật cơ chế Lão hóa (Aging) cho Priority', why: 'Cứ mỗi agN đơn vị thời gian chờ, Priority giảm 1. Tiến trình P1 chắc chắn sẽ đạt Priority 1 và được cấp CPU.', tradeOff: 'Tăng nhẹ thời gian chờ của các tiến trình mới đến.' },
                    { id: 'RR', label: 'Chuyển sang Round Robin (Quantum vừa phải)', why: 'Chia đều thời gian luân phiên qua quantum, đảm bảo mọi tiến trình đều được cấp CPU công bằng.', tradeOff: 'Tăng số lần chuyển ngữ cảnh so với FCFS.' }
                ]
            }
        };

        const COL = ['#2563eb', '#0d9488', '#d97706', '#7c3aed', '#db2777', '#059669', '#dc2626', '#4f46e5', '#0891b2', '#ea580c'];
        const STN = ['New', 'Ready', 'Running', 'Waiting', 'Terminated'];
        const STC = ['#7c8aa5', '#2563eb', '#16a34a', '#d97706', '#64748b'];

        const TABS = [
            ['about', 'Giới thiệu'],
            ['home', 'Trang chủ'],
            ['vm', 'Máy tính ảo'],
            ['alg', 'Thuật toán'],
            ['load', 'Phân tích tải CPU'],
            ['res', 'Kết quả'],
            ['contact', 'Liên hệ']
        ];

        const SAMPLES = {
            basic: {
                n: 'Cơ bản (5 tiến trình hỗn hợp)',
                d: 'Tập mẫu tiêu chuẩn gồm 5 tiến trình với thời điểm đến và thời gian thực thi đa dạng, có độ ưu tiên khác nhau.',
                r: [
                    [0, 5, 2, 0, 'CPU'],
                    [1, 3, 1, 2, 'IO'],
                    [2, 8, 4, 0, 'CPU'],
                    [3, 2, 3, 1, 'HH'],
                    [4, 4, 2, 0, 'HH']
                ]
            },
            convoy: {
                n: 'Hiệu ứng đoàn tàu (Convoy Effect)',
                d: 'P1 có CPU Burst rất dài đến ở t=0, các tiến trình ngắn P2..P5 đến ngay sau đó. Minh họa nhược điểm của FCFS so với SJF/RR.',
                r: [
                    [0, 24, 3, 0, 'CPU'],
                    [1, 3, 1, 0, 'HH'],
                    [2, 3, 2, 0, 'HH'],
                    [3, 2, 1, 0, 'IO']
                ]
            },
            sjf_starve: {
                n: 'Bỏ đói trong SJF / SRTF',
                d: 'Tiến trình dài P1 đến trước, liên tục có các tiến trình ngắn hơn P2..P5 đến sau, khiến P1 bị trì hoãn vô thời hạn.',
                r: [
                    [0, 18, 3, 0, 'CPU'],
                    [1, 2, 2, 0, 'HH'],
                    [2, 3, 1, 0, 'HH'],
                    [4, 2, 2, 0, 'IO'],
                    [6, 2, 1, 0, 'IO']
                ]
            },
            prio_starve: {
                n: 'Bỏ đói do Priority (Starvation)',
                d: 'P1 có độ ưu tiên thấp (Priority 9), liên tục bị các tiến trình ưu tiên cao (Priority 1-2) chiếm CPU. Thử nghiệm cơ chế Aging để giải cứu.',
                r: [
                    [0, 8, 9, 0, 'CPU'],
                    [1, 3, 1, 0, 'HH'],
                    [3, 4, 2, 0, 'HH'],
                    [5, 3, 1, 0, 'IO'],
                    [7, 4, 2, 0, 'IO']
                ]
            },
            same_arrival: {
                n: 'Đến đồng thời tại t = 0',
                d: '4 tiến trình cùng xuất hiện tại thời điểm t = 0 với burst khác nhau. Minh họa rõ nét nguyên lý của SJF, SRTF và Round Robin.',
                r: [
                    [0, 6, 2, 0, 'CPU'],
                    [0, 8, 1, 0, 'CPU'],
                    [0, 7, 3, 0, 'HH'],
                    [0, 3, 4, 0, 'IO']
                ]
            },
            rr_quantum: {
                n: 'Khảo sát Round Robin (Quantum)',
                d: 'Tập tiến trình có burst 5, 8, 12, 4 đơn vị. Thích hợp để quan sát ảnh hưởng của việc thay đổi giá trị Time Quantum.',
                r: [
                    [0, 5, 2, 0, 'HH'],
                    [1, 8, 3, 0, 'CPU'],
                    [2, 12, 1, 0, 'CPU'],
                    [3, 4, 2, 0, 'IO']
                ]
            }
        };


