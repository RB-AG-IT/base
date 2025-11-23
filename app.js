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
                    <div class="mini-stat-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </div>
                    <div class="mini-stat-value">${dummyData.stats.week}</div>
                    <div class="mini-stat-label">Diese Woche</div>
                </div>
                <div class="mini-stat animated-stat" style="--delay: 0.2s">
                    <div class="mini-stat-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                    </div>
                    <div class="mini-stat-value">${dummyData.stats.month}</div>
                    <div class="mini-stat-label">Dieser Monat</div>
                </div>
                <div class="mini-stat animated-stat" style="--delay: 0.3s">
                    <div class="mini-stat-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"></path>
                        </svg>
                    </div>
                    <div class="mini-stat-value">#${dummyData.stats.rank}</div>
                    <div class="mini-stat-label">Dein Rang</div>
                </div>
                <div class="mini-stat animated-stat" style="--delay: 0.4s">
                    <div class="mini-stat-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                    </div>
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
                    <div class="action-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </div>
                    <div class="action-label">Neues<br/>Mitglied</div>
                </a>
                <a href="#team" class="action-card">
                    <div class="action-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                            <line x1="8" y1="2" x2="8" y2="18"></line>
                            <line x1="16" y1="6" x2="16" y2="22"></line>
                        </svg>
                    </div>
                    <div class="action-label">Werbe-<br/>gebiete</div>
                </a>
                <a href="#ranking" class="action-card">
                    <div class="action-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"></path>
                        </svg>
                    </div>
                    <div class="action-label">Ranking</div>
                </a>
                <a href="#offline" class="action-card">
                    <div class="action-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                    </div>
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
                <div class="campaign-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="12" r="6"></circle>
                        <circle cx="12" cy="12" r="2"></circle>
                    </svg>
                </div>
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
            <h1 class="view-title">Mein Team</h1>

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
                            ${area.active ? '● Aktiv' : '○ Inaktiv'}
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
        <!-- Champion Banner - Fixed Top Left (below avatar) -->
        <div class="champion-banner-fixed">
            <div class="winner-crown">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L15 9L22 9.5L17 15L18.5 22L12 18L5.5 22L7 15L2 9.5L9 9L12 2Z"/>
                </svg>
            </div>
            <div class="winner-content">
                <div class="winner-label">Champion</div>
                <div class="winner-name">Anna S.</div>
                <div class="winner-score">127</div>
            </div>
        </div>

        <div class="view-container">
            <!-- Period Tabs -->
            <div class="ranking-tabs">
                <button class="ranking-tab active" data-period="day">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                    Tag
                </button>
                <button class="ranking-tab" data-period="week">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    Woche
                </button>
                <button class="ranking-tab" data-period="month">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"></path>
                    </svg>
                    Monat
                </button>
                <button class="ranking-tab" data-period="year">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2L15 9L22 9.5L17 15L18.5 22L12 18L5.5 22L7 15L2 9.5L9 9L12 2Z"/>
                    </svg>
                    Jahr
                </button>
            </div>

            <!-- Rankings List -->
            <div class="ranking-section">
                <h3 class="section-header">
                    <span>Top Performer</span>
                    <svg class="trophy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                        <path d="M4 22h16"></path>
                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path>
                    </svg>
                </h3>
                <div class="flashy-ranking-list">
                    ${dummyData.ranking.map(item => `
                        <div class="flashy-ranking-item rank-${item.position} ${item.isCurrentUser ? 'is-you' : ''}">
                            ${item.position <= 3 ? `<div class="rank-particles"></div>` : ''}
                            <div class="rank-badge ${item.position === 1 ? 'gold' : item.position === 2 ? 'silver' : item.position === 3 ? 'bronze' : ''}">
                                ${item.position <= 3 ? `
                                    <div class="medal-shine"></div>
                                    <svg class="medal-icon" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2L15 9L22 9.5L17 15L18.5 22L12 18L5.5 22L7 15L2 9.5L9 9L12 2Z"/>
                                    </svg>
                                ` : item.position}
                            </div>
                            <div class="rank-info">
                                <div class="rank-name">${item.name} ${item.isCurrentUser ? '<span class="you-badge">Du</span>' : ''}</div>
                                <div class="rank-team">${item.team}</div>
                            </div>
                            <div class="rank-score">
                                <div class="score-value">${item.score}</div>
                                <div class="score-label">Punkte</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `,

    offline: () => `
        <div class="view-container">
            <h1 class="view-title">Offline Gespeichert</h1>

            ${dummyData.offline.length > 0 ? `
                <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <svg style="width: 20px; height: 20px; flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="#856404" stroke-width="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
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

                <button class="btn-primary" style="margin-top: 16px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <svg style="width: 20px; height: 20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <polyline points="1 20 1 14 7 14"></polyline>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                    Jetzt synchronisieren
                </button>
            ` : `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <div class="empty-state-title">Alles synchronisiert!</div>
                    <div class="empty-state-text">Keine offline gespeicherten Datensätze vorhanden</div>
                </div>
            `}
        </div>
    `,

    profil: () => `
        <div class="view-container">
            <h1 class="view-title">Mein Profil</h1>

            <!-- Profile Header -->
            <div class="profile-header">
                <div class="profile-avatar-section">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23667eea'/%3E%3Ctext x='50' y='68' text-anchor='middle' font-size='40' fill='white' font-family='Arial'%3E${dummyData.user.avatar}%3C/text%3E%3C/svg%3E"
                         class="profile-avatar">
                </div>
                <div class="profile-header-info">
                    <h2 class="profile-name">${dummyData.user.name}</h2>
                    <div class="profile-role-badge">${getRoleLabel(currentRole)}</div>
                </div>
            </div>

            <!-- Personal Data Section -->
            <div class="profile-form-section">
                <h3 class="section-title">Persönliche Daten</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">Vorname *</label>
                        <input type="text" class="form-input" placeholder="Max" value="Max">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Nachname *</label>
                        <input type="text" class="form-input" placeholder="Mustermann" value="Mustermann">
                    </div>
                    <div class="form-group">
                        <label class="form-label">E-Mail *</label>
                        <input type="email" class="form-input" placeholder="max@example.com" value="${dummyData.user.email}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Telefon *</label>
                        <input type="tel" class="form-input" placeholder="+49 123 456789" value="${dummyData.user.phone}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">GameTAG</label>
                        <input type="text" class="form-input" placeholder="MeinGameTag" value="ProGamer42">
                    </div>
                </div>
            </div>

            <!-- Address Section -->
            <div class="profile-form-section">
                <h3 class="section-title">Adresse</h3>
                <div class="form-grid">
                    <div class="form-group form-group-2col">
                        <label class="form-label">Straße *</label>
                        <div class="input-with-icon">
                            <input type="text" class="form-input" id="street-input" placeholder="Musterstraße" value="">
                            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Hausnummer *</label>
                        <input type="text" class="form-input" placeholder="42" value="">
                    </div>
                    <div class="form-group">
                        <label class="form-label">PLZ *</label>
                        <input type="text" class="form-input" placeholder="12345" value="">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Stadt *</label>
                        <input type="text" class="form-input" placeholder="Berlin" value="">
                    </div>
                    <div class="form-group form-group-2col">
                        <label class="form-label">Land *</label>
                        <select class="form-input">
                            <option value="DE" selected>Deutschland</option>
                            <option value="AT">Österreich</option>
                            <option value="CH">Schweiz</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Bank Details Section -->
            <div class="profile-form-section">
                <h3 class="section-title">Bankverbindung</h3>
                <div class="form-grid">
                    <div class="form-group form-group-2col">
                        <label class="form-label">Kontoinhaber *</label>
                        <input type="text" class="form-input" placeholder="Max Mustermann" value="">
                    </div>
                    <div class="form-group form-group-2col">
                        <label class="form-label">IBAN *</label>
                        <div class="input-with-icon">
                            <input type="text" class="form-input" id="iban-input" placeholder="DE89 3704 0044 0532 0130 00" value="">
                            <svg class="input-icon input-icon-success" id="iban-check" style="display: none;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">BIC</label>
                        <input type="text" class="form-input" placeholder="COBADEFFXXX" value="">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Bank</label>
                        <input type="text" class="form-input" placeholder="Commerzbank" value="">
                    </div>
                </div>
            </div>

            <!-- Tax Information Section -->
            <div class="profile-form-section">
                <h3 class="section-title">Steuerinformationen</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">Steuernummer</label>
                        <input type="text" class="form-input" placeholder="12/345/67890" value="">
                    </div>
                    <div class="form-group">
                        <label class="form-label">USt-IdNr.</label>
                        <input type="text" class="form-input" placeholder="DE123456789" value="">
                    </div>
                </div>
            </div>

            <!-- Additional Information Section -->
            <div class="profile-form-section">
                <h3 class="section-title">Zusätzliche Informationen</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">Kleidergröße</label>
                        <select class="form-input">
                            <option value="">Bitte wählen</option>
                            <option value="XS">XS</option>
                            <option value="S">S</option>
                            <option value="M" selected>M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="XXL">XXL</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Custom Commission (%)</label>
                        <input type="number" class="form-input" placeholder="0" value="0" min="0" max="100">
                    </div>
                </div>
            </div>

            <!-- Document Upload Section -->
            <div class="profile-form-section">
                <h3 class="section-title">Dokumente</h3>
                <div class="upload-grid">
                    <div class="upload-box">
                        <div class="upload-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                        </div>
                        <div class="upload-label">Personalausweis</div>
                        <div class="upload-hint">PNG, JPG oder PDF</div>
                    </div>
                    <div class="upload-box">
                        <div class="upload-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                        </div>
                        <div class="upload-label">Führerschein Vorderseite</div>
                        <div class="upload-hint">PNG, JPG oder PDF</div>
                    </div>
                    <div class="upload-box">
                        <div class="upload-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                        </div>
                        <div class="upload-label">Führerschein Rückseite</div>
                        <div class="upload-hint">PNG, JPG oder PDF</div>
                    </div>
                </div>
            </div>

            <!-- Photo Upload Section -->
            <div class="profile-form-section">
                <h3 class="section-title">Fotos</h3>
                <div class="upload-grid">
                    <div class="upload-box">
                        <div class="upload-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                        </div>
                        <div class="upload-label">Internes Foto</div>
                        <div class="upload-hint">PNG oder JPG</div>
                    </div>
                    <div class="upload-box">
                        <div class="upload-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                        </div>
                        <div class="upload-label">Externes Foto</div>
                        <div class="upload-hint">PNG oder JPG</div>
                    </div>
                </div>
            </div>

            <!-- Save Button -->
            <div class="profile-actions">
                <button class="btn-primary btn-save">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    Änderungen speichern
                </button>
            </div>
        </div>
    `,

    einstellungen: () => `
        <div class="view-container">
            <h1 class="view-title">Einstellungen</h1>

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

            <button class="btn-secondary" style="margin-top: 16px; background: #ffebee; color: #c62828; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <svg style="width: 18px; height: 18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Logout
            </button>
        </div>
    `,

    // Admin-only views
    benutzer: () => `
        <div class="view-container">
            <h1 class="view-title">Benutzerverwaltung</h1>

            <div style="margin-bottom: 16px; position: relative;">
                <svg style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; pointer-events: none;" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input type="text" placeholder="Benutzer suchen..."
                       style="width: 100%; padding: 12px 12px 12px 40px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px;">
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
                                ${user.active ? '● Aktiv' : '○ Inaktiv'}
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>

            <button class="btn-primary" style="margin-top: 16px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <svg style="width: 20px; height: 20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                Neuer Benutzer
            </button>
        </div>
    `,

    kampagnen: () => `
        <div class="view-container">
            <h1 class="view-title">Kampagnen</h1>

            <div class="area-list">
                ${dummyData.campaigns.map(campaign => {
                    const statusColor = campaign.status === 'active' ? '#4caf50' : campaign.status === 'planned' ? '#2196f3' : '#9e9e9e';
                    const statusLabel = campaign.status === 'active' ? '● Aktiv' : campaign.status === 'planned' ? '● Geplant' : '○ Entwurf';
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

            <button class="btn-primary" style="margin-top: 16px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <svg style="width: 20px; height: 20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                Neue Kampagne
            </button>
        </div>
    `,

    quality: () => `
        <div class="view-container">
            <h1 class="view-title">Quality Management</h1>

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
                        <button class="btn-primary" style="flex: 1; background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); padding: 8px; display: flex; align-items: center; justify-content: center; gap: 4px;">
                            <svg style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Freigeben
                        </button>
                        <button class="btn-secondary" style="flex: 1; background: #ffebee; color: #c62828; padding: 8px; display: flex; align-items: center; justify-content: center; gap: 4px;">
                            <svg style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                            Ablehnen
                        </button>
                    </div>
                </div>
                <div class="area-card">
                    <h3>Müller, Anna</h3>
                    <p>Werber: Tom Müller • Werbegebiet: Neustadt</p>
                    <p style="font-size: 12px; color: #9e9e9e; margin-top: 4px;">23.11.2024 15:45</p>
                    <div style="margin-top: 12px; display: flex; gap: 8px;">
                        <button class="btn-primary" style="flex: 1; background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); padding: 8px; display: flex; align-items: center; justify-content: center; gap: 4px;">
                            <svg style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Freigeben
                        </button>
                        <button class="btn-secondary" style="flex: 1; background: #ffebee; color: #c62828; padding: 8px; display: flex; align-items: center; justify-content: center; gap: 4px;">
                            <svg style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                            Ablehnen
                        </button>
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

    // Scroll to top on view change (both window and content)
    window.scrollTo({ top: 0, behavior: 'instant' });
    content.scrollTop = 0;
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

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
        item.classList.remove('active');
        const href = item.getAttribute('href');
        if (href === '#' + viewName) {
            item.classList.add('active');
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

    // Setup profile form functionality
    if (viewName === 'profil') {
        setTimeout(() => {
            initAddressAutocomplete();
            initIBANValidation();
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
    document.body.classList.add('sidebar-open');
}

function closeSidebar() {
    document.getElementById('sideMenu').classList.remove('open');
    document.getElementById('overlay').classList.remove('active');
    document.body.classList.remove('sidebar-open');
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
    const displayHeight = 100;

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

// ========== ADDRESS AUTOCOMPLETE ==========
function initAddressAutocomplete() {
    const streetInput = document.getElementById('street-input');
    if (!streetInput) return;

    let autocompleteTimeout = null;
    let suggestionsContainer = null;

    // Create suggestions container
    function createSuggestionsContainer() {
        if (!suggestionsContainer) {
            suggestionsContainer = document.createElement('div');
            suggestionsContainer.className = 'address-suggestions';
            streetInput.parentElement.appendChild(suggestionsContainer);
        }
        return suggestionsContainer;
    }

    // Fetch address suggestions
    async function fetchAddressSuggestions(query) {
        if (query.length < 3) {
            hideSuggestions();
            return;
        }

        try {
            // Using OpenStreetMap Nominatim API (free, no API key required)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                `q=${encodeURIComponent(query)}&` +
                `format=json&` +
                `addressdetails=1&` +
                `countrycodes=de,at,ch&` +
                `limit=5`
            );

            if (!response.ok) return;

            const results = await response.json();
            showSuggestions(results);
        } catch (error) {
            console.error('Address autocomplete error:', error);
        }
    }

    // Show suggestions
    function showSuggestions(results) {
        const container = createSuggestionsContainer();
        container.innerHTML = '';

        if (results.length === 0) {
            hideSuggestions();
            return;
        }

        results.forEach(result => {
            const addr = result.address;
            const street = addr.road || addr.pedestrian || addr.path || '';
            const houseNumber = addr.house_number || '';
            const postcode = addr.postcode || '';
            const city = addr.city || addr.town || addr.village || addr.municipality || '';
            const country = addr.country_code ? addr.country_code.toUpperCase() : '';

            // Format: Straße, Hausnummer, PLZ, Ort, DE
            const parts = [];
            if (street && houseNumber) {
                parts.push(`${street} ${houseNumber}`);
            } else if (street) {
                parts.push(street);
            }
            if (postcode) parts.push(postcode);
            if (city) parts.push(city);
            if (country) parts.push(country);

            const displayText = parts.join(', ');

            const suggestion = document.createElement('div');
            suggestion.className = 'address-suggestion-item';
            suggestion.innerHTML = `
                <div class="suggestion-main">${displayText}</div>
            `;
            suggestion.addEventListener('click', () => {
                selectAddress(result);
            });
            container.appendChild(suggestion);
        });

        container.style.display = 'block';
    }

    // Hide suggestions
    function hideSuggestions() {
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }
    }

    // Select address and fill form
    function selectAddress(result) {
        const address = result.address;

        // Fill street
        const street = address.road || address.pedestrian || address.path || '';
        if (street) {
            streetInput.value = street;
        }

        // Fill house number
        const houseNumberInput = document.querySelector('input[placeholder="42"]');
        if (houseNumberInput && address.house_number) {
            houseNumberInput.value = address.house_number;
        }

        // Fill postal code
        const postalInput = document.querySelector('input[placeholder="12345"]');
        if (postalInput && address.postcode) {
            postalInput.value = address.postcode;
        }

        // Fill city
        const cityInput = document.querySelector('input[placeholder="Berlin"]');
        if (cityInput) {
            const city = address.city || address.town || address.village || address.municipality || '';
            if (city) {
                cityInput.value = city;
            }
        }

        // Fill country
        const countrySelect = document.querySelector('select.form-input');
        if (countrySelect && address.country_code) {
            const countryCode = address.country_code.toUpperCase();
            if (countryCode === 'DE' || countryCode === 'AT' || countryCode === 'CH') {
                countrySelect.value = countryCode;
            }
        }

        hideSuggestions();
    }

    // Input event listener
    streetInput.addEventListener('input', (e) => {
        clearTimeout(autocompleteTimeout);
        autocompleteTimeout = setTimeout(() => {
            fetchAddressSuggestions(e.target.value);
        }, 300);
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!streetInput.contains(e.target) && !suggestionsContainer?.contains(e.target)) {
            hideSuggestions();
        }
    });
}

// ========== IBAN VALIDATION ==========
function initIBANValidation() {
    const ibanInput = document.getElementById('iban-input');
    const ibanCheck = document.getElementById('iban-check');
    const bicInput = document.querySelector('input[placeholder="COBADEFFXXX"]');
    const bankInput = document.querySelector('input[placeholder="Commerzbank"]');
    if (!ibanInput || !ibanCheck) return;

    // Get bank info from IBAN via Supabase Edge Function
    async function getBankInfoFromIBAN(iban) {
        iban = iban.replace(/\s/g, '').toUpperCase();

        try {
            // Use query parameter instead of JSON body
            const url = `https://lgztglycqtiwcmiydxnm.supabase.co/functions/v1/iban-validate?iban=${encodeURIComponent(iban)}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                console.error('IBAN validation API error:', response.status);
                return null;
            }

            const data = await response.json();
            console.log('IBAN API Response:', data); // Debug log

            // OpenIBAN response format: { valid: true, bankData: { bankCode: '...', name: '...', bic: '...' } }
            if (data.valid && data.bankData) {
                return {
                    bic: data.bankData.bic || '',
                    name: data.bankData.name || ''
                };
            }

            return null;
        } catch (error) {
            console.error('IBAN validation error:', error);
            return null;
        }
    }

    // IBAN validation function
    function validateIBAN(iban) {
        // Remove spaces and convert to uppercase
        iban = iban.replace(/\s/g, '').toUpperCase();

        // Check if IBAN has valid length (15-34 characters)
        if (iban.length < 15 || iban.length > 34) {
            return false;
        }

        // Check if IBAN starts with 2 letters followed by 2 digits
        if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(iban)) {
            return false;
        }

        // Move first 4 characters to end
        const rearranged = iban.substring(4) + iban.substring(0, 4);

        // Replace letters with numbers (A=10, B=11, ..., Z=35)
        let numericIBAN = '';
        for (let char of rearranged) {
            if (char >= 'A' && char <= 'Z') {
                numericIBAN += (char.charCodeAt(0) - 55).toString();
            } else {
                numericIBAN += char;
            }
        }

        // Calculate mod 97
        let remainder = numericIBAN;
        while (remainder.length > 2) {
            const block = remainder.substring(0, 9);
            remainder = (parseInt(block, 10) % 97).toString() + remainder.substring(block.length);
        }

        return parseInt(remainder, 10) % 97 === 1;
    }

    // Format IBAN with spaces
    function formatIBAN(iban) {
        // Remove all spaces first
        iban = iban.replace(/\s/g, '').toUpperCase();
        // Add space every 4 characters
        return iban.match(/.{1,4}/g)?.join(' ') || iban;
    }

    // Validate on input
    let validationTimeout = null;
    ibanInput.addEventListener('input', (e) => {
        clearTimeout(validationTimeout);

        // Format IBAN as user types
        const cursorPosition = e.target.selectionStart;
        const oldValue = e.target.value;
        const newValue = formatIBAN(oldValue);

        if (oldValue !== newValue) {
            e.target.value = newValue;
            // Adjust cursor position
            const diff = newValue.length - oldValue.length;
            e.target.setSelectionRange(cursorPosition + diff, cursorPosition + diff);
        }

        validationTimeout = setTimeout(async () => {
            const isValid = validateIBAN(e.target.value);

            if (e.target.value.replace(/\s/g, '').length >= 15) {
                if (isValid) {
                    ibanCheck.style.display = 'block';
                    ibanInput.style.borderColor = '#00e676';

                    // Auto-fill BIC and Bank if available via API
                    const bankInfo = await getBankInfoFromIBAN(e.target.value);
                    if (bankInfo) {
                        if (bicInput) {
                            bicInput.value = bankInfo.bic;
                        }
                        if (bankInput) {
                            bankInput.value = bankInfo.name;
                        }
                    }
                } else {
                    ibanCheck.style.display = 'none';
                    ibanInput.style.borderColor = '#ff5252';
                }
            } else {
                ibanCheck.style.display = 'none';
                ibanInput.style.borderColor = '';
            }
        }, 500);
    });

    // Validate on blur
    ibanInput.addEventListener('blur', () => {
        if (ibanInput.value.trim() === '') {
            ibanCheck.style.display = 'none';
            ibanInput.style.borderColor = '';
        }
    });
}

// ========== SERVICE WORKER (PWA) ==========
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service Worker registration will be added later
        console.log('PWA ready for service worker registration');
    });
}
