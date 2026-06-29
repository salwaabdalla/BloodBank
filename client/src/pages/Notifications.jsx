import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Plus, Trash2, X, CheckCheck, Bell } from 'lucide-react';

const API      = 'http://localhost:5000/api/notifications';
const FORM_API = 'http://localhost:5000/api/notifications/form-data';
const EMPTY    = { donor_id: '', patient_id: '', notif_type: 'GENERAL', message: '' };

const NOTIF_TYPES = ['GENERAL', 'APPOINTMENT', 'DONATION', 'REQUEST', 'LOW_STOCK'];

const TYPE_STYLE = {
  APPOINTMENT: { background:'#dbeafe', color:'#1e40af' },
  DONATION:    { background:'#fef2f2', color:'#991b1b' },
  REQUEST:     { background:'#ffedd5', color:'#9a3412' },
  LOW_STOCK:   { background:'#fee2e2', color:'#b91c1c' },
  GENERAL:     { background:'#f3f4f6', color:'#374151' },
};

export default function Notifications() {
  const [notifs,     setNotifs]     = useState([]);
  const [recipients, setRecipients] = useState({ donors: [], patients: [] });
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [success,    setSuccess]    = useState(null);
  const [marking,    setMarking]    = useState(null);
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formError,  setFormError]  = useState(null);

  const fetchNotifs = useCallback(() => {
    setLoading(true);
    axios.get(API).then(r => { setNotifs(r.data); setError(null); }).catch(() => setError('Failed to load notifications.')).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchNotifs();
    axios.get(FORM_API).then(r => setRecipients(r.data)).catch(() => {});
  }, [fetchNotifs]);

  async function markRead(id) {
    setMarking(id);
    try {
      await axios.put(`${API}/${id}/read`);
      fetchNotifs();
    } catch { /* ignore */ }
    finally { setMarking(null); }
  }

  function openCreate() { setForm(EMPTY); setFormError(null); setShowForm(true); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.message.trim()) { setFormError('Message is required.'); return; }
    setSubmitting(true); setFormError(null);
    try {
      await axios.post(API, { ...form, donor_id: form.donor_id || null, patient_id: form.patient_id || null });
      setSuccess('Notification sent.'); setShowForm(false); setTimeout(() => setSuccess(null), 4000); fetchNotifs();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to send.');
    } finally { setSubmitting(false); }
  }

  async function handleDelete(n) {
    if (!window.confirm(`Delete this notification? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API}/${n.NOTIFICATION_ID}`);
      setSuccess('Notification deleted.'); setTimeout(() => setSuccess(null), 4000); fetchNotifs();
    } catch (err) { setError(err.response?.data?.error || 'Failed to delete.'); }
  }

  const ch = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div style={{ padding:'28px 32px', fontFamily:'inherit' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <Bell size={26} color="#8B0000" />
          <div>
            <h1 style={{ margin:0, fontSize:'1.45rem', fontWeight:700, color:'#111827' }}>Notifications</h1>
            <p style={{ margin:0, fontSize:'0.82rem', color:'#6b7280' }}>{notifs.filter(n => n.IS_READ === 'N').length} unread of {notifs.length}</p>
          </div>
        </div>
        <button style={btnPrimary} onClick={openCreate}><Plus size={16} />Send Notification</button>
      </div>

      {success && <div style={successBanner}>{success}</div>}
      {error   && <div style={errorBanner}>{error}</div>}

      <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div style={{ padding:'48px', textAlign:'center', color:'#6b7280' }}>Loading…</div>
        ) : notifs.length === 0 ? (
          <div style={{ padding:'48px', textAlign:'center', color:'#6b7280' }}>No notifications.</div>
        ) : (
          <table style={tbl}>
            <thead>
              <tr style={thead}>
                {['Type','Recipient','Message','Date','Status','Actions'].map(h => <th key={h} style={thS}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {notifs.map(n => {
                const unread = n.IS_READ === 'N';
                const tk = (n.NOTIF_TYPE || 'GENERAL').toUpperCase();
                const recipient = n.DONOR_NAME || n.PATIENT_NAME || '—';
                return (
                  <tr key={n.NOTIFICATION_ID} style={{ borderBottom:'1px solid #f3f4f6', background: unread ? '#fffbeb' : 'transparent' }}>
                    <td style={tdS}><span style={{ ...(TYPE_STYLE[tk] || TYPE_STYLE.GENERAL), display:'inline-block', borderRadius:'20px', padding:'3px 10px', fontSize:'0.74rem', fontWeight:600 }}>{n.NOTIF_TYPE}</span></td>
                    <td style={{ ...tdS, fontWeight:600 }}>{recipient}</td>
                    <td style={{ ...tdS, color:'#374151', maxWidth:'300px' }}>{n.MESSAGE}</td>
                    <td style={{ ...tdS, color:'#374151', whiteSpace:'nowrap' }}>{n.SENT_DATE}</td>
                    <td style={tdS}>
                      <span style={{ background: unread ? '#fef9c3' : '#dcfce7', color: unread ? '#854d0e' : '#166534', display:'inline-block', borderRadius:'20px', padding:'3px 10px', fontSize:'0.74rem', fontWeight:600 }}>
                        {unread ? 'Unread' : 'Read'}
                      </span>
                    </td>
                    <td style={tdS}>
                      <div style={{ display:'flex', gap:'6px' }}>
                        {unread && (
                          <button onClick={() => markRead(n.NOTIFICATION_ID)} disabled={marking === n.NOTIFICATION_ID} style={markBtn}>
                            <CheckCheck size={12} />{marking === n.NOTIFICATION_ID ? '…' : 'Mark Read'}
                          </button>
                        )}
                        <button style={delBtn} onClick={() => handleDelete(n)}><Trash2 size={12} />Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div style={overlay} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={panel}>
            <div style={panelHeader}>
              <h2 style={{ margin:0, fontSize:'1.1rem', fontWeight:700 }}>Send Notification</h2>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280' }}><X size={20} /></button>
            </div>
            {formError && <div style={{ ...errorBanner, margin:'0 20px' }}>{formError}</div>}
            <form onSubmit={handleSubmit} style={formGrid}>
              <label style={labelS}>Notification Type
                <select name="notif_type" value={form.notif_type} onChange={ch} style={inpS}>
                  {NOTIF_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </label>
              <div></div>
              <label style={labelS}>Donor (optional)
                <select name="donor_id" value={form.donor_id} onChange={ch} style={inpS}>
                  <option value="">— None —</option>
                  {recipients.donors.map(d => <option key={d.DONOR_ID} value={d.DONOR_ID}>{d.FULL_NAME}</option>)}
                </select>
              </label>
              <label style={labelS}>Patient (optional)
                <select name="patient_id" value={form.patient_id} onChange={ch} style={inpS}>
                  <option value="">— None —</option>
                  {recipients.patients.map(p => <option key={p.PATIENT_ID} value={p.PATIENT_ID}>{p.FULL_NAME}</option>)}
                </select>
              </label>
              <label style={{ ...labelS, gridColumn:'1 / -1' }}>Message *
                <textarea name="message" value={form.message} onChange={ch} required rows={3}
                  style={{ ...inpS, resize:'vertical', lineHeight:'1.5' }} placeholder="Enter notification message…" />
              </label>
              <div style={{ gridColumn:'1 / -1', display:'flex', gap:'10px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} style={btnSecondary}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Sending…' : 'Send Notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const btnPrimary    = { display:'flex', alignItems:'center', gap:'7px', background:'#8B0000', color:'#fff', padding:'9px 18px', borderRadius:'8px', fontSize:'0.88rem', fontWeight:600, cursor:'pointer', border:'none' };
const btnSecondary  = { padding:'9px 18px', borderRadius:'8px', fontSize:'0.88rem', fontWeight:600, border:'1px solid #e5e7eb', background:'#fff', cursor:'pointer', color:'#374151' };
const delBtn        = { display:'inline-flex', alignItems:'center', gap:'5px', padding:'5px 10px', borderRadius:'6px', fontSize:'0.78rem', fontWeight:600, border:'1px solid #fecaca', background:'#fff', color:'#991b1b', cursor:'pointer' };
const markBtn       = { display:'inline-flex', alignItems:'center', gap:'4px', padding:'5px 10px', borderRadius:'6px', fontSize:'0.78rem', fontWeight:600, border:'1px solid #d1fae5', background:'#f0fdf4', color:'#166534', cursor:'pointer' };
const successBanner = { background:'#dcfce7', color:'#166534', border:'1px solid #86efac', borderRadius:'8px', padding:'10px 14px', marginBottom:'16px', fontSize:'0.875rem' };
const errorBanner   = { background:'#fee2e2', color:'#991b1b', border:'1px solid #fca5a5', borderRadius:'8px', padding:'10px 14px', marginBottom:'16px', fontSize:'0.875rem' };
const tbl   = { width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' };
const thead = { background:'#f9fafb', borderBottom:'1px solid #e5e7eb' };
const thS   = { padding:'11px 14px', textAlign:'left', fontSize:'0.78rem', fontWeight:600, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.04em', whiteSpace:'nowrap' };
const tdS   = { padding:'11px 14px', verticalAlign:'middle' };
const overlay    = { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 };
const panel      = { background:'#fff', borderRadius:'14px', width:'100%', maxWidth:'520px', boxShadow:'0 20px 60px rgba(0,0,0,0.2)', display:'flex', flexDirection:'column', gap:'20px', paddingBottom:'24px', maxHeight:'90vh', overflowY:'auto' };
const panelHeader = { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 20px 0' };
const formGrid   = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', padding:'0 20px' };
const labelS     = { display:'flex', flexDirection:'column', gap:'5px', fontSize:'0.82rem', fontWeight:600, color:'#374151' };
const inpS       = { padding:'9px 11px', borderRadius:'7px', border:'1px solid #d1d5db', fontSize:'0.875rem', outline:'none', fontFamily:'inherit', background:'#fff', color:'#111827' };
