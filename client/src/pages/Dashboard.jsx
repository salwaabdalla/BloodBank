import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Users, Droplets, Clock, Package,
  AlertCircle, Calendar, Plus, Search, Bell,
} from 'lucide-react';

const API = 'http://localhost:5000';
const CRITICAL = 5;

// Blood type pill colours
const BT_COLORS = {
  'A+':  '#dc2626', 'A-':  '#b91c1c',
  'B+':  '#d97706', 'B-':  '#b45309',
  'AB+': '#7c3aed', 'AB-': '#6d28d9',
  'O+':  '#059669', 'O-':  '#047857',
};

function initials(first, last) {
  return `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase();
}

// Parse 'YYYY-MM-DD' as a local date to avoid UTC-to-local shift
function parseLocalDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(str) {
  const d = parseLocalDate(str);
  if (!d) return '—';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// SVG donut ring — pct is 0-100
function DonutChart({ pct }) {
  const r     = 48;
  const circ  = 2 * Math.PI * r;
  const dash  = ((pct || 0) / 100) * circ;
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      {/* Track ring */}
      <circle cx="60" cy="60" r={r} fill="none" stroke="#f1f5f9" strokeWidth="14" />
      {/* Filled arc — rotate -90° so arc starts at 12 o'clock */}
      <circle
        cx="60" cy="60" r={r}
        fill="none"
        stroke="#8B0000"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ - dash}`}
        transform="rotate(-90 60 60)"
      />
      {/* Centred percentage label */}
      <text x="60" y="66" textAnchor="middle" fontSize="18" fontWeight="700" fill="#111827">
        {pct}%
      </text>
    </svg>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats,          setStats]          = useState(null);
  const [invByType,      setInvByType]      = useState([]);
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [recentDonors,   setRecentDonors]   = useState([]);
  const [nextCamp,       setNextCamp]       = useState(null);
  const [error,          setError]          = useState(null);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    const safe = url => axios.get(url).then(r => r.data).catch(() => []);
    Promise.all([
      axios.get(`${API}/api/dashboard/stats`).then(r => r.data),
      safe(`${API}/api/inventory`),
      safe(`${API}/api/requests`),
      safe(`${API}/api/camps`),
      safe(`${API}/api/donors`),
    ])
      .then(([statsData, invData, reqData, campsData, donorsData]) => {
        setStats(statsData);

        // todayStr used for both inventory expiry filter and camp date filter
        const todayStr = new Date().toISOString().slice(0, 10);

        // Aggregate NON-EXPIRED inventory units by blood type.
        // /api/inventory returns all rows including expired ones, so we filter
        // here to match what the server-side stat card does:
        //   SELECT SUM(units) FROM blood_inventory WHERE expiry_date > SYSDATE
        const byType = {};
        invData
          .filter(r => r.EXPIRY_DATE && r.EXPIRY_DATE > todayStr)
          .forEach(r => { byType[r.BLOOD_GROUP] = (byType[r.BLOOD_GROUP] || 0) + r.UNITS; });
        const invArr = Object.entries(byType).map(([group, units]) => ({ group, units }));
        setInvByType(invArr);

        // Blood types below the CRITICAL threshold, sorted worst-first
        setCriticalAlerts(
          invArr
            .filter(({ units }) => units < CRITICAL)
            .map(({ group, units }) => ({
              group,
              units,
              pending: reqData.filter(
                r => r.BLOOD_GROUP === group && r.STATUS?.toUpperCase() === 'PENDING'
              ).length,
            }))
            .sort((a, b) => a.units - b.units),
        );

        // Soonest future camp: compare 'YYYY-MM-DD' strings (safe for ISO dates)
        const upcoming = (campsData || [])
          .filter(c => c.CAMP_DATE && c.CAMP_DATE >= todayStr)
          .sort((a, b) => a.CAMP_DATE.localeCompare(b.CAMP_DATE));
        setNextCamp(upcoming[0] || null);

        // Most recently added donors — API returns ORDER BY donor_id DESC
        setRecentDonors((donorsData || []).slice(0, 4));
      })
      .catch(() => setError('Failed to load dashboard. Is the server running?'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (error)   return <div className="error-banner">{error}</div>;

  // Stock health: fraction of tracked blood types at or above CRITICAL threshold
  const totalTypes   = invByType.length;
  const healthyTypes = invByType.filter(({ units }) => units >= CRITICAL).length;
  const stockPct     = totalTypes > 0 ? Math.round((healthyTypes / totalTypes) * 100) : 0;

  const worstAlert = criticalAlerts[0] || null;

  const todayLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Top bar: search + admin profile chip ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>

        {/* Search input */}
        <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
          <Search
            size={15} color="#9ca3af"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          />
          <input
            type="text"
            placeholder="Search..."
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '8px 14px 8px 36px',
              border: '1px solid #e5e7eb', borderRadius: '999px',
              background: '#f3f4f6',
              fontSize: '0.875rem', color: '#374151',
              outline: 'none',
            }}
          />
        </div>

        {/* Admin profile chip — shared admin login, no individual identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: '#8B0000', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: 700,
          }}>
            AD
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', lineHeight: 1.2 }}>Admin</div>
            <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '2px' }}>System Administrator</div>
          </div>
        </div>
      </div>

      {/* ── Page title + date ─── */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', letterSpacing: '-.03em', margin: 0 }}>
          Dashboard
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '.875rem', margin: '4px 0 0' }}>
          {todayLabel}
        </p>
      </div>

      {/* ── 4 stat cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>

        {/* Card 1 — Total Donors (solid brand red) */}
        <div style={{
          background: '#8B0000', borderRadius: '14px', padding: '20px 22px',
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          <Users size={18} color="rgba(255,255,255,0.7)" strokeWidth={1.8} />
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em', marginTop: '4px' }}>
            {stats?.total_donors?.toLocaleString() ?? '—'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>Total Donors</div>
        </div>

        {/* Card 2 — Donations */}
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '20px 22px',
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          <Droplets size={18} color="#9ca3af" strokeWidth={1.8} />
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', lineHeight: 1, letterSpacing: '-0.02em', marginTop: '4px' }}>
            {stats?.total_donations?.toLocaleString() ?? '—'}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>Donations</div>
        </div>

        {/* Card 3 — Pending Requests */}
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '20px 22px',
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          <Clock size={18} color="#9ca3af" strokeWidth={1.8} />
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', lineHeight: 1, letterSpacing: '-0.02em', marginTop: '4px' }}>
            {stats?.pending_requests?.toLocaleString() ?? '—'}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>Pending Requests</div>
        </div>

        {/* Card 4 — Units in Stock */}
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '20px 22px',
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          <Package size={18} color="#9ca3af" strokeWidth={1.8} />
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', lineHeight: 1, letterSpacing: '-0.02em', marginTop: '4px' }}>
            {stats?.total_inventory?.toLocaleString() ?? '—'}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>Units in Stock</div>
        </div>
      </div>

      {/* ── 3-column row ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>

        {/* Col 1 — Reminders: soonest upcoming camp */}
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '20px',
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>
            Reminders
          </div>
          {nextCamp ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                  background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Calendar size={18} color="#8B0000" strokeWidth={1.8} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111827', lineHeight: 1.3 }}>
                    {nextCamp.CAMP_NAME}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#6b7280', marginTop: '4px' }}>
                    {formatDate(nextCamp.CAMP_DATE)}
                    {nextCamp.LOCATION ? ` · ${nextCamp.LOCATION}` : ''}
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/camps')}
                style={{
                  background: 'none', border: '1px solid #e5e7eb', borderRadius: '8px',
                  padding: '7px 12px', fontSize: '0.78rem', fontWeight: 600, color: '#374151',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                View all camps →
              </button>
            </div>
          ) : (
            <div style={{ fontSize: '0.82rem', color: '#9ca3af' }}>
              No upcoming camps scheduled.
            </div>
          )}
        </div>

        {/* Col 2 — Recent Donors: top 4 by donor_id DESC (real insertion order) */}
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Recent Donors
            </div>
            {/* "+" navigates to the donors page where Add is available */}
            <button
              onClick={() => navigate('/donors')}
              title="Go to donors"
              style={{
                width: '26px', height: '26px', borderRadius: '6px',
                background: '#8B0000', border: 'none', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', padding: 0, flexShrink: 0,
              }}
            >
              <Plus size={14} strokeWidth={2.2} />
            </button>
          </div>

          {recentDonors.length === 0 ? (
            <div style={{ fontSize: '0.82rem', color: '#9ca3af' }}>No donors yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentDonors.map(d => {
                const btColor = BT_COLORS[d.BLOOD_GROUP] || '#8B0000';
                return (
                  <div key={d.DONOR_ID} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Avatar with initials */}
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                      background: '#f3f4f6', color: '#374151',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.72rem', fontWeight: 700,
                    }}>
                      {initials(d.FIRST_NAME, d.LAST_NAME)}
                    </div>
                    {/* Name */}
                    <div style={{ flex: 1, fontSize: '0.86rem', fontWeight: 500, color: '#111827', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.FIRST_NAME} {d.LAST_NAME}
                    </div>
                    {/* Blood type pill */}
                    <div style={{
                      background: btColor, color: '#fff',
                      padding: '2px 8px', borderRadius: '999px',
                      fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                    }}>
                      {d.BLOOD_GROUP}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Col 3 — Stock Health donut */}
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '20px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', alignSelf: 'flex-start' }}>
            Stock Health
          </div>
          <DonutChart pct={stockPct} />
          <div style={{ fontSize: '0.78rem', color: '#6b7280', textAlign: 'center' }}>
            {healthyTypes} of {totalTypes} blood type{totalTypes !== 1 ? 's' : ''} above threshold
          </div>
        </div>
      </div>

      {/* ── Full-width dark alert card ─── */}
      <div style={{
        background: '#111827', borderRadius: '14px', padding: '20px 24px',
        display: 'flex', alignItems: 'center', gap: '16px',
      }}>
        {/* Icon circle: red when critical, green when all healthy */}
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
          background: worstAlert ? '#dc2626' : '#059669',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {worstAlert
            ? <AlertCircle size={18} color="#fff" strokeWidth={2} />
            : <Package     size={18} color="#fff" strokeWidth={2} />
          }
        </div>

        {/* Text */}
        <div style={{ flex: 1 }}>
          {worstAlert ? (
            <>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '3px' }}>
                Critical Stock: {criticalAlerts.map(a => a.group).join(', ')}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                {worstAlert.group} is at {worstAlert.units} unit{worstAlert.units !== 1 ? 's' : ''} — lowest in stock
                {worstAlert.pending > 0 && `, ${worstAlert.pending} pending hospital request${worstAlert.pending !== 1 ? 's' : ''}`}
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '3px' }}>
                Stock levels healthy
              </div>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                All tracked blood types are at or above the critical threshold ({CRITICAL} units).
              </div>
            </>
          )}
        </div>

        {/*
          "Notify donors" button — style only, intentionally non-functional.
          TODO: future work — wire to a notification workflow
          (e.g., trigger /api/notifications or send SMS/email to eligible donors
          whose blood type matches the critical type). Do NOT fake a send here.
        */}
        {worstAlert && (
          <button
            disabled
            style={{
              background: '#dc2626', border: 'none', borderRadius: '8px',
              padding: '9px 16px', fontSize: '0.82rem', fontWeight: 600, color: '#fff',
              display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
              cursor: 'not-allowed', opacity: 0.85,
            }}
          >
            <Bell size={14} strokeWidth={2} />
            Notify donors
          </button>
        )}
      </div>

    </div>
  );
}
