// ========== SUPABASE SETUP ==========
const SUPABASE_URL = 'https://lgztglycqtiwcmiydxnm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnenRnbHljcXRpd2NtaXlkeG5tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzgwNzYxNSwiZXhwIjoyMDc5MzgzNjE1fQ.54kSk9ZSUdQt6LKYWkblqgR6Sjev80W80qkNHYEbPgk';

// Supabase Client initialisieren
let supabaseClient = null;

function initSupabase() {
    if (window.supabase && window.supabase.createClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        return true;
    }
    return false;
}

// Sofort versuchen, oder auf DOMContentLoaded warten
if (!initSupabase()) {
    document.addEventListener('DOMContentLoaded', initSupabase);
}

// ========== STATE MANAGEMENT ==========
let currentUser = null;
let currentUserData = null; // User-Daten aus users-Tabelle
let currentRole = 'werber';

// ========== HELPER FUNCTIONS ==========
function getRoleLabel(role) {
    const labels = {
        werber: 'Werber',
        teamleiter: 'Teamleiter',
        teamchef: 'Teamchef',
        admin: 'Administrator',
        quality: 'Quality Manager'
    };
    return labels[role] || 'Werber';
}

function showLoading(show = true) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.toggle('active', show);
    }
}

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function getCurrentKW() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 604800000;
    return Math.ceil((diff / oneWeek) + 1);
}

function getCurrentYear() {
    return new Date().getFullYear();
}

// ========== AUTH FUNCTIONS ==========
function openLoginModal() {
    document.getElementById('loginModal').classList.add('active');
    document.getElementById('loginEmail').focus();
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginError').style.display = 'none';
}

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const loginBtn = document.getElementById('loginBtn');
    const loginError = document.getElementById('loginError');

    if (!email || !password) {
        loginError.textContent = 'Bitte E-Mail und Passwort eingeben';
        loginError.style.display = 'block';
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Anmelden...';
    loginError.style.display = 'none';

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        currentUser = data.user;
        await loadUserData();
        closeLoginModal();
        loadView('dashboard');

    } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = error.message === 'Invalid login credentials'
            ? 'Ungültige E-Mail oder Passwort'
            : `Fehler: ${error.message}`;
        loginError.style.display = 'block';
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Anmelden';
    }
}

async function handleLogout() {
    if (!confirm('Möchtest du dich wirklich ausloggen?')) return;

    try {
        showLoading(true);
        await supabaseClient.auth.signOut();
        currentUser = null;
        currentUserData = null;
        currentRole = 'werber';
        updateAuthUI();
        loadView('dashboard');
    } catch (error) {
        console.error('Logout error:', error);
        alert('Fehler beim Abmelden: ' + error.message);
    } finally {
        showLoading(false);
    }
}

async function checkAuthState() {
    showLoading(true);

    try {
        const { data: { session } } = await supabaseClient.auth.getSession();

        if (session) {
            currentUser = session.user;
            await loadUserData();
        } else {
            currentUser = null;
            currentUserData = null;
        }

        updateAuthUI();
    } catch (error) {
        console.error('Auth check error:', error);
    } finally {
        showLoading(false);
    }
}

async function loadUserData() {
    if (!currentUser) return;

    try {
        const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single();

        if (error) throw error;

        currentUserData = data;
        currentRole = data.role || 'werber';
        updateAuthUI();
    } catch (error) {
        console.error('Load user data error:', error);
    }
}

function updateAuthUI() {
    // Update sidebar user info
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const headerAvatar = document.querySelector('#headerAvatar img');
    const sideMenuAvatar = document.querySelector('.side-menu-avatar img');

    if (currentUserData) {
        if (userName) userName.textContent = currentUserData.name || 'Unbekannt';
        if (userRole) userRole.textContent = getRoleLabel(currentRole);

        // Avatar update
        const initials = getInitials(currentUserData.name);
        const avatarSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Ccircle cx='24' cy='24' r='24' fill='%23d97706'/%3E%3Ctext x='24' y='32' text-anchor='middle' font-size='18' fill='white' font-family='Arial' font-weight='bold'%3E${initials}%3C/text%3E%3C/svg%3E`;
        if (headerAvatar) headerAvatar.src = avatarSvg;
        if (sideMenuAvatar) sideMenuAvatar.src = avatarSvg.replace('48', '60').replace('32', '40').replace('18', '24');
    } else {
        if (userName) userName.textContent = 'Nicht angemeldet';
        if (userRole) userRole.textContent = 'Gast';
    }

    // Show/hide role-specific menu items
    const adminItems = document.querySelectorAll('.admin-only');
    adminItems.forEach(item => {
        item.style.display = currentRole === 'admin' ? 'flex' : 'none';
    });

    const qualityItems = document.querySelectorAll('.quality-only');
    qualityItems.forEach(item => {
        item.style.display = currentRole === 'quality' ? 'flex' : 'none';
    });

    // Update logout button text
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        const logoutText = logoutBtn.querySelector('span:last-child');
        if (logoutText) {
            logoutText.textContent = currentUser ? 'Logout' : 'Login';
        }
    }
}

// Listen for auth state changes
supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
        currentUser = session.user;
        loadUserData().then(() => {
            const currentHash = window.location.hash.substring(1) || 'dashboard';
            loadView(currentHash);
        });
    } else if (event === 'SIGNED_OUT') {
        currentUser = null;
        currentUserData = null;
        currentRole = 'werber';
        updateAuthUI();
    }
});

// ========== DATA FETCHING FUNCTIONS ==========
async function fetchDashboardStats() {
    if (!currentUser || !currentUserData) {
        return { today: 0, week: 0, month: 0, total: 0, rank: '-', stornoMG: 0, stornoEH: 0 };
    }

    const year = getCurrentYear();
    const kw = getCurrentKW();
    const userId = currentUser.id;

    try {
        // EH aus provisions_ledger
        const { data: ehData } = await supabaseClient
            .from('provisions_ledger')
            .select('einheiten, created_at, kw')
            .eq('user_id', userId)
            .eq('kategorie', 'werben')
            .eq('year', year);

        // Records zählen
        const { data: recordsData } = await supabaseClient
            .from('records')
            .select('id, created_at, record_status')
            .eq('werber_id', userId)
            .gte('created_at', `${year}-01-01`);

        // Heute
        const today = new Date().toISOString().split('T')[0];
        const todayRecords = recordsData?.filter(r => r.created_at?.startsWith(today)).length || 0;

        // Diese Woche
        const weekRecords = recordsData?.filter(r => {
            const recordDate = new Date(r.created_at);
            const recordKW = getWeekNumber(recordDate);
            return recordKW === kw;
        }).length || 0;

        // Dieser Monat
        const month = new Date().getMonth();
        const monthRecords = recordsData?.filter(r => {
            const recordDate = new Date(r.created_at);
            return recordDate.getMonth() === month;
        }).length || 0;

        // Gesamt
        const totalRecords = recordsData?.length || 0;

        // EH Summe
        const totalEH = ehData?.reduce((sum, r) => sum + (r.einheiten || 0), 0) || 0;

        // Stornoquoten
        const stornoRecords = recordsData?.filter(r => r.record_status === 'storno').length || 0;
        const stornoMG = totalRecords > 0 ? ((stornoRecords / totalRecords) * 100).toFixed(1) : 0;

        const stornoEHData = ehData?.filter(r => r.typ === 'storno').reduce((sum, r) => sum + Math.abs(r.einheiten || 0), 0) || 0;
        const totalEHAbs = ehData?.reduce((sum, r) => sum + Math.abs(r.einheiten || 0), 0) || 0;
        const stornoEH = totalEHAbs > 0 ? ((stornoEHData / totalEHAbs) * 100).toFixed(1) : 0;

        // Rang berechnen
        const rank = await fetchUserRank(userId, year);

        return {
            today: todayRecords,
            week: weekRecords,
            month: monthRecords,
            total: totalRecords,
            totalEH: totalEH,
            rank: rank,
            stornoMG: stornoMG,
            stornoEH: stornoEH
        };
    } catch (error) {
        console.error('Fetch dashboard stats error:', error);
        return { today: 0, week: 0, month: 0, total: 0, rank: '-', stornoMG: 0, stornoEH: 0 };
    }
}

function getWeekNumber(date) {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = date - start;
    const oneWeek = 604800000;
    return Math.ceil((diff / oneWeek) + 1);
}

async function fetchUserRank(userId, year) {
    try {
        // Alle Werber mit EH
        const { data } = await supabaseClient
            .from('provisions_ledger')
            .select('user_id, einheiten')
            .eq('kategorie', 'werben')
            .eq('year', year);

        if (!data || data.length === 0) return '-';

        // Gruppieren nach user_id
        const userTotals = {};
        data.forEach(r => {
            userTotals[r.user_id] = (userTotals[r.user_id] || 0) + (r.einheiten || 0);
        });

        // Sortieren
        const sorted = Object.entries(userTotals).sort((a, b) => b[1] - a[1]);
        const rank = sorted.findIndex(([uid]) => uid === userId) + 1;

        return rank > 0 ? rank : '-';
    } catch (error) {
        console.error('Fetch rank error:', error);
        return '-';
    }
}

async function fetchRankingData(period = 'month') {
    const year = getCurrentYear();
    const kw = getCurrentKW();

    try {
        let query = supabaseClient
            .from('provisions_ledger')
            .select('user_id, einheiten, kw, created_at')
            .eq('kategorie', 'werben')
            .eq('year', year);

        const { data } = await query;

        if (!data || data.length === 0) return [];

        // Filter nach Zeitraum
        const now = new Date();
        const filtered = data.filter(r => {
            if (period === 'day') {
                return r.created_at?.startsWith(now.toISOString().split('T')[0]);
            } else if (period === 'week') {
                return r.kw === kw;
            } else if (period === 'month') {
                const recordDate = new Date(r.created_at);
                return recordDate.getMonth() === now.getMonth();
            }
            return true; // year
        });

        // Gruppieren nach user_id
        const userTotals = {};
        filtered.forEach(r => {
            userTotals[r.user_id] = (userTotals[r.user_id] || 0) + (r.einheiten || 0);
        });

        // User-Namen holen
        const userIds = Object.keys(userTotals);
        if (userIds.length === 0) return [];

        const { data: users } = await supabaseClient
            .from('users')
            .select('id, name, team')
            .in('id', userIds);

        const userMap = {};
        users?.forEach(u => {
            userMap[u.id] = u;
        });

        // Ranking erstellen
        const ranking = Object.entries(userTotals)
            .map(([userId, eh]) => ({
                userId,
                name: userMap[userId]?.name || 'Unbekannt',
                team: userMap[userId]?.team || '',
                score: eh,
                isCurrentUser: userId === currentUser?.id
            }))
            .sort((a, b) => b.score - a.score)
            .map((item, index) => ({
                ...item,
                position: index + 1
            }));

        return ranking;
    } catch (error) {
        console.error('Fetch ranking error:', error);
        return [];
    }
}

async function fetchTeamAreas() {
    if (!currentUser) return [];

    try {
        const kw = getCurrentKW();
        const year = getCurrentYear();

        // Werbegebiete für aktuellen User
        const { data: assignments } = await supabaseClient
            .from('campaign_assignment_werber')
            .select(`
                id,
                campaign_area_id,
                campaign_areas (
                    id,
                    name,
                    region
                )
            `)
            .eq('werber_id', currentUser.id)
            .eq('kw', kw)
            .eq('year', year);

        if (!assignments || assignments.length === 0) {
            return [];
        }

        // Stats für jedes Gebiet
        const areas = await Promise.all(assignments.map(async (a) => {
            const areaId = a.campaign_area_id;

            // Records für dieses Gebiet zählen
            const { count: todayCount } = await supabaseClient
                .from('records')
                .select('*', { count: 'exact', head: true })
                .eq('werber_id', currentUser.id)
                .eq('campaign_area_id', areaId)
                .gte('created_at', new Date().toISOString().split('T')[0]);

            const { count: weekCount } = await supabaseClient
                .from('records')
                .select('*', { count: 'exact', head: true })
                .eq('werber_id', currentUser.id)
                .eq('campaign_area_id', areaId)
                .eq('kw', kw);

            return {
                id: areaId,
                name: a.campaign_areas?.name || 'Unbekannt',
                region: a.campaign_areas?.region || '',
                today: todayCount || 0,
                week: weekCount || 0,
                active: true
            };
        }));

        return areas;
    } catch (error) {
        console.error('Fetch team areas error:', error);
        return [];
    }
}

async function fetchOfflineRecords() {
    // Offline Records aus localStorage
    const offlineData = localStorage.getItem('offlineRecords');
    if (!offlineData) return [];

    try {
        return JSON.parse(offlineData);
    } catch {
        return [];
    }
}

// TC-Funktionen: Letzte 10 Records vom Team
async function fetchLatestRecords() {
    if (!currentUser) return [];

    try {
        const kw = getCurrentKW();
        const year = getCurrentYear();

        // Hol alle Werber die dem TC zugeordnet sind
        const { data: teamWerber } = await supabaseClient
            .from('campaign_assignment_werber')
            .select('werber_id')
            .eq('teamchef_id', currentUser.id)
            .eq('kw', kw)
            .eq('year', year);

        if (!teamWerber || teamWerber.length === 0) {
            // Fallback: eigene Records
            const { data } = await supabaseClient
                .from('records')
                .select(`
                    id,
                    first_name,
                    last_name,
                    email,
                    iban,
                    created_at,
                    werber_id,
                    users!records_werber_id_fkey (name)
                `)
                .eq('werber_id', currentUser.id)
                .order('created_at', { ascending: false })
                .limit(10);

            return data || [];
        }

        const werberIds = teamWerber.map(w => w.werber_id);

        const { data } = await supabaseClient
            .from('records')
            .select(`
                id,
                first_name,
                last_name,
                email,
                iban,
                created_at,
                werber_id,
                users!records_werber_id_fkey (name)
            `)
            .in('werber_id', werberIds)
            .order('created_at', { ascending: false })
            .limit(10);

        return data || [];
    } catch (error) {
        console.error('Fetch latest records error:', error);
        return [];
    }
}

// TC-Funktionen: Team-Werber für Gebietszuordnung
async function fetchTeamWerber() {
    if (!currentUser) return [];

    try {
        const kw = getCurrentKW();
        const year = getCurrentYear();

        // Hole die Zuordnungen für diese KW
        const { data: assignments } = await supabaseClient
            .from('campaign_assignment_werber')
            .select(`
                id,
                werber_id,
                campaign_area_id,
                users!campaign_assignment_werber_werber_id_fkey (id, name),
                campaign_areas (id, name)
            `)
            .eq('teamchef_id', currentUser.id)
            .eq('kw', kw)
            .eq('year', year);

        return assignments || [];
    } catch (error) {
        console.error('Fetch team werber error:', error);
        return [];
    }
}

// TC-Funktionen: Verfügbare Gebiete laden
async function fetchAvailableAreas() {
    try {
        const { data } = await supabaseClient
            .from('campaign_areas')
            .select('id, name, region')
            .eq('status', 'aktiv')
            .order('name');

        return data || [];
    } catch (error) {
        console.error('Fetch available areas error:', error);
        return [];
    }
}

// TC-Funktionen: Werber einem Gebiet zuordnen
async function assignWerberToArea(assignmentId, areaId) {
    try {
        const { error } = await supabaseClient
            .from('campaign_assignment_werber')
            .update({ campaign_area_id: areaId })
            .eq('id', assignmentId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Assign werber error:', error);
        alert('Fehler beim Zuordnen: ' + error.message);
        return false;
    }
}

// ========== VIEWS ==========
const views = {
    dashboard: async () => {
        if (!currentUser) {
            return `
                <div class="view-container">
                    <div class="auth-required-message">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <h3>Anmeldung erforderlich</h3>
                        <p>Bitte melde dich an, um dein Dashboard zu sehen.</p>
                        <button class="btn-auth" onclick="openLoginModal()">Jetzt anmelden</button>
                    </div>
                </div>
            `;
        }

        const stats = await fetchDashboardStats();
        const ranking = await fetchRankingData('month');
        const topRanking = ranking.slice(0, 3);

        return `
        <div class="view-container">
            <!-- Hero Stats (Big & Bold) -->
            <div class="hero-stat">
                <div class="hero-stat-label">Heute erfasst</div>
                <div class="hero-stat-value">${stats.today}</div>
                <div class="hero-stat-subtitle">Neue Mitglieder</div>
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
                    <div class="mini-stat-value">${stats.week}</div>
                    <div class="mini-stat-label">Diese Woche</div>
                </div>
                <div class="mini-stat animated-stat" style="--delay: 0.2s">
                    <div class="mini-stat-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                    </div>
                    <div class="mini-stat-value">${stats.month}</div>
                    <div class="mini-stat-label">Dieser Monat</div>
                </div>
                <div class="mini-stat animated-stat" style="--delay: 0.3s">
                    <div class="mini-stat-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"></path>
                        </svg>
                    </div>
                    <div class="mini-stat-value">#${stats.rank}</div>
                    <div class="mini-stat-label">Dein Rang</div>
                </div>
                <div class="mini-stat animated-stat" style="--delay: 0.4s">
                    <div class="mini-stat-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                    </div>
                    <div class="mini-stat-value">${stats.total}</div>
                    <div class="mini-stat-label">Gesamt</div>
                </div>
            </div>

            <!-- Stornoquoten -->
            <div class="section-header">
                <h3>Stornoquoten</h3>
            </div>
            <div class="mini-stats-grid" style="grid-template-columns: 1fr 1fr;">
                <div class="mini-stat">
                    <div class="mini-stat-value" style="color: ${parseFloat(stats.stornoMG) > 10 ? 'var(--danger)' : 'var(--success)'};">${stats.stornoMG}%</div>
                    <div class="mini-stat-label">Storno MG</div>
                </div>
                <div class="mini-stat">
                    <div class="mini-stat-value" style="color: ${parseFloat(stats.stornoEH) > 10 ? 'var(--danger)' : 'var(--success)'};">${stats.stornoEH}%</div>
                    <div class="mini-stat-label">Storno EH</div>
                </div>
            </div>

            <!-- Quick Actions (Horizontal Scroll) -->
            <div class="section-header">
                <h3>Schnellzugriff</h3>
            </div>
            <div class="quick-actions-scroll">
                <a href="https://office.rb-inside.de/formular/" class="action-card">
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
                ${topRanking.length > 0 ? topRanking.map(item => `
                    <div class="leaderboard-item ${item.isCurrentUser ? 'is-you' : ''}">
                        <div class="leaderboard-position ${item.position === 1 ? 'gold' : item.position === 2 ? 'silver' : 'bronze'}">
                            ${item.position}
                        </div>
                        <div class="leaderboard-info">
                            <div class="leaderboard-name">${item.name}${item.isCurrentUser ? ' (Du)' : ''}</div>
                            <div class="leaderboard-team">${item.team || ''}</div>
                        </div>
                        <div class="leaderboard-score">
                            <div class="score-value">${item.score}</div>
                            <div class="score-label">EH</div>
                        </div>
                    </div>
                `).join('') : '<div class="empty-state-text">Noch keine Daten vorhanden</div>'}
            </div>

            <!-- Current Campaign Banner -->
            ${currentUserData?.current_campaign ? `
            <div class="campaign-banner">
                <div class="campaign-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="12" r="6"></circle>
                        <circle cx="12" cy="12" r="2"></circle>
                    </svg>
                </div>
                <div class="campaign-info">
                    <div class="campaign-name">${currentUserData.current_campaign}</div>
                    <div class="campaign-team">Team: ${currentUserData.team || 'Nicht zugewiesen'}</div>
                </div>
                <div class="campaign-status">Aktiv</div>
            </div>
            ` : ''}
        </div>
    `;
    },

    team: async () => {
        if (!currentUser) {
            return `
                <div class="view-container">
                    <div class="auth-required-message">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <h3>Anmeldung erforderlich</h3>
                        <p>Bitte melde dich an, um dein Team zu sehen.</p>
                        <button class="btn-auth" onclick="openLoginModal()">Jetzt anmelden</button>
                    </div>
                </div>
            `;
        }

        const areas = await fetchTeamAreas();

        return `
        <div class="view-container">
            <h1 class="view-title">Mein Team</h1>

            <div style="background: var(--bg-card); border-radius: 12px; padding: 16px; margin-bottom: 24px; box-shadow: var(--shadow-sm);">
                <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 4px;">Kampagne</div>
                <div style="font-weight: 600; margin-bottom: 8px;">${currentUserData?.current_campaign || 'Keine aktive Kampagne'}</div>
                <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 4px;">Team</div>
                <div style="font-weight: 600;">${currentUserData?.team || 'Nicht zugewiesen'}</div>
            </div>

            <h3 style="font-size: 14px; color: var(--text-secondary); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Meine Werbegebiete</h3>
            <div class="area-list">
                ${areas.length > 0 ? areas.map(area => `
                    <a href="https://office.rb-inside.de/formular/?werbegebiet=${area.id}" class="area-card">
                        <h3>${area.name}</h3>
                        <p>Heute: ${area.today} Mitglieder • Diese Woche: ${area.week} Mitglieder</p>
                        <span class="area-badge" style="background: ${area.active ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)' : '#eeeeee'}; color: ${area.active ? 'white' : '#757575'};">
                            ${area.active ? '● Aktiv' : '○ Inaktiv'}
                        </span>
                    </a>
                `).join('') : `
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                            </svg>
                        </div>
                        <div class="empty-state-title">Keine Werbegebiete</div>
                        <div class="empty-state-text">Du bist noch keinem Werbegebiet zugewiesen.</div>
                    </div>
                `}
            </div>

            ${currentRole === 'teamleiter' || currentRole === 'teamchef' || currentRole === 'admin' ? await renderTCSection() : ''}
        </div>
    `;
    },

    ranking: async () => {
        const ranking = await fetchRankingData('month');
        const champion = ranking[0];

        return `
        <!-- Champion Banner - Fixed Top Left (below avatar) -->
        ${champion ? `
        <div class="champion-banner-fixed">
            <div class="winner-crown">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L15 9L22 9.5L17 15L18.5 22L12 18L5.5 22L7 15L2 9.5L9 9L12 2Z"/>
                </svg>
            </div>
            <div class="winner-content">
                <div class="winner-label">Champion</div>
                <div class="winner-name">${champion.name.split(' ')[0]}</div>
                <div class="winner-score">${champion.score}</div>
            </div>
        </div>
        ` : ''}

        <div class="view-container">
            <!-- Period Tabs -->
            <div class="ranking-tabs">
                <button class="ranking-tab" data-period="day" onclick="switchRankingPeriod('day')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                    </svg>
                    Tag
                </button>
                <button class="ranking-tab" data-period="week" onclick="switchRankingPeriod('week')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    Woche
                </button>
                <button class="ranking-tab active" data-period="month" onclick="switchRankingPeriod('month')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    Monat
                </button>
                <button class="ranking-tab" data-period="year" onclick="switchRankingPeriod('year')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
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
                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path>
                    </svg>
                </h3>
                <div class="flashy-ranking-list" id="rankingList">
                    ${ranking.length > 0 ? ranking.map(item => `
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
                                <div class="rank-team">${item.team || ''}</div>
                            </div>
                            <div class="rank-score">
                                <div class="score-value">${item.score}</div>
                                <div class="score-label">EH</div>
                            </div>
                        </div>
                    `).join('') : `
                        <div class="empty-state">
                            <div class="empty-state-title">Keine Daten</div>
                            <div class="empty-state-text">Für diesen Zeitraum sind noch keine Daten vorhanden.</div>
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
    },

    offline: async () => {
        const offlineRecords = await fetchOfflineRecords();

        return `
        <div class="view-container">
            <h1 class="view-title">Offline Gespeichert</h1>

            ${offlineRecords.length > 0 ? `
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
                        ${offlineRecords.length} Datensätze warten auf Synchronisation
                    </p>
                </div>

                <div class="area-list">
                    ${offlineRecords.map(item => `
                        <div class="area-card">
                            <h3>${item.name || 'Unbekannt'}</h3>
                            <p>Werbegebiet: ${item.area || 'Unbekannt'}</p>
                            <p style="font-size: 12px; color: var(--text-tertiary); margin-top: 4px;">${item.timestamp || ''}</p>
                        </div>
                    `).join('')}
                </div>

                <button class="btn-primary" style="margin-top: 16px; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="syncOfflineRecords()">
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
    `;
    },

    profil: async () => {
        if (!currentUser) {
            return `
                <div class="view-container">
                    <div class="auth-required-message">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <h3>Anmeldung erforderlich</h3>
                        <p>Bitte melde dich an, um dein Profil zu bearbeiten.</p>
                        <button class="btn-auth" onclick="openLoginModal()">Jetzt anmelden</button>
                    </div>
                </div>
            `;
        }

        const user = currentUserData || {};
        const initials = getInitials(user.name);

        return `
        <div class="view-container">
            <h1 class="view-title">Mein Profil</h1>

            <!-- Profile Header -->
            <div class="profile-header">
                <div class="profile-avatar-section">
                    <img src="${user.foto_intern || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d97706'/%3E%3Ctext x='50' y='68' text-anchor='middle' font-size='40' fill='white' font-family='Arial'%3E${initials}%3C/text%3E%3C/svg%3E`}"
                         class="profile-avatar" id="profileAvatar">
                </div>
                <div class="profile-header-info">
                    <h2 class="profile-name">${user.name || 'Unbekannt'}</h2>
                    <div class="profile-role-badge">${getRoleLabel(currentRole)}</div>
                </div>
            </div>

            <!-- Personal Data Section -->
            <div class="profile-form-section">
                <h3 class="section-title">Persönliche Daten</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">Vorname *</label>
                        <input type="text" class="form-input" id="profileFirstname" placeholder="Vorname" value="${user.vorname || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Nachname *</label>
                        <input type="text" class="form-input" id="profileLastname" placeholder="Nachname" value="${user.nachname || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">E-Mail *</label>
                        <input type="email" class="form-input" id="profileEmail" placeholder="email@example.com" value="${user.email || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Telefon</label>
                        <input type="tel" class="form-input" id="profilePhone" placeholder="+49 123 456789" value="${user.telefon || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">GameTag</label>
                        <input type="text" class="form-input" id="profileGametag" placeholder="Dein GameTag" value="${user.gametag || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Kleidergröße</label>
                        <select class="form-input" id="profileClothingSize">
                            <option value="">Bitte wählen</option>
                            ${['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map(size =>
                                `<option value="${size}" ${user.kleidergroesse === size ? 'selected' : ''}>${size}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
            </div>

            <!-- Address Section -->
            <div class="profile-form-section">
                <h3 class="section-title">Adresse</h3>
                <div class="form-grid">
                    <div class="form-group form-group-2col">
                        <label class="form-label">Straße</label>
                        <input type="text" class="form-input" id="profileStreet" placeholder="Musterstraße" value="${user.strasse || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Hausnummer</label>
                        <input type="text" class="form-input" id="profileHouseNumber" placeholder="42" value="${user.hausnummer || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">PLZ</label>
                        <input type="text" class="form-input" id="profileZip" placeholder="12345" value="${user.plz || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Stadt</label>
                        <input type="text" class="form-input" id="profileCity" placeholder="Berlin" value="${user.stadt || ''}">
                    </div>
                </div>
            </div>

            <!-- Bank Details Section -->
            <div class="profile-form-section">
                <h3 class="section-title">Bankverbindung</h3>
                <div class="form-grid">
                    <div class="form-group form-group-2col">
                        <label class="form-label">Kontoinhaber</label>
                        <input type="text" class="form-input" id="profileAccountHolder" placeholder="Max Mustermann" value="${user.kontoinhaber || ''}">
                    </div>
                    <div class="form-group form-group-2col">
                        <label class="form-label">IBAN</label>
                        <input type="text" class="form-input" id="profileIban" placeholder="DE89 3704 0044 0532 0130 00" value="${user.iban || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">BIC</label>
                        <input type="text" class="form-input" id="profileBic" placeholder="COBADEFFXXX" value="${user.bic || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Bank</label>
                        <input type="text" class="form-input" id="profileBank" placeholder="Commerzbank" value="${user.bank || ''}">
                    </div>
                </div>
            </div>

            <!-- Tax Information Section -->
            <div class="profile-form-section">
                <h3 class="section-title">Steuerinformationen</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">Steuer-ID</label>
                        <input type="text" class="form-input" id="profileTaxId" placeholder="12 345 678 901" value="${user.steuer_id || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">SV-Nummer</label>
                        <input type="text" class="form-input" id="profileSvNumber" placeholder="12 345678 A 123" value="${user.sv_nummer || ''}">
                    </div>
                </div>
            </div>

            <!-- Save Button -->
            <div class="profile-actions">
                <button class="btn-primary btn-save" onclick="saveProfile()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    Änderungen speichern
                </button>
            </div>
        </div>
    `;
    },

    einstellungen: () => `
        <div class="view-container">
            <h1 class="view-title">Einstellungen</h1>

            <div class="profile-section">
                <h3>Allgemein</h3>
                <div class="profile-item">
                    <span class="profile-label">Benachrichtigungen</span>
                    <input type="checkbox" checked style="width: 20px; height: 20px;">
                </div>
                <div class="profile-item">
                    <span class="profile-label">Offline-Modus</span>
                    <input type="checkbox" checked style="width: 20px; height: 20px;">
                </div>
            </div>

            <div class="profile-section">
                <h3>Sichtbarkeit</h3>
                <div class="profile-item">
                    <span class="profile-label">Im Ranking anzeigen</span>
                    <input type="checkbox" id="settingRankingVisible" ${currentUserData?.ranking_visible !== false ? 'checked' : ''} style="width: 20px; height: 20px;">
                </div>
                <div class="profile-item">
                    <span class="profile-label">Ghost-Modus</span>
                    <input type="checkbox" id="settingGhostMode" ${currentUserData?.ghost_mode ? 'checked' : ''} style="width: 20px; height: 20px;">
                </div>
            </div>

            <div class="profile-section">
                <h3>Über</h3>
                <div class="profile-item">
                    <span class="profile-label">Version</span>
                    <span class="profile-value">2.0.0</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Build</span>
                    <span class="profile-value">${new Date().toISOString().split('T')[0]}</span>
                </div>
            </div>

            <button class="btn-secondary" style="margin-top: 16px; background: ${currentUser ? '#ffebee' : 'var(--accent-gradient)'}; color: ${currentUser ? '#c62828' : 'white'}; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="${currentUser ? 'handleLogout()' : 'openLoginModal()'}">
                <svg style="width: 18px; height: 18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                ${currentUser ? 'Logout' : 'Login'}
            </button>
        </div>
    `
};

// ========== TC SECTION RENDER ==========
async function renderTCSection() {
    const latestRecords = await fetchLatestRecords();
    const teamWerber = await fetchTeamWerber();

    // Format timestamp
    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const hours = date.getHours().toString().padStart(2, '0');
        const mins = date.getMinutes().toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${day}.${month}. ${hours}:${mins}`;
    };

    return `
        <div style="margin-top: 32px;">
            <!-- Letzte Schriebe Kärtchen -->
            <h3 style="font-size: 14px; color: var(--text-secondary); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                📝 Letzte Schriebe
            </h3>
            <div class="latest-records-grid">
                ${latestRecords.length > 0 ? latestRecords.map(record => `
                    <div class="record-card">
                        <div class="record-card-header">
                            <span class="record-name">${record.first_name || ''} ${record.last_name || ''}</span>
                            <span class="record-time">${formatTime(record.created_at)}</span>
                        </div>
                        <div class="record-card-body">
                            <div class="record-status">
                                <span class="status-badge ${record.email ? 'status-ok' : 'status-warn'}">
                                    ${record.email ? '✉️ E-Mail' : '⚠️ Keine E-Mail'}
                                </span>
                                <span class="status-badge ${record.iban ? 'status-ok' : 'status-warn'}">
                                    ${record.iban ? '💳 IBAN' : '⚠️ Keine IBAN'}
                                </span>
                            </div>
                            <div class="record-werber">
                                👤 ${record.users?.name || 'Unbekannt'}
                            </div>
                        </div>
                    </div>
                `).join('') : `
                    <div style="grid-column: 1/-1; text-align: center; padding: 24px; color: var(--text-secondary);">
                        Noch keine Datensätze vorhanden
                    </div>
                `}
            </div>

            <!-- Werber-Zuordnung -->
            <h3 style="font-size: 14px; color: var(--text-secondary); margin: 24px 0 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                📋 Werber-Zuordnung (KW ${getCurrentKW()})
            </h3>
            <div class="werber-assignment-list" id="werberAssignmentList">
                ${teamWerber.length > 0 ? teamWerber.map(w => `
                    <div class="werber-assignment-item">
                        <div class="werber-name">${w.users?.name || 'Unbekannt'}</div>
                        <select class="werber-area-select" onchange="handleAreaChange('${w.id}', this.value)">
                            <option value="">-- Gebiet wählen --</option>
                            ${w.campaign_areas ? `<option value="${w.campaign_area_id}" selected>${w.campaign_areas.name}</option>` : ''}
                        </select>
                    </div>
                `).join('') : `
                    <div style="text-align: center; padding: 16px; color: var(--text-secondary);">
                        Keine Werber zugewiesen. Bitte im Office zuweisen.
                    </div>
                `}
            </div>

            <!-- Action Buttons -->
            <div style="display: flex; gap: 8px; margin-top: 16px;">
                <button class="btn-secondary" onclick="refreshTCSection()">
                    🔄 Aktualisieren
                </button>
            </div>
        </div>
    `;
}

// TC: Area change handler
async function handleAreaChange(assignmentId, areaId) {
    if (!areaId) return;

    const success = await assignWerberToArea(assignmentId, areaId);
    if (success) {
        // Visual feedback
        const select = document.querySelector(`select[onchange*="${assignmentId}"]`);
        if (select) {
            select.style.borderColor = 'var(--success)';
            setTimeout(() => {
                select.style.borderColor = '';
            }, 2000);
        }
    }
}

// TC: Refresh the TC section
async function refreshTCSection() {
    showLoading(true);
    await loadView('team');
    showLoading(false);
}

// Load available areas into selects
async function loadAreasIntoSelects() {
    const areas = await fetchAvailableAreas();
    const selects = document.querySelectorAll('.werber-area-select');

    selects.forEach(select => {
        const currentValue = select.value;
        // Keep first option and selected
        const firstOption = select.querySelector('option:first-child');
        const selectedOption = select.querySelector('option[selected]');
        select.innerHTML = '';
        if (firstOption) select.appendChild(firstOption);

        areas.forEach(area => {
            const opt = document.createElement('option');
            opt.value = area.id;
            opt.textContent = area.name;
            if (area.id === currentValue) opt.selected = true;
            select.appendChild(opt);
        });

        // Re-add selected if it exists
        if (selectedOption && !select.querySelector(`option[value="${selectedOption.value}"]`)) {
            select.insertBefore(selectedOption, select.firstChild.nextSibling);
        }
    });
}

// ========== ADDITIONAL FUNCTIONS ==========
async function switchRankingPeriod(period) {
    // Update active tab
    document.querySelectorAll('.ranking-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.period === period);
    });

    // Reload ranking data
    const ranking = await fetchRankingData(period);
    const listEl = document.getElementById('rankingList');

    if (listEl) {
        listEl.innerHTML = ranking.length > 0 ? ranking.map(item => `
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
                    <div class="rank-team">${item.team || ''}</div>
                </div>
                <div class="rank-score">
                    <div class="score-value">${item.score}</div>
                    <div class="score-label">EH</div>
                </div>
            </div>
        `).join('') : `
            <div class="empty-state">
                <div class="empty-state-title">Keine Daten</div>
                <div class="empty-state-text">Für diesen Zeitraum sind noch keine Daten vorhanden.</div>
            </div>
        `;
    }
}

async function saveProfile() {
    if (!currentUser) return;

    showLoading(true);

    try {
        const updateData = {
            vorname: document.getElementById('profileFirstname')?.value || '',
            nachname: document.getElementById('profileLastname')?.value || '',
            email: document.getElementById('profileEmail')?.value || '',
            telefon: document.getElementById('profilePhone')?.value || '',
            gametag: document.getElementById('profileGametag')?.value || '',
            kleidergroesse: document.getElementById('profileClothingSize')?.value || '',
            strasse: document.getElementById('profileStreet')?.value || '',
            hausnummer: document.getElementById('profileHouseNumber')?.value || '',
            plz: document.getElementById('profileZip')?.value || '',
            stadt: document.getElementById('profileCity')?.value || '',
            kontoinhaber: document.getElementById('profileAccountHolder')?.value || '',
            iban: document.getElementById('profileIban')?.value || '',
            bic: document.getElementById('profileBic')?.value || '',
            bank: document.getElementById('profileBank')?.value || '',
            steuer_id: document.getElementById('profileTaxId')?.value || '',
            sv_nummer: document.getElementById('profileSvNumber')?.value || ''
        };

        // Update name from vorname + nachname
        if (updateData.vorname && updateData.nachname) {
            updateData.name = `${updateData.vorname} ${updateData.nachname}`;
        }

        const { error } = await supabaseClient
            .from('users')
            .update(updateData)
            .eq('id', currentUser.id);

        if (error) throw error;

        // Reload user data
        await loadUserData();
        alert('Profil erfolgreich gespeichert!');

    } catch (error) {
        console.error('Save profile error:', error);
        alert('Fehler beim Speichern: ' + error.message);
    } finally {
        showLoading(false);
    }
}

async function syncOfflineRecords() {
    const offlineData = localStorage.getItem('offlineRecords');
    if (!offlineData) return;

    showLoading(true);

    try {
        const records = JSON.parse(offlineData);

        for (const record of records) {
            const { error } = await supabaseClient
                .from('records')
                .insert(record.data);

            if (error) {
                console.error('Sync error for record:', error);
            }
        }

        // Clear offline storage
        localStorage.removeItem('offlineRecords');
        alert('Alle Datensätze erfolgreich synchronisiert!');
        loadView('offline');

    } catch (error) {
        console.error('Sync error:', error);
        alert('Fehler beim Synchronisieren: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// ========== ROUTER ==========
async function loadView(viewName) {
    const content = document.getElementById('appContent');

    if (!views[viewName]) {
        viewName = 'dashboard';
    }

    showLoading(true);

    try {
        // Get view content (can be async)
        const viewContent = await views[viewName]();
        content.innerHTML = viewContent;

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'instant' });
        content.scrollTop = 0;

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

    } catch (error) {
        console.error('Load view error:', error);
        content.innerHTML = `
            <div class="view-container">
                <div class="empty-state">
                    <div class="empty-state-title">Fehler</div>
                    <div class="empty-state-text">Die Ansicht konnte nicht geladen werden.</div>
                </div>
            </div>
        `;
    } finally {
        showLoading(false);
    }
}

// ========== EVENT LISTENERS ==========
document.addEventListener('DOMContentLoaded', async function() {
    // Check auth state first
    await checkAuthState();

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

    // Avatar click opens sidebar
    document.getElementById('headerAvatar').addEventListener('click', () => {
        openSidebar();
    });

    // Overlay
    document.getElementById('overlay').addEventListener('click', () => {
        closeSidebar();
    });

    // FAB button
    document.getElementById('fab').addEventListener('click', () => {
        window.location.href = 'https://office.rb-inside.de/formular/';
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (currentUser) {
            handleLogout();
        } else {
            openLoginModal();
        }
    });

    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // Close login modal
    document.getElementById('closeLoginModal').addEventListener('click', closeLoginModal);

    // Close modal on backdrop click
    document.getElementById('loginModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('loginModal')) {
            closeLoginModal();
        }
    });

    // Hash change handler
    window.addEventListener('hashchange', () => {
        const view = window.location.hash.substring(1) || 'dashboard';
        loadView(view);
    });

    // Initial load
    const initialView = window.location.hash.substring(1) || 'dashboard';
    loadView(initialView);
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

// ========== SERVICE WORKER (PWA) ==========
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        console.log('PWA ready for service worker registration');
    });
}
