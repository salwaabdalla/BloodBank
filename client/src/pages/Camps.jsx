import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, X, FileBarChart2, Users, Droplets, Target, Tent } from 'lucide-react';

const API      = 'http://localhost:5000/api/camps';
const FORM_API = 'http://localhost:5000/api/camps/form-data';

const EMPTY = { bank_id: '', camp_name: '', location: '', camp_date: '', target_donors: '', status: 'SCHEDULED' };
const STATUSES = ['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'];

const STATUS_STYLE = {
  COMPLETED: { background: '#dcfce7', color: '#166534' },
  ONGOING:   { background: '#dbeafe', color: '#1e40af' },
  SCHEDULED: { background: '#fef9c3', color: '#854d0e' },
  CANCELLED: { background: '#f3f4f6', color: '#6b7280' },
};

const s = {
  btn:   { display:'flex', alignItems:'center', gap:'7px', background:'#8B0000', color:'#fff', padding:'9px 18px', borderRadius:'8px', fontSize:'0.88rem', fontWeight:600, cursor:'pointer', border:'none' },
  sec:   { padding:'9px 18px', borderRadius:'8px', fontSize:'0.88rem', fontWeight:600, border:'1px solid #e5e7eb', background:'#fff', cursor:'pointer', color:'#374151' },
  edit:  { display:'inline-flex', alignItems:'center', gap:'5px', padding:'5px 10px', borderRadius:'6px', fontSize:'0.78rem', fontWeight:600, border:'1px solid #e5e7eb', background:'#fff', color:'#374151', cursor:'pointer' },
  del:   { display:'inline-flex', alignItems:'center', gap:'5px', padding:'5px 10px', borderRadius:'6px', fontSize:'0.78rem', fontWeight:600, border:'1px solid #fecaca', background:'#fff', color:'#991b1b', cursor:'pointer' },
  rep:   { display:'inline-flex', alignItems:'center', gap:'5px', padding:'5px 10px', borderRadius:'6px', fontSize:'0.78rem', fontWeight:600, border:'1px solid #e0e7ff', background:'#eef2ff', color:'#4338ca', cursor:'pointer' },
  ov:    { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 },
  pan:   { background:'#fff', borderRadius:'14px', width:'100%', maxWidth:'540px', boxShadow:'0 20px 60px rgba(0,0,0,0.2)', display:'flex', flexDirection:'column', gap:'20px', paddingBottom:'24px', maxHeight:'90vh', overflowY:'auto' },
  ph:    { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 20px 0' },
  grid:  { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', padding:'0 20px' },
  label: { display:'flex', flexDirection:'column', gap:'5px', fontSize:'0.82rem', fontWeight:600, color:'#374151' },
  inp:   { padding:'9px 11px', borderRadius:'7px', border:'1px solid #d1d5db', fontSize:'0.875rem', outline:'none', fontFamily:'inherit', background:'#fff', color:'#111827' },
  th:    { padding:'11px 14px', textAlign:'left', fontSize:'0.78rem', fontWeight:600, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.04em', whiteSpace:'nowrap' },
  td:    { padding:'11px 14px', borderBottom:'1px solid #f3f4f6', verticalAlign:'middle' },
};

function statCard(bg, color) {
  return { background: bg, borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', color };
}
function progressFill(actual, target) {
  const pct = target > 0 ? Math.min((actual ?? 0) / target, 1) * 100 : 0;
  const clr = pct >= 100 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626';
  return { height: '100%', borderRadius: '99px', width: `${pct}%`, background: clr, transition: 'width .5s ease', minWidth: pct > 0 ? '6px' : '0' };
}

export default function Camps() {
  const [items, setItems] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [report, setReport] = useState(null);
  const [reporting, setReporting] = useState(null);

  const fetchItems = useCallback(() => {
    setLoading(true);
    axios.get(API).then(r => { setItems(r.data); setError(null); }).catch(() => setError('Failed to load camps.')).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchItems();
    axios.get(FORM_API).then(r => setBanks(r.data.banks)).catch(() => {});
  }, [fetchItems]);

  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY, bank_id: banks[0]?.BANK_ID?.toString() || '' });
    setFormError(null); setShowForm(true);
  }

  function openEdit(c) {
    setEditingId(c.CAMP_ID);
    setForm({ bank_id: c.BANK_ID?.toString() || '', camp_name: c.CAMP_NAME, location: c.LOCATION || '', camp_date: c.CAMP_DATE || '', target_donors: c.TARGET_DONORS?.toString() || '', status: c.STATUS || 'SCHEDULED' });
    setFormError(null); setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.camp_name.trim()) { setFormError('Camp name is required.'); return; }
    if (!form.bank_id) { setFormError('Bank is required.'); return; }
    setSubmitting(true); setFormError(null);
    try {
      if (editingId) { await axios.put(`${API}/${editingId}`, form); setSuccess('Camp updated.'); }
      else           { await axios.post(API, form);                  setSuccess('Camp added.');   }
      setShowForm(false); setTimeout(() => setSuccess(null), 4000); fetchItems();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Operation failed.');
    } finally { setSubmitting(false); }
  }

  async function handleDelete(c) {
    if (!window.confirm(`Delete "${c.CAMP_NAME}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API}/${c.CAMP_ID}`);
      setSuccess('Camp deleted.'); setTimeout(() => setSuccess(null), 4000); fetchItems();
    } catch (err) { setError(err.response?.data?.error || 'Failed to delete. Camp may have associated donations.'); }
  }

  async function handleReport(c) {
    setReporting(c.CAMP_ID);
    try {
      const res = await axios.post(`${API}/report`, { camp_id: c.CAMP_ID });
      setReport({ camp: c, data: res.data });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate report.');
    } finally { setReporting(null); }
  }

  const ch = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div style={{ padding:'28px 32px', fontFamily:'inherit' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <Tent size={26} color="#8B0000" />
          <div>
            <h1 style={{ margin:0, fontSize:'1.45rem', fontWeight:700, color:'#111827' }}>Donation Camps</h1>
            <p style={{ margin:0, fontSize:'0.82rem', color:'#6b7280' }}>{items.length} camps</p>
          </div>
        </div>
        <button style={s.btn} onClick={openCreate}><Plus size={16} />Add Camp</button>
      </div>

      {success && <div style={{ background:'#dcfce7', color:'#166534', border:'1px solid #86efac', borderRadius:'8px', padding:'10px 14px', marginBottom:'16px', fontSize:'0.875rem' }}>{success}</div>}
      {error   && <div style={{ background:'#fee2e2', color:'#991b1b', border:'1px solid #fca5a5', borderRadius:'8px', padding:'10px 14px', marginBottom:'16px', fontSize:'0.875rem' }}>{error}</div>}

      <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div style={{ padding:'48px', textAlign:'center', color:'#6b7280' }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ padding:'48px', textAlign:'center', color:'#6b7280' }}>No camps yet.</div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
            <thead>
              <tr style={{ background:'#f9fafb', borderBottom:'1px solid #e5e7eb' }}>
                {['Camp Name','Bank','Location','Date','Target','Status','Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {items.map(c => {
                const sk = (c.STATUS || 'SCHEDULED').toUpperCase();
                return (
                  <tr key={c.CAMP_ID} style={{ borderBottom:'1px solid #f3f4f6' }}>
                    <td style={{ ...s.td, fontWeight:600, color:'#111827' }}>{c.CAMP_NAME}</td>
                    <td style={{ ...s.td, color:'#374151' }}>{c.BANK_NAME}</td>
                    <td style={{ ...s.td, color:'#374151' }}>{c.LOCATION || '—'}</td>
                    <td style={{ ...s.td, color:'#374151', whiteSpace:'nowrap' }}>{c.CAMP_DATE || '—'}</td>
                    <td style={{ ...s.td, color:'#374151', textAlign:'center' }}>{c.TARGET_DONORS ?? '—'}</td>
                    <td style={s.td}><span style={{ ...(STATUS_STYLE[sk] || STATUS_STYLE.SCHEDULED), padding:'3px 10px', borderRadius:'99px', fontSize:'0.74rem', fontWeight:600 }}>{sk}</span></td>
                    <td style={s.td}>
                      <div style={{ display:'flex', gap:'5px', flexWrap:'wrap' }}>
                        <button style={s.rep}  onClick={() => handleReport(c)} disabled={reporting === c.CAMP_ID}><FileBarChart2 size={12} />{reporting === c.CAMP_ID ? '…' : 'Report'}</button>
                        <button style={s.edit} onClick={() => openEdit(c)}><Pencil size={12} />Edit</button>
                        <button style={s.del}  onClick={() => handleDelete(c)}><Trash2 size={12} />Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit form modal */}
      {showForm && (
        <div style={s.ov} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={s.pan}>
            <div style={s.ph}>
              <h2 style={{ margin:0, fontSize:'1.1rem', fontWeight:700 }}>{editingId ? 'Edit Camp' : 'Add Camp'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280' }}><X size={20} /></button>
            </div>
            {formError && <div style={{ background:'#fee2e2', color:'#991b1b', border:'1px solid #fca5a5', borderRadius:'8px', padding:'10px 14px', margin:'0 20px', fontSize:'0.875rem' }}>{formError}</div>}
            <form onSubmit={handleSubmit}>
              <div style={s.grid}>
                <label style={{ ...s.label, gridColumn:'1 / -1' }}>Camp Name *<input name="camp_name" value={form.camp_name} onChange={ch} required style={s.inp} /></label>
                <label style={{ ...s.label, gridColumn:'1 / -1' }}>Blood Bank *
                  <select name="bank_id" value={form.bank_id} onChange={ch} required style={s.inp}>
                    <option value="">Select bank…</option>
                    {banks.map(b => <option key={b.BANK_ID} value={b.BANK_ID}>{b.BANK_NAME}</option>)}
                  </select>
                </label>
                <label style={s.label}>Location<input name="location" value={form.location} onChange={ch} style={s.inp} /></label>
                <label style={s.label}>Camp Date<input name="camp_date" type="date" value={form.camp_date} onChange={ch} style={s.inp} /></label>
                <label style={s.label}>Target Donors<input name="target_donors" type="number" min="1" value={form.target_donors} onChange={ch} style={s.inp} /></label>
                <label style={s.label}>Status
                  <select name="status" value={form.status} onChange={ch} style={s.inp}>
                    {STATUSES.map(st => <option key={st}>{st}</option>)}
                  </select>
                </label>
              </div>
              <div style={{ display:'flex', gap:'10px', padding:'4px 20px 0', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} style={s.sec}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ ...s.btn, opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Saving…' : (editingId ? 'Update' : 'Add Camp')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report modal */}
      {report && (
        <div style={s.ov} onClick={e => e.target === e.currentTarget && setReport(null)}>
          <div style={{ ...s.pan, maxWidth:'460px' }}>
            <div style={s.ph}>
              <div>
                <div style={{ fontWeight:700, fontSize:'1.1rem', color:'#1a1a2e' }}>Camp Report</div>
                <div style={{ fontSize:'0.85rem', color:'#6b7280', marginTop:'2px' }}>{report.camp.CAMP_NAME}</div>
              </div>
              <button onClick={() => setReport(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280' }}><X size={20} /></button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', padding:'0 20px' }}>
              <div style={statCard('#eff6ff','#1d4ed8')}>
                <Users size={20} strokeWidth={1.8} />
                <div style={{ fontSize:'1.8rem', fontWeight:700, lineHeight:1 }}>{report.data.total_donors ?? 0}</div>
                <div style={{ fontSize:'0.78rem', fontWeight:500, opacity:0.8 }}>Total Donors</div>
              </div>
              <div style={statCard('#fef2f2','#991b1b')}>
                <Droplets size={20} strokeWidth={1.8} />
                <div style={{ fontSize:'1.8rem', fontWeight:700, lineHeight:1 }}>{report.data.total_units ?? 0}</div>
                <div style={{ fontSize:'0.78rem', fontWeight:500, opacity:0.8 }}>Units Collected</div>
              </div>
            </div>
            <div style={{ padding:'0 20px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' }}>
                <span style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'0.83rem', fontWeight:600, color:'#374151' }}><Target size={14} />Target vs Actual</span>
                <span style={{ fontSize:'0.8rem', color:'#6b7280' }}>{report.data.total_units ?? 0} / {report.camp.TARGET_DONORS}</span>
              </div>
              <div style={{ height:'10px', background:'#f3f4f6', borderRadius:'99px', overflow:'hidden' }}>
                <div style={progressFill(report.data.total_units, report.camp.TARGET_DONORS)} />
              </div>
              <div style={{ fontSize:'0.78rem', color:'#6b7280', marginTop:'6px', textAlign:'right' }}>
                {report.camp.TARGET_DONORS > 0 ? `${Math.round(((report.data.total_units ?? 0) / report.camp.TARGET_DONORS) * 100)}% of target` : '—'}
              </div>
            </div>
            <div style={{ margin:'0 20px', border:'1px solid #f3f4f6', borderRadius:'10px', overflow:'hidden' }}>
              {[['Date', report.camp.CAMP_DATE], ['Location', report.camp.LOCATION], ['Bank', report.camp.BANK_NAME], ['Status', report.camp.STATUS]].map(([k, v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'9px 14px', borderBottom:'1px solid #f3f4f6', fontSize:'0.84rem' }}>
                  <span style={{ color:'#6b7280', fontWeight:500 }}>{k}</span>
                  <span style={{ color:'#111827', fontWeight:600 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ padding:'0 20px', display:'flex', justifyContent:'flex-end' }}>
              <button onClick={() => setReport(null)} style={s.btn}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
