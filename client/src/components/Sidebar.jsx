import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Droplets, ClipboardList,
  Package, UserRound, Tent, ShieldCheck, Bell,
  Building2, Hospital, FlaskConical, CreditCard,
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: null,
    items: [
      { to: '/', label: 'Dashboard', Icon: LayoutDashboard },
    ],
  },
  {
    label: 'Supply',
    items: [
      { to: '/donors',    label: 'Donors',    Icon: Users     },
      { to: '/donations', label: 'Donations', Icon: Droplets  },
      { to: '/inventory', label: 'Inventory', Icon: Package   },
      { to: '/banks',     label: 'Banks',     Icon: Building2 },
    ],
  },
  {
    label: 'Demand',
    items: [
      { to: '/blood-requests', label: 'Blood Requests', Icon: ClipboardList },
      { to: '/patients',       label: 'Patients',       Icon: UserRound     },
      { to: '/hospitals',      label: 'Hospitals',      Icon: Hospital      },
      { to: '/camps',          label: 'Camps',          Icon: Tent          },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/tests',         label: 'Tests',         Icon: FlaskConical },
      { to: '/staff',         label: 'Staff',         Icon: ShieldCheck  },
      { to: '/payments',      label: 'Payments',      Icon: CreditCard   },
      { to: '/notifications', label: 'Notifications', Icon: Bell         },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside style={s.sidebar}>
      <div style={s.brand}>
        <span style={{ fontSize: '20px' }}>🩸</span>
        <span style={s.brandText}>Blood Bank</span>
      </div>

      <nav style={s.nav}>
        {NAV_SECTIONS.map(({ label, items }) => (
          <div key={label ?? '__top'}>
            {label && (
              <div style={s.sectionLabel}>{label}</div>
            )}
            {items.map(({ to, label: itemLabel, Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                style={({ isActive }) => ({
                  ...s.link,
                  ...(isActive ? s.linkActive : s.linkInactive),
                })}
              >
                <Icon size={16} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                {itemLabel}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

const s = {
  sidebar: {
    width: '220px',
    minWidth: '220px',
    height: '100vh',
    background: '#8B0000',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '20px 16px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.18)',
  },
  brandText: {
    color: '#fafafa',
    fontWeight: 700,
    fontSize: '1.05rem',
    letterSpacing: '0.01em',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '8px 8px 8px 0',
    gap: '0',
  },
  sectionLabel: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.42)',
    textTransform: 'uppercase',
    letterSpacing: '0.09em',
    padding: '14px 14px 4px 14px',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    padding: '8px 12px 8px 11px',
    borderRadius: '0 7px 7px 0',
    fontSize: '0.86rem',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'background 0.12s, color 0.12s',
    marginBottom: '1px',
  },
  linkActive: {
    borderLeft: '3px solid #fff',
    background: 'rgba(255,255,255,0.18)',
    color: '#fff',
    paddingLeft: '8px',
  },
  linkInactive: {
    borderLeft: '3px solid transparent',
    background: 'transparent',
    color: 'rgba(255,255,255,0.72)',
    paddingLeft: '8px',
  },
};
