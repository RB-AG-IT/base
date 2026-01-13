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

// ========== CACHE SYSTEM ==========
const CACHE_PREFIX = 'base_cache_';
const CACHE_DURATION = 5 * 60 * 1000; // 5 Minuten

function cacheSet(key, data) {
    try {
        const cacheItem = {
            data: data,
            timestamp: Date.now()
        };
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheItem));
    } catch (e) {
        console.warn('Cache write failed:', e);
    }
}

function cacheGet(key, maxAge = CACHE_DURATION) {
    try {
        const item = localStorage.getItem(CACHE_PREFIX + key);
        if (!item) return null;

        const cacheItem = JSON.parse(item);
        const age = Date.now() - cacheItem.timestamp;

        // Daten zurückgeben auch wenn abgelaufen (stale-while-revalidate)
        return {
            data: cacheItem.data,
            isStale: age > maxAge
        };
    } catch (e) {
        return null;
    }
}

function cacheClear() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
            localStorage.removeItem(key);
        }
    });
}

function cacheInvalidate(key) {
    localStorage.removeItem(CACHE_PREFIX + key);
}

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
    return getWeekNumber(new Date());
}

function getCurrentYear() {
    return new Date().getFullYear();
}

// ========== TOAST NOTIFICATIONS ==========
function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'error' ? '!' : type === 'success' ? '!' : 'i'}</span>
        <span class="toast-message">${message}</span>
    `;

    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ========== FORMULAR HELPER ==========
async function openFormular() {
    if (!currentUser) {
        showToast('Bitte zuerst anmelden', 'error');
        return;
    }

    const areas = await fetchTeamAreas();

    if (areas.length === 0) {
        showToast('Kein Gebiet zugewiesen. Bitte wende dich an deinen Teamchef.', 'error');
        return;
    }

    const area = areas[0];
    const url = new URL('/formular/', window.location.origin);
    url.searchParams.set('botschafter', currentUser.id);
    url.searchParams.set('werbegebiet', area.id);
    if (area.campaign_id) {
        url.searchParams.set('kampagne', area.campaign_id);
    }

    window.open(url.toString(), '_blank');
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
        cacheClear(); // Cache löschen bei neuem Login
        await loadUserData();
        closeLoginModal();
        loadView('dashboard', true); // Force refresh

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
        cacheClear(); // Cache löschen bei Logout
        await supabaseClient.auth.signOut();
        currentUser = null;
        currentUserData = null;
        currentRole = 'werber';
        updateAuthUI();
        loadView('dashboard', true); // Force refresh
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
        // Users Tabelle
        const { data: userData, error: userError } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single();

        if (userError) throw userError;

        // User Profiles Tabelle
        const { data: profileData } = await supabaseClient
            .from('user_profiles')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();

        // Aktuelle Kampagne laden
        let currentCampaign = null;
        const kw = getCurrentKW();

        // Finde Kampagnenzuweisung für aktuelle KW
        const { data: assignments } = await supabaseClient
            .from('campaign_assignments')
            .select('id, campaign_id')
            .eq('kw', kw);

        if (assignments && assignments.length > 0) {
            const assignmentIds = assignments.map(a => a.id);

            // Prüfe ob User in dieser Kampagne zugewiesen ist
            const { data: werberAssignment } = await supabaseClient
                .from('campaign_assignment_werber')
                .select('assignment_id')
                .eq('werber_id', currentUser.id)
                .in('assignment_id', assignmentIds)
                .limit(1)
                .single();

            if (werberAssignment) {
                const assignment = assignments.find(a => a.id === werberAssignment.assignment_id);
                if (assignment?.campaign_id) {
                    // Kampagnen-Name laden
                    const { data: campaign } = await supabaseClient
                        .from('campaigns')
                        .select('name')
                        .eq('id', assignment.campaign_id)
                        .single();

                    currentCampaign = campaign?.name || null;
                }
            }
        }

        // Merge: Profile überschreibt Users + Kampagne hinzufügen
        currentUserData = { ...userData, ...profileData, current_campaign: currentCampaign };
        currentRole = userData.role || 'werber';
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

        // Avatar update - Profilbild oder Initialen-Fallback
        const initials = getInitials(currentUserData.name);
        const fallbackAvatar = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Ccircle cx='24' cy='24' r='24' fill='%23d97706'/%3E%3Ctext x='24' y='32' text-anchor='middle' font-size='18' fill='white' font-family='Arial' font-weight='bold'%3E${initials}%3C/text%3E%3C/svg%3E`;
        const avatarUrl = currentUserData.photo_intern_url || fallbackAvatar;
        if (headerAvatar) headerAvatar.src = avatarUrl;
        if (sideMenuAvatar) sideMenuAvatar.src = avatarUrl;
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

        // Records zählen (nach start_date = Unterschriftsdatum)
        const { data: recordsData } = await supabaseClient
            .from('records')
            .select('id, start_date, record_status')
            .eq('werber_id', userId)
            .gte('start_date', `${year}-01-01`);

        // Heute
        const today = new Date().toISOString().split('T')[0];
        const todayRecords = recordsData?.filter(r => r.start_date === today).length || 0;
        const todayEH = ehData?.filter(r => r.created_at?.startsWith(today)).reduce((sum, r) => sum + (r.einheiten || 0), 0) || 0;

        // Diese Woche
        const weekRecords = recordsData?.filter(r => {
            if (!r.start_date) return false;
            const recordDate = new Date(r.start_date + 'T00:00:00');
            const recordKW = getWeekNumber(recordDate);
            return recordKW === kw;
        }).length || 0;

        // Dieser Monat
        const month = new Date().getMonth();
        const monthRecords = recordsData?.filter(r => {
            if (!r.start_date) return false;
            const recordDate = new Date(r.start_date + 'T00:00:00');
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
            todayEH: todayEH,
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
    // ISO 8601 Kalenderwoche
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7; // Sonntag = 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum); // Zum Donnerstag der Woche
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
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

async function fetchRankingData(period = 'day') {
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

        // User-Namen holen (nur sichtbare User: ranking_enabled=true, ghost_mode=false)
        const userIds = Object.keys(userTotals);
        if (userIds.length === 0) return [];

        const { data: profiles } = await supabaseClient
            .from('user_profiles')
            .select('user_id, game_tag, first_name, last_name, photo_intern_url, ranking_enabled, ghost_mode')
            .in('user_id', userIds);

        // Filtere User die nicht im Ranking angezeigt werden sollen
        const visibleProfiles = profiles?.filter(p =>
            p.ranking_enabled !== false && p.ghost_mode !== true
        ) || [];

        const userMap = {};
        visibleProfiles.forEach(p => {
            userMap[p.user_id] = p;
        });

        // Ranking erstellen (nur sichtbare User)
        const ranking = Object.entries(userTotals)
            .filter(([userId]) => userMap[userId]) // Nur User die sichtbar sind
            .map(([userId, eh]) => ({
                userId,
                name: userMap[userId]?.game_tag || `${userMap[userId]?.first_name || ''} ${userMap[userId]?.last_name || ''}`.trim() || 'Unbekannt',
                photo: userMap[userId]?.photo_intern_url || null,
                team: '',
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

        // Get all assignments for current user in current KW via campaign_assignments
        const { data: parentAssignments } = await supabaseClient
            .from('campaign_assignments')
            .select('id, campaign_id')
            .eq('kw', kw);

        if (!parentAssignments || parentAssignments.length === 0) {
            return [];
        }

        const assignmentIds = parentAssignments.map(a => a.id);

        // Get user's werber assignments for these parent assignments
        const { data: werberAssignments } = await supabaseClient
            .from('campaign_assignment_werber')
            .select(`
                id,
                assignment_id,
                campaign_area_id,
                campaign_areas (
                    id,
                    name,
                    campaign_id
                )
            `)
            .eq('werber_id', currentUser.id)
            .in('assignment_id', assignmentIds);

        if (!werberAssignments || werberAssignments.length === 0) {
            return [];
        }

        // Stats für jedes Gebiet
        const areas = await Promise.all(werberAssignments.map(async (a) => {
            const areaId = a.campaign_area_id;
            if (!areaId) return null;

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
                campaign_id: a.campaign_areas?.campaign_id || null,
                today: todayCount || 0,
                week: weekCount || 0,
                active: true
            };
        }));

        return areas.filter(a => a !== null);
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

        // Get TC's assignment for current KW via campaign_assignments table
        const { data: tcAssignment } = await supabaseClient
            .from('campaign_assignments')
            .select(`
                id,
                campaign_id,
                campaign_assignment_werber (werber_id)
            `)
            .eq('teamchef_id', currentUser.id)
            .eq('kw', kw);

        if (!tcAssignment || tcAssignment.length === 0) {
            // Fallback: eigene Records
            const { data } = await supabaseClient
                .from('records')
                .select(`
                    id, first_name, last_name, email, iban, created_at, werber_id,
                    users!records_werber_id_fkey (name),
                    campaign_areas (id, name)
                `)
                .eq('werber_id', currentUser.id)
                .order('created_at', { ascending: false })
                .limit(10);
            return data || [];
        }

        // Extract werber IDs and campaign IDs from nested structure
        const werberIds = [];
        const campaignIds = [];
        tcAssignment.forEach(a => {
            if (a.campaign_id) campaignIds.push(a.campaign_id);
            a.campaign_assignment_werber?.forEach(w => {
                if (w.werber_id) werberIds.push(w.werber_id);
            });
        });

        if (werberIds.length === 0) return [];

        // Query mit Kampagnen-Filter
        let query = supabaseClient
            .from('records')
            .select(`
                id, first_name, last_name, created_at, werber_id, yearly_amount,
                users!records_werber_id_fkey (name),
                campaign_areas (id, name)
            `)
            .in('werber_id', werberIds);

        // Nach Kampagne filtern falls vorhanden
        if (campaignIds.length > 0) {
            query = query.in('campaign_id', campaignIds);
        }

        const { data } = await query
            .order('created_at', { ascending: false })
            .limit(10);

        return data || [];
    } catch (error) {
        console.error('Fetch latest records error:', error);
        return [];
    }
}

// TC-Funktionen: Prüft ob User als TC für aktuelle KW eingetragen ist
async function isUserTC() {
    if (!currentUser) return false;
    const kw = getCurrentKW();

    const { data } = await supabaseClient
        .from('campaign_assignments')
        .select('id')
        .eq('kw', kw)
        .eq('teamchef_id', currentUser.id)
        .maybeSingle();

    return !!data;
}

// TC-Funktionen: Team-Werber für Gebietszuordnung
async function fetchTeamWerber() {
    if (!currentUser) return { campaignId: null, werber: [] };

    try {
        const kw = getCurrentKW();

        // Get TC's assignment for current KW via campaign_assignments table
        const { data: tcAssignment } = await supabaseClient
            .from('campaign_assignments')
            .select('id, campaign_id')
            .eq('teamchef_id', currentUser.id)
            .eq('kw', kw)
            .single();

        if (!tcAssignment) {
            return { campaignId: null, werber: [] };
        }

        // Get all Werber for this assignment
        const { data: werberAssignments } = await supabaseClient
            .from('campaign_assignment_werber')
            .select(`
                id,
                werber_id,
                campaign_area_id,
                users!campaign_assignment_werber_werber_id_fkey (id, name),
                campaign_areas (id, name)
            `)
            .eq('assignment_id', tcAssignment.id);

        return {
            campaignId: tcAssignment.campaign_id,
            werber: werberAssignments || []
        };
    } catch (error) {
        console.error('Fetch team werber error:', error);
        return { campaignId: null, werber: [] };
    }
}

// TC-Funktionen: Verfügbare Gebiete laden (filtered by campaign)
async function fetchAvailableAreas(campaignId) {
    if (!campaignId) return [];

    try {
        const { data } = await supabaseClient
            .from('campaign_areas')
            .select('id, name, plz')
            .eq('campaign_id', campaignId)
            .order('name');

        return data || [];
    } catch (error) {
        console.error('Fetch available areas error:', error);
        return [];
    }
}

// TC-Funktionen: Werber einem Gebiet zuordnen
async function assignWerberToArea(assignmentId, areaId) {
    console.log('assignWerberToArea called:', { assignmentId, areaId });
    try {
        const { data, error } = await supabaseClient
            .from('campaign_assignment_werber')
            .update({ campaign_area_id: areaId })
            .eq('id', assignmentId)
            .select();

        console.log('Update result:', { data, error });

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
        const ranking = await fetchRankingData('day');
        const topRanking = ranking.slice(0, 3);

        return `
        <div class="view-container">
            <!-- Hero Stats (Big & Bold) -->
            <div class="hero-stat">
                <div class="hero-stat-label">Heute erfasst</div>
                <div class="hero-stat-value" style="font-size: 24px;">MG: ${stats.today} EH: ${stats.todayEH.toFixed(2)}</div>
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
                <a href="javascript:void(0)" onclick="openFormular()" class="action-card">
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
                    <div class="leaderboard-item ${item.isCurrentUser ? 'is-you' : ''} rank-${item.position}">
                        <img src="${item.photo || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23d97706'/%3E%3Ctext x='20' y='26' text-anchor='middle' font-size='16' fill='white' font-family='Arial'%3E${item.name.charAt(0)}%3C/text%3E%3C/svg%3E`}" class="leaderboard-avatar">
                        <div class="leaderboard-info">
                            <div class="leaderboard-name">${item.name}${item.isCurrentUser ? ' (Du)' : ''}</div>
                            <div class="leaderboard-team">${item.team || ''}</div>
                        </div>
                        <div class="leaderboard-score">
                            <div class="score-value">${item.score.toFixed(2)}</div>
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
                <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 4px;">Zugewiesene Kampagne</div>
                <div style="font-weight: 600;">${currentUserData?.current_campaign || 'Keine aktive Kampagne'}</div>
            </div>

            <h3 style="font-size: 14px; color: var(--text-secondary); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Meine Werbegebiete</h3>
            <div class="area-list">
                ${areas.length > 0 ? areas.map(area => `
                    <a href="/formular/?botschafter=${currentUser.id}&werbegebiet=${area.id}${area.campaign_id ? '&kampagne=' + area.campaign_id : ''}" class="area-card">
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

            ${currentRole === 'admin' || await isUserTC() ? await renderTCSection() : ''}
        </div>
    `;
    },

    ranking: async () => {
        const ranking = await fetchRankingData('day');
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
                <div class="winner-name">${champion.name}</div>
                <div class="winner-score">${champion.score.toFixed(2)} EH</div>
            </div>
        </div>
        ` : ''}

        <div class="view-container">
            <!-- Period Tabs -->
            <div class="ranking-tabs">
                <button class="ranking-tab active" data-period="day" onclick="switchRankingPeriod('day')">
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
                <button class="ranking-tab" data-period="month" onclick="switchRankingPeriod('month')">
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
                            <img src="${item.photo || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23d97706'/%3E%3Ctext x='20' y='26' text-anchor='middle' font-size='16' fill='white' font-family='Arial'%3E${item.name.charAt(0)}%3C/text%3E%3C/svg%3E`}" class="rank-avatar">
                            <div class="rank-info">
                                <div class="rank-name">${item.name} ${item.isCurrentUser ? '<span class="you-badge">Du</span>' : ''}</div>
                                <div class="rank-team">${item.team || ''}</div>
                            </div>
                            <div class="rank-score">
                                <div class="score-value">${item.score.toFixed(2)}</div>
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
                    ${offlineRecords.map(item => {
                        const timestamp = item.createdAt ? new Date(item.createdAt).toLocaleString('de-DE') : '';
                        const name = item.name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Unbekannt';
                        return `
                        <div class="area-card">
                            <h3>${name}</h3>
                            <p>Werbegebiet: ${item.area || 'Unbekannt'}</p>
                            <p style="font-size: 12px; color: var(--text-tertiary); margin-top: 4px;">Erstellt: ${timestamp}</p>
                        </div>
                    `}).join('')}
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
                    <img src="${user.photo_intern_url || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d97706'/%3E%3Ctext x='50' y='68' text-anchor='middle' font-size='40' fill='white' font-family='Arial'%3E${initials}%3C/text%3E%3C/svg%3E`}"
                         class="profile-avatar" id="profileAvatar">
                </div>
                <div class="profile-header-info">
                    <h2 class="profile-name">${user.name || 'Unbekannt'}</h2>
                    <div class="profile-role-badge">${getRoleLabel(currentRole)}</div>
                </div>
            </div>

            <!-- Profilbilder -->
            <div class="profile-form-section">
                <h3 class="section-title">Profilbilder</h3>
                <div class="photo-upload-row">
                    <div class="photo-upload-box">
                        <div class="photo-upload-area" onclick="document.getElementById('photoInternInput').click()">
                            ${user.photo_intern_url
                                ? `<img src="${user.photo_intern_url}" class="photo-preview">`
                                : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="photo-placeholder">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                   </svg>`
                            }
                        </div>
                        <span class="photo-label">Intern</span>
                        <input type="file" id="photoInternInput" accept="image/*" hidden onchange="uploadProfilePhoto('intern', this)">
                    </div>
                    <div class="photo-upload-box">
                        <div class="photo-upload-area" onclick="document.getElementById('photoExternInput').click()">
                            ${user.photo_extern_url
                                ? `<img src="${user.photo_extern_url}" class="photo-preview">`
                                : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="photo-placeholder">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                   </svg>`
                            }
                        </div>
                        <span class="photo-label">Extern (DRK)</span>
                        <input type="file" id="photoExternInput" accept="image/*" hidden onchange="uploadProfilePhoto('extern', this)">
                    </div>
                </div>
            </div>

            <!-- Personal Data Section -->
            <div class="profile-form-section">
                <h3 class="section-title">Persönliche Daten</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">Vorname *</label>
                        <input type="text" class="form-input" id="profileFirstname" placeholder="Vorname" value="${user.first_name || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Nachname *</label>
                        <input type="text" class="form-input" id="profileLastname" placeholder="Nachname" value="${user.last_name || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">E-Mail *</label>
                        <input type="email" class="form-input" id="profileEmail" placeholder="email@example.com" value="${user.email || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Telefon</label>
                        <input type="tel" class="form-input" id="profilePhone" placeholder="+49 123 456789" value="${user.phone || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">GameTag</label>
                        <input type="text" class="form-input" id="profileGametag" placeholder="Dein GameTag" value="${user.game_tag || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Kleidergröße</label>
                        <select class="form-input" id="profileClothingSize">
                            <option value="">Bitte wählen</option>
                            ${['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map(size =>
                                `<option value="${size}" ${user.clothing_size === size ? 'selected' : ''}>${size}</option>`
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
                        <input type="text" class="form-input" id="profileStreet" placeholder="Musterstraße" value="${user.street || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Hausnummer</label>
                        <input type="text" class="form-input" id="profileHouseNumber" placeholder="42" value="${user.house_number || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">PLZ</label>
                        <input type="text" class="form-input" id="profileZip" placeholder="12345" value="${user.postal_code || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Stadt</label>
                        <input type="text" class="form-input" id="profileCity" placeholder="Berlin" value="${user.city || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Bundesland</label>
                        <input type="text" class="form-input" id="profileState" placeholder="Bayern" value="${user.state || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Land</label>
                        <input type="text" class="form-input" id="profileCountry" placeholder="Deutschland" value="${user.country || ''}">
                    </div>
                    <div class="form-group form-group-2col">
                        <label class="form-label">Adresszusatz</label>
                        <input type="text" class="form-input" id="profileAddressExtra" placeholder="Apartment 4B" value="${user.address_extra || ''}">
                    </div>
                </div>
            </div>

            <!-- Bank Details Section -->
            <div class="profile-form-section">
                <h3 class="section-title">Bankverbindung</h3>
                <div class="form-grid">
                    <div class="form-group form-group-2col">
                        <label class="form-label">Kontoinhaber</label>
                        <input type="text" class="form-input" id="profileAccountHolder" placeholder="Max Mustermann" value="${user.account_holder || ''}">
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
                        <input type="text" class="form-input" id="profileBank" placeholder="Commerzbank" value="${user.bank_name || ''}">
                    </div>
                </div>
            </div>

            <!-- Tax Information Section (Privatperson) -->
            <div class="profile-form-section">
                <h3 class="section-title">Steuer (Privatperson)</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">Steuer-ID</label>
                        <input type="text" class="form-input" id="profileTaxId" placeholder="12 345 678 901" value="${user.tax_id || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">SV-Nummer</label>
                        <input type="text" class="form-input" id="profileSvNumber" placeholder="12 345678 A 123" value="${user.social_security_number || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">KVNR</label>
                        <input type="text" class="form-input" id="profileKvnr" placeholder="A123456789" value="${user.kvnr || ''}">
                    </div>
                </div>
            </div>

            <!-- Tax Information Section (Gewerbe) -->
            <div class="profile-form-section">
                <h3 class="section-title">Steuer (Gewerbe)</h3>
                <div class="form-grid">
                    <div class="form-group form-group-2col">
                        <label class="form-label">Firmenname</label>
                        <input type="text" class="form-input" id="profileCompanyName" placeholder="Musterfirma GmbH" value="${user.company_name || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Steuernummer</label>
                        <input type="text" class="form-input" id="profileTaxNumber" placeholder="123/456/78901" value="${user.tax_number || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">USt-IdNr</label>
                        <input type="text" class="form-input" id="profileVatId" placeholder="DE123456789" value="${user.vat_id || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">USt-pflichtig</label>
                        <select class="form-input" id="profileVatLiable">
                            <option value="">Bitte wählen</option>
                            <option value="true" ${user.is_vat_liable === true ? 'selected' : ''}>Ja</option>
                            <option value="false" ${user.is_vat_liable === false ? 'selected' : ''}>Nein</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Password Change Section -->
            <div class="profile-form-section">
                <h3 class="section-title">Passwort ändern</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">Neues Passwort</label>
                        <input type="password" class="form-input" id="profileNewPassword" placeholder="••••••••">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Passwort bestätigen</label>
                        <input type="password" class="form-input" id="profileConfirmPassword" placeholder="••••••••">
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
                <h3>Sichtbarkeit</h3>
                <div class="profile-item">
                    <span class="profile-label">Im Ranking anzeigen</span>
                    <input type="checkbox" id="settingRankingVisible" ${currentUserData?.ranking_enabled !== false ? 'checked' : ''} onchange="updateUserSetting('ranking_enabled', this.checked)" style="width: 20px; height: 20px;">
                </div>
            </div>

            <button class="btn-secondary" style="margin-top: 24px; background: ${currentUser ? '#ffebee' : 'var(--accent-gradient)'}; color: ${currentUser ? '#c62828' : 'white'}; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="${currentUser ? 'handleLogout()' : 'openLoginModal()'}">
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
    const teamData = await fetchTeamWerber();
    const latestRecords = await fetchLatestRecords();
    const availableAreas = await fetchAvailableAreas(teamData.campaignId);
    const teamWerber = teamData.werber || [];

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
            <!-- Letzte Schriebe -->
            <h3 style="font-size: 14px; color: var(--text-secondary); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                Letzte Schriebe
            </h3>
            <div class="latest-records-grid">
                ${latestRecords.length > 0 ? latestRecords.map(record => `
                    <div class="record-card">
                        <div class="record-card-header">
                            <span class="record-name">${record.first_name || ''} ${record.last_name || ''}</span>
                            <span class="record-eh">${((record.yearly_amount || 0) / 12).toFixed(2)} EH</span>
                        </div>
                        <div class="record-card-body">
                            <div class="record-meta">
                                <span class="record-time">${formatTime(record.created_at)}</span>
                                ${record.campaign_areas?.name ? `<span class="record-area">${record.campaign_areas.name}</span>` : ''}
                            </div>
                            <div class="record-werber">${record.users?.name || 'Unbekannt'}</div>
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
                Werber-Zuordnung (KW ${getCurrentKW()})
            </h3>
            <div class="werber-assignment-list" id="werberAssignmentList">
                ${teamWerber.length > 0 ? teamWerber.map(w => `
                    <div class="werber-assignment-item">
                        <div class="werber-name">${w.users?.name || 'Unbekannt'}</div>
                        <select class="werber-area-select" onchange="handleAreaChange('${w.id}', this.value)">
                            <option value="">-- Gebiet wählen --</option>
                            ${availableAreas.map(area => `
                                <option value="${area.id}" ${w.campaign_area_id === area.id ? 'selected' : ''}>
                                    ${area.name}${area.plz ? ` (${area.plz})` : ''}
                                </option>
                            `).join('')}
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
                    Aktualisieren
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
    try {
        showLoading(true);
        await loadView('team', true); // Force refresh
    } finally {
        showLoading(false);
    }
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
                <img src="${item.photo || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23d97706'/%3E%3Ctext x='20' y='26' text-anchor='middle' font-size='16' fill='white' font-family='Arial'%3E${item.name.charAt(0)}%3C/text%3E%3C/svg%3E`}" class="rank-avatar">
                <div class="rank-info">
                    <div class="rank-name">${item.name} ${item.isCurrentUser ? '<span class="you-badge">Du</span>' : ''}</div>
                    <div class="rank-team">${item.team || ''}</div>
                </div>
                <div class="rank-score">
                    <div class="score-value">${item.score.toFixed(2)}</div>
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

async function updateUserSetting(field, value) {
    if (!currentUser) return;

    await supabaseClient
        .from('user_profiles')
        .update({ [field]: value })
        .eq('user_id', currentUser.id);

    if (currentUserData) currentUserData[field] = value;
}

async function uploadProfilePhoto(type, input) {
    if (!currentUser || !input.files[0]) return;

    const file = input.files[0];

    // Nur Bilder erlauben
    if (!file.type.startsWith('image/')) {
        alert('Bitte nur Bilddateien auswählen');
        return;
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
        alert('Datei zu groß (max. 5MB)');
        return;
    }

    showLoading(true);

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `photo_${type}_url-${Date.now()}.${fileExt}`;
        const filePath = `${currentUser.id}/${fileName}`;

        // Upload zu Supabase Storage
        const { error: uploadError } = await supabaseClient.storage
            .from('user-files')
            .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        // Public URL holen
        const { data: urlData } = supabaseClient.storage
            .from('user-files')
            .getPublicUrl(filePath);

        const url = urlData.publicUrl;
        const urlField = type === 'intern' ? 'photo_intern_url' : 'photo_extern_url';

        // In DB speichern
        const { error: dbError } = await supabaseClient
            .from('user_profiles')
            .update({ [urlField]: url })
            .eq('user_id', currentUser.id);

        if (dbError) throw dbError;

        // UI aktualisieren
        if (currentUserData) currentUserData[urlField] = url;
        loadView('profil');

        alert('Foto erfolgreich hochgeladen!');
    } catch (error) {
        console.error('Upload error:', error);
        alert('Fehler beim Hochladen: ' + error.message);
    } finally {
        showLoading(false);
        input.value = '';
    }
}

async function saveProfile() {
    if (!currentUser) return;

    showLoading(true);

    try {
        // Passwort ändern (falls eingegeben)
        const newPassword = document.getElementById('profileNewPassword')?.value;
        const confirmPassword = document.getElementById('profileConfirmPassword')?.value;

        if (newPassword) {
            if (newPassword !== confirmPassword) {
                alert('Passwörter stimmen nicht überein!');
                showLoading(false);
                return;
            }
            if (newPassword.length < 6) {
                alert('Passwort muss mindestens 6 Zeichen haben!');
                showLoading(false);
                return;
            }

            const { error: pwError } = await supabaseClient.auth.updateUser({
                password: newPassword
            });

            if (pwError) {
                alert('Passwort konnte nicht geändert werden: ' + pwError.message);
                showLoading(false);
                return;
            }

            // Felder leeren nach erfolgreicher Änderung
            document.getElementById('profileNewPassword').value = '';
            document.getElementById('profileConfirmPassword').value = '';
        }

        // User Profiles Daten (Hauptprofil)
        const profileData = {
            first_name: document.getElementById('profileFirstname')?.value || '',
            last_name: document.getElementById('profileLastname')?.value || '',
            phone: document.getElementById('profilePhone')?.value || '',
            game_tag: document.getElementById('profileGametag')?.value || '',
            clothing_size: document.getElementById('profileClothingSize')?.value || '',
            street: document.getElementById('profileStreet')?.value || '',
            house_number: document.getElementById('profileHouseNumber')?.value || '',
            postal_code: document.getElementById('profileZip')?.value || '',
            city: document.getElementById('profileCity')?.value || '',
            state: document.getElementById('profileState')?.value || '',
            country: document.getElementById('profileCountry')?.value || '',
            address_extra: document.getElementById('profileAddressExtra')?.value || '',
            account_holder: document.getElementById('profileAccountHolder')?.value || '',
            iban: document.getElementById('profileIban')?.value || '',
            bic: document.getElementById('profileBic')?.value || '',
            bank_name: document.getElementById('profileBank')?.value || '',
            tax_id: document.getElementById('profileTaxId')?.value || '',
            social_security_number: document.getElementById('profileSvNumber')?.value || '',
            kvnr: document.getElementById('profileKvnr')?.value || '',
            company_name: document.getElementById('profileCompanyName')?.value || '',
            tax_number: document.getElementById('profileTaxNumber')?.value || '',
            vat_id: document.getElementById('profileVatId')?.value || '',
            is_vat_liable: document.getElementById('profileVatLiable')?.value === 'true' ? true :
                           document.getElementById('profileVatLiable')?.value === 'false' ? false : null
        };

        // Upsert: Update wenn existiert, sonst Insert
        const { error: profileError } = await supabaseClient
            .from('user_profiles')
            .upsert({
                user_id: currentUser.id,
                ...profileData
            }, {
                onConflict: 'user_id'
            });

        if (profileError) throw profileError;

        // Users Tabelle: Name und Email
        const email = document.getElementById('profileEmail')?.value || '';
        const name = `${profileData.first_name} ${profileData.last_name}`.trim();

        await supabaseClient
            .from('users')
            .update({ name, email })
            .eq('id', currentUser.id);

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

// Echter Connection-Check (wie im Formular)
async function checkConnection(timeout = 5000) {
    if (!navigator.onLine) return false;
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        const response = await fetch(SUPABASE_URL + '/rest/v1/', {
            method: 'HEAD',
            signal: controller.signal,
            headers: { 'apikey': SUPABASE_KEY }
        });
        clearTimeout(timeoutId);
        return response.ok || response.status === 400;
    } catch (e) {
        return false;
    }
}

// Auto-Sync beim App-Start
async function autoSyncOfflineRecords() {
    const offlineData = localStorage.getItem('offlineRecords');
    if (!offlineData) return;

    try {
        const records = JSON.parse(offlineData);
        if (records.length === 0) return;

        // Echter Connection-Check (nicht nur navigator.onLine)
        const isOnline = await checkConnection(5000);
        if (!isOnline) {
            console.log('Auto-Sync: Keine Verbindung zu Supabase, überspringe');
            return;
        }

        console.log(`Auto-Sync: ${records.length} Offline-Records gefunden`);
        showToast(`${records.length} Offline-Datensätze werden synchronisiert...`, 'info');

        // Kurz warten damit Toast sichtbar ist
        await new Promise(r => setTimeout(r, 500));

        const failedRecords = [];
        let successCount = 0;
        let skippedCount = 0;

        for (const record of records) {
            const { offlineId, createdAt, name, area, werber, ...dbRecord } = record;

            // Duplikat-Prüfung: Gleiche Signatur + gleiches Datum = bereits vorhanden
            if (dbRecord.signature && dbRecord.start_date) {
                const { data: existing } = await supabaseClient
                    .from('records')
                    .select('id')
                    .eq('signature', dbRecord.signature)
                    .eq('start_date', dbRecord.start_date)
                    .limit(1);

                if (existing && existing.length > 0) {
                    console.log('Auto-Sync: Duplikat übersprungen', dbRecord.signature);
                    skippedCount++;
                    continue; // Nicht erneut einfügen
                }
            }

            dbRecord.status = 'success';
            dbRecord.synced = true;

            try {
                const { error } = await supabaseClient
                    .from('records')
                    .insert(dbRecord);

                if (error) {
                    console.error('Auto-Sync error:', error);
                    failedRecords.push(record);
                } else {
                    successCount++;
                }
            } catch (e) {
                failedRecords.push(record);
            }
        }

        // Ergebnis speichern
        if (failedRecords.length > 0) {
            localStorage.setItem('offlineRecords', JSON.stringify(failedRecords));
            let msg = `${successCount} synchronisiert, ${failedRecords.length} fehlgeschlagen`;
            if (skippedCount > 0) msg += `, ${skippedCount} Duplikate übersprungen`;
            showToast(msg, 'warning');
        } else {
            localStorage.removeItem('offlineRecords');
            let msg = `${successCount} Datensätze erfolgreich synchronisiert!`;
            if (skippedCount > 0) msg += ` (${skippedCount} Duplikate übersprungen)`;
            showToast(msg, 'success');
        }

        // View aktualisieren falls auf Offline-Seite
        if (window.location.hash === '#offline') {
            loadView('offline', true);
        }

    } catch (e) {
        console.error('Auto-Sync Fehler:', e);
    }
}

// Manuelle Sync-Funktion (Button)
async function syncOfflineRecords() {
    const offlineData = localStorage.getItem('offlineRecords');
    if (!offlineData) return;

    showLoading(true);

    // Connection-Check vor Sync
    const isOnline = await checkConnection(5000);
    if (!isOnline) {
        showLoading(false);
        alert('Keine Verbindung zum Server. Bitte später erneut versuchen.');
        return;
    }

    try {
        const records = JSON.parse(offlineData);
        const failedRecords = [];
        let successCount = 0;
        let skippedCount = 0;

        for (const record of records) {
            // Offline-spezifische Felder entfernen, nur DB-Felder behalten
            const { offlineId, createdAt, name, area, werber, ...dbRecord } = record;

            // Duplikat-Prüfung: Gleiche Signatur + gleiches Datum = bereits vorhanden
            if (dbRecord.signature && dbRecord.start_date) {
                const { data: existing } = await supabaseClient
                    .from('records')
                    .select('id')
                    .eq('signature', dbRecord.signature)
                    .eq('start_date', dbRecord.start_date)
                    .limit(1);

                if (existing && existing.length > 0) {
                    console.log('Sync: Duplikat übersprungen', dbRecord.signature);
                    skippedCount++;
                    continue;
                }
            }

            // Status für Online-Speicherung aktualisieren
            dbRecord.status = 'success';
            dbRecord.synced = true;

            try {
                const { error } = await supabaseClient
                    .from('records')
                    .insert(dbRecord);

                if (error) {
                    console.error('Sync error for record:', error);
                    failedRecords.push(record);
                } else {
                    successCount++;
                }
            } catch (e) {
                console.error('Sync exception:', e);
                failedRecords.push(record);
            }
        }

        // Nur fehlgeschlagene Records behalten
        if (failedRecords.length > 0) {
            localStorage.setItem('offlineRecords', JSON.stringify(failedRecords));
            let msg = `${successCount} von ${records.length} Datensätzen synchronisiert.\n\n${failedRecords.length} Datensätze konnten nicht hochgeladen werden.`;
            if (skippedCount > 0) msg += `\n${skippedCount} Duplikate wurden übersprungen.`;
            alert(msg);
        } else {
            localStorage.removeItem('offlineRecords');
            let msg = `Alle ${successCount} Datensätze erfolgreich synchronisiert!`;
            if (skippedCount > 0) msg += `\n(${skippedCount} Duplikate übersprungen)`;
            alert(msg);
        }

        loadView('offline', true);

    } catch (error) {
        console.error('Sync error:', error);
        alert('Fehler beim Synchronisieren: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// ========== ROUTER ==========
async function loadView(viewName, forceRefresh = false) {
    const content = document.getElementById('appContent');

    if (!views[viewName]) {
        viewName = 'dashboard';
    }

    const cacheKey = `view_${viewName}_${currentUser?.id || 'anon'}`;

    // Prüfe Cache
    const cached = cacheGet(cacheKey);
    const hasCache = cached && cached.data;

    // Sofort aus Cache anzeigen (kein Ladescreen)
    if (hasCache && !forceRefresh) {
        content.innerHTML = cached.data;
        updateNavigation(viewName);
    } else {
        // Kein Cache - Ladescreen anzeigen
        showLoading(true);
    }

    try {
        // Daten im Hintergrund holen
        const viewContent = await views[viewName]();

        // Nur updaten wenn sich Inhalt geändert hat oder kein Cache
        if (!hasCache || cached.data !== viewContent || forceRefresh) {
            content.innerHTML = viewContent;
            cacheSet(cacheKey, viewContent);
        }

        // Scroll to top nur bei erstem Laden (kein Cache)
        if (!hasCache) {
            window.scrollTo({ top: 0, behavior: 'instant' });
            content.scrollTop = 0;
        }

        updateNavigation(viewName);

    } catch (error) {
        console.error('Load view error:', error);
        // Bei Fehler: Cache behalten falls vorhanden, sonst Fehler anzeigen
        if (!hasCache) {
            content.innerHTML = `
                <div class="view-container">
                    <div class="empty-state">
                        <div class="empty-state-title">Fehler</div>
                        <div class="empty-state-text">Die Ansicht konnte nicht geladen werden.</div>
                    </div>
                </div>
            `;
        }
    } finally {
        showLoading(false);
    }
}

function updateNavigation(viewName) {
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
}

// ========== EVENT LISTENERS ==========
document.addEventListener('DOMContentLoaded', async function() {
    // Check auth state first
    await checkAuthState();

    // Auto-Sync: Offline-Records automatisch hochladen wenn online
    autoSyncOfflineRecords();

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

    // FAB button - with area validation
    document.getElementById('fab').addEventListener('click', async () => {
        if (!currentUser) {
            showToast('Bitte zuerst anmelden', 'error');
            return;
        }

        // Get user's assigned areas for current KW
        const areas = await fetchTeamAreas();

        if (areas.length === 0) {
            showToast('Kein Gebiet zugewiesen. Bitte wende dich an deinen Teamchef.', 'error');
            return;
        }

        // Use first assigned area
        const area = areas[0];
        const url = new URL('/formular/', window.location.origin);
        url.searchParams.set('botschafter', currentUser.id);
        url.searchParams.set('werbegebiet', area.id);
        if (area.campaign_id) {
            url.searchParams.set('kampagne', area.campaign_id);
        }

        window.location.href = url.toString();
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
