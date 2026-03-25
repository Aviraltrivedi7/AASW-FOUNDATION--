document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Sidebar Toggle Logic ---
    const mobileToggle = document.getElementById('mobileToggle');
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');

    const toggleSidebar = () => {
        sidebar.classList.toggle('active');
    };

    if(mobileToggle) mobileToggle.addEventListener('click', toggleSidebar);
    if(menuBtn) menuBtn.addEventListener('click', toggleSidebar);

    // --- 2. Fetch API Health ---
    const checkApiHealth = async () => {
        const statusText = document.getElementById('apiStatusText');
        const uptimeText = document.getElementById('apiUptimeText');
        const statusIcon = document.getElementById('apiStatusIcon');

        try {
            // Give it a tiny delay just for a nice visual loading effect
            await new Promise(r => setTimeout(r, 600)); 

            const res = await fetch('/api/v1/health');
            const data = await res.json();

            if (data.success && data.data.status === 'active') {
                statusText.textContent = "Online & Healthy";
                
                // Format uptime (seconds to hours/mins)
                const uptimeSecs = data.data.uptime;
                const hours = Math.floor(uptimeSecs / 3600);
                const minutes = Math.floor((uptimeSecs % 3600) / 60);
                
                if (hours > 0) {
                    uptimeText.innerHTML = `<i data-lucide="check-circle"></i> Uptime: ${hours}h ${minutes}m`;
                } else {
                    uptimeText.innerHTML = `<i data-lucide="check-circle"></i> Uptime: ${minutes}m ${Math.floor(uptimeSecs % 60)}s`;
                }
                uptimeText.className = "kpi-trend positive";

            } else {
                throw new Error("Invalid response");
            }

        } catch (err) {
            console.error(err);
            statusText.textContent = "Server Offline";
            statusIcon.className = "kpi-icon i-red";
            uptimeText.innerHTML = `<i data-lucide="x-circle"></i> Connection failed`;
            uptimeText.className = "kpi-trend negative";
        }
        
        // Re-init lucide icons for new injected HTML
        lucide.createIcons();
    };

    checkApiHealth();
    
    // Initial icon render
    lucide.createIcons();


    // --- 3. Initialize Charts (Chart.js) ---
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Outfit', sans-serif";

    // Common premium chart options
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true,
                    boxWidth: 8
                }
            }
        },
        scales: {
            x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' } }
        }
    };

    // --- 3. Tab Switching Logic ---
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    const viewSections = document.querySelectorAll('.view-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('data-target');
            if (!targetId || targetId === 'logout') return;
            
            e.preventDefault();
            
            // Update active nav state
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            link.parentElement.classList.add('active');
            
            // Show target view, hide others
            viewSections.forEach(view => {
                if (view.id === 'view-' + targetId) {
                    view.style.display = 'block';
                    // small animation effect
                    view.style.opacity = '0';
                    view.style.animation = 'fadeIn 0.4s ease forwards';
                } else {
                    view.style.display = 'none';
                    view.style.animation = 'none';
                }
            });
            
            // on mobile, close sidebar after clicking a nav item
            if(window.innerWidth <= 768 && sidebar.classList.contains('active')) {
                toggleSidebar();
            }
        });
    });

    // --- Logout Logic ---
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('adminAuth');
            localStorage.removeItem('adminAuth');
            window.location.href = '/';
        });
    });

    // --- 4. Fetch Dashboard Stats ---
    const fetchDashboardStats = async () => {
        try {
            const res = await fetch('/admin/api/stats');
            const result = await res.json();
            
            if (result.success && result.data) {
                const data = result.data;
                
                // Update KPI Cards
                document.getElementById('valVisitors').textContent = (data.overview.totalVisitors || 0).toLocaleString('en-IN');
                document.getElementById('valMessages').textContent = (data.overview.totalContacts || 0).toLocaleString('en-IN');
                document.getElementById('valSubscribers').textContent = (data.overview.totalSubscribers || 0).toLocaleString('en-IN');
                if (document.getElementById('valMemberships')) {
                    document.getElementById('valMemberships').textContent = (data.overview.totalMemberships || 0).toLocaleString('en-IN');
                }
                
                // --- Helper function for dates ---
                const renderDate = (dstr) => {
                    const d = new Date(dstr);
                    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
                };

                // Provide a safe escape function
                const escapeHtml = (unsafe) => {
                    return (unsafe || '').toString()
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;")
                        .replace(/'/g, "&#039;");
                };

                // --- Update Recent Messages Table (Overview Tab) ---
                const recentTbody = document.getElementById('recentMessagesTbody');
                if (data.recentContacts && data.recentContacts.length > 0) {
                    recentTbody.innerHTML = '';
                    data.recentContacts.forEach(msg => {
                        const tr = document.createElement('tr');
                        let initials = (msg.name || 'U').substring(0, 2).toUpperCase();
                        tr.innerHTML = `
                            <td>
                                <div class="table-user">
                                    <div class="tu-avatar">${escapeHtml(initials)}</div>
                                    <span>${escapeHtml(msg.name)}</span>
                                </div>
                            </td>
                            <td>${escapeHtml(msg.email)}</td>
                            <td>${escapeHtml(msg.subject)}</td>
                            <td>${renderDate(msg.date)}</td>
                        `;
                        recentTbody.appendChild(tr);
                    });
                } else {
                    recentTbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem;">No recent messages found</td></tr>';
                }
                
                // --- Update FULL Messages Table (Messages Tab) ---
                const allMsgsTbody = document.getElementById('allMessagesTbody');
                if (data.allContacts && data.allContacts.length > 0) {
                    allMsgsTbody.innerHTML = '';
                    data.allContacts.forEach(msg => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td><strong>${escapeHtml(msg.name)}</strong></td>
                            <td>${escapeHtml(msg.email)}</td>
                            <td>${escapeHtml(msg.subject)}</td>
                            <td><div style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(msg.message)}">${escapeHtml(msg.message)}</div></td>
                            <td>${renderDate(msg.date)}</td>
                        `;
                        allMsgsTbody.appendChild(tr);
                    });
                } else {
                    allMsgsTbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem;">No messages available</td></tr>';
                }

                // --- Update FULL Users Table (Users Tab) ---
                const allUsersTbody = document.getElementById('allUsersTbody');
                if (data.allSubscribers && data.allSubscribers.length > 0) {
                    allUsersTbody.innerHTML = '';
                    data.allSubscribers.forEach(sub => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td><strong>${escapeHtml(sub.email)}</strong></td>
                            <td>${renderDate(sub.date)}</td>
                        `;
                        allUsersTbody.appendChild(tr);
                    });
                } else {
                    allUsersTbody.innerHTML = '<tr><td colspan="2" style="text-align:center; padding: 2rem;">No subscribers available</td></tr>';
                }
                
                // --- Update FULL Memberships Table (Memberships Tab) ---
                const allMembershipsTbody = document.getElementById('allMembershipsTbody');
                if (allMembershipsTbody) {
                    if (data.allMemberships && data.allMemberships.length > 0) {
                        allMembershipsTbody.innerHTML = '';
                        data.allMemberships.forEach(mem => {
                            const tr = document.createElement('tr');
                            tr.innerHTML = `
                                <td style="font-family: monospace;">${escapeHtml(mem.id)}</td>
                                <td><strong>${escapeHtml(mem.email)}</strong></td>
                                <td><span style="background:#e8f0fe; color:#1a73e8; padding:4px 8px; border-radius:12px; font-size:0.8rem; font-weight:600;">${escapeHtml(mem.planName)}</span></td>
                                <td style="font-weight:700; color:#10b981;">₹${mem.amount}</td>
                                <td style="font-family: monospace;">${escapeHtml(mem.txnId)}</td>
                                <td>${renderDate(mem.date)}</td>
                            `;
                            allMembershipsTbody.appendChild(tr);
                        });
                    } else {
                        allMembershipsTbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem;">No memberships available</td></tr>';
                    }
                }
                
            }
        } catch (err) {
            console.error("Failed to fetch dashboard stats", err);
            const errHtml = '<tr><td colspan="5" style="text-align:center; padding: 2rem; color: #ef4444;">Failed to load data</td></tr>';
            document.getElementById('recentMessagesTbody').innerHTML = errHtml;
            document.getElementById('allMessagesTbody').innerHTML = errHtml;
            document.getElementById('allUsersTbody').innerHTML = errHtml;
            if (document.getElementById('allMembershipsTbody')) {
                document.getElementById('allMembershipsTbody').innerHTML = errHtml;
            }
        }
    };
    
    fetchDashboardStats();

    // Region Impact Chart (Doughnut)
    const ctxRegion = document.getElementById('regionChart');
    if (ctxRegion) {
        new Chart(ctxRegion, {
            type: 'doughnut',
            data: {
                labels: ['Rajasthan', 'Madhya Pradesh', 'Haryana', 'Uttar Pradesh'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: [
                        '#8b5cf6', // Purple
                        '#3b82f6', // Blue
                        '#10b981', // Green
                        '#fbbf24'  // Gold
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%', // Make it thin and highly premium looking
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#e2e8f0',
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    }
                }
            }
        });
    }

});
