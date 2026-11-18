        /* ===== js/controller.js ===== */
        /* CPU Scheduling Simulator - Simulation Playback Controller & Fixed Bottom Dock */

        function getActiveSim() {
            return S.view === 'load' ? S.loadSim : S.r;
        }

        function simStat(r, t) {
            if (!r) return ['Chưa có mô phỏng.', false];
            if (t >= r.T) return [`Đã hoàn thành toàn bộ (${r.T} đv thời gian)`, false];
            if (S.tm) return [`Đang chạy mô phỏng (t = ${t} / ${r.T})...`, true];
            return [`Tạm dừng tại t = ${t} / ${r.T}`, false];
        }

        function simBtn() {
            const r = getActiveSim();
            if (!r) return;
            const t = curT();
            const bRun = $('#bRun'), bStop = $('#bStop'), bStep = $('#bStep');
            if (!bRun || !bStop || !bStep) return;

            bRun.disabled = !!S.tm || t >= r.T;
            bRun.innerHTML = `${svg('run', 16, 2)} ${t <= 0 ? 'Bắt đầu' : t >= r.T ? 'Hoàn tất' : 'Tiếp tục'}`;
            bStop.disabled = !S.tm;
            bStep.disabled = !!S.tm || t >= r.T;

            const [msg, on] = simStat(r, t);
            const ssText = $('#ss-text');
            if (ssText) ssText.textContent = msg;
            const ssDot = $('#ss-dot');
            if (ssDot) ssDot.className = `ctl-status-dot${on ? ' active' : ''}`;
        }

        function simView(t) {
            const r = getActiveSim();
            if (!r) return;
            t = Math.max(0, Math.min(r.T, Math.floor(t)));
            if (S.view === 'load') S.loadCur = t;
            else S.cur = t;

            const ts = $('#ts');
            if (ts && +ts.value !== t) ts.value = t;
            const tv = $('#tv');
            if (tv) tv.textContent = t;

            // Cập nhật Biểu đồ Gantt & Sơ đồ trạng thái
            ggRefresh(r, t, true);
            const sd = $('#sd');
            withScroll(sd, () => { sd.innerHTML = stateView(r, t); });

            // Cập nhật popup tiến trình nếu đang mở
            if (S.pop !== null) stPopRender();

            // Cập nhật bảng KPI và bảng tiến trình
            const kp = $('#kp');
            if (kp) withScroll(kp, () => { kp.innerHTML = kpiCardsHTML(r, t); });
            const pt = $('#pt');
            if (pt) withScroll(pt, () => { pt.innerHTML = processTableHTML(r.P, r, t); });

            // Cập nhật nhật ký sự kiện
            logRefresh();
            simBtn();
        }

        function simStop() {
            if (S.tm) {
                clearInterval(S.tm);
                S.tm = null;
            }
            simBtn();
        }

        function simTick() {
            const r = getActiveSim();
            if (!r) { simStop(); return; }
            const ct = curT();
            if (ct >= r.T) {
                simStop();
                return;
            }
            simView(ct + 1);
        }

        function simRun() {
            const r = getActiveSim();
            if (!r) return;
            if (curT() >= r.T) simView(0);
            simStop();
            const delay = +($('#spd')?.value || S.spd || 500);
            S.tm = setInterval(simTick, delay);
            simBtn();
        }

        function simStep() {
            const r = getActiveSim();
            if (!r) return;
            simStop();
            const ct = curT();
            if (ct < r.T) simView(ct + 1);
        }

        function simReset() {
            simStop();
            simView(0);
        }

        const SPEEDS = [[2000, 'Rất chậm', '0,5'], [1000, 'Chậm', '1'], [500, 'Vừa', '2'], [200, 'Nhanh', '5'], [100, 'Rất nhanh', '10']];

        function simSpd() {
            S.spd = +($('#spd')?.value || 500);
            if (S.tm) {
                simStop();
                simRun();
            }
        }

        function simUI(r, t) {
            const [m, on] = simStat(r, t);
            if (S.lf && !r.P.some(p => p.pid === S.lf)) S.lf = 0;

            return `<!-- Giao diện mô phỏng chính -->` +
                `<div class="sim">` +
                `<div class="card">` +
                `<h3>Biểu đồ Gantt & Trục thời gian</h3>` +
                `<p class="mu">Mỗi khối thể hiện khoảng thời gian tiến trình được cấp phát CPU. Vạch đỏ đánh dấu con trỏ thời điểm hiện tại t = ${t}.</p>` +
                `<div id="gg">${gantt(r, t)}</div>` +
                `</div>` +

                `<div class="card">` +
                `<h3>Sơ đồ vòng đời trạng thái tiến trình (5-State Model)</h3>` +
                `<p class="mu">Hiển thị trực quan và đồng bộ các tiến trình qua 5 trạng thái tại thời điểm t = ${t}. Nhấp vào thẻ tiến trình hoặc nút mở rộng để xem bảng chi tiết.</p>` +
                `<div id="sd">${stateView(r, t)}</div>` +
                `</div>` +

                `<div class="card">` +
                `<div class="lg-h"><h3 style="margin:0">Nhật ký sự kiện điều phối CPU</h3>` +
                `<label>Lọc theo tiến trình: <select id="lf" onchange="S.lf=+this.value;logRefresh()"><option value="0">Tất cả tiến trình</option>${r.P.map(p => `<option value="${p.pid}" ${S.lf === p.pid ? 'selected' : ''}>P${p.pid} – ${esc(p.name)}</option>`).join('')}</select></label>` +
                `</div>` +
                `<div id="lg">${logHTML(r, t)}</div>` +
                `</div>` +
                `</div>` +

                `<!-- Thanh điều khiển mô phỏng cố định phía dưới màn hình (Fixed Bottom Bar) -->` +
                `<div class="ctl-dock" id="ctlDock" role="region" aria-label="Bảng điều khiển mô phỏng">` +
                `<div class="ctl-dock-inner">` +
                `<div class="ctl-dock-row1">` +
                `<div class="ctl-btn-group">` +
                `<button type="button" class="bt" id="bRun" onclick="simRun()">${svg('run', 16, 2)} ${t <= 0 ? 'Bắt đầu' : t >= r.T ? 'Hoàn tất' : 'Tiếp tục'}</button>` +
                `<button type="button" class="bt g" id="bStop" onclick="simStop()" disabled>${svg('pause', 16, 2)} Tạm dừng</button>` +
                `<button type="button" class="bt g" id="bStep" onclick="simStep()">${svg('step', 16, 2)} Tiến 1 bước</button>` +
                `<button type="button" class="bt g" onclick="simReset()">${svg('reset', 16, 2)} Đặt lại (t=0)</button>` +
                `</div>` +
                `<div class="ctl-status-badge"><i id="ss-dot" class="ctl-status-dot${on ? ' active' : ''}"></i><span id="ss-text">${m}</span></div>` +
                `<div class="ctl-spd-wrap">` +
                `<label>Tốc độ: <select id="spd" onchange="simSpd()">${SPEEDS.map(x => `<option value="${x[0]}" ${x[0] === (S.spd || 500) ? 'selected' : ''}>${x[1]} (${x[2]} đv/giây)</option>`).join('')}</select></label>` +
                `</div>` +
                `</div>` +
                `<div class="ctl-dock-row2">` +
                `<input id="ts" type="range" min="0" max="${r.T}" value="${t}" aria-label="Thanh trượt thời gian" oninput="simStop();simView(+this.value)">` +
                `<span class="ctl-time-badge">Thời điểm: t = <b id="tv">${t}</b> / ${r.T} đv</span>` +
                `</div>` +
                `</div>` +
                `</div>`;
        }


