        /* ===== js/loadAnalysis.js ===== */
        /* CPU Scheduling Simulator - Scientific Workload Analysis Engine */

        function mkLoad() {
            simStop();
            const scEl = $('#sc');
            const nnEl = $('#nn');
            if (scEl) S.sc = scEl.value;
            if (nnEl) S.n = Math.min(40, Math.max(5, +nnEl.value || 12));

            const n = S.n, sc = S.sc;
            const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
            const P = [];

            for (let i = 0; i < n; i++) {
                let at = 0, cpu = 2, type = 'HH', pr = R(1, 5), io = 0;

                if (sc === 'burst') {
                    // Đến tập trung tại t = 0..2
                    at = R(0, 2);
                    cpu = (i === 0) ? R(14, 20) : R(2, 6); // Tiến trình đầu dài -> Convoy effect
                    pr = R(1, 4);
                } else if (sc === 'cpu') {
                    // Tác vụ nặng CPU kéo dài
                    at = R(0, Math.floor(n * 0.8));
                    cpu = R(12, 22);
                    type = 'CPU';
                    pr = R(1, 4);
                } else if (sc === 'mixed') {
                    // Hỗn hợp CPU-bound và I/O-bound
                    at = R(0, Math.floor(n * 1.5));
                    if (i % 2 === 0) {
                        type = 'CPU';
                        cpu = R(10, 16);
                        io = 0;
                    } else {
                        type = 'IO';
                        cpu = R(2, 4);
                        io = R(2, 5);
                    }
                } else if (sc === 'inter') {
                    // Tác vụ tương tác
                    if (i === 0) {
                        at = 0;
                        cpu = 25;
                        type = 'CPU';
                        pr = 4;
                    } else {
                        at = R(1, Math.round(n * 1.2));
                        cpu = R(1, 3);
                        type = 'IO';
                        io = R(1, 2);
                        pr = R(1, 3);
                    }
                } else if (sc === 'hiprio') {
                    // Tải ưu tiên cao
                    at = R(0, n * 2);
                    if (i % 4 === 0) {
                        pr = 5; // Ưu tiên thấp
                        cpu = R(8, 14);
                    } else {
                        pr = R(1, 2); // Ưu tiên cao
                        cpu = R(3, 6);
                    }
                } else { // starve: Nguy cơ Starvation
                    if (i === 0) {
                        at = 0;
                        cpu = 8;
                        pr = 9; // Ưu tiên cực thấp, đến sớm
                    } else {
                        at = (i - 1) * 2 + 1; // Ưu tiên cao đến liên tục
                        cpu = R(3, 5);
                        pr = 1;
                    }
                }

                const pName = (sc === 'starve') ? (i === 0 ? 'Tác vụ ưu tiên thấp (P1)' : `Tác vụ ưu tiên cao (${i + 1})`) :
                    (sc === 'hiprio' ? (pr <= 2 ? 'Khẩn cấp ' : 'Thông thường ') : 'Tác vụ ') + (i + 1);

                P.push({
                    pid: i + 1,
                    name: pName,
                    type,
                    at,
                    cpu,
                    io,
                    pr
                });
            }

            if (sc !== 'starve') S.ag = false;
            S.load = { P, sc, appliedAlgo: null, appliedSig: null, appliedText: '' };
            if (S.rs === 'load') { S.rs = 'vm'; S.r = null; S.cur = 0; }
            S.loadSim = sim(P, S.algo || 'FCFS', S.q, S.pp, OPT());
            S.loadCur = S.loadSim.T;
            go('load', 1);
        }

        /* Cấu hình thực thi cho từng giải pháp (có thể ghi đè theo kịch bản để khớp đúng mô tả giải pháp) */
        const APPLY_CFG = {
            PRIO_AGING: { algo: 'PRIO', pp: true, ag: true, agN: 2 },
            PRIO: { algo: 'PRIO', pp: true, ag: true, agN: 2 }, // "Priority kèm cơ chế Aging"
            RR: { algo: 'RR', q: 3 },
            MLFQ: { algo: 'MLFQ', q: 2, bs: 15 }
        };
        const APPLY_OVERRIDE = {
            'cpu:RR': { q: 6 } // "Round Robin với Quantum lớn (q ≥ 6)"
        };

        // Chữ ký các tham số có ảnh hưởng đến thuật toán đang chọn (dùng để biết giải pháp đã áp dụng có còn đúng với cấu hình hiện tại không)
        function cfgSig() {
            const a = S.algo || 'FCFS';
            return JSON.stringify([
                a, S.cs,
                (a === 'RR' || a === 'MLQ' || a === 'MLFQ') ? S.q : 0,
                a === 'PRIO' ? [!!S.pp, !!S.ag, S.ag ? S.agN : 0] : 0,
                a === 'MLFQ' ? S.bs : 0
            ]);
        }

        function cfgText() {
            const a = S.algo || 'FCFS';
            const d = [];
            if (a === 'RR' || a === 'MLQ' || a === 'MLFQ') d.push('q = ' + S.q);
            if (a === 'MLFQ') d.push('Boost S = ' + S.bs);
            if (a === 'PRIO') {
                d.push(S.pp ? 'có ngắt' : 'không ngắt');
                if (S.ag) d.push('Aging: mỗi ' + S.agN + ' đv chờ giảm 1 Priority');
            }
            d.push('chuyển ngữ cảnh ' + S.cs + ' đv');
            return NM[a] + ' (' + d.join(', ') + ')';
        }

        // Giải pháp đã áp dụng còn khớp với cấu hình đang chạy hay không
        function appliedOK() {
            const L = S.load;
            return !!(L && L.appliedAlgo && L.appliedSig === cfgSig());
        }

        // Khi người dùng đổi tham số ở thanh điều khiển: tính lại đúng tập dữ liệu của trang hiện tại rồi vẽ lại
        function cfgChanged(pg) {
            simStop();
            if (S.view === 'load' && S.load) {
                S.loadSim = sim(S.load.P, S.algo, S.q, S.pp, OPT());
            } else {
                const P = resP();
                if (P.length) S.r = sim(P, S.algo, S.q, S.pp, OPT());
            }
            go(pg, 1);
        }

        // Chuyển sang trang Kết quả với tập tải của trang Phân tích tải (cùng cấu hình đang chạy), hiển thị tại thời điểm kết thúc
        function showLoadResult() {
            if (!S.load || !S.load.P || !S.load.P.length) return;
            S.rs = 'load';
            S.r = sim(S.load.P, S.algo, S.q, S.pp, OPT());
            S.cur = S.r.T;
            S.gsel = null;
            go('res');
        }

        function applyAlgo(id) {
            const L = S.load;
            if (!L || !L.P || !L.P.length) return;
            simStop();

            // 1. Xác định cấu hình của giải pháp và nạp vào trạng thái chung
            const cfg = Object.assign({ algo: id }, APPLY_CFG[id] || {}, APPLY_OVERRIDE[L.sc + ':' + id] || {});
            S.algo = cfg.algo;
            if (cfg.q !== undefined) S.q = cfg.q;
            if (cfg.pp !== undefined) S.pp = cfg.pp;
            if (cfg.bs !== undefined) S.bs = cfg.bs;
            S.ag = !!cfg.ag;
            if (cfg.ag) S.agN = cfg.agN;

            // 2. Thực thi lại thuật toán với cơ chế mới trên đúng tập tiến trình của kịch bản
            const r = sim(L.P, S.algo, S.q, S.pp, OPT());
            if (!r) return;

            // 3. Lưu kết quả đã áp dụng: trang Phân tích tải
            L.appliedAlgo = id;
            L.appliedSig = cfgSig();
            L.appliedText = cfgText();
            S.loadSim = r;
            S.loadCur = r.T;

            // 4. Đồng bộ sang trang Kết quả (cùng tập tiến trình + cùng cấu hình, hiển thị tại thời điểm kết thúc)
            S.rs = 'load';
            S.r = sim(L.P, S.algo, S.q, S.pp, OPT());
            S.cur = S.r.T;
            S.gsel = null;

            go('load', 1);
        }


