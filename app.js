// ========== DUMMY DATA ==========
const dummyData = {
    user: {
        name: 'Max Mustermann',
        role: 'werber', // werber, teamleiter, admin, quality
        avatar: 'M',
        email: 'max@example.com',
        phone: '+49 123 456789',
        campaign: 'DRK Herbstkampagne 2024',
        team: 'Team Nord'
    },
    stats: {
        today: 3,
        week: 12,
        month: 48,
        total: 156,
        rank: 3,
        totalUsers: 15
    },
    areas: [
        { id: 1, name: 'Ortsverein Musterstadt', today: 2, week: 8, active: true },
        { id: 2, name: 'Ortsverein Neustadt', today: 1, week: 4, active: true },
        { id: 3, name: 'Ortsverein Altstadt', today: 0, week: 0, active: false }
    ],
    ranking: [
        { position: 1, name: 'Anna Schmidt', team: 'Team Süd', score: 89 },
        { position: 2, name: 'Tom Müller', team: 'Team Ost', score: 67 },
        { position: 3, name: 'Max Mustermann', team: 'Team Nord', score: 48, isCurrentUser: true },
        { position: 4, name: 'Lisa Weber', team: 'Team West', score: 42 },
        { position: 5, name: 'Paul Klein', team: 'Team Nord', score: 38 },
        { position: 6, name: 'Sarah Berg', team: 'Team Süd', score: 35 },
        { position: 7, name: 'Mike Fischer', team: 'Team Ost', score: 31 },
        { position: 8, name: 'Julia Koch', team: 'Team West', score: 28 }
    ],
    offline: [
        { id: 1, name: 'Schmidt, Hans', area: 'Musterstadt', timestamp: '2024-11-23 14:30' },
        { id: 2, name: 'Müller, Anna', area: 'Neustadt', timestamp: '2024-11-23 15:45' }
    ],
    users: [
        { id: 1, name: 'Max Mustermann', role: 'Werber', team: 'Team Nord', active: true },
        { id: 2, name: 'Anna Schmidt', role: 'Teamleiter', team: 'Team Süd', active: true },
        { id: 3, name: 'Tom Müller', role: 'Werber', team: 'Team Ost', active: true },
        { id: 4, name: 'Lisa Weber', role: 'Quality', team: 'Team West', active: false }
    ],
    campaigns: [
        { id: 1, name: 'DRK Herbstkampagne 2024', kw: 'KW 47-50', status: 'active', members: 156 },
        { id: 2, name: 'UNICEF Winteraktion', kw: 'KW 51-52', status: 'planned', members: 0 },
        { id: 3, name: 'DRK Frühjahrskampagne', kw: 'KW 10-15', status: 'draft', members: 0 }
    ]
};

// ========== STATE MANAGEMENT ==========
let currentRole = dummyData.user.role;

// ========== VIEWS ==========
const views = {
    dashboard: () => {
        const html = `
        <div class="view-container">
            <!-- Hero Stats (Big & Bold) -->
            <div class="hero-stat">
                <div class="hero-stat-label">Heute erfasst</div>
                <div class="hero-stat-value">${dummyData.stats.today}</div>
                <div class="hero-stat-subtitle">Neue Mitglieder</div>
                <div class="hero-stat-trend">↗ +${Math.floor(Math.random() * 30 + 10)}% mehr als gestern</div>
            </div>

            <!-- Animated Live Chart -->
            <div class="chart-card">
                <div class="chart-header">
                    <div>
                        <div class="chart-title">7-Tage Performance</div>
                        <div class="chart-change positive">↗ Trending Up</div>
                    </div>
                </div>
                <div class="chart-canvas">
                    <canvas id="liveChart"></canvas>
                </div>
            </div>

            <!-- Mini Stats Grid (2x2) -->
            <div class="mini-stats-grid">
                <div class="mini-stat animated-stat" style="--delay: 0.1s">
                    <div class="mini-stat-icon">📅</div>
                    <div class="mini-stat-value">${dummyData.stats.week}</div>
                    <div class="mini-stat-label">Diese Woche</div>
                </div>
                <div class="mini-stat animated-stat" style="--delay: 0.2s">
                    <div class="mini-stat-icon">📆</div>
                    <div class="mini-stat-value">${dummyData.stats.month}</div>
                    <div class="mini-stat-label">Dieser Monat</div>
                </div>
                <div class="mini-stat animated-stat" style="--delay: 0.3s">
                    <div class="mini-stat-icon">🏆</div>
                    <div class="mini-stat-value">#${dummyData.stats.rank}</div>
                    <div class="mini-stat-label">Dein Rang</div>
                </div>
                <div class="mini-stat animated-stat" style="--delay: 0.4s">
                    <div class="mini-stat-icon">📈</div>
                    <div class="mini-stat-value">${dummyData.stats.total}</div>
                    <div class="mini-stat-label">Gesamt</div>
                </div>
            </div>

            <!-- Quick Actions (Horizontal Scroll) -->
            <div class="section-header">
                <h3>Schnellzugriff</h3>
            </div>
            <div class="quick-actions-scroll">
                <a href="formular/" class="action-card">
                    <div class="action-icon">📝</div>
                    <div class="action-label">Neues<br/>Mitglied</div>
                </a>
                <a href="#team" class="action-card">
                    <div class="action-icon">🗺️</div>
                    <div class="action-label">Werbe-<br/>gebiete</div>
                </a>
                <a href="#ranking" class="action-card">
                    <div class="action-icon">🏆</div>
                    <div class="action-label">Ranking</div>
                </a>
                <a href="#offline" class="action-card">
                    <div class="action-icon">💾</div>
                    <div class="action-label">Offline<br/>Daten</div>
                </a>
            </div>

            <!-- Top 3 Leaderboard -->
            <div class="section-header">
                <h3>Top Werber</h3>
                <a href="#ranking" class="section-link">Alle ansehen →</a>
            </div>
            <div class="leaderboard">
                ${dummyData.ranking.slice(0, 3).map(item => `
                    <div class="leaderboard-item ${item.isCurrentUser ? 'is-you' : ''}">
                        <div class="leaderboard-position ${item.position === 1 ? 'gold' : item.position === 2 ? 'silver' : 'bronze'}">
                            ${item.position}
                        </div>
                        <div class="leaderboard-info">
                            <div class="leaderboard-name">${item.name}${item.isCurrentUser ? ' (Du)' : ''}</div>
                            <div class="leaderboard-team">${item.team}</div>
                        </div>
                        <div class="leaderboard-score">
                            <div class="score-value">${item.score}</div>
                            <div class="score-label">Punkte</div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Current Campaign Banner -->
            <div class="campaign-banner">
                <div class="campaign-icon">🎯</div>
                <div class="campaign-info">
                    <div class="campaign-name">${dummyData.user.campaign}</div>
                    <div class="campaign-team">Team: ${dummyData.user.team}</div>
                </div>
                <div class="campaign-status">Aktiv</div>
            </div>
        </div>
    `;

        // Start chart animation after render
        setTimeout(() => {
            initLiveChart();
        }, 100);

        return html;
    },

    team: () => `
        <div class="view-container">
            <h1 class="view-title">Mein Team 👥</h1>

            <div style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.12);">
                <div style="font-size: 13px; color: #757575; margin-bottom: 4px;">Kampagne</div>
                <div style="font-weight: 600; margin-bottom: 8px;">${dummyData.user.campaign}</div>
                <div style="font-size: 13px; color: #757575; margin-bottom: 4px;">Team</div>
                <div style="font-weight: 600;">${dummyData.user.team}</div>
            </div>

            <h3 style="font-size: 14px; color: #757575; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Meine Werbegebiete</h3>
            <div class="area-list">
                ${dummyData.areas.map(area => `
                    <a href="formular/?area=${area.id}" class="area-card">
                        <h3>${area.name}</h3>
                        <p>Heute: ${area.today} Mitglieder • Diese Woche: ${area.week} Mitglieder</p>
                        <span class="area-badge" style="background: ${area.active ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)' : '#eeeeee'}; color: ${area.active ? 'white' : '#757575'};">
                            ${area.active ? '🟢 Aktiv' : '⚫ Inaktiv'}
                        </span>
                    </a>
                `).join('')}
            </div>

            ${currentRole === 'teamleiter' || currentRole === 'admin' ? `
                <div style="margin-top: 32px;">
                    <h3 style="font-size: 14px; color: #757575; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Teamleiter-Funktionen</h3>
                    <button class="btn-secondary" style="margin-bottom: 8px;">
                        📋 Werber zuordnen
                    </button>
                    <button class="btn-secondary">
                        📊 Team-Statistiken
                    </button>
                </div>
            ` : ''}
        </div>
    `,

    ranking: () => `
        <div class="view-container">
            <h1 class="view-title">Ranking 🏆</h1>

            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 24px; color: white; margin-bottom: 24px; text-align: center;">
                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">Deine Position</div>
                <div style="font-size: 48px; font-weight: 700; line-height: 1;">#${dummyData.stats.rank}</div>
                <div style="font-size: 14px; opacity: 0.9; margin-top: 4px;">von ${dummyData.stats.totalUsers} Werbern</div>
            </div>

            <h3 style="font-size: 14px; color: #757575; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Top Werber</h3>
            <div class="ranking-list">
                ${dummyData.ranking.map(item => `
                    <div class="ranking-item ${item.isCurrentUser ? 'highlight' : ''}">
                        <div class="ranking-position ${item.position === 1 ? 'gold' : item.position === 2 ? 'silver' : item.position === 3 ? 'bronze' : ''}">
                            ${item.position}
                        </div>
                        <div class="ranking-info">
                            <div class="ranking-name">${item.name} ${item.isCurrentUser ? '(Du)' : ''}</div>
                            <div class="ranking-team">${item.team}</div>
                        </div>
                        <div class="ranking-score">${item.score}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `,

    offline: () => `
        <div class="view-container">
            <h1 class="view-title">Offline Gespeichert 💾</h1>

            ${dummyData.offline.length > 0 ? `
                <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span style="font-size: 20px;">⚠️</span>
                        <strong style="color: #856404;">Nicht synchronisiert</strong>
                    </div>
                    <p style="font-size: 14px; color: #856404; margin: 0;">
                        ${dummyData.offline.length} Datensätze warten auf Synchronisation
                    </p>
                </div>

                <div class="area-list">
                    ${dummyData.offline.map(item => `
                        <div class="area-card">
                            <h3>${item.name}</h3>
                            <p>Werbegebiet: ${item.area}</p>
                            <p style="font-size: 12px; color: #9e9e9e; margin-top: 4px;">${item.timestamp}</p>
                        </div>
                    `).join('')}
                </div>

                <button class="btn-primary" style="margin-top: 16px;">
                    🔄 Jetzt synchronisieren
                </button>
            ` : `
                <div class="empty-state">
                    <div class="empty-state-icon">✅</div>
                    <div class="empty-state-title">Alles synchronisiert!</div>
                    <div class="empty-state-text">Keine offline gespeicherten Datensätze vorhanden</div>
                </div>
            `}
        </div>
    `,

    profil: () => `
        <div class="view-container">
            <h1 class="view-title">Mein Profil 👤</h1>

            <div style="text-align: center; margin-bottom: 32px;">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23667eea'/%3E%3Ctext x='50' y='68' text-anchor='middle' font-size='40' fill='white' font-family='Arial'%3E${dummyData.user.avatar}%3C/text%3E%3C/svg%3E"
                     style="width: 100px; height: 100px; border-radius: 50%; border: 4px solid #eeeeee; margin-bottom: 16px;">
                <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 4px;">${dummyData.user.name}</h2>
                <p style="color: #757575;">${getRoleLabel(currentRole)}</p>
            </div>

            <div class="profile-section">
                <h3>Persönliche Daten</h3>
                <div class="profile-item">
                    <span class="profile-label">Name</span>
                    <span class="profile-value">${dummyData.user.name}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">E-Mail</span>
                    <span class="profile-value">${dummyData.user.email}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Telefon</span>
                    <span class="profile-value">${dummyData.user.phone}</span>
                </div>
            </div>

            <div class="profile-section">
                <h3>Kampagne</h3>
                <div class="profile-item">
                    <span class="profile-label">Aktuelle Kampagne</span>
                    <span class="profile-value">${dummyData.user.campaign}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Team</span>
                    <span class="profile-value">${dummyData.user.team}</span>
                </div>
            </div>

            <div class="profile-section">
                <h3>Statistiken</h3>
                <div class="profile-item">
                    <span class="profile-label">Gesamt Mitglieder</span>
                    <span class="profile-value">${dummyData.stats.total}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Ranking</span>
                    <span class="profile-value">#${dummyData.stats.rank} von ${dummyData.stats.totalUsers}</span>
                </div>
            </div>

            <button class="btn-secondary" style="margin-top: 16px;">
                ✏️ Profil bearbeiten
            </button>
        </div>
    `,

    einstellungen: () => `
        <div class="view-container">
            <h1 class="view-title">Einstellungen ⚙️</h1>

            <div class="profile-section">
                <h3>Rollen-Wechsel (Demo)</h3>
                <div style="margin-top: 12px;">
                    <select id="roleSelector" style="width: 100%; padding: 12px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px;">
                        <option value="werber" ${currentRole === 'werber' ? 'selected' : ''}>Werber</option>
                        <option value="teamleiter" ${currentRole === 'teamleiter' ? 'selected' : ''}>Teamleiter</option>
                        <option value="admin" ${currentRole === 'admin' ? 'selected' : ''}>Admin</option>
                        <option value="quality" ${currentRole === 'quality' ? 'selected' : ''}>Quality Manager</option>
                    </select>
                </div>
            </div>

            <div class="profile-section">
                <h3>Allgemein</h3>
                <div class="profile-item">
                    <span class="profile-label">Benachrichtigungen</span>
                    <input type="checkbox" checked style="width: 20px; height: 20px;">
                </div>
                <div class="profile-item">
                    <span class="profile-label">Dark Mode</span>
                    <input type="checkbox" style="width: 20px; height: 20px;">
                </div>
                <div class="profile-item">
                    <span class="profile-label">Offline-Modus</span>
                    <input type="checkbox" checked style="width: 20px; height: 20px;">
                </div>
            </div>

            <div class="profile-section">
                <h3>Über</h3>
                <div class="profile-item">
                    <span class="profile-label">Version</span>
                    <span class="profile-value">1.0.0 Beta</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Build</span>
                    <span class="profile-value">2024.11.23</span>
                </div>
            </div>

            <button class="btn-secondary" style="margin-top: 16px; background: #ffebee; color: #c62828;">
                🚪 Logout
            </button>
        </div>
    `,

    // Admin-only views
    benutzer: () => `
        <div class="view-container">
            <h1 class="view-title">Benutzerverwaltung 👨‍💼</h1>

            <div style="margin-bottom: 16px;">
                <input type="text" placeholder="🔍 Benutzer suchen..."
                       style="width: 100%; padding: 12px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px;">
            </div>

            <div class="area-list">
                ${dummyData.users.map(user => `
                    <div class="area-card">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div>
                                <h3>${user.name}</h3>
                                <p>${user.role} • ${user.team}</p>
                            </div>
                            <span class="area-badge" style="background: ${user.active ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)' : '#eeeeee'}; color: ${user.active ? 'white' : '#757575'};">
                                ${user.active ? '🟢 Aktiv' : '⚫ Inaktiv'}
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>

            <button class="btn-primary" style="margin-top: 16px;">
                ➕ Neuer Benutzer
            </button>
        </div>
    `,

    kampagnen: () => `
        <div class="view-container">
            <h1 class="view-title">Kampagnen 📋</h1>

            <div class="area-list">
                ${dummyData.campaigns.map(campaign => {
                    const statusColor = campaign.status === 'active' ? '#4caf50' : campaign.status === 'planned' ? '#2196f3' : '#9e9e9e';
                    const statusLabel = campaign.status === 'active' ? '🟢 Aktiv' : campaign.status === 'planned' ? '🔵 Geplant' : '⚪ Entwurf';
                    return `
                    <div class="area-card">
                        <h3>${campaign.name}</h3>
                        <p>${campaign.kw} • ${campaign.members} Mitglieder</p>
                        <span class="area-badge" style="background: ${statusColor}; color: white;">
                            ${statusLabel}
                        </span>
                    </div>
                `}).join('')}
            </div>

            <button class="btn-primary" style="margin-top: 16px;">
                ➕ Neue Kampagne
            </button>
        </div>
    `,

    quality: () => `
        <div class="view-container">
            <h1 class="view-title">Quality Management ✅</h1>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Zu prüfen</div>
                    <div class="stat-value">7</div>
                    <div class="stat-subtitle">Datensätze</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Geprüft</div>
                    <div class="stat-value">142</div>
                    <div class="stat-subtitle">Datensätze</div>
                </div>
            </div>

            <h3 style="font-size: 14px; color: #757575; margin: 24px 0 12px; text-transform: uppercase; letter-spacing: 0.5px;">Offene Prüfungen</h3>

            <div class="area-list">
                <div class="area-card">
                    <h3>Schmidt, Hans</h3>
                    <p>Werber: Max Mustermann • Werbegebiet: Musterstadt</p>
                    <p style="font-size: 12px; color: #9e9e9e; margin-top: 4px;">23.11.2024 14:30</p>
                    <div style="margin-top: 12px; display: flex; gap: 8px;">
                        <button class="btn-primary" style="flex: 1; background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); padding: 8px;">✓ Freigeben</button>
                        <button class="btn-secondary" style="flex: 1; background: #ffebee; color: #c62828; padding: 8px;">✗ Ablehnen</button>
                    </div>
                </div>
                <div class="area-card">
                    <h3>Müller, Anna</h3>
                    <p>Werber: Tom Müller • Werbegebiet: Neustadt</p>
                    <p style="font-size: 12px; color: #9e9e9e; margin-top: 4px;">23.11.2024 15:45</p>
                    <div style="margin-top: 12px; display: flex; gap: 8px;">
                        <button class="btn-primary" style="flex: 1; background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); padding: 8px;">✓ Freigeben</button>
                        <button class="btn-secondary" style="flex: 1; background: #ffebee; color: #c62828; padding: 8px;">✗ Ablehnen</button>
                    </div>
                </div>
            </div>
        </div>
    `
};

// ========== HELPER FUNCTIONS ==========
function getRoleLabel(role) {
    const labels = {
        werber: 'Werber',
        teamleiter: 'Teamleiter',
        admin: 'Administrator',
        quality: 'Quality Manager'
    };
    return labels[role] || 'Werber';
}

function updateRoleUI() {
    // Update sidebar user role
    document.getElementById('userRole').textContent = getRoleLabel(currentRole);

    // Show/hide admin-only menu items
    const adminItems = document.querySelectorAll('.admin-only');
    adminItems.forEach(item => {
        item.style.display = currentRole === 'admin' ? 'flex' : 'none';
    });

    // Show/hide quality-only menu items
    const qualityItems = document.querySelectorAll('.quality-only');
    qualityItems.forEach(item => {
        item.style.display = currentRole === 'quality' ? 'flex' : 'none';
    });

    // Reload current view to reflect role changes
    const hash = window.location.hash.substring(1) || 'dashboard';
    loadView(hash);
}

// ========== ROUTER ==========
function loadView(viewName) {
    const content = document.getElementById('appContent');

    // Check if view exists
    if (!views[viewName]) {
        viewName = 'dashboard';
    }

    // Check role permissions
    const adminViews = ['benutzer', 'kampagnen'];
    const qualityViews = ['quality'];

    if (adminViews.includes(viewName) && currentRole !== 'admin') {
        viewName = 'dashboard';
    }

    if (qualityViews.includes(viewName) && currentRole !== 'quality') {
        viewName = 'dashboard';
    }

    // Stop chart animation if leaving dashboard
    if (viewName !== 'dashboard') {
        stopChartAnimation();
    }

    // Load view
    content.innerHTML = views[viewName]();

    // Header title is hidden (no update needed)

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-view') === viewName) {
            item.classList.add('active');
        }
    });

    // Update active sidebar item
    document.querySelectorAll('.side-menu-item').forEach(item => {
        const href = item.getAttribute('href');
        if (href === '#' + viewName) {
            item.style.background = '#f5f5f5';
        } else {
            item.style.background = 'transparent';
        }
    });

    // Setup role selector in settings
    if (viewName === 'einstellungen') {
        setTimeout(() => {
            const roleSelector = document.getElementById('roleSelector');
            if (roleSelector) {
                roleSelector.addEventListener('change', (e) => {
                    currentRole = e.target.value;
                    updateRoleUI();
                    alert(`Rolle gewechselt zu: ${getRoleLabel(currentRole)}`);
                });
            }
        }, 0);
    }
}

// ========== EVENT LISTENERS ==========
document.addEventListener('DOMContentLoaded', function() {
    // Navigation click handlers
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.getAttribute('data-view');
            window.location.hash = view;
        });
    });

    // Sidebar menu items
    document.querySelectorAll('.side-menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.getAttribute('href').substring(1);
            window.location.hash = view;
            closeSidebar();
        });
    });

    // Avatar click opens sidebar (statt Menu button)
    document.getElementById('headerAvatar').addEventListener('click', () => {
        openSidebar();
    });

    // Overlay
    document.getElementById('overlay').addEventListener('click', () => {
        closeSidebar();
    });

    // FAB button
    document.getElementById('fab').addEventListener('click', () => {
        // Navigate to formular
        window.location.href = 'formular/';
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm('Möchtest du dich wirklich ausloggen?')) {
            alert('Logout-Funktion (noch nicht implementiert)');
        }
    });

    // Hash change handler (for browser back/forward)
    window.addEventListener('hashchange', () => {
        const view = window.location.hash.substring(1) || 'dashboard';
        loadView(view);
    });

    // Initial load
    const initialView = window.location.hash.substring(1) || 'dashboard';
    loadView(initialView);
    updateRoleUI();
});

// ========== SIDEBAR FUNCTIONS ==========
function openSidebar() {
    document.getElementById('sideMenu').classList.add('open');
    document.getElementById('overlay').classList.add('active');
}

function closeSidebar() {
    document.getElementById('sideMenu').classList.remove('open');
    document.getElementById('overlay').classList.remove('active');
}

// ========== ANIMATED LIVE CHART (MODERN & RETINA) ==========
let chartAnimation = null;

function initLiveChart() {
    const canvas = document.getElementById('liveChart');
    if (!canvas) return;

    // Make canvas Retina-ready
    const container = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = container.offsetWidth;
    const displayHeight = 140;

    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const width = displayWidth;
    const height = displayHeight;

    // Data configuration
    const dataPoints = 50;
    let data = [];
    let currentIndex = 0;
    let targetData = [];

    // Initialize with smooth random data
    for (let i = 0; i < dataPoints; i++) {
        const value = 50 + Math.sin(i * 0.3) * 15 + Math.random() * 10;
        data.push(value);
        targetData.push(value);
    }

    function drawChart() {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Update data SLOWLY (only every 60 frames = ~1 second)
        if (currentIndex % 60 === 0) {
            // Generate smooth new target
            const lastValue = targetData[targetData.length - 1];
            const newValue = lastValue + (Math.random() - 0.5) * 10;
            const clampedValue = Math.max(30, Math.min(70, newValue));

            targetData.shift();
            targetData.push(clampedValue);
        }

        // Smooth interpolation to target
        for (let i = 0; i < dataPoints; i++) {
            data[i] += (targetData[i] - data[i]) * 0.05;
        }

        currentIndex++;

        // Draw subtle grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = (height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Draw gradient fill
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.25)');
        gradient.addColorStop(0.7, 'rgba(102, 126, 234, 0.05)');
        gradient.addColorStop(1, 'rgba(102, 126, 234, 0)');

        ctx.beginPath();
        ctx.moveTo(0, height);

        // Smooth bezier curve
        for (let i = 0; i < dataPoints; i++) {
            const x = (width / (dataPoints - 1)) * i;
            const y = height - ((data[i] / 100) * height);

            if (i === 0) {
                ctx.lineTo(x, y);
            } else {
                // Bezier curve for smoothness
                const prevX = (width / (dataPoints - 1)) * (i - 1);
                const prevY = height - ((data[i - 1] / 100) * height);
                const cpX = (prevX + x) / 2;

                ctx.quadraticCurveTo(cpX, prevY, x, y);
            }
        }

        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw main line with glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(102, 126, 234, 0.4)';
        ctx.beginPath();

        for (let i = 0; i < dataPoints; i++) {
            const x = (width / (dataPoints - 1)) * i;
            const y = height - ((data[i] / 100) * height);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                const prevX = (width / (dataPoints - 1)) * (i - 1);
                const prevY = height - ((data[i - 1] / 100) * height);
                const cpX = (prevX + x) / 2;

                ctx.quadraticCurveTo(cpX, prevY, x, y);
            }
        }

        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw dots on last 5 points
        for (let i = dataPoints - 5; i < dataPoints; i++) {
            const x = (width / (dataPoints - 1)) * i;
            const y = height - ((data[i] / 100) * height);

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#667eea';
            ctx.fill();

            // Outer ring
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Continue animation
        chartAnimation = requestAnimationFrame(drawChart);
    }

    // Start animation
    drawChart();
}

// Stop chart animation when leaving dashboard
function stopChartAnimation() {
    if (chartAnimation) {
        cancelAnimationFrame(chartAnimation);
        chartAnimation = null;
    }
}

// ========== SERVICE WORKER (PWA) ==========
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service Worker registration will be added later
        console.log('PWA ready for service worker registration');
    });
}
