        // ---- Trang Liên hệ ----
        // Nếu website và backend nằm khác tên miền, đổi thành URL đầy đủ, ví dụ 'https://ten-du-an.vercel.app/api/contact'
        const CONTACT_API_URL = '/api/contact';
        const CT_COOLDOWN_MS = 30000;
        const CT_TOPICS = ['Góp ý cải tiến giao diện', 'Báo lỗi / sự cố', 'Đề xuất tính năng mới', 'Câu hỏi về thuật toán', 'Khác'];
        const CT_ALGOS = ['Tất cả các thuật toán', 'FCFS', 'SJF', 'SRTF', 'Priority', 'Round Robin', 'Multilevel Queue', 'Multilevel Feedback Queue'];
        const CT_FIELDS = ['name', 'email', 'topic', 'algo', 'subject', 'message'];
        let ctRenderedAt = Date.now(), ctSending = false, ctLast = 0;

        function ctValidate(v) {
            const e = {};
            const name = (v.name || '').trim(), email = (v.email || '').trim();
            const subject = (v.subject || '').trim(), message = (v.message || '').trim();
            if (!name) e.name = 'Vui lòng nhập họ và tên.';
            else if (name.length < 2) e.name = 'Họ và tên cần tối thiểu 2 ký tự.';
            else if (name.length > 80) e.name = 'Họ và tên tối đa 80 ký tự.';
            if (!email) e.email = 'Vui lòng nhập địa chỉ email.';
            else if (email.length > 254 || !/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[^\s@.]{2,}$/.test(email)) e.email = 'Địa chỉ email không hợp lệ (ví dụ: ten@example.com).';
            if (!CT_TOPICS.includes(v.topic)) e.topic = 'Vui lòng chọn chủ đề hợp lệ.';
            if (!CT_ALGOS.includes(v.algo)) e.algo = 'Vui lòng chọn thuật toán hợp lệ.';
            if (!subject) e.subject = 'Vui lòng nhập tiêu đề.';
            else if (subject.length < 3) e.subject = 'Tiêu đề cần tối thiểu 3 ký tự.';
            else if (subject.length > 150) e.subject = 'Tiêu đề tối đa 150 ký tự.';
            if (!message) e.message = 'Vui lòng nhập nội dung góp ý.';
            else if (message.length < 10) e.message = 'Nội dung cần tối thiểu 10 ký tự để chúng tôi hiểu rõ ý bạn.';
            else if (message.length > 3000) e.message = 'Nội dung tối đa 3000 ký tự.';
            return e;
        }

        function ctStatus(text, kind) {
            const st = $('#contactMsg');
            if (!st) return;
            st.textContent = text || '';
            st.className = 'ct-status' + (kind ? ' ' + kind : '');
        }

        function ctShowErrors(f, errs) {
            CT_FIELDS.forEach(k => {
                const el = f.elements[k], m = $('#ce-' + k);
                if (m) m.textContent = errs[k] || '';
                if (el) {
                    el.classList.toggle('bad', !!errs[k]);
                    if (errs[k]) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
                }
            });
            const first = CT_FIELDS.find(k => errs[k]);
            if (first && f.elements[first]) f.elements[first].focus();
        }

        function ctInput(el) {
            if (!el || !el.name) return;
            el.classList.remove('bad');
            el.removeAttribute('aria-invalid');
            const m = $('#ce-' + el.name);
            if (m) m.textContent = '';
            if (el.name === 'message') {
                const c = $('#ct-count');
                if (c) c.textContent = el.value.length + '/3000';
            }
        }

        async function handleContactSubmit(e) {
            e.preventDefault();
            if (ctSending) return false;
            const f = e.target;
            const btn = $('#btnContactSubmit');
            const v = {};
            CT_FIELDS.forEach(k => { v[k] = f.elements[k] ? f.elements[k].value : ''; });

            const errs = ctValidate(v);
            ctShowErrors(f, errs);
            if (Object.keys(errs).length) {
                ctStatus('Vui lòng kiểm tra lại các trường được đánh dấu. Email chưa được gửi.', 'err');
                return false;
            }
            const wait = Math.ceil((CT_COOLDOWN_MS - (Date.now() - ctLast)) / 1000);
            if (ctLast && wait > 0) {
                ctStatus(`Bạn vừa gửi liên hệ. Vui lòng đợi ${wait} giây trước khi gửi thư tiếp theo.`, 'err');
                return false;
            }

            ctSending = true;
            ctStatus('Đang gửi email, vui lòng chờ trong giây lát...', '');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<span class="spin" aria-hidden="true"></span> Đang gửi...';
            }
            const ac = new AbortController();
            const to = setTimeout(() => ac.abort(), 20000);
            try {
                const res = await fetch(CONTACT_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: v.name.trim(), email: v.email.trim(), topic: v.topic, algo: v.algo,
                        subject: v.subject.trim(), message: v.message.trim(),
                        website: f.elements.website ? f.elements.website.value : '',
                        elapsed: Date.now() - ctRenderedAt
                    }),
                    signal: ac.signal
                });
                let data = null;
                try { data = await res.json(); } catch (_) { }
                if (res.ok && data && data.ok === true) {
                    ctLast = Date.now();
                    const cf = $('#contactForm');
                    if (cf) {
                        cf.reset();
                        ctShowErrors(cf, {});
                        const c = $('#ct-count');
                        if (c) c.textContent = '0/3000';
                    }
                    ctRenderedAt = Date.now();
                    ctStatus('Cảm ơn bạn! Email đã được gửi thành công. Chúng tôi sẽ phản hồi qua địa chỉ email bạn đã cung cấp.', 'ok');
                } else if (res.status === 400 && data && data.errors) {
                    const cf = $('#contactForm');
                    if (cf) ctShowErrors(cf, data.errors);
                    ctStatus('Máy chủ từ chối dữ liệu chưa hợp lệ. Email chưa được gửi.', 'err');
                } else if (res.status === 429) {
                    ctStatus((data && data.message) || 'Bạn đã gửi quá nhiều yêu cầu. Email chưa được gửi, vui lòng thử lại sau ít phút.', 'err');
                } else {
                    ctStatus('Không thể gửi email lúc này nên thư CHƯA được gửi. Vui lòng thử lại sau hoặc liên hệ trực tiếp qua email của nhóm.', 'err');
                }
            } catch (err) {
                ctStatus(err && err.name === 'AbortError'
                    ? 'Máy chủ phản hồi quá chậm. Email chưa được gửi, vui lòng thử lại.'
                    : 'Không kết nối được tới máy chủ gửi email (kiểm tra kết nối mạng hoặc cấu hình backend). Email chưa được gửi.', 'err');
            } finally {
                clearTimeout(to);
                ctSending = false;
                const b2 = $('#btnContactSubmit');
                if (b2) { b2.disabled = false; b2.textContent = 'Gửi liên hệ'; }
            }
            return false;
        }


