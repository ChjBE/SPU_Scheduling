        /* ===== js/gantt.js ===== */
        /* CPU Scheduling Simulator - Interactive Gantt Chart */

        function gantt(r, upto) {
            if (!r || !r.g || !r.g.length) {
                return '<p class="mu" style="padding:16px 0">Chưa có dữ liệu Gantt để hiển thị.</p>';
            }

            const T = r.T;
            let tw, eff;
            if (S.gz > 0) {
                tw = `width:${T * S.gz}px`;
                eff = S.gz;
            } else if (S.gz === 0) {
                tw = 'width:100%';
                eff = 880 / (T || 1);
            } else {
                const mw = Math.min(Math.max(T * 28, 360), 3200);
                tw = `width:100%;min-width:${mw}px`;
                eff = mw / (T || 1);
            }

            const curPercent = T > 0 ? (upto / T * 100) : 0;
            const NICE = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
            const step = NICE.find(s => s * eff >= 38) || 5000;
            const ticks = [];
            for (let ti = 0; ti <= T; ti += step) ticks.push(ti);
            if (ticks[ticks.length - 1] !== T) ticks.push(T);

            const axisHtml = `<div class="gt-axis">` + ticks.map(ti => `<span class="gt-tick" style="left:${T > 0 ? (ti / T * 100) : 0}%">${ti}</span>`).join('') + `</div>`;

            const blocksHtml = r.g.map((s, k) => {
                const dur = s.e - s.s;
                const wPct = T > 0 ? (dur / T * 100) : 0;
                const kind = s.pid >= 0 ? 'run' : (s.pid === -2 ? 'cs' : 'idle');
                let cls = 'sg ' + kind;
                if (S.gsel && S.gsel.r === r && S.gsel.i === k) cls += ' sel';

                const bg = kind === 'run' ? `background:${COL[s.pid % 10]};` : '';
                const label = kind === 'run' ? 'P' + s.pid : (kind === 'cs' ? 'CS' : 'IDLE');
                const title = kind === 'run' ? `P${s.pid}: [${s.s} - ${s.e}] (${dur} đv)${s.why ? ' · ' + s.why : ''}` :
                    (kind === 'cs' ? `Chuyển ngữ cảnh CS: [${s.s} - ${s.e}] (P${s.from} → P${s.to})` : `CPU nhàn rỗi: [${s.s} - ${s.e}] (${dur} đv)`);

                return `<div class="${cls}" style="flex:0 0 ${wPct}%;${bg}" onclick="gSel('${k}')" title="${esc(title)}"><span>${label}</span></div>`;
            }).join('');

            const legendHtml = `<div class="lgd-lean">` +
                `<span class="lgd-item"><i class="lgd-box" style="background:var(--ac)"></i>Tiến trình (P)</span>` +
                `<span class="lgd-item"><i class="lgd-box" style="background:var(--bd);border:1px dashed var(--mu)"></i>CPU nhàn rỗi (Idle)</span>` +
                `<span class="lgd-item"><i class="lgd-box" style="background:repeating-linear-gradient(-45deg,#f1f5f9,#f1f5f9 2px,#e2e8f0 2px,#e2e8f0 4px);border:1px solid #cbd5e1"></i>Chuyển ngữ cảnh (CS)</span>` +
                `<span class="lgd-item"><i class="lgd-line" style="background:#ef4444"></i>Con trỏ thời điểm hiện tại (t = ${upto})</span>` +
                `</div>`;

            const zl = S.gz > 0 ? `${S.gz.toFixed(0)} px/đv` : S.gz === 0 ? 'Vừa vặn' : 'Tự động';
            const tb = `<div class="gt-tb">` +
                `<span class="mu">Thu phóng:</span>` +
                `<div class="gt-tb-btns">` +
                `<button type="button" class="bt g sm" onclick="gz(-1)" aria-label="Thu nhỏ">−</button>` +
                `<button type="button" class="bt g sm" onclick="gz(1)" aria-label="Phóng to">+</button>` +
                `<button type="button" class="bt g sm" onclick="gz('fit')">Vừa vặn</button>` +
                `<button type="button" class="bt g sm" onclick="gz('auto')">Mặc định</button>` +
                `</div>` +
                `<span class="mu">(${zl}) · Cuộn ngang để xem · Nhấp vào khối để xem chi tiết</span>` +
                `</div>`;

            return `<div class="gt-wrap">${tb}<div class="gt-scroll"><div class="gt-inner"><div class="gt-track" style="${tw}">` +
                `<div class="gt-cur-line" style="left:${curPercent}%"></div>` +
                `<div class="gt">${blocksHtml}</div>` +
                axisHtml +
                `</div></div></div>${legendHtml}${gDetail(r)}</div>`;
        }

        function gDetail(r) {
            if (!S.gsel || S.gsel.r !== r) return '';
            const s = r.g[S.gsel.i];
            if (!s) return '';
            const dur = s.e - s.s;
            const kind = s.pid >= 0 ? `Tiến trình P${s.pid}` : (s.pid === -2 ? 'Chuyển ngữ cảnh (Context Switch)' : 'CPU nhàn rỗi (Idle)');
            let extra = '';
            if (s.pid >= 0) {
                const p = r.P.find(x => x.pid === s.pid);
                extra = `<p class="mu" style="margin:4px 0 0">Thông tin tiến trình: ${p ? `Burst gốc: ${p.cpu}, Ưu tiên gốc: ${p.pr}, Thời điểm đến: ${p.at}` : ''}${s.why ? ` · <b>Lý do chọn:</b> ${s.why}` : ''}</p>`;
            } else if (s.pid === -2) {
                extra = `<p class="mu" style="margin:4px 0 0">CPU đang lưu ngữ cảnh của P${s.from} và khôi phục trạng thái cho P${s.to}.</p>`;
            } else {
                extra = `<p class="mu" style="margin:4px 0 0">Không có tiến trình nào trong hàng đợi sẵn sàng (Ready Queue).</p>`;
            }

            return `<div class="card" style="margin-top:12px;background:var(--ac2);border-color:var(--ac);padding:12px 16px">` +
                `<div style="display:flex;align-items:center;justify-content:space-between">` +
                `<b>Chi tiết khối Gantt: ${kind} [t = ${s.s} → ${s.e}] (Độ dài: ${dur} đv)</b>` +
                `<button type="button" class="bt g sm" onclick="S.gsel=null;ggRefresh(getActiveSim(),curT())">Đóng</button>` +
                `</div>${extra}</div>`;
        }

        const SCROLLERS = ['.gt-scroll', '.lg-b', '.evl', '.sc', '.stm-b'];
        function withScroll(el, render) {
            if (!el) return;
            const saved = [];
            SCROLLERS.forEach(sel => el.querySelectorAll(sel).forEach((n, i) => saved.push([sel, i, n.scrollLeft, n.scrollTop])));
            render();
            saved.forEach(([sel, i, l, t]) => {
                const n = el.querySelectorAll(sel)[i];
                if (n) { n.scrollLeft = l; n.scrollTop = t; }
            });
        }

        function ggRefresh(r, upto, follow) {
            const el = $('#gg');
            if (!el || !r) return;
            withScroll(el, () => { el.innerHTML = gantt(r, upto); });
            if (follow) {
                // Chỉ cuộn khi con trỏ thời gian ra khỏi vùng nhìn thấy, đưa con trỏ về khoảng 30% chiều rộng
                const sc = el.querySelector('.gt-scroll'), tr = el.querySelector('.gt-track');
                if (!sc || !tr || !(r.T > 0)) return;
                if (upto <= 0) { sc.scrollLeft = 0; return; }
                const x = tr.offsetLeft + tr.offsetWidth * upto / r.T;
                if (x < sc.scrollLeft + 24 || x > sc.scrollLeft + sc.clientWidth - 48) {
                    sc.scrollLeft = Math.max(0, x - sc.clientWidth * 0.3);
                }
            }
        }

        function gSel(i) {
            const r = getActiveSim();
            if (!r) return;
            const idx = +i;
            if (S.gsel && S.gsel.i === idx) {
                S.gsel = null;
            } else {
                S.gsel = { r, i: idx };
            }
            ggRefresh(r, curT());
        }

        function gz(mode) {
            if (mode === 'fit') S.gz = 0;
            else if (mode === 'auto') S.gz = null;
            else {
                const cur = S.gz === null ? 28 : S.gz === 0 ? 18 : S.gz;
                S.gz = Math.max(8, Math.min(120, cur + mode * 8));
            }
            ggRefresh(getActiveSim(), curT());
        }


