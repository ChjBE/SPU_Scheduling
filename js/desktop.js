        /* ===== js/desktop.js ===== */
        /* CPU Scheduling Simulator - Virtual Machine Desktop & Process Management */

        function tbl() {
            const el = $('#pt');
            if (!el) return;
            if (!S.procs.length) {
                el.innerHTML = '<p class="mu" style="padding:16px 0">Chưa có tiến trình nào được tạo. Hãy nhấp mở các ứng dụng trên màn hình máy tính ảo, nạp bài mẫu hoặc thêm tiến trình bên trên.</p>';
                return;
            }
            el.innerHTML = `<table><thead><tr><th>PID</th><th>Tên tiến trình</th><th>Loại</th><th>Thời điểm đến (AT)</th><th>CPU Burst</th><th>I/O Burst</th><th>Độ ưu tiên</th><th>Thao tác</th></tr></thead><tbody>` +
                S.procs.map((p, i) => `<tr><td><b>P${p.pid}</b></td><td>${esc(p.name)}</td><td><span class="tag ${p.type.toLowerCase()}">${p.type}</span></td><td>${p.at}</td><td>${p.cpu}</td><td>${p.io}</td><td>${p.pr}</td><td><button type="button" class="bt g sm" onclick="S.procs.splice(${i},1);S.fin=false;S.rs='vm';S.r=null;tbl()">Xóa</button></td></tr>`).join('') +
                `</tbody></table>`;
        }

        function clearVM() {
            // 1. Dừng mọi tiến trình mô phỏng đang phát
            if (S.tm) {
                clearInterval(S.tm);
                S.tm = null;
            }

            // 2. Xóa toàn bộ danh sách tiến trình và kết quả mô phỏng
            S.procs = [];
            S.t0 = Date.now();
            S.pid = 1;
            S.fin = false;
            S.r = null;
            S.rs = 'vm';
            S.cur = 0;
            S.gsel = null;
            const am = $('#addp-msg');
            if (am) { am.textContent = ''; am.className = 'qp-msg'; }

            // 3. Đóng và xóa toàn bộ các cửa sổ ứng dụng đang mở trên màn hình desktop ảo
            const dk = $('#dk');
            if (dk) {
                const wins = dk.querySelectorAll('.win');
                wins.forEach(w => w.remove());
            }

            // 4. Xóa sạch các tab ứng dụng trên thanh Taskbar
            tb();

            // 5. Cập nhật lại bảng tiến trình về trạng thái trống ban đầu
            tbl();

            // 6. Xóa dữ liệu khung nhập nhanh nếu có
            const qp = $('#qp');
            if (qp) qp.value = '';
            const qpMsg = $('#qp-msg');
            if (qpMsg) {
                qpMsg.textContent = 'Đã đặt lại máy tính ảo về trạng thái sạch ban đầu.';
                qpMsg.className = 'qp-msg ok';
                setTimeout(() => { if (qpMsg) qpMsg.textContent = ''; }, 3000);
            }
        }

        function loadSample(k, append = true) {
            const sp = SAMPLES[k] || SAMPLES.basic;
            // Xác định PID bắt đầu để không ghi đè hoặc trùng PID với các tiến trình đã nạp trước đó
            const basePid = (append && S.procs.length) ? Math.max(...S.procs.map(p => p.pid)) + 1 : 1;

            const newProcs = sp.r.map(([a, c, p, io, ty], i) => ({
                pid: basePid + i,
                name: 'Tiến trình ' + (basePid + i),
                type: ty || (io > 0 ? (c > 6 ? 'HH' : 'IO') : 'CPU'),
                at: a,
                cpu: c,
                io: io || 0,
                pr: p
            }));

            if (append && S.procs.length > 0) {
                S.procs = S.procs.concat(newProcs);
            } else {
                S.procs = newProcs;
            }

            S.pid = Math.max(S.pid, ...S.procs.map(p => p.pid)) + 1;
            S.fin = false;
            S.r = null;
            S.rs = 'vm';
            const d = $('#smp-d');
            if (d) d.textContent = sp.d;
            tbl();

            const qpMsg = $('#qp-msg');
            if (qpMsg) {
                const isAppended = append && S.procs.length > newProcs.length;
                qpMsg.textContent = isAppended ?
                    `Đã thêm ${newProcs.length} tiến trình mới từ bài mẫu "${sp.n}" vào danh sách hiện có.` :
                    `Đã nạp ${newProcs.length} tiến trình từ bài mẫu "${sp.n}".`;
                qpMsg.className = 'qp-msg ok';
                setTimeout(() => { if (qpMsg) qpMsg.textContent = ''; }, 3500);
            }
        }

        function sample() {
            loadSample('basic', S.procs.length > 0);
        }

        function smpHint() {
            const d = $('#smp-d'), s = $('#smp');
            if (d && s && SAMPLES[s.value]) d.textContent = SAMPLES[s.value].d;
        }

        // ---- Tiện ích kiểm tra dữ liệu đầu vào ----
        const LIMITS = { at: 999, cpu: 200, io: 200, pr: 99 };

        function toast(msg, kind) {
            let t = document.getElementById('toast');
            if (!t) {
                t = document.createElement('div');
                t.id = 'toast';
                t.setAttribute('role', 'status');
                document.body.appendChild(t);
            }
            t.textContent = msg;
            t.className = 'show ' + (kind || 'err');
            clearTimeout(toast._t);
            toast._t = setTimeout(() => { t.className = ''; }, 3800);
        }

        // Nhập tham số thuật toán (Quantum, chuyển ngữ cảnh, Boost, Aging): chỉ chấp nhận số nguyên trong khoảng cho phép
        function setParam(el, key, min, max, label, pg) {
            const raw = String(el.value).trim();
            const v = Number(raw);
            if (raw === '' || !Number.isInteger(v) || v < min || v > max) {
                toast(`${label} phải là số nguyên từ ${min} đến ${max}. Giá trị cũ (${S[key]}) được giữ nguyên.`);
                el.value = S[key];
                return;
            }
            S[key] = v;
            cfgChanged(pg);
        }

        // Chặn chuyển sang trang mô phỏng khi chưa có tiến trình
        function goResults() {
            if (!S.procs.length) {
                const m = $('#addp-msg');
                if (m) {
                    m.textContent = 'Chưa có tiến trình nào để mô phỏng. Hãy thêm tiến trình, mở ứng dụng trên màn hình ảo hoặc nạp bài mẫu trước.';
                    m.className = 'qp-msg err';
                }
                toast('Chưa có tiến trình hợp lệ để mô phỏng.');
                return;
            }
            S.rs = 'vm';
            S.r = null;
            go('res');
        }

        function parseQuick(txt) {
            const rows = [], errs = [], seen = new Set();
            let started = false;
            const lines = txt.split('\n');

            for (let i = 0; i < lines.length; i++) {
                const ln = lines[i].trim();
                if (!ln || ln.startsWith('#') || ln.startsWith('//')) continue;
                const tk = ln.split(/[\s,;|]+/).filter(Boolean);
                if (!started && !/^p?\d+$/i.test(tk[0])) {
                    started = true; // Bỏ qua dòng tiêu đề
                    continue;
                }
                started = true;
                const no = `Dòng ${i + 1}: `;
                if (tk.length < 3) {
                    errs.push(no + 'Cần tối thiểu 3 cột (PID, AT, BT)');
                    continue;
                }
                if (tk.length > 5) {
                    errs.push(no + 'Tối đa 5 cột (PID, AT, CPU, PR, IO)');
                    continue;
                }
                const v = tk.map(x => /^p?\d+$/i.test(x) ? +x.replace(/^p/i, '') : NaN);
                const [pid, at, bt, pr = 0, io = 0] = v;

                if (isNaN(pid) || pid <= 0) { errs.push(no + 'PID phải là số nguyên dương'); continue; }
                if (seen.has(pid)) { errs.push(no + `PID ${pid} bị trùng trong dữ liệu dán`); continue; }
                if (isNaN(at) || at < 0) { errs.push(no + 'Arrival Time phải là số nguyên ≥ 0'); continue; }
                if (isNaN(bt) || bt <= 0) { errs.push(no + 'CPU Burst phải là số nguyên > 0'); continue; }
                if (isNaN(pr) || pr < 0) { errs.push(no + 'Priority phải là số nguyên ≥ 0'); continue; }
                if (isNaN(io) || io < 0) { errs.push(no + 'I/O Burst phải là số nguyên ≥ 0'); continue; }
                if (at > LIMITS.at) { errs.push(no + `Arrival Time không được vượt quá ${LIMITS.at}`); continue; }
                if (bt > LIMITS.cpu) { errs.push(no + `CPU Burst không được vượt quá ${LIMITS.cpu}`); continue; }
                if (pr > LIMITS.pr) { errs.push(no + `Priority không được vượt quá ${LIMITS.pr}`); continue; }
                if (io > LIMITS.io) { errs.push(no + `I/O Burst không được vượt quá ${LIMITS.io}`); continue; }

                seen.add(pid);
                const ty = io > 0 ? (bt >= 6 ? 'HH' : 'IO') : 'CPU';
                rows.push({ pid, name: 'P' + pid, type: ty, at, cpu: bt, io, pr });
            }
            return { rows, errs };
        }

        function addQuick(replace) {
            const box = $('#qp'), msg = $('#qp-msg');
            if (!box || !box.value.trim()) {
                if (msg) {
                    msg.textContent = 'Vui lòng dán dữ liệu tiến trình vào ô văn bản.';
                    msg.className = 'qp-msg err';
                }
                return;
            }
            const { rows, errs } = parseQuick(box.value);
            if (errs.length) {
                if (msg) {
                    msg.textContent = errs.slice(0, 3).join('; ') + (errs.length > 3 ? ` (+${errs.length - 3} lỗi khác)` : '');
                    msg.className = 'qp-msg err';
                }
                return;
            }
            if (!rows.length) {
                if (msg) {
                    msg.textContent = 'Không tìm thấy dòng dữ liệu tiến trình hợp lệ nào.';
                    msg.className = 'qp-msg err';
                }
                return;
            }

            if (!replace) {
                const ex = new Set(S.procs.map(p => p.pid));
                const dup = rows.filter(r => ex.has(r.pid));
                if (dup.length) {
                    if (msg) {
                        msg.textContent = `Không thể thêm: PID ${dup.map(d => d.pid).join(', ')} đã tồn tại trong danh sách. Hãy đổi PID hoặc chọn "Thay thế danh sách".`;
                        msg.className = 'qp-msg err';
                    }
                    return;
                }
            }

            S.procs = replace ? rows : S.procs.concat(rows);
            S.pid = Math.max(S.pid, ...S.procs.map(p => p.pid)) + 1;
            S.fin = false;
            S.r = null;
            S.rs = 'vm';
            tbl();

            if (msg) {
                msg.textContent = `Đã ${replace ? 'thay thế' : 'thêm'} thành công ${rows.length} tiến trình vào danh sách.`;
                msg.className = 'qp-msg ok';
            }
        }

        function addP(e) {
            e.preventDefault();
            const f = e.target;
            const msg = $('#addp-msg');
            f.querySelectorAll('.bad').forEach(x => x.classList.remove('bad'));

            // Đọc & kiểm tra một trường số nguyên
            const chk = (el, label, min, max, req) => {
                const raw = el.value.trim();
                if (el.validity && el.validity.badInput) return { el, m: `${label} phải là số, không được chứa ký tự khác.` };
                if (raw === '') return req ? { el, m: `Vui lòng nhập ${label}.` } : { v: 0 };
                const v = Number(raw);
                if (!Number.isFinite(v)) return { el, m: `${label} phải là số.` };
                if (!Number.isInteger(v)) return { el, m: `${label} phải là số nguyên.` };
                if (v < min) return { el, m: `${label} không được nhỏ hơn ${min}.` };
                if (v > max) return { el, m: `${label} không được vượt quá ${max}.` };
                return { v };
            };

            const nmRaw = f.nm.value.trim();
            const ty = f.ty.value;
            const errs = [];
            if (nmRaw.length > 30) errs.push({ el: f.nm, m: 'Tên tiến trình tối đa 30 ký tự.' });
            const A = chk(f.at, 'Arrival Time (AT)', 0, LIMITS.at, true);
            const C = chk(f.cpu, 'CPU Burst', 1, LIMITS.cpu, true);
            const I = chk(f.io, 'I/O Burst', 0, LIMITS.io, ty === 'IO');
            const P = chk(f.pr, 'Priority', 0, LIMITS.pr, false);
            [A, C, I, P].forEach(x => { if (x.m) errs.push(x); });

            // Quy tắc nghiệp vụ: loại tiến trình phải khớp với I/O Burst
            if (!I.m) {
                if (ty === 'CPU' && I.v > 0) errs.push({ el: f.io, m: 'Tiến trình CPU-bound không có I/O Burst: hãy để trống/0 hoặc đổi loại tiến trình.' });
                if (ty === 'IO' && I.v === 0) errs.push({ el: f.io, m: 'Tiến trình I/O-bound cần I/O Burst lớn hơn 0.' });
            }

            if (errs.length) {
                errs.forEach(x => x.el.classList.add('bad'));
                if (msg) {
                    msg.textContent = errs.map(x => x.m).join(' ');
                    msg.className = 'qp-msg err';
                }
                errs[0].el.focus();
                return false;
            }

            const nm = nmRaw || ('P' + S.pid);
            const pid = S.pid++;
            S.procs.push({ pid, name: nm, type: ty, at: A.v, cpu: C.v, io: I.v, pr: P.v });
            f.nm.value = '';
            f.cpu.value = '';
            f.io.value = '';
            f.pr.value = '';
            S.fin = false;
            S.r = null;
            S.rs = 'vm';
            tbl();
            if (msg) {
                msg.textContent = `Đã thêm tiến trình P${pid} (${nm}) vào danh sách.`;
                msg.className = 'qp-msg ok';
            }
            return false;
        }

        function spawn(i) {
            const a = APPS[i];
            if (!S.procs.length) S.t0 = Date.now();
            const at = Math.max(0, Math.floor((Date.now() - S.t0) / 1000));
            const p = { pid: S.pid++, name: a[0], type: a[2], at, cpu: a[3], io: a[4], pr: a[5] };
            S.procs.push(p);
            S.fin = false;
            S.r = null;
            S.rs = 'vm';
            tbl();
            return p;
        }

        function tb() {
            const tbi = $('#tbi');
            if (!tbi) return;
            const ws = document.querySelectorAll('.win');
            tbi.innerHTML = Array.from(ws).map(w => `<span class="ti">${ico(w.dataset.ic, 18)}</span>`).join('');
        }

        function openApp(i) {
            const a = APPS[i], p = spawn(i), w = document.createElement('div'), k = S.wn++ % 6;
            w.className = 'win';
            w.dataset.ic = a[1];
            w.style.left = (230 + k * 28) + 'px';
            w.style.top = (20 + k * 26) + 'px';
            w.style.zIndex = ++S.z;
            w.innerHTML = `<div class="wh"><span class="wt" data-t="${esc(a[0])}">${ico(a[1], 18)}</span><button type="button" aria-label="Đóng">${svg('x', 14)}</button></div>` +
                `<div class="wb"><p>${esc(a[6])}</p>${i === 5 ? '<textarea placeholder="Nhập văn bản tương tác..."></textarea>' : ''}<p class="mu">Đã tạo tiến trình <b>P${p.pid}</b>: CPU Burst ${p.cpu}, I/O Burst ${p.io}, Priority ${p.pr}.</p><button type="button" class="bt">Tạo thêm tiến trình</button></div>`;

            const h = w.querySelector('.wh');
            h.onpointerdown = e => {
                if (e.target.tagName === 'BUTTON') return;
                w.style.zIndex = ++S.z;
                const dx = e.clientX - w.offsetLeft, dy = e.clientY - w.offsetTop;
                h.setPointerCapture(e.pointerId);
                h.onpointermove = e => {
                    w.style.left = Math.max(0, e.clientX - dx) + 'px';
                    w.style.top = Math.max(0, e.clientY - dy) + 'px';
                };
                h.onpointerup = () => { h.onpointermove = null; };
            };
            w.onpointerdown = () => { w.style.zIndex = ++S.z; };
            h.querySelector('button').onclick = () => { w.remove(); tb(); };
            w.querySelector('.bt').onclick = () => {
                const q = spawn(i);
                w.querySelector('.mu').innerHTML += ` Thêm <b>P${q.pid}</b>.`;
            };
            $('#dk').appendChild(w);
            tb();
        }

        function clk() {
            const el = $('#clk');
            if (el) {
                const d = new Date();
                el.textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
            }
        }


