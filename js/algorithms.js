        /* ===== js/algorithms.js ===== */
        /* CPU Scheduling Simulator - Core Simulation Engine */

        function sim(P0, algo, q, pp, opt) {
            if (!P0 || !P0.length) return null;
            opt = opt || {};
            q = Math.max(1, +q || 3);
            const CSV = Math.max(0, Math.floor(+opt.cs || 0)); // Thời gian chuyển ngữ cảnh
            const AGING = algo === 'PRIO' && !!opt.aging; // Cơ chế Aging cho Priority
            const AGN = Math.max(1, Math.floor(+opt.agN || 3)); // Cứ AGN đơn vị chờ -> Priority giảm 1 (tăng ưu tiên)
            const BS = algo === 'MLFQ' ? Math.max(0, Math.floor(+opt.bs || 0)) : 0; // Chu kỳ Priority Boost của MLFQ

            const P = P0.map((p, idx) => {
                const cpu = Math.max(1, +p.cpu || 1);
                const io = Math.max(0, +p.io || 0);
                const pr = +p.pr || 0;
                return {
                    idx,
                    pid: p.pid,
                    name: p.name || ('P' + p.pid),
                    type: p.type || 'HH',
                    at: Math.max(0, +p.at || 0),
                    cpu,
                    io,
                    pr,
                    ep: pr, // Priority hiệu lực (thay đổi khi có Aging)
                    ageWait: 0, // Thời gian chờ tích lũy cho Aging
                    rem: cpu, // Thời gian CPU còn lại
                    lvl: 0,
                    usedQ: 0,
                    firstRun: null,
                    ct: null,
                    wt: 0,
                    ioHalf: (io > 0 && cpu >= 2) ? Math.floor(cpu / 2) : 0, // Chạy nửa CPU Burst thì chuyển I/O
                    ioDone: false,
                    ioLeft: 0,
                    ioTaken: 0
                };
            });

            const n = P.length;
            let t = 0, cur = null, lastPid = null;
            let cs = 0, csT = 0, busy = 0, done = 0;
            let disp = null, dispWhy = '', csLeft = 0, csFrom = null, fresh = false, pendingWhy = null;
            const waiting = [];
            const gantt = [];
            const events = [];
            const snapshots = [];
            const Q = algo === 'MLQ' ? [[], []] : algo === 'MLFQ' ? [[], [], []] : [[]];

            // Quy tắc chọn tiến trình tốt nhất (Tie-break: Tiêu chí chính -> Arrival nhỏ hơn -> PID nhỏ hơn)
            const F = {
                SJF: (a, b) => a.cpu - b.cpu || a.at - b.at || a.pid - b.pid,
                SRTF: (a, b) => a.rem - b.rem || a.at - b.at || a.pid - b.pid,
                PRIO: (a, b) => a.ep - b.ep || a.at - b.at || a.pid - b.pid
            };

            const best = (arr, f) => {
                let b = 0;
                for (let i = 1; i < arr.length; i++) {
                    if (f(arr[i], arr[b]) < 0) b = i;
                }
                return b;
            };

            function logEv(time, pid, from, to, reason) {
                events.push({ t: time, pid, from, to, reason });
            }

            function toReady(p) {
                if (algo === 'MLQ') {
                    p.lvl = (p.type === 'CPU') ? 1 : 0;
                    Q[p.lvl].push(p);
                } else if (algo === 'MLFQ') {
                    Q[p.lvl].push(p);
                } else {
                    Q[0].push(p);
                }
            }

            function leaveCpu(p) {
                p.ep = p.pr;
                p.ageWait = 0;
            }

            function startRun(p, time, why) {
                if (p.firstRun === null) p.firstRun = time;
                p.ageWait = 0;
                pendingWhy = why;
                logEv(time, p.pid, 'Ready', 'Running', why);
            }

            function recordSnapshot(now) {
                const readyList = [];
                for (let l = 0; l < Q.length; l++) {
                    for (let p of Q[l]) {
                        readyList.push({
                            idx: p.idx,
                            pid: p.pid,
                            name: p.name,
                            rem: p.rem,
                            pr: p.ep,
                            base: p.pr,
                            lvl: l,
                            wt: p.wt
                        });
                    }
                }

                const procStats = P.map(p => {
                    /* xác định trạng thái tiến trình */
                    let st = 'New';
                    if (p.ct !== null && p.ct <= now) st = 'Terminated';
                    else if (cur && cur.pid === p.pid) st = 'Running';
                    else if (waiting.includes(p)) st = 'Waiting';
                    else if (p.at <= now) st = 'Ready';

                    const curTat = (p.ct !== null && p.ct <= now) ? (p.ct - p.at) : (p.at <= now ? now - p.at : 0);
                    const curWt = (p.ct !== null && p.ct <= now) ? p.wt : Math.max(0, p.wt);
                    const curRt = (p.firstRun !== null && p.firstRun <= now) ? (p.firstRun - p.at) : null;

                    return {
                        idx: p.idx,
                        pid: p.pid,
                        name: p.name,
                        type: p.type,
                        at: p.at,
                        cpu: p.cpu,
                        io: p.io,
                        pr: p.ep,
                        basePr: p.pr,
                        rem: p.rem,
                        lvl: p.lvl,
                        state: st,
                        wt: curWt,
                        tat: curTat,
                        rt: curRt,
                        ct: (p.ct !== null && p.ct <= now) ? p.ct : null
                    };
                });

                snapshots.push({
                    t: now,
                    curRunningPid: cur ? cur.pid : -1,
                    readyList,
                    procStats,
                    busy,
                    cs,
                    csT,
                    done,
                    u: now > 0 ? (busy / now * 100) : 0,
                    thr: now > 0 ? (done / now) : 0,
                    eventsUpToT: events.slice()
                });
            }

            // VÒNG LẶP MÔ PHỎNG CHÍNH TỪNG ĐƠN VỊ THỜI GIAN t
            while (done < n && t < 100000) {
                // 1. Tiến trình mới xuất hiện tại thời điểm t
                const arriving = P.filter(p => p.at === t).sort((a, b) => a.pid - b.pid);
                for (let p of arriving) {
                    toReady(p);
                    logEv(t, p.pid, 'New', 'Ready', `Đến hệ thống tại t = ${t}, vào hàng đợi sẵn sàng`);
                }

                // 1b. Priority Boost cho MLFQ: định kỳ đưa mọi tiến trình về Q0
                if (BS > 0 && t > 0 && t % BS === 0) {
                    const moved = [];
                    for (let l = 1; l < 3; l++) {
                        while (Q[l].length) moved.push([Q[l].shift(), l]);
                    }
                    if (moved.length) {
                        for (let [p] of moved) {
                            p.lvl = 0;
                            p.usedQ = 0;
                            Q[0].push(p);
                        }
                        const ids = moved.map(m => 'P' + m[0].pid).join(', ');
                        logEv(t, moved[0][0].pid, 'Ready', 'Ready', `[Priority Boost] Đưa ${ids} từ hàng đợi thấp về Q0 để chống Starvation`);
                    }
                }

                const skip = fresh;
                fresh = false;

                // 2. Kiểm tra ngắt tiền định (Preemption) hoặc hết Time Quantum
                if (!skip && csLeft === 0 && cur !== null) {
                    let qLimit = 1e9;
                    if (algo === 'RR') qLimit = q;
                    else if (algo === 'MLQ') qLimit = (cur.lvl === 0) ? q : 1e9;
                    else if (algo === 'MLFQ') qLimit = (cur.lvl === 0) ? q : (cur.lvl === 1) ? 2 * q : 1e9;

                    if (cur.usedQ >= qLimit) {
                        // Hết Quantum
                        const prev = cur;
                        cur = null;
                        leaveCpu(prev);
                        if (algo === 'MLFQ') {
                            prev.lvl = Math.min(2, prev.lvl + 1);
                            prev.usedQ = 0;
                            logEv(t, prev.pid, 'Running', 'Ready', `Dùng hết Quantum (${qLimit} đv) mà chưa nhường CPU, giáng cấp xuống Q${prev.lvl}`);
                            Q[prev.lvl].push(prev);
                        } else if (algo === 'MLQ') {
                            prev.usedQ = 0;
                            logEv(t, prev.pid, 'Running', 'Ready', `Hết Quantum (${qLimit} đv), quay lại cuối hàng đợi Q${prev.lvl}`);
                            Q[prev.lvl].push(prev);
                        } else {
                            prev.usedQ = 0;
                            logEv(t, prev.pid, 'Running', 'Ready', `Hết lát thời gian Quantum (${q} đv), quay về cuối hàng đợi sẵn sàng`);
                            Q[0].push(prev);
                        }
                    } else {
                        // Kiểm tra ngắt bởi tiến trình ưu tiên cao hơn
                        let preempt = false, reason = '';
                        if (algo === 'SRTF') {
                            const minP = Q[0].length ? Q[0][best(Q[0], F.SRTF)] : null;
                            if (minP && minP.rem < cur.rem) {
                                preempt = true;
                                reason = `Bị ngắt bởi P${minP.pid} (thời gian còn lại ${minP.rem} < ${cur.rem})`;
                            }
                        } else if (algo === 'PRIO' && pp) {
                            const minP = Q[0].length ? Q[0][best(Q[0], F.PRIO)] : null;
                            if (minP && minP.ep < cur.ep) {
                                preempt = true;
                                reason = `Bị ngắt bởi P${minP.pid} có độ ưu tiên cao hơn (${minP.ep} < ${cur.ep})`;
                            }
                        } else if (algo === 'MLQ') {
                            if (cur.lvl === 1 && Q[0].length > 0) {
                                preempt = true;
                                reason = `Bị ngắt bởi P${Q[0][0].pid} tại hàng đợi tương tác Q0 có quyền ưu tiên cao hơn`;
                            }
                        } else if (algo === 'MLFQ') {
                            for (let l = 0; l < cur.lvl; l++) {
                                if (Q[l].length > 0) {
                                    preempt = true;
                                    reason = `Bị ngắt bởi P${Q[l][0].pid} tại hàng đợi mức cao Q${l}`;
                                    break;
                                }
                            }
                        }

                        if (preempt) {
                            const prev = cur;
                            cur = null;
                            leaveCpu(prev);
                            logEv(t, prev.pid, 'Running', 'Ready', reason);
                            toReady(prev);
                        }
                    }
                }

                // 3. Dispatch CPU: Chọn tiến trình tiếp theo nếu CPU trống và không đang chuyển ngữ cảnh
                if (csLeft === 0 && cur === null) {
                    let next = null, why = '';

                    if (algo === 'SJF' || algo === 'SRTF' || algo === 'PRIO') {
                        if (Q[0].length > 0) {
                            const b = best(Q[0], F[algo]);
                            next = Q[0].splice(b, 1)[0];
                            next.usedQ = 0;

                            if (algo === 'SJF') {
                                why = `CPU Burst ngắn nhất (${next.cpu})`;
                            } else if (algo === 'SRTF') {
                                why = `Thời gian còn lại ngắn nhất (${next.rem})`;
                            } else if (algo === 'PRIO') {
                                why = `Độ ưu tiên cao nhất (${next.ep}${next.ep !== next.pr ? ` [Aging từ ${next.pr}]` : ''})`;
                            }
                        }
                    } else if (algo === 'MLQ') {
                        if (Q[0].length > 0) {
                            next = Q[0].shift();
                            next.usedQ = 0;
                            why = `Đứng đầu hàng đợi tương tác Q0`;
                        } else if (Q[1].length > 0) {
                            next = Q[1].shift();
                            next.usedQ = 0;
                            why = `Đứng đầu hàng đợi tính toán Q1`;
                        }
                    } else if (algo === 'MLFQ') {
                        for (let l = 0; l < 3; l++) {
                            if (Q[l].length > 0) {
                                next = Q[l].shift();
                                next.usedQ = 0;
                                why = `Đứng đầu hàng đợi phản hồi Q${l} (Quantum ${l === 0 ? q : l === 1 ? 2 * q : 'FCFS'})`;
                                break;
                            }
                        }
                    } else { // FCFS / Round Robin
                        if (Q[0].length > 0) {
                            next = Q[0].shift();
                            next.usedQ = 0;
                            why = (algo === 'RR') ? 'Đứng đầu hàng đợi luân phiên' : 'Đến trước, phục vụ trước';
                        }
                    }

                    if (next !== null) {
                        // CPU vừa Idle ngay trước thời điểm t -> Idle → tiến trình KHÔNG phải chuyển ngữ cảnh
                        const lastG0 = gantt[gantt.length - 1];
                        const idleBefore = !!lastG0 && lastG0.pid === -1 && lastG0.e === t;
                        const needCS = CSV > 0 && lastPid !== null && lastPid !== next.pid && !idleBefore;
                        if (needCS) {
                            csLeft = CSV;
                            disp = next;
                            dispWhy = why;
                            csFrom = lastPid;
                            cs++;
                            logEv(t, next.pid, 'Ready', 'Ready', `Bắt đầu chuyển ngữ cảnh từ P${lastPid} sang P${next.pid} (mất ${CSV} đv thời gian)`);
                        } else {
                            cur = next;
                            lastPid = cur.pid;
                            startRun(cur, t, why);
                        }
                    }
                }

                recordSnapshot(t);

                // 4. Ghi nhận biểu đồ Gantt
                // pid: >= 0: tiến trình đang chạy; -1: Idle; -2: Context Switch (CS)
                const gp = csLeft > 0 ? -2 : (cur !== null ? cur.pid : -1);
                const lastG = gantt[gantt.length - 1];
                const cont = lastG && lastG.pid === gp && lastG.e === t && pendingWhy === null && (gp !== -2 || lastG.from === csFrom);

                if (cont) {
                    lastG.e++;
                } else {
                    const sg = { pid: gp, s: t, e: t + 1 };
                    if (gp === -2) {
                        sg.from = csFrom;
                        sg.to = disp ? disp.pid : null;
                    } else if (gp >= 0 && pendingWhy) {
                        sg.why = pendingWhy;
                        pendingWhy = null;
                    }
                    gantt.push(sg);
                }

                // 5. Cập nhật thời gian chờ và cơ chế Aging cho các tiến trình trong Ready Queue
                for (let l = 0; l < Q.length; l++) {
                    for (let p of Q[l]) {
                        p.wt++;
                        if (AGING) {
                            p.ageWait++;
                            if (p.ageWait >= AGN) {
                                p.ageWait = 0;
                                if (p.ep > 1) {
                                    const oldEp = p.ep;
                                    p.ep--;
                                    logEv(t + 1, p.pid, 'Ready', 'Ready', `[Aging] Đã chờ ${AGN} đv liên tiếp, ưu tiên tăng: ${oldEp} → ${p.ep}`);
                                }
                            }
                        }
                    }
                }
                if (disp) disp.wt++;

                // 6. Xử lý tiến trình trong hàng đợi I/O (Waiting)
                const backToReady = [];
                for (let i = waiting.length - 1; i >= 0; i--) {
                    const w = waiting[i];
                    w.ioLeft--;
                    if (w.ioLeft <= 0) {
                        waiting.splice(i, 1);
                        backToReady.push(w);
                    }
                }
                for (let p of backToReady) {
                    toReady(p);
                    logEv(t + 1, p.pid, 'Waiting', 'Ready', `Hoàn thành đợt I/O (${p.io} đv), quay trở lại hàng đợi sẵn sàng`);
                }

                // 7. Thực thi CPU 1 đơn vị thời gian [t, t + 1)
                if (csLeft > 0) {
                    csLeft--;
                    csT++;
                    if (csLeft === 0 && disp) {
                        cur = disp;
                        disp = null;
                        lastPid = cur.pid;
                        startRun(cur, t + 1, dispWhy);
                        fresh = true;
                    }
                } else if (cur !== null) {
                    cur.rem--;
                    cur.usedQ++;
                    busy++;

                    // Hoàn thành toàn bộ hoặc chuyển sang I/O sau nửa CPU Burst
                    if (cur.rem === 0) {
                        cur.ct = t + 1;
                        done++;
                        logEv(t + 1, cur.pid, 'Running', 'Terminated', `Hoàn thành toàn bộ CPU Burst tại t = ${t + 1}`);
                        cur = null;
                    } else if (cur.io > 0 && !cur.ioDone && cur.ioHalf > 0 && (cur.cpu - cur.rem) >= cur.ioHalf) {
                        // Nhường CPU để thực hiện I/O
                        const p = cur;
                        cur = null;
                        p.ioDone = true;
                        p.ioLeft = p.io;
                        p.ioTaken += p.io;
                        p.usedQ = 0;
                        leaveCpu(p);
                        waiting.push(p);
                        logEv(t + 1, p.pid, 'Running', 'Waiting', `Chạy xong nửa CPU Burst (${p.ioHalf} đv), chuyển sang chờ I/O (${p.io} đv)`);
                    }
                }

                t++;
            }

            recordSnapshot(t);

            const T = t;
            const m = P.map(p => {
                const tat = (p.ct !== null) ? (p.ct - p.at) : (T - p.at);
                const wt = Math.max(0, tat - p.cpu - p.ioTaken);
                const rt = (p.firstRun !== null) ? (p.firstRun - p.at) : (T - p.at);
                return {
                    idx: p.idx,
                    pid: p.pid,
                    name: p.name,
                    type: p.type,
                    at: p.at,
                    cpu: p.cpu,
                    io: p.io,
                    pr: p.pr,
                    ct: p.ct,
                    firstRun: p.firstRun,
                    tat,
                    wt,
                    rt
                };
            });

            const avg = k => m.reduce((s, x) => s + x[k], 0) / (n || 1);
            const mq = Math.max(0, ...snapshots.map(s => s.readyList.length));

            return {
                g: gantt,
                m,
                P,
                T,
                wt: avg('wt'),
                tat: avg('tat'),
                rt: avg('rt'),
                thr: T > 0 ? (done / T) : 0,
                u: T > 0 ? (busy / T * 100) : 0,
                cs,
                csT,
                mq,
                mw: Math.max(0, ...m.map(x => x.wt)),
                snapshots,
                events
            };
        }

        const cmp = P => AL.map(a => ({ id: a[0], r: sim(P, a[0], S.q, S.pp, OPT()) }));

