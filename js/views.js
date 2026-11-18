        /* ===== js/views.js ===== */
        /* CPU Scheduling Simulator - Page Views, Scientific Load Analysis & Grouped KPIs */

        function processTableHTML(P, r, t) {
            if (!r || !r.m || !r.m.length) {
                return '<p class="mu" style="padding:16px 0">Chưa có kết quả tiến trình để hiển thị.</p>';
            }

            t = Math.max(0, Math.min(r.T, t));
            const snap = r.snapshots[t] || r.snapshots[r.snapshots.length - 1];
            const statMap = new Map(snap.procStats.map(s => [s.pid, s]));

            return `<div class="sc"><table><thead><tr>` +
                `<th>PID</th><th>Tên tiến trình</th><th>Loại</th><th>Arrival (AT)</th><th>CPU Burst</th><th>I/O Burst</th><th>Priority</th>` +
                `<th>Hoàn tất (CT)</th><th>Quay vòng (TAT)</th><th>Thời gian chờ (WT)</th><th>Phản hồi (RT)</th><th>Trạng thái (t=${t})</th>` +
                `</tr></thead><tbody>` +
                r.m.map(p => {
                    const curStat = statMap.get(p.pid);
                    const st = curStat ? curStat.state : (p.ct !== null && p.ct <= t ? 'Terminated' : (p.at <= t ? 'Ready' : 'New'));
                    const stIdx = STK.indexOf(st);
                    const badgeColor = stIdx >= 0 ? STC[stIdx] : '#64748b';
                    const ctStr = (p.ct !== null && p.ct <= t) ? p.ct : (t >= r.T ? (p.ct !== null ? p.ct : '-') : '-');
                    const tatVal = (p.ct !== null && p.ct <= t) ? p.tat : (p.at <= t ? (t - p.at) : 0);
                    const wtVal = (p.ct !== null && p.ct <= t) ? p.wt : (curStat ? curStat.wt : 0);
                    const rtStr = (p.firstRun !== null && p.firstRun <= t) ? p.rt : (t >= r.T ? (p.firstRun !== null ? p.rt : '-') : '-');
                    const prStr = (curStat && curStat.pr !== undefined && curStat.pr !== p.pr) ? `${p.pr} → ${curStat.pr}` : `${p.pr}`;

                    return `<tr>` +
                        `<td><b>P${p.pid}</b></td>` +
                        `<td>${esc(p.name)}</td>` +
                        `<td><span class="tag ${p.type.toLowerCase()}">${p.type}</span></td>` +
                        `<td>${p.at}</td>` +
                        `<td>${p.cpu}</td>` +
                        `<td>${p.io}</td>` +
                        `<td>${prStr}</td>` +
                        `<td>${ctStr}</td>` +
                        `<td>${tatVal} đv</td>` +
                        `<td>${wtVal} đv</td>` +
                        `<td>${rtStr !== '-' ? rtStr + ' đv' : '-'}</td>` +
                        `<td><span class="chp" style="background:${badgeColor};font-size:11.5px;padding:2px 8px">${st}</span></td>` +
                        `</tr>`;
                }).join('') +
                `</tbody></table></div>`;
        }

        function kpiCardsHTML(r, t) {
            t = Math.max(0, Math.min(r.T, t));
            const snap = r.snapshots[t] || r.snapshots[r.snapshots.length - 1];

            const curU = (snap.u !== undefined) ? snap.u : r.u;
            const curThr = (snap.thr !== undefined) ? snap.thr : r.thr;
            const curCs = (snap.cs !== undefined) ? snap.cs : r.cs;
            const curCsT = (snap.csT !== undefined) ? snap.csT : (r.csT || 0);

            return `<div class="kpi-section">` +
                `<!-- Nhóm 1: Chỉ số thời gian tiến trình -->` +
                `<div class="kpi-group">` +
                `<h4 class="kpi-group-title">Chỉ số thời gian tiến trình (Trung bình)</h4>` +
                `<div class="kpi-grid">` +
                `<div class="kpi-card">` +
                `<span class="kpi-lbl">Thời gian chờ (Waiting Time)</span>` +
                `<div class="kpi-val-wrap"><span class="kpi-num">${r.wt.toFixed(2)}</span><span class="kpi-unit">đv thời gian</span></div>` +
                `<span class="kpi-desc">Trung bình chờ trong Ready Queue</span>` +
                `</div>` +
                `<div class="kpi-card">` +
                `<span class="kpi-lbl">Thời gian quay vòng (Turnaround)</span>` +
                `<div class="kpi-val-wrap"><span class="kpi-num">${r.tat.toFixed(2)}</span><span class="kpi-unit">đv thời gian</span></div>` +
                `<span class="kpi-desc">Khoảng cách từ lúc đến tới khi kết thúc</span>` +
                `</div>` +
                `<div class="kpi-card">` +
                `<span class="kpi-lbl">Thời gian phản hồi (Response Time)</span>` +
                `<div class="kpi-val-wrap"><span class="kpi-num">${r.rt.toFixed(2)}</span><span class="kpi-unit">đv thời gian</span></div>` +
                `<span class="kpi-desc">Từ khi đến tới lần đầu nhận được CPU</span>` +
                `</div>` +
                `</div>` +
                `</div>` +

                `<!-- Nhóm 2: Chỉ số hiệu năng CPU & Hệ thống -->` +
                `<div class="kpi-group">` +
                `<h4 class="kpi-group-title">Chỉ số hiệu năng CPU & Hệ thống</h4>` +
                `<div class="kpi-grid">` +
                `<div class="kpi-card">` +
                `<span class="kpi-lbl">Hiệu suất CPU (CPU Utilization)</span>` +
                `<div class="kpi-val-wrap"><span class="kpi-num ok">${curU.toFixed(1)}</span><span class="kpi-unit">%</span></div>` +
                `<span class="kpi-desc">Tỷ lệ thời gian CPU bận thực thi</span>` +
                `</div>` +
                `<div class="kpi-card">` +
                `<span class="kpi-lbl">Thông lượng (Throughput)</span>` +
                `<div class="kpi-val-wrap"><span class="kpi-num">${curThr.toFixed(3)}</span><span class="kpi-unit">tiến trình/đv</span></div>` +
                `<span class="kpi-desc">Số lượng tác vụ hoàn tất / đơn vị thời gian</span>` +
                `</div>` +
                `<div class="kpi-card">` +
                `<span class="kpi-lbl">Chuyển ngữ cảnh (Context Switches)</span>` +
                `<div class="kpi-val-wrap"><span class="kpi-num">${curCs}</span><span class="kpi-unit">lần hoán đổi</span></div>` +
                `<span class="kpi-desc">Tiêu tốn ${curCsT} đv thời gian chuyển đổi ngữ cảnh</span>` +
                `</div>` +
                `</div>` +
                `</div>` +
                `</div>`;
        }

        function logHTML(r, t) {
            const snap = r.snapshots[t] || r.snapshots[r.snapshots.length - 1];
            let ev = snap.eventsUpToT;
            if (S.lf) ev = ev.filter(e => e.pid === S.lf);

            return `<p class="mu note" style="margin:0 0 10px">${ev.length} sự kiện được ghi nhận${S.lf ? ' của P' + S.lf : ''} tính đến thời điểm t = ${t}:</p>` +
                `<div class="lg-b"><div class="lg-t">` +
                (ev.length ? ev.slice(-60).reverse().map(e => `<div class="lg-r"><span class="tm">t = ${e.t}</span><span class="chp" style="background:${COL[e.pid % 10]}">P${e.pid}</span><span class="st2 st-from">${e.from}</span><span class="lg-arr">${svg('arrow', 14, 2)}</span><span class="st2 st-to">${e.to}</span><span class="rs">${esc(e.reason)}</span></div>`).join('') : '<p class="mu" style="padding:12px 0">Chưa có sự kiện nào được ghi nhận.</p>') +
                `</div></div>`;
        }

        function logRefresh() {
            const r = getActiveSim();
            if (!r) return;
            const ct = curT();
            const bStep = $('#bStep');
            if (bStep) bStep.disabled = !!S.tm || ct >= r.T;
            const el = $('#lg');
            if (el) withScroll(el, () => { el.innerHTML = logHTML(r, ct); });
        }

        const ctrl = (pg) => {
            const a = S.algo || 'FCFS';
            const starve = pg === 'load' && S.load && S.load.sc === 'starve';

            let h = `<div class="ctrl-bar-wrap">` +
                `<label class="ctrl-item"><b>Thuật toán:</b> ` +
                `<select aria-label="Thuật toán" onchange="S.algo=this.value;cfgChanged('${pg}')">` +
                AL.map(x => `<option value="${x[0]}" ${x[0] === a ? 'selected' : ''}>${NM[x[0]]}</option>`).join('') +
                `</select></label>`;

            // Time Quantum
            if (a === 'RR' || a === 'MLQ' || a === 'MLFQ') {
                h += `<label class="ctrl-item"><b>Time Quantum:</b> ` +
                    `<input type="number" min="1" max="100" step="1" value="${S.q}" style="width:58px" onchange="setParam(this,'q',1,100,'Time Quantum','${pg}')"> đv</label>`;
            }

            // Preemptive Priority
            if (a === 'PRIO') {
                h += `<label class="ctrl-item"><input type="checkbox" ${S.pp ? 'checked' : ''} onchange="S.pp=this.checked;cfgChanged('${pg}')"> <b>Có ngắt (Preemptive)</b></label>`;
            }

            // Context Switch duration
            h += `<label class="ctrl-item" title="Thời gian hao phí chuyển đổi giữa hai tiến trình khác nhau (đặt 0 nếu bỏ qua)">` +
                `<b>Chuyển ngữ cảnh:</b> ` +
                `<input type="number" min="0" max="10" step="1" value="${S.cs}" style="width:52px" onchange="setParam(this,'cs',0,10,'Thời gian chuyển ngữ cảnh','${pg}')"> đv</label>`;

            // MLFQ Boost
            if (a === 'MLFQ') {
                h += `<label class="ctrl-item" title="Chu kỳ đưa toàn bộ tiến trình ở các hàng đợi thấp về Q0">` +
                    `<b>Boost S:</b> <input type="number" min="1" max="999" step="1" value="${S.bs}" style="width:58px" onchange="setParam(this,'bs',1,999,'Chu kỳ Boost S','${pg}')"> đv</label>`;
            }

            // Aging option
            if (starve || a === 'PRIO') {
                h += `<label class="ctrl-item"><input type="checkbox" ${S.ag ? 'checked' : ''} onchange="S.ag=this.checked;cfgChanged('${pg}')"> <b>Bật Aging</b></label>`;
                if (S.ag) {
                    h += `<label class="ctrl-item">Cứ mỗi <input type="number" min="1" max="999" step="1" value="${S.agN}" style="width:50px" onchange="setParam(this,'agN',1,999,'Chu kỳ Aging','${pg}')"> đv chờ → Priority giảm 1</label>`;
                }
            }

            h += `</div>`;
            return h;
        };

        const V = {
            home() {
                const n = S.procs.length;
                const kp = (ic, v, l, g) => `<div><span class="bd ${g ? 'g' : ''}">${svg(ic, 24)}</span><b>${v}</b><span class="mu" style="font-size:13px">${l}</span></div>`;
                const fc = c => `<div class="card fc"><span class="bd">${svg(c[0], 24)}</span><h3>${c[1]}</h3><p class="mu">${c[2]}</p><button type="button" class="bt g sm" onclick="go('${c[3]}')">Mở chuyên mục →</button></div>`;

                return `<section class="pg">` +
                    `<div class="hero"><div class="hc">` +
                    `<span class="ey">CPU SCHEDULING SIMULATOR • KIẾN TRÚC MÁY TÍNH & HỆ ĐIỀU HÀNH</span>` +
                    `<h1>Mô phỏng và Phân tích Lập lịch CPU</h1>` +
                    `<p>Mô phỏng 7 thuật toán điều phối CPU kinh điển: FCFS, SJF, SRTF, Round Robin, Priority (có/không ngắt), Multilevel Queue và Multilevel Feedback Queue.</p>` +
                    `<div style="display:flex;gap:12px;flex-wrap:wrap">` +
                    `<button type="button" class="bt hb" onclick="go('vm')">Vào Máy tính ảo ${svg('arrow', 18, 2)}</button>` +
                    `</div></div>` +
                    `<div class="hv">${HERO_SVG}</div></div>` +

                    `<div class="kpi">${kp('list', n, 'Tiến trình trong hệ thống')}${kp('clock', S.fin ? 0 : n, 'Trạng thái sẵn sàng')}${kp('check', S.fin ? n : 0, 'Đã hoàn tất', 1)}${kp('nodes', (S.algo && NM[S.algo]) ? NM[S.algo] : 'FCFS', 'Thuật toán đang chọn')}</div>` +

                    `<h2>Khám phá các phân hệ chức năng</h2>` +
                    `<div class="grid">${[
                        ['monitor', 'Máy tính ảo', 'Khởi chạy ứng dụng đồ họa để sinh tiến trình mô phỏng tương ứng; hỗ trợ nạp bài mẫu và dán dữ liệu nhanh.', 'vm'],
                        ['bars', 'Nguyên lý thuật toán', 'Cơ sở lý thuyết, ưu nhược điểm và công thức toán học của 7 thuật toán điều phối CPU.', 'alg'],
                        ['gauge', 'Phân tích tải CPU', 'Thực nghiệm 6 kịch bản quá tải, phân tích nguyên nhân và thực thi giải pháp cải thiện trực tiếp.', 'load'],
                        ['chart', 'Kết quả mô phỏng', 'Biểu đồ Gantt, sơ đồ trạng thái 5 mức, chỉ số hiệu năng và so sánh toàn diện 7 thuật toán.', 'res']
                    ].map(fc).join('')}</div>` +
                    `</section>`;
            },

            alg() {
                const AL_TAGS = {
                    FCFS: { mode: 'Độc quyền (Non-preemptive)', badge: 'FCFS' },
                    SJF: { mode: 'Độc quyền (Non-preemptive)', badge: 'SJF' },
                    SRTF: { mode: 'Không độc quyền (Preemptive)', badge: 'SRTF' },
                    PRIO: { mode: 'Hỗ trợ cả có ngắt & không ngắt', badge: 'Priority' },
                    RR: { mode: 'Không độc quyền (Quantum q)', badge: 'Round Robin' },
                    MLQ: { mode: 'Đa hàng đợi cố định (Multilevel)', badge: 'MLQ' },
                    MLFQ: { mode: 'Đa hàng đợi phản hồi (Feedback)', badge: 'MLFQ' }
                };

                return `<section class="pg"><h1>Tổng quan các Thuật toán Lập lịch CPU</h1>` +
                    `<p class="mu">Hệ thống hỗ trợ đầy đủ 7 giải thuật lập lịch vi xử lý cốt lõi. Nhấp “Mô phỏng thuật toán này” để chạy ngay trên tập tiến trình hiện có.</p>` +
                    `<div class="alg-grid">` +
                    AL.map(a => {
                        const meta = AL_TAGS[a[0]] || { mode: 'Chuẩn', badge: a[0] };
                        return `<div class="card alg-card">` +
                            `<div class="alg-head"><div><h3>${NM[a[0]]}</h3><span class="alg-mode">${meta.mode}</span></div><span class="alg-badge">${meta.badge}</span></div>` +
                            `<div class="alg-body">` +
                            `<p class="alg-desc">${a[1]}</p>` +
                            `<div class="alg-details">` +
                            `<div class="alg-box ok-box"><b class="ok">Ưu điểm:</b> ${a[2]}</div>` +
                            `<div class="alg-box err-box"><b class="er">Nhược điểm:</b> ${a[3]}</div>` +
                            `</div></div>` +
                            `<div class="alg-footer"><button type="button" class="bt" onclick="if(!resP().length){toast('Chưa có tiến trình để mô phỏng. Hãy tạo tiến trình ở Máy tính ảo trước.');return}S.algo='${a[0]}';go('res')">Mô phỏng thuật toán này →</button></div>` +
                            `</div>`;
                    }).join('') +
                    `</div></section>`;
            },

            load() {
                let h = `<section class="pg has-dock"><h1>Phân tích Tải CPU Chuyên sâu</h1>` +
                    `<p class="mu">Mô phỏng các tình huống tắc nghẽn vi xử lý kinh điển trong môn Hệ điều hành. Đánh giá nguyên nhân gốc rễ và kiểm chứng các giải pháp cải thiện.</p>` +
                    `<div class="bar" style="gap:12px;flex-wrap:wrap">` +
                    `<label><b>Kịch bản tải:</b> <select id="sc" aria-label="Kịch bản">${SC.map(s => `<option value="${s[0]}" ${s[0] === S.sc ? 'selected' : ''}>${s[1]}</option>`).join('')}</select></label>` +
                    `<label><b>Số tiến trình:</b> <input id="nn" type="number" min="5" max="40" value="${S.n}" style="width:68px"></label>` +
                    `<button type="button" class="bt" onclick="mkLoad()">${svg('run', 16, 2)} Tạo tải và phân tích</button>` +
                    `</div>`;

                const L = S.load;
                if (!L) {
                    return h + `<div class="card" style="padding:28px;text-align:center"><p class="mu">Chưa khởi tạo kịch bản tải nào. Hãy chọn một kịch bản ở trên và nhấn <b>“Tạo tải và phân tích”</b> để bắt đầu.</p></div></section>`;
                }

                const scInfo = SC_DATA[L.sc] || SC_DATA.burst;
                const rows = cmp(L.P);
                const r = rows.find(x => x.id === (S.algo || 'FCFS'))?.r || rows[0].r;
                S.loadSim = r;
                if (S.loadCur === null || S.loadCur > r.T) S.loadCur = r.T;
                const t = S.loadCur;

                const n = L.P.length;
                const ac = L.P.reduce((s, p) => s + p.cpu, 0) / (n || 1);
                const ratio = r.wt / (ac || 1);
                const loadStatus = ratio >= 3.5 && r.u > 88 ? ['Quá tải nghiêm trọng', 'over'] : ratio >= 1.5 ? ['Tải cao', 'hi'] : ['Bình thường', 'ok'];

                // Đánh giá chuyên sâu theo dữ liệu thực tế
                const evalText = scInfo.evalRule(r, ac);
                const sv = r.m.reduce((a, b) => b.wt > a.wt ? b : a);
                const starvationDetected = sv.wt >= 2.5 * r.wt && sv.wt - r.wt >= 4;

                // Bảng giải pháp đề xuất
                const recRows = scInfo.recommendations.map(rec => {
                    const isApplied = appliedOK() && L.appliedAlgo === rec.id;
                    return `<tr>` +
                        `<td><b>${rec.label}</b></td>` +
                        `<td>${rec.why}</td>` +
                        `<td>${rec.tradeOff}</td>` +
                        `<td><button type="button" class="bt sm ${isApplied ? 'g' : ''}" onclick="applyAlgo('${rec.id}')">${isApplied ? '✓ Đang áp dụng' : 'Áp dụng giải pháp'}</button></td>` +
                        `</tr>`;
                }).join('');

                let appliedAlert = '';
                if (L.appliedAlgo) {
                    const inSync = S.rs === 'load';
                    if (appliedOK()) {
                        appliedAlert = `<div class="card" style="background:var(--okbg);border-color:var(--ok);color:var(--ok);margin-bottom:16px;padding:12px 18px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">` +
                            `<span><strong>✓ Đã áp dụng giải pháp: ${esc(L.appliedText)}</strong> cho kịch bản này. Thuật toán đã được thực thi lại; Gantt, sơ đồ trạng thái, nhật ký, bảng và chỉ số hiệu năng bên dưới đã được tính toán lại theo cơ chế mới. ` +
                            (inSync ? 'Kết quả này đã được đồng bộ sang trang Kết quả.' : 'Trang Kết quả hiện đang hiển thị dữ liệu của Máy tính ảo; nhấn nút bên phải để xem kết quả của tải này.') +
                            `</span><button type="button" class="bt sm" onclick="showLoadResult()">Xem trên trang Kết quả đầy đủ →</button></div>`;
                    } else {
                        appliedAlert = `<div class="card" style="background:var(--ac2);border-color:var(--ac);margin-bottom:16px;padding:12px 18px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">` +
                            `<span><strong>Cấu hình đã được điều chỉnh sau khi áp dụng giải pháp “${esc(L.appliedText)}”.</strong> Kết quả bên dưới đang được tính theo cấu hình hiện tại: ${esc(cfgText())}.</span>` +
                            `<button type="button" class="bt sm" onclick="showLoadResult()">Xem trên trang Kết quả đầy đủ →</button></div>`;
                    }
                }

                // Bảng tập tiến trình của kịch bản
                const procListHtml = `<div class="sc" style="max-height:220px"><table><thead><tr>` +
                    `<th>PID</th><th>Tên tác vụ</th><th>Loại</th><th>Thời điểm đến (AT)</th><th>CPU Burst</th><th>I/O Burst</th><th>Priority</th>` +
                    `</tr></thead><tbody>` +
                    L.P.map(p => `<tr><td><b>P${p.pid}</b></td><td>${esc(p.name)}</td><td><span class="tag ${p.type.toLowerCase()}">${p.type}</span></td><td>${p.at}</td><td>${p.cpu}</td><td>${p.io}</td><td>${p.pr}</td></tr>`).join('') +
                    `</tbody></table></div>`;

                return h +
                    appliedAlert +
                    `<!-- Cấu trúc 7 phần khoa học theo chuẩn học thuật Hệ điều hành -->` +
                    `<div class="card" style="margin-bottom:16px">` +
                    `<h3>Mục tiêu & Cơ sở lý thuyết</h3>` +
                    `<p><b>Mục tiêu nghiên cứu:</b> ${scInfo.target}</p>` +
                    `<p><b>Cơ sở lý thuyết Hệ điều hành:</b> ${scInfo.theory}</p>` +
                    `<p><b>Thiết lập mô phỏng:</b> ${scInfo.setup}</p>` +
                    `<p><b>Cơ chế xử lý:</b> ${scInfo.mechanism}</p>` +
                    `</div>` +

                    `<h2>Thiết lập mô phỏng & Tập tiến trình (${n} tác vụ)</h2>${procListHtml}` +

                    `<h2>Giám sát Quá trình Điều phối (${NM[S.algo || 'FCFS']})</h2>` +
                    `<div class="bar" style="margin-bottom:12px">Đang quan sát theo cấu hình: ${ctrl('load')}</div>` +
                    simUI(r, t) +

                    `<h2>Kết quả Mô phỏng Thực tế</h2>` +
                    `<div class="kpi">` +
                    `<div><b>${r.u.toFixed(1)}%</b>Hiệu suất CPU</div>` +
                    `<div><b>${r.mq}</b>Hàng đợi tối đa</div>` +
                    `<div><b>${r.wt.toFixed(2)}</b>Thời gian chờ TB</div>` +
                    `<div><b>${r.tat.toFixed(2)}</b>Thời gian quay vòng TB</div>` +
                    `<div><b>${r.thr.toFixed(3)}</b>Thông lượng (Throughput)</div>` +
                    `<div><b class="${loadStatus[1]}">${loadStatus[0]}</b>Đánh giá mức tải</div>` +
                    `</div>` +
                    `<div id="kp">${kpiCardsHTML(r, t)}</div>` +
                    `<h3 style="margin:16px 0 8px">Bảng kết quả chi tiết theo tiến trình</h3>` +
                    `<div id="pt">${processTableHTML(r.P, r, t)}</div>` +

                    `<div class="card" style="margin-bottom:16px">` +
                    `<h3 style="margin-top:0">Phân tích & Đánh giá</h3>` +
                    `<ul>` +
                    `<li><b>Nhận định tải:</b> ${evalText}</li>` +
                    `<li><b>Phân bổ thời gian chờ:</b> Thời gian chờ trung bình là ${r.wt.toFixed(1)} đv (gấp ${ratio.toFixed(1)} lần CPU Burst trung bình ${ac.toFixed(1)} đv). Hàng đợi sẵn sàng đạt cực đại ${r.mq} tiến trình.</li>` +
                    (starvationDetected ? `<li class="er"><b>Cảnh báo Starvation:</b> Tác vụ P${sv.pid} (ưu tiên ${sv.pr}, burst ${sv.cpu}) phải chờ tới ${sv.wt} đv thời gian (gấp ${(sv.wt / Math.max(0.1, r.wt)).toFixed(1)} lần mức chờ trung bình), cho thấy nguy cơ bị bỏ đói tài nguyên nghiêm trọng.</li>` : `<li><b>Kiểm tra Starvation:</b> Thời gian chờ giữa các tiến trình đồng đều, không có tiến trình nào bị đình trệ quá mức.</li>`) +
                    `</ul>` +
                    `</div>` +

                    `<h2>Giải pháp Cải thiện & Thực thi</h2>` +
                    `<div class="sc"><table class="rec-table"><thead><tr><th>Giải pháp đề xuất</th><th>Căn cứ lý thuyết & Mục tiêu</th><th>Đánh đổi (Trade-off)</th><th>Thao tác thực thi</th></tr></thead><tbody>${recRows}</tbody></table></div>` +

                    `<h2>So sánh toàn diện các thuật toán trên tập tải này</h2>${cmpT(rows)}` +
                    `</section>`;
            },

            res() {
                const RP = resP();
                if (!RP.length) {
                    return `<section class="pg"><h1>Kết quả mô phỏng</h1>` +
                        `<div class="card" style="padding:28px;text-align:center">` +
                        `<p class="mu">Hiện chưa có tiến trình nào để mô phỏng.</p>` +
                        `<div style="display:flex;justify-content:center;gap:12px;margin-top:16px">` +
                        `<button type="button" class="bt" onclick="go('vm')">Vào Máy tính ảo để tạo tiến trình</button>` +
                        `<button type="button" class="bt g" onclick="sample();go('res')">Nạp tập tiến trình mẫu</button>` +
                        `</div></div></section>`;
                }

                if (!S.algo) S.algo = 'FCFS';
                const r = S.r = sim(RP, S.algo, S.q, S.pp, OPT());
                if (S.cur === null || S.cur > r.T) S.cur = 0;
                const t = S.cur;
                const rows = cmp(RP);

                let srcBanner = '';
                if (S.rs === 'load' && S.load && RP === S.load.P) {
                    const L = S.load, ok = appliedOK();
                    const sc = (SC_DATA[L.sc] || {}).title || L.sc;
                    srcBanner = `<div class="card" style="background:${ok ? 'var(--okbg)' : 'var(--ac2)'};border-color:${ok ? 'var(--ok)' : 'var(--ac)'};margin-bottom:14px;padding:12px 18px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">` +
                        `<span><strong>${ok ? '✓ Kết quả sau khi áp dụng giải pháp: ' + esc(L.appliedText) : 'Đang hiển thị tập tải từ trang Phân tích tải CPU, cấu hình: ' + esc(cfgText())}</strong><br>Kịch bản: ${esc(sc)} · ${RP.length} tiến trình.</span>` +
                        `<span style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="bt g sm" onclick="go('load')">← Về Phân tích tải</button>` +
                        `<button type="button" class="bt g sm" onclick="S.rs='vm';S.r=null;S.cur=0;go('res')">Dùng dữ liệu Máy tính ảo</button></span></div>`;
                }

                return `<section class="pg has-dock">` +
                    `<h1>Kết quả Mô phỏng Lập lịch CPU</h1>` +
                    srcBanner +
                    `<div class="bar" style="margin-bottom:14px">` +
                    ctrl('res') +
                    `</div>` +

                    simUI(r, t) +

                    `<h2>Chỉ số Hiệu suất Hệ thống</h2>` +
                    `<div id="kp">${kpiCardsHTML(r, t)}</div>` +

                    `<h2>Bảng Chi tiết Tiến trình</h2>` +
                    `<div id="pt">${processTableHTML(r.P, r, t)}</div>` +

                    `<h2>Phân tích Kết quả Mô phỏng</h2>` +
                    analysisHTML(r, rows) +

                    `<h2>Bảng So sánh Hiệu năng các Thuật toán</h2>` +
                    `<p class="mu">Đánh giá song song các giải thuật điều phối trên cùng tập dữ liệu đầu vào hiện tại để tìm phương án tối ưu nhất.</p>` +
                    cmpT(rows) +

                    `<h2>Cơ sở Lý thuyết & Công thức Đo lường</h2>` +
                    `<div class="sc"><table><thead><tr><th>Chỉ số</th><th>Ý nghĩa trong môn Hệ điều hành</th><th>Công thức xác định</th></tr></thead><tbody>` +
                    `<tr><td><b>Thời gian quay vòng (Turnaround Time)</b></td><td>Tổng thời gian từ khi tiến trình xuất hiện đến khi hoàn tất</td><td><code>Turnaround Time = Completion Time - Arrival Time</code></td></tr>` +
                    `<tr><td><b>Thời gian chờ (Waiting Time)</b></td><td>Tổng thời gian tiến trình phải chờ đợi trong Ready Queue</td><td><code>Waiting Time = Turnaround Time - CPU Burst - I/O Burst</code></td></tr>` +
                    `<tr><td><b>Thời gian phản hồi (Response Time)</b></td><td>Thời gian từ khi đến đến lần đầu tiên được cấp CPU</td><td><code>Response Time = First Run Time - Arrival Time</code></td></tr>` +
                    `<tr><td><b>Hiệu suất CPU (CPU Utilization)</b></td><td>Tỷ lệ thời gian CPU bận thực thi tiến trình trên tổng thời gian</td><td><code>(Tổng thời gian CPU bận / Tổng thời gian mô phỏng) × 100%</code></td></tr>` +
                    `<tr><td><b>Thông lượng (Throughput)</b></td><td>Số lượng tiến trình hoàn thành trên một đơn vị thời gian</td><td><code>Số tiến trình hoàn tất / Tổng thời gian mô phỏng</code></td></tr>` +
                    `<tr><td><b>Chuyển ngữ cảnh (Context Switch)</b></td><td>Số lần CPU đổi quyền thực thi giữa các tiến trình khác nhau</td><td><code>Đếm mỗi lần CPU chuyển giao giữa 2 tiến trình khác nhau (kèm thời gian hao phí CS)</code></td></tr>` +
                    `</tbody></table></div>` +
                    `</section>`;
            },

            about() {
                return `<section class="pg"><div class="hero"><div class="hc">` +
                    `<span class="ey">HỆ ĐIỀU HÀNH • MÔ PHỎNG HỌC THUẬT</span>` +
                    `<h1>Giới thiệu Hệ thống Mô phỏng</h1>` +
                    `<p>CPU Scheduling Simulator là công cụ mô phỏng trực quan tương tác phục vụ học tập, giảng dạy và nghiên cứu học phần Hệ điều hành tại các trường đại học khối ngành Công nghệ thông tin.</p>` +
                    `<div style="display:flex;gap:12px;flex-wrap:wrap">` +
                    `<button type="button" class="bt hb" onclick="go('home')">Về Trang chủ ${svg('arrow', 18, 2)}</button>` +
                    `<button type="button" class="bt g" style="background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.3)" onclick="go('vm')">Máy tính ảo</button>` +
                    `</div></div><div class="hv">${HERO_SVG}</div></div>` +

                    `<h2>Các đặc tính nổi bật</h2>` +
                    `<div class="grid">${[
                        ['clock', 'Mô phỏng', 'Theo dõi từng đơn vị thời gian với các nút Tiếp tục, Tạm dừng, Đi từng bước và thanh trượt tua thời gian mượt mà.'],
                        ['chart', 'Biểu đồ Gantt đa chức năng', 'Trực quan hóa khoảng thời gian thực thi, CPU Idle, Context Switch, hỗ trợ thu phóng và nhấp khối để soi chi tiết.'],
                        ['nodes', 'Sơ đồ Vòng đời 5 trạng thái', 'Mô hình 5-state chuẩn xác (New, Ready, Running, Waiting, Terminated) chuyển động theo từng thời điểm t.'],
                        ['gauge', 'Phân tích tải thực nghiệm', 'Mô phỏng 6 kịch bản quá tải kinh điển: Convoy effect, CPU-bound, Mixed I/O, Starvation kèm giải pháp cải thiện.']
                    ].map(f => `<div class="card fc"><span class="bd">${svg(f[0], 24)}</span><h3>${f[1]}</h3><p class="mu">${f[2]}</p></div>`).join('')}</div>` +
                    `</section>`;
            },

            contact() {
                ctRenderedAt = Date.now();
                const topics = CT_TOPICS.map(t => `<option value="${t}">${t}</option>`).join('');
                const algos = CT_ALGOS.map(t => `<option value="${t}">${t}</option>`).join('');
                const faq = [
                    ['Hệ thống có hoạt động ngoại tuyến (Offline) không?', 'Có. Ứng dụng mô phỏng chạy 100% trong trình duyệt của bạn (Client-side), hoàn toàn không cần kết nối mạng hay máy chủ. Riêng biểu mẫu gửi góp ý cần có Internet.'],
                    ['Dữ liệu tiến trình có bị lộ ra ngoài không?', 'Không. Toàn bộ tiến trình chỉ lưu trong bộ nhớ tạm phiên làm việc hiện tại. Chỉ nội dung bạn nhập trong biểu mẫu liên hệ mới được gửi đi khi bạn bấm Gửi liên hệ.'],
                    ['Tôi nên cung cấp gì khi báo lỗi thuật toán?', 'Hãy nêu tên thuật toán, bộ dữ liệu tiến trình (PID, AT, CPU Burst, I/O, Priority) và kết quả bạn kỳ vọng so với kết quả hiển thị.'],
                    ['Bao lâu tôi nhận được phản hồi?', 'Thư được gửi trực tiếp đến hộp thư của nhóm phát triển. Chúng tôi sẽ phản hồi qua địa chỉ email bạn cung cấp.']
                ].map(q => `<div class="faq-item"><b>${q[0]}</b><p>${q[1]}</p></div>`).join('');

                return `<section class="pg">` +
                    `<div class="hero contact-hero"><div class="hc">` +
                    `<span class="ey">KẾT NỐI & HỖ TRỢ HỌC THUẬT</span>` +
                    `<h1>Liên hệ & Đóng góp ý kiến</h1>` +
                    `<p>Hệ thống luôn sẵn sàng lắng nghe mọi góp ý từ sinh viên và giảng viên để hoàn thiện mô phỏng chính xác và trực quan hơn.</p>` +
                    `</div></div>` +

                    `<div class="contact-grid">` +
                    `<div class="ct-left">` +
                    `<div class="card ct-card ct-info"><h3>${svg('globe', 22)}Thông tin dự án</h3>` +
                    `<p><b>Đề tài:</b> CPU Scheduling Simulator (Mô phỏng lập lịch CPU).</p>` +
                    `<p><b>Môn học:</b> Hệ điều hành (Operating Systems).</p>` +
                    `<p><b>Mục tiêu:</b> Phục vụ trực quan hóa bài giảng và hỗ trợ làm đồ án môn học.</p>` +
                    `<p><b>Nền tảng:</b> Thuần Web (HTML5/CSS3/JavaScript), không cần cài đặt thêm phần mềm.</p>` +
                    `</div>` +
                    `<div class="card ct-card"><h3>${svg('check', 22)}Câu hỏi thường gặp (FAQ)</h3><div class="faq-list">${faq}</div></div>` +
                    `</div>` +

                    `<div class="card ct-card"><h3>${svg('note', 22)}Gửi thư đóng góp ý kiến</h3>` +
                    `<p class="mu" style="font-size:14.5px!important;line-height:1.6!important;margin:0">Điền thông tin bên dưới nếu bạn muốn đề xuất tính năng mới, báo cáo vấn đề hoặc gửi câu hỏi về thuật toán.</p>` +
                    `<form class="ct-form" id="contactForm" onsubmit="return handleContactSubmit(event)" novalidate>` +
                    `<div class="form-row">` +
                    `<div class="fld"><label for="ct-name">Họ và tên<i>*</i></label><input id="ct-name" type="text" name="name" maxlength="80" autocomplete="name" placeholder="Nguyễn Văn A" oninput="ctInput(this)"><p class="ferr" id="ce-name" role="alert"></p></div>` +
                    `<div class="fld"><label for="ct-email">Email liên hệ<i>*</i></label><input id="ct-email" type="email" name="email" maxlength="254" autocomplete="email" inputmode="email" placeholder="student@university.edu.vn" oninput="ctInput(this)"><p class="ferr" id="ce-email" role="alert"></p></div>` +
                    `</div>` +
                    `<div class="form-row">` +
                    `<div class="fld"><label for="ct-topic">Chủ đề</label><select id="ct-topic" name="topic">${topics}</select><p class="ferr" id="ce-topic" role="alert"></p></div>` +
                    `<div class="fld"><label for="ct-algo">Thuật toán quan tâm</label><select id="ct-algo" name="algo">${algos}</select><p class="ferr" id="ce-algo" role="alert"></p></div>` +
                    `</div>` +
                    `<div class="fld"><label for="ct-subject">Tiêu đề<i>*</i></label><input id="ct-subject" type="text" name="subject" maxlength="150" placeholder="Ví dụ: Đề xuất bổ sung thuật toán HRRN" oninput="ctInput(this)"><p class="ferr" id="ce-subject" role="alert"></p></div>` +
                    `<div class="fld"><label for="ct-message">Nội dung góp ý<i>*</i></label><textarea id="ct-message" name="message" maxlength="3000" placeholder="Mô tả chi tiết câu hỏi, trường hợp cần kiểm tra hoặc ý tưởng cải thiện của bạn..." oninput="ctInput(this)"></textarea><span class="fcount" id="ct-count">0/3000</span><p class="ferr" id="ce-message" role="alert"></p></div>` +
                    `<div class="hp-wrap" aria-hidden="true"><label>Để trống trường này<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>` +
                    `<button type="submit" class="bt ct-submit" id="btnContactSubmit">Gửi liên hệ</button>` +
                    `<p id="contactMsg" class="ct-status" role="status" aria-live="polite"></p>` +
                    `</form></div>` +
                    `</div></section>`;
            }
        };

