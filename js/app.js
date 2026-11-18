        /* ===== js/app.js ===== */
        /* CPU Scheduling Simulator - Application Entry & Navigation Router */

        function go(v, preserveScroll) {
            if (S.view !== v) {
                simStop();
            }
            S.view = v;
            if (S.pop !== null) {
                S.pop = null;
                stPopRender();
            }

            const isVm = (v === 'vm');
            $('#vm').hidden = !isVm;
            $('#v').hidden = isVm;

            if (!isVm) {
                $('#v').innerHTML = V[v]();
                simBtn();
            } else {
                tbl();
            }

            // Chân trang chỉ hiện khi không có thanh điều khiển mô phỏng (t, Chạy, Tạm dừng...)
            const ft = document.querySelector('footer');
            if (ft) ft.hidden = !!document.querySelector('.ctl-dock');

            $('#nav').innerHTML = `<span class="lg">${svg('chip', 28, 1.8)}<b>CPU Scheduling Simulator</b></span>` +
                TABS.map(t => `<button type="button" class="${t[0] === v ? 'on' : ''}" onclick="go('${t[0]}')">${t[1]}</button>`).join('');

            if (!preserveScroll) scrollTo(0, 0);
        }

        // Khởi tạo giao diện Desktop của Máy tính ảo
        $('#vm').innerHTML = `<section class="pg"><h1>Máy tính ảo (Virtual Machine Desktop)</h1>` +
            `<p class="mu">Mỗi lần nhấp mở ứng dụng trên màn hình, máy tính ảo sẽ tự động khởi tạo một tiến trình mô phỏng tương ứng với các thuộc tính CPU Burst, I/O Burst và Priority. Bạn có thể kéo di chuyển các cửa sổ ứng dụng.</p>` +

            `<div class="dk" id="dk">${APPS.map((a, i) => `<button type="button" class="ic" onclick="openApp(${i})"><span class="tile">${ico(a[1], 26)}</span>${a[0]}</button>`).join('')}` +
            `<div class="tk"><div class="st"><i></i><i></i><i></i><i></i></div><div class="se">${svg('search', 16)}<span>Tìm kiếm ứng dụng...</span></div><div id="tbi"></div><div class="cl" id="clk"></div></div></div>` +

            `<h2>Danh sách Tiến trình trong Hệ thống</h2>` +
            `<form class="bar" onsubmit="return addP(event)" novalidate>` +
            `<input name="nm" placeholder="Tên tiến trình (ví dụ: Task 1)">` +
            `<select name="ty"><option value="CPU">CPU-bound</option><option value="IO">I/O-bound</option><option value="HH" selected>Hỗn hợp (HH)</option></select>` +
            `<input name="at" type="number" min="0" placeholder="Arrival (AT)" style="width:128px">` +
            `<input name="cpu" type="number" min="1" placeholder="CPU Burst" style="width:118px">` +
            `<input name="io" type="number" min="0" placeholder="I/O Burst" style="width:114px">` +
            `<input name="pr" type="number" min="0" placeholder="Priority" style="width:104px">` +
            `<button type="submit" class="bt">Thêm tiến trình</button>` +
            `<button type="button" class="bt g" onclick="clearVM()" title="Đóng toàn bộ tab, xóa tiến trình và đưa máy tính ảo về ban đầu">Xóa tất cả (Đặt lại VM)</button>` +
            `</form>` +
            `<p id="addp-msg" class="qp-msg" role="status" aria-live="polite" style="margin:-6px 0 10px"></p>` +

            `<div class="bar" style="gap:10px;flex-wrap:wrap">` +
            `<label><b>Kịch bản mẫu:</b> <select id="smp" onchange="smpHint()">${Object.keys(SAMPLES).map(k => `<option value="${k}">${SAMPLES[k].n}</option>`).join('')}</select></label>` +
            `<button type="button" class="bt" onclick="loadSample($('#smp').value, true)">Thêm bài mẫu vào danh sách</button>` +
            `<button type="button" class="bt g" onclick="loadSample($('#smp').value, false)">Thay thế danh sách</button>` +
            `</div>` +
            `<p class="mu" id="smp-d" style="margin:0 0 14px">${SAMPLES.basic.d}</p>` +

            `<details class="card" style="margin-bottom:16px;padding:14px 18px">` +
            `<summary style="cursor:pointer;font-weight:600">Nhập nhanh / Dán danh sách tiến trình (PID, AT, CPU Burst, Priority, I/O Burst)</summary>` +
            `<p class="mu" style="margin:8px 0">Mỗi dòng một tiến trình, phân tách bằng dấu phẩy, khoảng trắng hoặc tab (có thể sao chép trực tiếp từ bảng tính Excel). Dòng tiêu đề hoặc bắt đầu bằng # sẽ được tự động bỏ qua.</p>` +
            `<textarea id="qp" class="qp" placeholder="PID, AT, CPU, PR, IO&#10;1, 0, 8, 3, 0&#10;2, 1, 4, 1, 2&#10;3, 2, 9, 4, 0"></textarea>` +
            `<div class="bar" style="margin:10px 0 0">` +
            `<button type="button" class="bt" onclick="addQuick(false)">Thêm vào danh sách hiện có</button>` +
            `<button type="button" class="bt g" onclick="addQuick(true)">Thay thế toàn bộ danh sách</button>` +
            `</div>` +
            `<p id="qp-msg" class="qp-msg" role="status"></p>` +
            `</details>` +

            `<div class="sc" id="pt"></div>` +

            `<div class="bar" style="margin-top:16px">` +
            `<button type="button" class="bt g" onclick="go('alg')">Xem & Chọn thuật toán</button>` +
            `<button type="button" class="bt" onclick="goResults()">Chuyển sang Kết quả mô phỏng →</button>` +
            `</div>` +
            `<p class="mu" style="margin-top:8px">Quy ước loại tiến trình: CPU = CPU-bound (thiên về tính toán thuần túy), IO = I/O-bound (thiên về nhập xuất tương tác), HH = hỗn hợp cả CPU và I/O.</p>` +
            `</section>`;

        // Khởi chạy đồng hồ trên Taskbar và vào Trang chủ
        clk();
        setInterval(clk, 15000);
        go('home');

