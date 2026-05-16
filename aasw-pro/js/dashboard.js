document.addEventListener('DOMContentLoaded', () => {

    // ─── 1. Sidebar / Navigation Tab Switching ─────────────────────────────
    const navLinks = document.querySelectorAll('.sidebar .nav-link, #sidebar .nav-link');
    const viewSections = document.querySelectorAll('.view-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('data-target');
            if (!targetId) return;
            e.preventDefault();

            // Active state on sidebar links
            navLinks.forEach(l => l.classList.remove('active-tab'));
            link.classList.add('active-tab');

            // Show / hide sections with animation
            viewSections.forEach(view => {
                if (view.id === 'view-' + targetId) {
                    view.style.display = 'block';
                    view.style.opacity = '0';
                    // Trigger reflow so animation replays
                    void view.offsetWidth;
                    view.style.animation = 'fadeSlideIn 0.35s ease forwards';
                } else {
                    view.style.display = 'none';
                    view.style.animation = 'none';
                }
            });

            // Close mobile sidebar after navigation
            if (window.innerWidth < 1024) {
                if (typeof closeSidebar === 'function') closeSidebar();
            }
        });
    });

    // ─── 2. Logout Buttons ─────────────────────────────────────────────────
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('adminAuth');
            localStorage.removeItem('adminAuth');
            window.location.href = '/';
        });
    });

    // ─── 3. API Health Check ────────────────────────────────────────────────
    const checkApiHealth = async () => {
        const statusText = document.getElementById('apiStatusText');
        const uptimeText = document.getElementById('apiUptimeText');
        const statusIcon = document.getElementById('apiStatusIcon');

        try {
            await new Promise(r => setTimeout(r, 600));
            const res = await fetch('/api/v1/health', { credentials: 'include' });
            const data = await res.json();

            if (data.success && data.data.status === 'active') {
                statusText.textContent = "Online & Healthy";

                const uptimeSecs = data.data.uptime;
                const hours   = Math.floor(uptimeSecs / 3600);
                const minutes = Math.floor((uptimeSecs % 3600) / 60);
                const secs    = Math.floor(uptimeSecs % 60);

                uptimeText.innerHTML = `<span class="material-symbols-outlined text-sm">check_circle</span> Uptime: ${hours > 0 ? hours + 'h ' : ''}${minutes}m ${secs}s`;
                uptimeText.className = 'text-[#81ecff] text-xs mt-2 flex items-center gap-1';

            } else {
                throw new Error('Bad response');
            }
        } catch (err) {
            console.warn('API Health check failed:', err);
            if (statusText) statusText.textContent = 'Server Offline';
            if (statusIcon) statusIcon.style.color = '#ff6e84';
            if (uptimeText) {
                uptimeText.innerHTML = `<span class="material-symbols-outlined text-sm">cancel</span> Connection failed`;
                uptimeText.className = 'text-[#ff6e84] text-xs mt-2 flex items-center gap-1';
            }
        }
    };
    checkApiHealth();

    // ─── 4. Animated Server Performance Bars ───────────────────────────────
    const barsContainer = document.getElementById('serverBars');
    if (barsContainer) {
        const heights = [40, 55, 30, 65, 80, 45, 60, 90, 75, 50, 35, 85, 60, 70, 50, 40, 65, 80, 55, 45];
        heights.forEach((h, i) => {
            const bar = document.createElement('div');
            const isHighlight = h >= 80;
            bar.className = `flex-1 rounded-t transition-all duration-700`;
            bar.style.height = `${h}%`;
            bar.style.background = isHighlight
                ? 'linear-gradient(to top, rgba(148,170,255,0.2), rgba(148,170,255,0.5))'
                : 'rgba(255,255,255,0.06)';
            bar.style.animationDelay = `${i * 40}ms`;
            barsContainer.appendChild(bar);
        });
    }

    // ─── 5. Dashboard Stats ─────────────────────────────────────────────────
    const escHtml = (s) => (s || '').toString()
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

    const renderDate = (dstr) => {
        if (!dstr) return '—';
        const d = new Date(dstr);
        return isNaN(d) ? dstr : d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const fetchDashboardStats = async () => {
        try {
            const res    = await fetch('/admin/api/stats', { credentials: 'include' });
            const result = await res.json();

            if (result.success && result.data) {
                const data = result.data;

                // KPI values
                document.getElementById('valVisitors').textContent    = (data.overview.totalVisitors    || 0).toLocaleString('en-IN');
                document.getElementById('valMessages').textContent    = (data.overview.totalContacts    || 0).toLocaleString('en-IN');
                document.getElementById('valSubscribers').textContent = (data.overview.totalSubscribers || 0).toLocaleString('en-IN');
                const valMem = document.getElementById('valMemberships');
                if (valMem) valMem.textContent = (data.overview.totalMemberships || 0).toLocaleString('en-IN');

                // ── Recent Messages (Overview) ──
                const recentTbody = document.getElementById('recentMessagesTbody');
                if (recentTbody) {
                    if (data.recentContacts && data.recentContacts.length > 0) {
                        recentTbody.innerHTML = '';
                        data.recentContacts.forEach(msg => {
                            const initials = (msg.name || 'U').substring(0, 2).toUpperCase();
                            const colorClass = ['text-[#94aaff]', 'text-[#cb7bff]', 'text-[#81ecff]', 'text-[#fbbf24]'][Math.floor(Math.random() * 4)];
                            recentTbody.insertAdjacentHTML('beforeend', `
                                <tr class="hover:bg-white/[0.02] transition-colors">
                                    <td class="px-7 py-4">
                                        <div class="flex items-center gap-3">
                                            <div class="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold ${colorClass}">${escHtml(initials)}</div>
                                            <span class="text-sm font-semibold text-white">${escHtml(msg.name)}</span>
                                        </div>
                                    </td>
                                    <td class="px-7 py-4 text-sm text-white/60">${escHtml(msg.email)}</td>
                                    <td class="px-7 py-4 text-sm text-white/70 max-w-[180px] truncate">${escHtml(msg.subject)}</td>
                                    <td class="px-7 py-4 text-xs text-white/40 text-right">${renderDate(msg.submittedAt || msg.date)}</td>
                                </tr>
                            `);
                        });
                    } else {
                        recentTbody.innerHTML = '<tr><td colspan="4" class="px-7 py-8 text-center text-white/30 text-sm">No recent messages found</td></tr>';
                    }
                }

                // ── All Messages tab ──
                const allMsgsTbody = document.getElementById('allMessagesTbody');
                if (allMsgsTbody) {
                    if (data.allContacts && data.allContacts.length > 0) {
                        allMsgsTbody.innerHTML = '';
                        data.allContacts.forEach(msg => {
                            allMsgsTbody.insertAdjacentHTML('beforeend', `
                                <tr class="hover:bg-white/[0.02] transition-colors">
                                    <td class="px-7 py-4 text-sm font-semibold text-white">${escHtml(msg.name)}</td>
                                    <td class="px-7 py-4 text-sm text-white/60">${escHtml(msg.email)}</td>
                                    <td class="px-7 py-4 text-sm text-white/70">${escHtml(msg.subject)}</td>
                                    <td class="px-7 py-4 text-sm text-white/50 max-w-[220px] truncate" title="${escHtml(msg.message)}">${escHtml(msg.message)}</td>
                                    <td class="px-7 py-4 text-xs text-white/40">${renderDate(msg.submittedAt || msg.date)}</td>
                                </tr>
                            `);
                        });
                    } else {
                        allMsgsTbody.innerHTML = '<tr><td colspan="5" class="px-7 py-8 text-center text-white/30 text-sm">No messages available</td></tr>';
                    }
                }

                // ── All Users / Subscribers tab ──
                const allUsersTbody = document.getElementById('allUsersTbody');
                if (allUsersTbody) {
                    if (data.allSubscribers && data.allSubscribers.length > 0) {
                        allUsersTbody.innerHTML = '';
                        data.allSubscribers.forEach(sub => {
                            allUsersTbody.insertAdjacentHTML('beforeend', `
                                <tr class="hover:bg-white/[0.02] transition-colors">
                                    <td class="px-7 py-4 text-sm font-semibold text-white">${escHtml(sub.email)}</td>
                                    <td class="px-7 py-4 text-xs text-white/40">${renderDate(sub.subscribedAt || sub.date)}</td>
                                </tr>
                            `);
                        });
                    } else {
                        allUsersTbody.innerHTML = '<tr><td colspan="2" class="px-7 py-8 text-center text-white/30 text-sm">No subscribers available</td></tr>';
                    }
                }

                // ── Memberships tab ──
                const allMembershipsTbody = document.getElementById('allMembershipsTbody');
                if (allMembershipsTbody) {
                    if (data.allMemberships && data.allMemberships.length > 0) {
                        allMembershipsTbody.innerHTML = '';
                        data.allMemberships.forEach(mem => {
                            allMembershipsTbody.insertAdjacentHTML('beforeend', `
                                <tr class="hover:bg-white/[0.02] transition-colors">
                                    <td class="px-7 py-4 font-mono text-[11px] text-white/50">${escHtml(mem.id)}</td>
                                    <td class="px-7 py-4 text-sm font-semibold text-white">${escHtml(mem.email)}</td>
                                    <td class="px-7 py-4"><span class="px-3 py-1 rounded-full bg-[#94aaff]/10 text-[#94aaff] text-[10px] font-bold uppercase tracking-wider">${escHtml(mem.planName)}</span></td>
                                    <td class="px-7 py-4 text-sm font-bold text-[#10b981]">₹${mem.amount}</td>
                                    <td class="px-7 py-4 font-mono text-[11px] text-white/50">${escHtml(mem.txnId)}</td>
                                    <td class="px-7 py-4 text-xs text-white/40">${renderDate(mem.date)}</td>
                                </tr>
                            `);
                        });
                    } else {
                        allMembershipsTbody.innerHTML = '<tr><td colspan="6" class="px-7 py-8 text-center text-white/30 text-sm">No memberships available</td></tr>';
                    }
                }
            }
        } catch (err) {
            console.warn('Failed to fetch dashboard stats', err);
            const errHtml = '<tr><td colspan="6" class="px-7 py-8 text-center text-[#ff6e84] text-sm">Failed to load data</td></tr>';
            ['recentMessagesTbody', 'allMessagesTbody', 'allUsersTbody', 'allMembershipsTbody'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerHTML = errHtml;
            });
        }
    };
    fetchDashboardStats();

    // ─── 6. Region Impact Doughnut Chart ────────────────────────────────────
    const ctxRegion = document.getElementById('regionChart');
    if (ctxRegion) {
        Chart.defaults.color = '#adaaab';
        Chart.defaults.font.family = "'Manrope', sans-serif";
        new Chart(ctxRegion, {
            type: 'doughnut',
            data: {
                labels: ['Rajasthan', 'Madhya Pradesh', 'Haryana', 'Uttar Pradesh'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: ['#94aaff', '#cb7bff', '#81ecff', '#fbbf24'],
                    borderWidth: 0,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '72%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#adaaab',
                            padding: 16,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: { size: 11, family: "'Space Grotesk', sans-serif" }
                        }
                    }
                }
            }
        });
    }

});
