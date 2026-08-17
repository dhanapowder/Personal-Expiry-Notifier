(function() {
            // ---------- DATA STORE (fully interactive) ----------
            let items = [
                { id: 1, name: 'Azithromycin', category: 'Medicine', expiry: '2025-12-12', reminderDays: 7, notes: 'after food', status: 'safe' },
                { id: 2, name: 'Milk packet', category: 'Food', expiry: '2025-02-22', reminderDays: 3, notes: '', status: 'soon' },
                { id: 3, name: 'Face cream', category: 'Cosmetic', expiry: '2024-01-01', reminderDays: 5, notes: 'keep cool', status: 'expired' },
                { id: 4, name: 'Aadhaar card', category: 'Personal Document', expiry: '2030-12-31', reminderDays: 30, notes: 'renewal', status: 'safe' },
                { id: 5, name: 'Vitamin C syrup', category: 'Medicine', expiry: '2025-03-01', reminderDays: 5, notes: '', status: 'soon' },
                { id: 6, name: 'Yogurt', category: 'Food', expiry: '2025-02-13', reminderDays: 2, notes: '', status: 'expired' },
            ];

            // helper to compute days left & status
            function refreshItemStatus() {
                const today = new Date();
                today.setHours(0,0,0,0);
                items.forEach(item => {
                    const exp = new Date(item.expiry + 'T00:00:00');
                    const diffTime = exp - today;
                    const diffDays = Math.ceil(diffTime / (1000*60*60*24));
                    if (diffDays < 0) item.status = 'expired';
                    else if (diffDays <= 7) item.status = 'soon';   // within 7 days = soon
                    else item.status = 'safe';
                });
            }
            refreshItemStatus();

            // stats calculation
            function getStats() {
                const total = items.length;
                const expired = items.filter(i => i.status === 'expired').length;
                const soon = items.filter(i => i.status === 'soon').length;
                const safe = items.filter(i => i.status === 'safe').length;
                return { total, expired, soon, safe };
            }

            // ----- RENDER FUNCTIONS FOR EACH PAGE -----
            function renderDashboard() {
                const stats = getStats();
                // also show items as cards
                let itemsHtml = '';
                items.forEach(item => {
                    const expDate = new Date(item.expiry + 'T00:00:00');
                    const today = new Date(); today.setHours(0,0,0,0);
                    const diffTime = expDate - today;
                    const diffDays = Math.ceil(diffTime / (1000*60*60*24));
                    const daysText = diffDays < 0 ? `expired ${-diffDays}d ago` : (diffDays === 0 ? 'expires today' : `${diffDays} days left`);
                    let badgeClass = 'green';
                    if (item.status === 'soon') badgeClass = 'yellow';
                    else if (item.status === 'expired') badgeClass = 'red';
                    
                    itemsHtml += `<div class="item-card">
                        <div class="item-header"><span class="item-title">${item.name}</span> <span class="badge ${badgeClass}">${item.status}</span></div>
                        <div class="item-detail"><i class="fas fa-tag"></i> ${item.category} · Exp: ${item.expiry}</div>
                        <div class="item-detail"><i class="fas fa-hourglass-half"></i> ${daysText}</div>
                        <div class="item-actions">
                            <i class="fas fa-edit" onclick="editItem(${item.id})"></i>
                            <i class="fas fa-trash-alt" onclick="deleteItem(${item.id})"></i>
                        </div>
                    </div>`;
                });

                return `
                    <div class="stats-grid">
                        <div class="stat-card"><div class="stat-left"><h4>Total items</h4><span class="number">${stats.total}</span></div><i class="fas fa-boxes stat-icon"></i></div>
                        <div class="stat-card"><div class="stat-left"><h4>Expiring soon</h4><span class="number" style="color:#b87c00;">${stats.soon}</span></div><i class="fas fa-exclamation-triangle stat-icon" style="color:#f3b33d;"></i></div>
                        <div class="stat-card"><div class="stat-left"><h4>Expired</h4><span class="number" style="color:#bc2c1e;">${stats.expired}</span></div><i class="fas fa-times-circle stat-icon" style="color:#bc2c1e;"></i></div>
                        <div class="stat-card"><div class="stat-left"><h4>Safe</h4><span class="number" style="color:#1f7042;">${stats.safe}</span></div><i class="fas fa-check-circle stat-icon" style="color:#1f7042;"></i></div>
                    </div>
                    <div class="section-header"><h2><i class="fas fa-box-open"></i> Your items</h2><span class="pointer" onclick="navigateTo('addItem')"><i class="fas fa-plus-circle" style="color:#22745a;"></i> Add new</span></div>
                    <div class="item-grid" id="itemGridContainer">${itemsHtml}</div>
                `;
            }

            function renderAddItem() {
                return `
                    <div class="section-header"><h2><i class="fas fa-plus-circle"></i> Add new item</h2></div>
                    <div class="form-card">
                        <div class="form-row"><label>Name</label><input class="form-control" id="itemName" placeholder="e.g. Paracetamol"></div>
                        <div class="form-row"><label>Category</label>
                            <select class="form-control" id="itemCategory">
                                <option>Medicine</option><option>Food</option><option>Cosmetic</option><option>Grocery</option><option>Personal Document</option>
                            </select>
                        </div>
                        <div class="form-row"><label>Expiry date</label><input class="form-control" type="date" id="itemExpiry"></div>
                        <div class="form-row"><label>Reminder before (days)</label><input class="form-control" type="number" id="itemReminder" value="7"></div>
                        <div class="form-row"><label>Notes (optional)</label><textarea class="form-control" id="itemNotes" rows="2"></textarea></div>
                        <button class="btn-primary" onclick="addNewItem()"><i class="fas fa-save"></i> Save item</button>
                    </div>
                `;
            }

            function renderNotifications() {
                const soonItems = items.filter(i => i.status === 'soon');
                const expiredItems = items.filter(i => i.status === 'expired');
                let alertsHtml = '';
                [...expiredItems, ...soonItems].forEach(item => {
                    const cls = item.status === 'expired' ? 'expired' : 'soon';
                    const icon = item.status === 'expired' ? 'fa-skull-crosswalk' : 'fa-clock';
                    const expDate = new Date(item.expiry + 'T00:00:00');
                    const today = new Date(); today.setHours(0,0,0,0);
                    const diff = Math.ceil((expDate - today) / (1000*60*60*24));
                    const msg = item.status === 'expired' ? `expired ${-diff} days ago` : `expires in ${diff} days`;
                    alertsHtml += `<div class="alert-item ${cls}"><i class="fas ${icon} alert-icon" style="color:${cls==='expired'?'#bc2c1e':'#f3b33d'};"></i><div class="alert-content"><strong>${item.name}</strong> (${item.category}) ${msg}</div><i class="fas fa-times" style="opacity:0.5;"></i></div>`;
                });
                if (alertsHtml === '') alertsHtml = '<div class="stat-card" style="justify-content:center;">✨ No pending alerts</div>';
                return `<div class="section-header"><h2><i class="fas fa-bell"></i> Notifications</h2></div><div class="alert-list">${alertsHtml}</div>`;
            }

            function renderProfile() {
                return `
                    <div class="section-header"><h2><i class="fas fa-user-circle"></i> Profile</h2></div>
                    <div class="form-card" style="max-width:500px;">
                        <div style="text-align:center; font-size:4rem; color:#22745a;"><i class="fas fa-user-astronaut"></i></div>
                        <div class="form-row"><label>Name</label><input class="form-control" value="Dhanashree Jadhav" disabled></div>
                        <div class="form-row"><label>Email</label><input class="form-control" value="Dhanashree@expirynotifier.demo" disabled></div>
                        <div class="form-row"><label>Academic project</label><input class="form-control" value="SY BCA Sem IV" disabled></div>
                        <button class="btn-primary" style="background:#789f92;" disabled><i class="fas fa-check"></i> demo only</button>
                    </div>
                `;
            }

            // ----- GLOBAL FUNCTIONS (for onclick) -----
            window.navigateTo = function(page) {
                // update active class in sidebar
                document.querySelectorAll('.nav-item').forEach(el => {
                    const data = el.getAttribute('data-page');
                    if (data === page) el.classList.add('active');
                    else el.classList.remove('active');
                });
                let content = '';
                let title = '';
                if (page === 'dashboard') { content = renderDashboard(); title = 'Dashboard'; }
                else if (page === 'addItem') { content = renderAddItem(); title = 'Add Item'; }
                else if (page === 'notifications') { content = renderNotifications(); title = 'Notifications'; }
                else if (page === 'profile') { content = renderProfile(); title = 'Profile'; }
                document.getElementById('pageContent').innerHTML = content;
                document.getElementById('currentPageTitle').innerHTML = `<i class="fas fa-${page==='dashboard'?'clock':(page==='addItem'?'plus-circle':(page==='notifications'?'bell':'user'))}"></i> ${title}`;
            };

            window.addNewItem = function() {
                const name = document.getElementById('itemName')?.value.trim();
                const category = document.getElementById('itemCategory')?.value;
                const expiry = document.getElementById('itemExpiry')?.value;
                const reminder = parseInt(document.getElementById('itemReminder')?.value) || 7;
                const notes = document.getElementById('itemNotes')?.value || '';
                if (!name || !expiry) { alert('Name and expiry required'); return; }
                const newId = items.length ? Math.max(...items.map(i=>i.id)) + 1 : 7;
                items.push({ id: newId, name, category, expiry, reminderDays: reminder, notes, status: 'safe' });
                refreshItemStatus();
                navigateTo('dashboard'); // go back to dashboard
            };

            window.deleteItem = function(id) {
                if (confirm('Delete item?')) {
                    items = items.filter(i => i.id !== id);
                    refreshItemStatus();
                    navigateTo('dashboard');
                }
            };

            window.editItem = function(id) {
                alert(`Edit item ${id} - would open prefilled form (demo interaction)`);
                // in full version you'd populate form and navigate to addItem
            };

            // attach sidebar click listeners
            function initSidebar() {
                document.querySelectorAll('.nav-item').forEach(el => {
                    el.addEventListener('click', function(e) {
                        const page = this.getAttribute('data-page');
                        if (page) navigateTo(page);
                    });
                });
            }

            // show dashboard and set default
            function showDashboardApp() {
                document.getElementById('landingPage').classList.add('hidden');
                document.getElementById('dashboardApp').classList.remove('hidden');
                initSidebar();
                navigateTo('dashboard');
            }

            // get started button
            document.getElementById('getStartedBtn').addEventListener('click', showDashboardApp);

            // also if someone clicks directly on dashboard (for demo) make sure initial state
            window.onload = function() {
                // landing visible, dashboard hidden. sidebar not yet initialized.
                // but we'll prepare for later
            };

            // expose functions to global for onclick
            window.navigateTo = navigateTo;
            window.addNewItem = addNewItem;
            window.deleteItem = deleteItem;
            window.editItem = editItem;
        })();

//Connect JavaScript to Python//

async function getAIMessage(docName, daysLeft) {
    const response = await fetch("http://127.0.0.1:5000/generate-reminder", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            doc_name: docName,
            days_left: daysLeft
        })
    });

    const data = await response.json();
    return data.message;
}
