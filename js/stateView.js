        /* ===== js/stateView.js ===== */
        /* CPU Scheduling Simulator - 5-State Process Lifecycle Diagram */

        const STK = ['New', 'Ready', 'Running', 'Waiting', 'Terminated'];
        const CAP = 9;

        function stateView(r, t) {
            if (!r || !r.snapshots || !r.snapshots.length) {
                return '<p class="mu" style="padding:16px 0">Chưa có dữ liệu trạng thái tiến trình.</p>';
            }

            t = Math.max(0, Math.min(r.T, t));
            const snap = r.snapshots[t] || r.snapshots[r.snapshots.length - 1];
            const L = [0, 1, 2, 3, 4].map(k => snap.procStats.filter(p => p.state === STK[k]));

            const W = 103, G = 22, X = k => k * (W + G);
            // Cố định kích thước khung để sơ đồ không bị giật lên xuống khi mô phỏng chạy (Issue 7)
            // Chiều cao khung được xác định cố định theo tổng số tiến trình của kịch bản, không đổi theo tick t
            const totalP = (r && r.P) ? r.P.length : 10;
            const hasOver = totalP > CAP;
            const maxBadgeRows = Math.min(3, Math.max(1, Math.ceil(totalP / 3)));
            const H = 40 + maxBadgeRows * 24 + (hasOver ? 24 : 0) + 8;
            const WW = 190, wH = 64 + (hasOver ? 24 : 0);
            const WY = H + 52, TH = WY + wH + 6;
            const mid = (X(1) + W / 2 + X(2) + W / 2) / 2;
            const c1 = X(1) + W / 2, c2 = X(2) + W / 2;

            const keys = new Set(snap.eventsUpToT.filter(e => e.t === t).map(e => e.from + '>' + e.to));
            const ar = (key, d, dash) => `<path class="ar${dash ? ' dash' : ''}${keys.has(key) ? ' on' : ''}" d="${d}" marker-end="url(#${keys.has(key) ? 'mo' : 'mh'})"/>`;

            const more = (k, x, y, w, cnt) => {
                const txt = `+${cnt} tiến trình khác`;
                return `<g class="mr" role="button" tabindex="0" onclick="stPop(${k})" onkeydown="if(event.key==='Enter')stPop(${k})"><title>Nhấn để xem danh sách đầy đủ (${L[k].length} tiến trình)</title>` +
                    `<rect x="${x}" y="${y}" width="${w}" height="20" rx="6"/><text x="${x + w / 2}" y="${y + 14}">${txt}</text></g>`;
            };

            const node = (k, x, y, w, h, dash) => {
                const list = L[k];
                const c = STC[k];
                const act = list.length > 0;
                const shown = list.slice(0, CAP);
                const over = list.length - shown.length;
                const extraDesc = k === 3 ? (list.length ? '' : `<text class="sub" x="${x + w / 2}" y="${y + 40}" text-anchor="middle">Chờ I/O hoàn tất</text>`) : '';

                return `<g><rect class="nd${dash ? ' dash' : ''}" x="${x}" y="${y}" width="${w}" height="${h}" rx="12" style="${act ? 'stroke:' + c : ''}"/>` +
                    (act ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${c}" fill-opacity=".08"/>` : '') +
                    `<circle cx="${x + 9}" cy="${y + 17}" r="3.5" fill="${c}"/><text x="${x + 17}" y="${y + 21}">${STN[k]}</text>` +
                    `<text class="cn" x="${x + w - 7}" y="${y + 21}" style="${act ? 'fill:' + c : ''}">${list.length}</text>` +
                    extraDesc +
                    shown.map((p, j) => {
                        const px = x + 8 + (j % 3) * 29;
                        const py = y + 34 + Math.floor(j / 3) * 24;
                        return `<g><title>P${p.pid} – ${esc(p.name)}: ${STN[k]} (CPU còn: ${p.rem}/${p.cpu}, Ưu tiên: ${p.pr})</title>` +
                            `<rect x="${px}" y="${py}" width="26" height="20" rx="6" fill="${COL[p.pid % 10]}"/>` +
                            `<text class="cp" x="${px + 13}" y="${py + 14.5}">P${p.pid}</text></g>`;
                    }).join('') +
                    (over > 0 ? more(k, x + 8, y + 34 + Math.ceil(shown.length / 3) * 24, w - 16, over) : '') +
                    `</g>`;
            };

            return `<svg class="sd" viewBox="0 0 480 ${TH}" role="img" aria-label="Sơ đồ trạng thái tiến trình tại t = ${t}">` +
                `<defs>` +
                `<marker id="mh" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="mh" d="M1 1L9 5L1 9z"/></marker>` +
                `<marker id="mo" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="mo" d="M1 1L9 5L1 9z"/></marker>` +
                `</defs>` +
                ar('New>Ready', `M${X(0) + W + 1} 22H${X(1) - 3}`) +
                ar('Ready>Running', `M${X(1) + W + 1} 16H${X(2) - 3}`) +
                ar('Running>Ready', `M${X(2) - 1} 34H${X(1) + W + 3}`) +
                ar('Running>Terminated', `M${X(2) + W + 1} 22H${X(3) - 3}`) +
                ar('Running>Waiting', `M${c2} ${H + 1}V${WY - 3}`) +
                ar('Waiting>Ready', `M${c1} ${WY - 1}V${H + 3}`) +
                node(0, X(0), 0, W, H) +
                node(1, X(1), 0, W, H) +
                node(2, X(2), 0, W, H) +
                node(4, X(3), 0, W, H) +
                node(3, mid - WW / 2, WY, WW, wH, 1) +
                `</svg>`;
        }

        function stPop(k) {
            S.pop = k;
            stPopRender();
        }

        function stPopClose() {
            S.pop = null;
            stPopRender();
        }

        function stPopRender() {
            let m = $('#stm');
            const r = getActiveSim();
            if (S.pop === null || !r) {
                if (m) m.remove();
                return;
            }
            const t = Math.max(0, Math.min(r.T, curT()));
            const snap = r.snapshots[t] || r.snapshots[r.snapshots.length - 1];
            const list = snap.procStats.filter(p => p.state === STK[S.pop]);

            if (!m) {
                m = document.createElement('div');
                m.id = 'stm';
                m.className = 'stm';
                m.onclick = e => { if (e.target === m) stPopClose(); };
                document.body.appendChild(m);
            }

            withScroll(m, () => {
                m.innerHTML = `<div class="stm-c" role="dialog" aria-modal="true" aria-label="Danh sách tiến trình ${STN[S.pop]}">` +
                    `<div class="stm-h"><b>${STN[S.pop]} · t = ${t} · ${list.length} tiến trình</b><button type="button" class="bt g x" onclick="stPopClose()" aria-label="Đóng">${svg('x', 16)}</button></div>` +
                    `<div class="sc stm-b"><table><thead><tr><th>PID</th><th>Tên tiến trình</th><th>CPU còn lại</th><th>Priority</th><th>Thời gian chờ</th></tr></thead><tbody>` +
                    (list.length ? list.map(p => `<tr><td><b>P${p.pid}</b></td><td>${esc(p.name)}</td><td>${p.rem} / ${p.cpu} đv</td><td>${p.pr}</td><td>${p.wt} đv</td></tr>`).join('') : '<tr><td colspan="5" class="mu">Không có tiến trình nào trong trạng thái này.</td></tr>') +
                    `</tbody></table></div></div>`;
            });
        }

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && S.pop !== null) stPopClose();
        });


