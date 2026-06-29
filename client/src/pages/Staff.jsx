import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, X, Users } from 'lucide-react';

const API      = 'http://localhost:5000/api/staff';
const FORM_API = 'http://localhost:5000/api/staff/form-data';

const EMPTY = { bank_id: '', first_name: '', last_name: '', role: 'DOCTOR', phone: '', hire_date: '' };
const ROLES  = ['ADMIN', 'DOCTOR', 'NURSE', 'TECHNICIAN', 'COORDINATOR'];

const ROLE_BADGE = {
  ADMIN:       { background:'#dbeafe', color:'#1e40af' },
  DOCTOR:      { background:'#dcfce7', color:'#166534' },
  NURSE:       { background:'#fce7f3', color:'#9d174d' },
  TECHNICIAN:  { background:'#fef3c7', color:'#92400e' },
  COORDINATOR: { background:'#ede9fe', color:'#5b21b6' },
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

export default function Staff() {
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

  const fetchItems = useCallback(() => {
    setLoading(true);
    axios.get(API).then(r => { setItems(r.data); setError(null); }).catch(() => setError('Failed to load staff.')).finally(() => setLoading(false));
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

  function openEdit(m) {
    setEditingId(m.STAFF_ID);
    setForm({ bank_id: m.BANK_ID?.toString() || '', first_name: m.FIRST_NAME, last_name: m.LAST_NAME, role: m.ROLE, phone: m.PHONE || '', hire_date: m.HIRE_DATE || '' });
    setFormError(null); setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim()) { setFormError('First and last name are required.'); return; }
    if (!form.bank_id) { setFormError('Bank is required.'); return; }
    setSubmitting(true); setFormError(null);
    try {
      if (editingId) { await axios.put(`${API}/${editingId}`, form); setSuccess('Staff member updated.'); }
      else           { await axios.post(API, form);                  setSuccess('Staff member added.');   }
      setShowForm(false); setTimeout(() => setSuccess(null), 4000); fetchItems();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Operation failed.');
    } finally { setSubmitting(false); }
  }

  async function handleDelete(m) {
    if (!window.confirm(`Delete ${m.FIRST_NAME} ${m.LAST_NAME}? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API}/${m.STAFF_ID}`);
      setSuccess('Staff member deleted.'); setTimeout(() => setSuccess(null), 4000); fetchItems();
    } catch (err) { setError(err.response?.data?.error || 'Failed to delete.'); }
  }

  const ch = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div style={{ padding:'28px 32px', fontFamily:'inherit' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <Users size={26} color="#8B0000" />
          <div>
            <h1 style={{ margin:0, fontSize:'1.45rem', fontWeight:700, color:'#111827' }}>Staff</h1>
            <p style={{ margin:0, fontSize:'0.82rem', color:'#6b7280' }}>{items.length} staff members</p>
          </div>
        </div>
        <button style={s.btn} onClick={openCreate}><Plus size={16} />Add Staff</button>
      </div>

      {success && <div style={{ background:'#dcfce7', color:'#166534', border:'1px solid #86efac', borderRadius:'8px', padding:'10px 14px', marginBottom:'16px', fontSize:'0.875rem' }}>{success}</div>}
      {error   && <div style={{ background:'#fee2e2', color:'#991b1b', border:'1px solid #fca5a5', borderRadius:'8px', padding:'10px 14px', marginBottom:'16px', fontSize:'0.875rem' }}>{error}</div>}

      <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div style={{ padding:'48px', textAlign:'center', color:'#6b7280' }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ padding:'48px', textAlign:'center', color:'#6b7280' }}>No staff records yet.</div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
            <thead>
              <tr style={{ background:'#f9fafb', borderBottom:'1px solid #e5e7eb' }}>
                {['Name','Bank','Role','Phone','Hire Date','Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {items.map(m => (
                <tr key={m.STAFF_ID} style={{ borderBottom:'1px solid #f3f4f6' }}>
                  <td style={{ ...s.td, fontWeight:600, color:'#111827' }}>{m.FIRST_NAME} {m.LAST_NAME}</td>
                  <td style={{ ...s.td, color:'#374151' }}>{m.BANK_NAME}</td>
                  <td style={s.td}>
                    <span style={{ ...(ROLE_BADGE[m.ROLE] || ROLE_BADGE.DOCTOR), padding:'3px 10px', borderRadius:'99px', fontSize:'0.74rem', fontWeight:600 }}>{m.ROLE}</span>
                  </td>
                  <td style={{ ...s.td, color:'#374151' }}>{m.PHONE || '—'}</td>
                  <td style={{ ...s.td, color:'#374151' }}>{m.HIRE_DATE || '—'}</td>
                  <td style={s.td}>
                    <div style={{ display:'flex', gap:'6px' }}>
                      <button style={s.edit} onClick={() => openEdit(m)}><Pencil size={12} />Edit</button>
                      <button style={s.del}  onClick={() => handleDelete(m)}><Trash2 size={12} />Delete</button>
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
              <h2 style={{ margin:0, fontSize:'1.1rem', fontWeight:700 }}>{editingId ? 'Edit Staff Member' : 'Add Staff Member'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280' }}><X size={20} /></button>
            </div>
            {formError && <div style={{ background:'#fee2e2', color:'#991b1b', border:'1px solid #fca5a5', borderRadius:'8px', padding:'10px 14px', margin:'0 20px', fontSize:'0.875rem' }}>{formError}</div>}
            <form onSubmit={handleSubmit}>
              <div style={s.grid}>
                <label style={s.label}>First Name *<input name="first_name" value={form.first_name} onChange={ch} required style={s.inp} /></label>
                <label style={s.label}>Last Name *<input name="last_name" value={form.last_name} onChange={ch} required style={s.inp} /></label>
                <label style={{ ...s.label, gridColumn:'1 / -1' }}>Blood Bank *
                  <select name="bank_id" value={form.bank_id} onChange={ch} required style={s.inp}>
                    <option value="">Select bank…</option>
                    {banks.map(b => <option key={b.BANK_ID} value={b.BANK_ID}>{b.BANK_NAME}</option>)}
                  </select>
                </label>
                <label style={s.label}>Role
                  <select name="role" value={form.role} onChange={ch} style={s.inp}>
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </label>
                <label style={s.label}>Phone<input name="phone" value={form.phone} onChange={ch} style={s.inp} /></label>
                <label style={s.label}>Hire Date<input name="hire_date" type="date" value={form.hire_date} onChange={ch} style={s.inp} /></label>
              </div>
              <div style={{ display:'flex', gap:'10px', padding:'4px 20px 0', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} style={s.sec}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ ...s.btn, opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Saving…' : (editingId ? 'Update' : 'Add Staff')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
