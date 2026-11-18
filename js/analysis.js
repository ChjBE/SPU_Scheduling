        // ---- Phân tích kết quả mô phỏng  ----
        function analysisHTML(r, rows) {
            const m = r.m, n = m.length, T = r.T;
            if (!n || !T) return '';
            const f1 = x => (Math.round(x * 10) / 10).toString().replace('.', ',');
            const avgCpu = m.reduce((a, x) => a + x.cpu, 0) / n;
            const maxCpu = Math.max(...m.map(x => x.cpu)), minCpu = Math.min(...m.map(x => x.cpu));
            const nIo = m.filter(x => x.io > 0).length;
            const minAt = Math.min(...m.map(x => x.at));
            const prs = new Set(m.map(x => x.pr)).size;
            const cur = rows.find(x => x.id === S.algo) || rows[0];
            const lv = (v, a, b) => v < a ? 'ok' : v < b ? 'warn' : 'bad';
            const tag = { ok: 'Tốt', warn: 'Cần lưu ý', bad: 'Cần cải thiện' };
            const items = [];

            // 1. Hiệu suất CPU
            {
                const u = r.u, csP = r.csT / T * 100, idle = Math.max(0, 100 - u - csP);
                const st = u >= 85 ? 'ok' : u >= 60 ? 'warn' : 'bad';
                const li = [];
                li.push(idle < 5 ? 'CPU gần như luôn có việc: thời gian còn lại chủ yếu là thực thi và chuyển ngữ cảnh.' : `CPU có khoảng ${f1(idle)}% thời gian không có tiến trình nào để chạy.`);
                if (idle >= 10) {
                    if (minAt > 0) li.push(`Tiến trình đầu tiên chỉ đến ở t = ${minAt}, nên CPU nhàn rỗi trong giai đoạn đầu.`);
                    if (nIo > 0) li.push(`${nIo}/${n} tiến trình có I/O; khi tất cả cùng chờ I/O thì CPU bị bỏ trống. Có thể tăng mức đa chương trình bằng cách bổ sung tiến trình thiên về CPU.`);
                    if (minAt === 0 && nIo === 0) li.push('Khoảng trống chủ yếu đến từ các khoảng chờ giữa thời điểm đến của các tiến trình.');
                }
                if (r.csT > 0) li.push(`Thời gian chuyển ngữ cảnh chiếm ${f1(csP)}% tổng thời gian mô phỏng (không tính là thực thi hữu ích).`);
                items.push({ t: '1. Hiệu suất CPU', q: 'CPU hoạt động hiệu quả hay có nhiều khoảng nhàn rỗi?', st, m: `Thực thi ${f1(u)}% · chuyển ngữ cảnh ${f1(csP)}% · nhàn rỗi ${f1(idle)}% (trong ${T} đv)`, li });
            }

            // 2. Thời gian chờ
            {
                const w = m.reduce((a, x) => x.wt > a.wt ? x : a, m[0]);
                const ratio = r.wt / Math.max(avgCpu, 1e-9);
                let st = ratio < 0.5 ? 'ok' : ratio < 1.2 ? 'warn' : 'bad';
                const li = [`Tiến trình chờ lâu nhất: P${w.pid} (${esc(w.name)}) chờ ${w.wt} đv, CPU Burst ${w.cpu}, độ ưu tiên ${w.pr}.`];
                li.push(`Chờ trung bình ${f1(r.wt)} đv, bằng ${f1(ratio)} lần CPU Burst trung bình (${f1(avgCpu)} đv) → ${st === 'ok' ? 'ở mức thấp.' : st === 'warn' ? 'ở mức trung bình.' : 'ở mức cao.'}`);
                if (n >= 3 && w.wt >= 2.5 * Math.max(r.wt, 1) && w.wt >= 5) {
                    li.push(`Cảnh báo: thời gian chờ của P${w.pid} gấp ${f1(w.wt / Math.max(r.wt, 1))} lần mức trung bình — dấu hiệu bất công bằng hoặc nguy cơ Starvation.`);
                    if (st === 'ok') st = 'warn';
                }
                items.push({ t: '2. Thời gian chờ', q: 'Tiến trình nào chờ lâu nhất? Thời gian chờ trung bình có cao không?', st, m: `Chờ TB ${f1(r.wt)} đv · lớn nhất ${w.wt} đv (P${w.pid})`, li });
            }

            // 3. Khả năng phản hồi
            {
                const w = m.reduce((a, x) => x.rt > a.rt ? x : a, m[0]);
                const now = m.filter(x => x.rt === 0).length;
                const ratio = r.rt / Math.max(avgCpu, 1e-9);
                const st = ratio <= 0.5 ? 'ok' : ratio <= 1.5 ? 'warn' : 'bad';
                const li = [`${now}/${n} tiến trình được cấp CPU ngay khi đến (Response = 0).`,
                `Phản hồi chậm nhất: P${w.pid} (${esc(w.name)}) phải đợi ${w.rt} đv mới chạy lần đầu.`,
                st === 'ok' ? 'Các tiến trình được phục vụ kịp thời, phù hợp với tác vụ tương tác.' : st === 'warn' ? 'Mức phản hồi chấp nhận được nhưng một số tiến trình phải đợi khá lâu.' : 'Phản hồi chậm so với độ dài tác vụ; tiến trình tương tác sẽ có cảm giác bị "đứng".'];
                items.push({ t: '3. Khả năng phản hồi', q: 'Các tiến trình có được CPU phục vụ kịp thời không?', st, m: `Phản hồi TB ${f1(r.rt)} đv · lớn nhất ${w.rt} đv (P${w.pid})`, li });
            }

            // 4. Chuyển đổi ngữ cảnh
            {
                const ovh = r.csT / T * 100;
                const st = lv(ovh, 5, 15);
                const minCs = rows.reduce((a, x) => x.r.cs < a.r.cs ? x : a, rows[0]);
                const li = [`${r.cs} lần chuyển ngữ cảnh cho ${n} tiến trình (≈ ${f1(r.cs / n)} lần/tiến trình), tiêu tốn ${r.csT} đv = ${f1(ovh)}% tổng thời gian.`];
                if (S.cs === 0) li.push('Chi phí chuyển ngữ cảnh đang đặt = 0 nên overhead lý thuyết bằng 0; số lần chuyển vẫn phản ánh mức độ ngắt tiến trình.');
                else li.push(st === 'ok' ? 'Overhead nhỏ, không ảnh hưởng đáng kể đến hiệu suất.' : st === 'warn' ? 'Overhead đáng kể; cân nhắc tăng Time Quantum hoặc dùng thuật toán ít ngắt hơn.' : 'Overhead lớn, CPU mất nhiều thời gian cho việc chuyển đổi thay vì xử lý; nên tăng Time Quantum hoặc dùng thuật toán không ngắt.');
                if (minCs.id !== S.algo && minCs.r.cs < r.cs) li.push(`Ít chuyển ngữ cảnh nhất trên tập này: ${NM[minCs.id]} (${minCs.r.cs} lần).`);
                items.push({ t: '4. Chuyển đổi ngữ cảnh', q: 'Số lần chuyển nhiều hay ít, có gây overhead đáng kể không?', st, m: `${r.cs} lần · overhead ${f1(ovh)}%`, li });
            }

            // 5. Đánh giá thuật toán
            {
                const best = rows.reduce((a, x) => x.r.wt < a.r.wt - 1e-9 ? x : a, rows[0]);
                const bestRt = rows.reduce((a, x) => x.r.rt < a.r.rt - 1e-9 ? x : a, rows[0]);
                const bestU = rows.reduce((a, x) => x.r.u > a.r.u + 1e-9 ? x : a, rows[0]);
                const rank = 1 + rows.filter(x => x.r.wt < cur.r.wt - 1e-9).length;
                const gap = best.r.wt > 0 ? (cur.r.wt - best.r.wt) / best.r.wt * 100 : (cur.r.wt > 0 ? 100 : 0);
                const st = (gap <= 10 || rank <= 2) ? 'ok' : rank <= 4 ? 'warn' : 'bad';
                const li = [`Đặc điểm tập tiến trình: ${n} tiến trình, CPU Burst từ ${minCpu} đến ${maxCpu} (TB ${f1(avgCpu)}), ${nIo} tiến trình có I/O, ${prs} mức ưu tiên khác nhau${minAt === Math.max(...m.map(x => x.at)) ? ', đến cùng thời điểm' : ''}.`];
                li.push(`${NM[S.algo]} xếp hạng ${rank}/${rows.length} về thời gian chờ trung bình` + (rank === 1 ? ' (tốt nhất trong các thuật toán).' : `; thuật toán tốt nhất là ${NM[best.id]} (${f1(best.r.wt)} đv, giảm được ${f1(cur.r.wt > 0 ? (cur.r.wt - best.r.wt) / cur.r.wt * 100 : 0)}% thời gian chờ).`));
                if (bestRt.id !== best.id) li.push(`Về phản hồi, ${NM[bestRt.id]} tốt nhất (${f1(bestRt.r.rt)} đv).`);
                if (bestU.id !== S.algo && bestU.r.u - cur.r.u >= 1) li.push(`Về hiệu suất CPU, ${NM[bestU.id]} đạt cao nhất (${f1(bestU.r.u)}%).`);
                const nt = [];
                const lastFirst = m.slice().sort((a, b) => a.at - b.at || a.pid - b.pid)[0];
                if (S.algo === 'FCFS' && lastFirst.cpu >= avgCpu * 1.5 && n >= 3) nt.push('Tiến trình dài đến sớm khiến các tiến trình ngắn phải chờ (hiệu ứng đoàn tàu - Convoy Effect).');
                if ((S.algo === 'SJF' || S.algo === 'SRTF') && maxCpu >= 4 * Math.max(minCpu, 1) && n >= 3) nt.push('Chênh lệch CPU Burst lớn nên nhóm thuật toán ưu tiên việc ngắn rất phù hợp, nhưng tiến trình dài có nguy cơ bị chờ lâu.');
                if (S.algo === 'RR') nt.push(S.q > maxCpu ? `Time Quantum (${S.q}) lớn hơn mọi CPU Burst nên Round Robin thoái hóa thành FCFS.` : S.q < avgCpu / 3 ? `Time Quantum (${S.q}) quá nhỏ so với CPU Burst trung bình (${f1(avgCpu)}) nên sinh nhiều chuyển ngữ cảnh.` : `Time Quantum (${S.q}) hợp lý so với CPU Burst trung bình (${f1(avgCpu)}).`);
                if (S.algo === 'PRIO' && prs === 1) nt.push('Tất cả tiến trình cùng độ ưu tiên nên Priority không phát huy tác dụng (hoạt động như FCFS).');
                if (S.algo === 'PRIO' && prs > 1) nt.push('Priority phù hợp khi độ ưu tiên phản ánh đúng mức khẩn cấp; hãy theo dõi tiến trình ưu tiên thấp (nguy cơ Starvation, có thể bật Aging).');
                if ((S.algo === 'MLQ' || S.algo === 'MLFQ') && n < 4) nt.push('Số tiến trình ít nên lợi thế của hàng đợi đa cấp chưa thể hiện rõ.');
                if (nIo > 0 && (S.algo === 'FCFS' || S.algo === 'SJF')) nt.push('Có tiến trình I/O nhưng thuật toán không ngắt có thể làm CPU chờ lâu; thuật toán có ngắt thường tận dụng CPU tốt hơn.');
                nt.forEach(x => li.push(x));
                li.push(st === 'ok' ? `Kết luận: ${NM[S.algo]} phù hợp với tập tiến trình hiện tại.` : st === 'warn' ? `Kết luận: ${NM[S.algo]} dùng được nhưng chưa tối ưu; nên thử ${NM[best.id]}.` : `Kết luận: ${NM[S.algo]} chưa phù hợp với tập này; nên chuyển sang ${NM[best.id]}.`);
                items.push({ t: '5. Đánh giá thuật toán', q: 'Thuật toán hiện tại có phù hợp với tập tiến trình đang mô phỏng không?', st, m: `${NM[S.algo]} · hạng ${rank}/${rows.length} về thời gian chờ`, li, wide: true });
            }

            const cnt = k => items.filter(x => x.st === k).length;
            const sum = `<b>Tóm tắt:</b> với <b>${NM[S.algo]}</b> trên ${n} tiến trình (tổng ${T} đv), ${cnt('ok')} tiêu chí đạt tốt, ${cnt('warn')} cần lưu ý, ${cnt('bad')} cần cải thiện.` +
                (cnt('warn') + cnt('bad') ? ' Chi tiết ở các mục bên dưới.' : ' Hệ thống vận hành ổn định trên tập dữ liệu này.');
            return `<div class="an-wrap"><div class="an-sum">${sum}</div><div class="an-grid">` +
                items.map(x => `<div class="an-item ${x.st}${x.wide ? ' wide' : ''}"><div class="an-h"><b>${x.t}</b><span class="an-badge">${tag[x.st]}</span></div><p class="an-q">${x.q}</p><p class="an-m">${x.m}</p><ul>${x.li.map(l => `<li>${l}</li>`).join('')}</ul></div>`).join('') +
                `</div><p class="mu" style="margin:0">Phân tích dựa trên toàn bộ lần chạy mô phỏng hiện tại (đến t = ${T}) và so sánh với 7 thuật toán trên cùng tập dữ liệu; ngưỡng đánh giá mang tính tham khảo cho mục đích học tập.</p></div>`;
        }

        function cmpT(rows) {
            if (!rows || !rows.length) return '';
            const f = (k, b) => Math[b === 'max' ? 'max' : 'min'](...rows.map(x => x.r[k])),
                c = (x, k, d, b) => `<td class="${x.r[k] === f(k, b) ? 'bst' : ''}">${x.r[k].toFixed(d)}</td>`;

            return `<div class="sc"><table><thead><tr><th>Thuật toán</th><th>Thời gian chờ TB</th><th>Quay vòng TB</th><th>Phản hồi TB</th><th>Thông lượng</th><th>Hiệu suất CPU</th><th>Chuyển ngữ cảnh</th><th>Chờ tối đa</th></tr></thead><tbody>` +
                rows.map(x => `<tr><td><b>${NM[x.id]}</b></td>${c(x, 'wt', 2)}${c(x, 'tat', 2)}${c(x, 'rt', 2)}${c(x, 'thr', 3, 'max')}${c(x, 'u', 1, 'max')}<td>${x.r.cs} lần</td><td>${x.r.mw} đv</td></tr>`).join('') +
                `</tbody></table></div><p class="mu" style="margin-top:8px">Ghi chú: Ô màu xanh lá nổi bật là giá trị tối ưu nhất giữa các thuật toán theo từng tiêu chí.</p>`;
        }


