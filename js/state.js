        /* ===== js/state.js ===== */
        /* CPU Scheduling Simulator - Global Application State */
        const $ = s => document.querySelector(s);

        const S = {
            view: 'home',
            procs: [],
            pid: 1,
            t0: Date.now(),
            algo: 'FCFS',
            q: 3,
            pp: true,
            fin: false,
            z: 5,
            wn: 0,
            sc: 'starve',
            n: 12,
            load: null,
            r: null,
            cur: 0,
            tm: null,
            loadSim: null,
            loadCur: 0,
            gz: null,
            gsel: null,
            lf: 0,
            pop: null,
            cs: 1,
            ag: false,
            agN: 3,
            bs: 20,
            rs: 'vm' // Nguồn dữ liệu trang Kết quả: 'vm' = tiến trình Máy tính ảo, 'load' = tập tải đã áp dụng giải pháp
        };

        const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
        const curT = () => S.view === 'load' ? (S.loadCur || 0) : (S.cur || 0);
        const OPT = () => ({ cs: S.cs, aging: S.ag, agN: S.agN, bs: S.bs });
        // Tập tiến trình mà trang Kết quả đang mô phỏng
        const resP = () => (S.rs === 'load' && S.load && S.load.P && S.load.P.length) ? S.load.P : S.procs;


