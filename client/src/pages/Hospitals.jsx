import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, X, Building2 } from 'lucide-react';

const API = 'http://localhost:5000/api/hospitals';
const EMPTY = { hospital_name: '', address: '', city: '', phone: '', email: '', hospital_type: 'PUBLIC' };
const TYPES  = ['PUBLIC', 'PRIVATE', 'MILITARY'];
const TYPE_BADGE = {
  PUBLIC:   { background: '#dbeafe', color: '#1e40af' },
  PRIVATE:  { background: '#dcfce7', color: '#166534' },
  MILITARY: { background: '#f3f4f6', color: '#374151' },
};

const s = {
  btn:   { display:'flex', alignItems:'center', gap:'7px', background:'#8B0000', color:'#fff', padding:'9px 18px', borderRadius:'8px', fontSize:'0.88rem', fontWeight:600, cursor:'pointer', border:'none' },
  sec:   { padding:'9px 18px', borderRadius:'8px', fontSize:'0.88rem', fontWeight:600, border:'1px solid #e5e7eb', background:'#fff', cursor:'pointer', color:'#374151' },
  edit:  { display:'inline-flex', alignItems:'center', gap:'5px', padding:'5px 10px', borderRadius:'6px', fontSize:'0.78rem', fontWeight:600, border:'1px solid #e5e7eb', background:'#fff', color:'#374151', cursor:'pointer' },
  del:   { display:'inline-flex', alignItems:'center', gap:'5px', padding:'5px 10px', borderRadius:'6px', fontSize:'0.78rem', fontWeight:600, border:'1px solid #fecaca', background:'#fff', color:'#991b1b', cursor:'pointer' },
  ov:    { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 },
  pan:   { background:'#fff', borderRadius:'14px', width:'100%', maxWidth:'540px', boxShadow:'0 20px 60px rgba(0,0,0,0.2)', display:'flex', flexDirection:'column', gap:'20px', paddingBottom:'24px', maxHeight:'90vh', overflowY:'auto' },
  ph:    { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 20px 0' },
  grid:  { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', padding:'0 20px' },
  label: { display:'flex', flexDirection:'column', gap:'5px', fontSize:'0.82rem', fontWeight:600, color:'#374151' },
  inp:   { padding:'9px 11px', borderRadius:'7px', border:'1px solid #d1d5db', fontSize:'0.875rem', outline:'none', fontFamily:'inherit', background:'#fff', color:'#111827' },
  th:    { padding:'11px 14px', textAlign:'left', fontSize:'0.78rem', fontWeight:600, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.04em', whiteSpace:'nowrap' },
  td:    { padding:'11px 14px', verticalAlign:'middle' },
};

export default function Hospitals() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchItems = useCallback(() => {
    setLoading(true);
    axios.get(API).then(r => { setItems(r.data); setError(null); }).catch(() => setError('Failed to load hospitals.')).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function openCreate() { setEditingId(null); setForm(EMPTY); setFormError(null); setShowForm(true); }

  function openEdit(h) {
    setEditingId(h.HOSPITAL_ID);
    setForm({ hospital_name: h.HOSPITAL_NAME, address: h.ADDRESS || '', city: h.CITY || '', phone: h.PHONE || '', email: h.EMAIL || '', hospital_type: h.HOSPITAL_TYPE || 'PUBLIC' });
    setFormError(null); setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.hospital_name.trim()) { setFormError('Hospital name is required.'); return; }
    setSubmitting(true); setFormError(null);
    try {
      if (editingId) { await axios.put(`${API}/${editingId}`, form); setSuccess('Hospital updated.'); }
      else           { await axios.post(API, form);                  setSuccess('Hospital added.');   }
      setShowForm(false); setTimeout(() => setSuccess(null), 4000); fetchItems();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Operation failed.');
    } finally { setSubmitting(false); }
  }

  async function handleDelete(h) {
    if (!window.confirm(`Delete "${h.HOSPITAL_NAME}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API}/${h.HOSPITAL_ID}`);
      setSuccess('Hospital deleted.'); setTimeout(() => setSuccess(null), 4000); fetchItems();
    } catch (err) { setError(err.response?.data?.error || 'Failed to delete hospital.'); }
  }

  const ch = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div style={{ padding:'28px 32px', fontFamily:'inherit' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <Building2 size={26} color="#8B0000" />
          <div>
            <h1 style={{ margin:0, fontSize:'1.45rem', fontWeight:700, color:'#111827' }}>Hospitals</h1>
            <p style={{ margin:0, fontSize:'0.82rem', color:'#6b7280' }}>{items.length} registered</p>
          </div>
        </div>
        <button style={s.btn} onClick={openCreate}><Plus size={16} />Add Hospital</button>
      </div>

      {success && <div style={{ background:'#dcfce7', color:'#166534', border:'1px solid #86efac', borderRadius:'8px', padding:'10px 14px', marginBottom:'16px', fontSize:'0.875rem' }}>{success}</div>}
      {error   && <div style={{ background:'#fee2e2', color:'#991b1b', border:'1px solid #fca5a5', borderRadius:'8px', padding:'10px 14px', marginBottom:'16px', fontSize:'0.875rem' }}>{error}</div>}

      <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div style={{ padding:'48px', textAlign:'center', color:'#6b7280' }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ padding:'48px', textAlign:'center', color:'#6b7280' }}>No hospitals yet. Add one above.</div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
            <thead>
              <tr style={{ background:'#f9fafb', borderBottom:'1px solid #e5e7eb' }}>
                {['Hospital Name','City','Phone','Email','Type','Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {items.map(h => (
                <tr key={h.HOSPITAL_ID} style={{ borderBottom:'1px solid #f3f4f6' }}>
                  <td style={{ ...s.td, fontWeight:600, color:'#111827' }}>{h.HOSPITAL_NAME}</td>
                  <td style={{ ...s.td, color:'#374151' }}>{h.CITY || '—'}</td>
                  <td style={{ ...s.td, color:'#374151' }}>{h.PHONE || '—'}</td>
                  <td style={{ ...s.td, color:'#374151' }}>{h.EMAIL || '—'}</td>
                  <td style={s.td}>
                    <span style={{ ...(TYPE_BADGE[h.HOSPITAL_TYPE] || TYPE_BADGE.PUBLIC), padding:'3px 10px', borderRadius:'99px', fontSize:'0.74rem', fontWeight:600 }}>{h.HOSPITAL_TYPE}</span>
                  </td>
                  <td style={s.td}>
                    <div style={{ display:'flex', gap:'6px' }}>
                      <button style={s.edit} onClick={() => openEdit(h)}><Pencil size={12} />Edit</button>
                      <button style={s.del}  onClick={() => handleDelete(h)}><Trash2 size={12} />Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div style={s.ov} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={s.pan}>
            <div style={s.ph}>
              <h2 style={{ margin:0, fontSize:'1.1rem', fontWeight:700 }}>{editingId ? 'Edit Hospital' : 'Add Hospital'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280' }}><X size={20} /></button>
            </div>
            {formError && <div style={{ background:'#fee2e2', color:'#991b1b', border:'1px solid #fca5a5', borderRadius:'8px', padding:'10px 14px', margin:'0 20px', fontSize:'0.875rem' }}>{formError}</div>}
            <form onSubmit={handleSubmit}>
              <div style={s.grid}>
                <label style={{ ...s.label, gridColumn:'1 / -1' }}>Hospital Name *<input name="hospital_name" value={form.hospital_name} onChange={ch} required style={s.inp} placeholder="General Hospital" /></label>
                <label style={s.label}>City<input name="city" value={form.city} onChange={ch} style={s.inp} placeholder="Mogadishu" /></label>
                <label style={s.label}>Phone<input name="phone" value={form.phone} onChange={ch} style={s.inp} placeholder="+252..." /></label>
                <label style={{ ...s.label, gridColumn:'1 / -1' }}>Address<input name="address" value={form.address} onChange={ch} style={s.inp} /></label>
                <label style={s.label}>Email<input name="email" type="email" value={form.email} onChange={ch} style={s.inp} /></label>
                <label style={s.label}>Type<select name="hospital_type" value={form.hospital_type} onChange={ch} style={s.inp}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></label>
              </div>
              <div style={{ display:'flex', gap:'10px', padding:'4px 20px 0', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} style={s.sec}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ ...s.btn, opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Saving…' : (editingId ? 'Update' : 'Add Hospital')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
