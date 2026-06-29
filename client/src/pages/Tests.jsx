import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, X, FlaskConical } from 'lucide-react';

const API      = 'http://localhost:5000/api/tests';
const FORM_API = 'http://localhost:5000/api/tests/form-data';
const EMPTY    = { donation_id: '', test_type: 'HIV', test_date: '', result: 'PENDING', tested_by: '' };

const TEST_TYPES = ['HIV', 'HEPATITIS_B', 'HEPATITIS_C', 'SYPHILIS', 'MALARIA'];

const RESULT_STYLE = {
  PASS:    { background:'#dcfce7', color:'#166534' },
  FAIL:    { background:'#fee2e2', color:'#991b1b' },
  PENDING: { background:'#fef9c3', color:'#854d0e' },
};

export default function Tests() {
  const [items,      setItems]      = useState([]);
  const [donations,  setDonations]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [success,    setSuccess]    = useState(null);
  const [showForm,   setShowForm]   = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [form,       setForm]       = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formError,  setFormError]  = useState(null);

  const fetchItems = useCallback(() => {
    setLoading(true);
    axios.get(API).then(r => { setItems(r.data); setError(null); }).catch(() => setError('Failed to load tests.')).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchItems();
    axios.get(FORM_API).then(r => setDonations(r.data.donations));
  }, [fetchItems]);

  function openCreate() { setEditingId(null); setForm(EMPTY); setFormError(null); setShowForm(true); }

  function openEdit(t) {
    setEditingId(t.TEST_ID);
    setForm({ donation_id: t.DONATION_ID?.toString() || '', test_type: t.TEST_TYPE || 'HIV', test_date: t.TEST_DATE || '', result: (t.RESULT || 'PENDING').toUpperCase(), tested_by: t.TESTED_BY || '' });
    setFormError(null); setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.donation_id) { setFormError('Donation is required.'); return; }
    setSubmitting(true); setFormError(null);
    try {
      const payload = { ...form, result: form.result };
      if (editingId) { await axios.put(`${API}/${editingId}`, payload); setSuccess('Test record updated.'); }
      else           { await axios.post(API, payload);                  setSuccess('Test recorded.');       }
      setShowForm(false); setTimeout(() => setSuccess(null), 4000); fetchItems();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Operation failed.');
    } finally { setSubmitting(false); }
  }

  async function handleDelete(t) {
    if (!window.confirm(`Delete test #${t.TEST_ID}? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API}/${t.TEST_ID}`);
      setSuccess('Test deleted.'); setTimeout(() => setSuccess(null), 4000); fetchItems();
    } catch (err) { setError(err.response?.data?.error || 'Failed to delete.'); }
  }

  const ch = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div style={{ padding:'28px 32px', fontFamily:'inherit' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <FlaskConical size={26} color="#8B0000" />
          <div>
            <h1 style={{ margin:0, fontSize:'1.45rem', fontWeight:700, color:'#111827' }}>Medical Tests</h1>
            <p style={{ margin:0, fontSize:'0.82rem', color:'#6b7280' }}>{items.length} test records</p>
          </div>
        </div>
        <button style={btnPrimary} onClick={openCreate}><Plus size={16} />Record Test</button>
      </div>

      {success && <div style={successBanner}>{success}</div>}
      {error   && <div style={errorBanner}>{error}</div>}

      <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div style={{ padding:'48px', textAlign:'center', color:'#6b7280' }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ padding:'48px', textAlign:'center', color:'#6b7280' }}>No test records yet.</div>
        ) : (
          <table style={tbl}>
            <thead>
              <tr style={thead}>
                {['Donor','Donation Date','Test Type','Test Date','Result','Tested By','Actions'].map(h => <th key={h} style={thS}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {items.map(t => {
                const rk = (t.RESULT || 'PENDING').toUpperCase();
                return (
                  <tr key={t.TEST_ID} style={{ borderBottom:'1px solid #f3f4f6' }}>
                    <td style={{ ...tdS, fontWeight:600 }}>{t.DONOR_NAME}</td>
                    <td style={{ ...tdS, color:'#374151', whiteSpace:'nowrap' }}>{t.DONATION_DATE}</td>
                    <td style={tdS}><span style={{ background:'#ede9fe', color:'#5b21b6', padding:'3px 10px', borderRadius:'99px', fontSize:'0.74rem', fontWeight:600 }}>{t.TEST_TYPE}</span></td>
                    <td style={{ ...tdS, color:'#374151', whiteSpace:'nowrap' }}>{t.TEST_DATE}</td>
                    <td style={tdS}><span style={{ ...(RESULT_STYLE[rk] || RESULT_STYLE.PENDING), padding:'3px 10px', borderRadius:'99px', fontSize:'0.74rem', fontWeight:600 }}>{t.RESULT}</span></td>
                    <td style={{ ...tdS, color:'#374151' }}>{t.TESTED_BY || '—'}</td>
                    <td style={tdS}>
                      <div style={{ display:'flex', gap:'6px' }}>
                        <button style={editBtn} onClick={() => openEdit(t)}><Pencil size={12} />Edit</button>
                        <button style={delBtn}  onClick={() => handleDelete(t)}><Trash2 size={12} />Delete</button>
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
              <h2 style={{ margin:0, fontSize:'1.1rem', fontWeight:700 }}>{editingId ? 'Edit Test' : 'Record Test'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280' }}><X size={20} /></button>
            </div>
            {formError && <div style={{ ...errorBanner, margin:'0 20px' }}>{formError}</div>}
            <form onSubmit={handleSubmit} style={formGrid}>
              <label style={{ ...labelS, gridColumn:'1 / -1' }}>Donation *
                <select name="donation_id" value={form.donation_id} onChange={ch} required style={inpS}>
                  <option value="">— Select donation —</option>
                  {donations.map(d => <option key={d.DONATION_ID} value={d.DONATION_ID}>{d.DONOR_NAME} — {d.BLOOD_GROUP} ({d.DONATION_DATE})</option>)}
                </select>
              </label>
              <label style={labelS}>Test Type
                <select name="test_type" value={form.test_type} onChange={ch} style={inpS}>
                  {TEST_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label style={labelS}>Test Date
                <input name="test_date" type="date" value={form.test_date} onChange={ch} style={inpS} />
              </label>
              <label style={labelS}>Result
                <select name="result" value={form.result} onChange={ch} style={inpS}>
                  <option value="PENDING">PENDING</option>
                  <option value="PASS">PASS</option>
                  <option value="FAIL">FAIL</option>
                </select>
              </label>
              <label style={labelS}>Tested By
                <input name="tested_by" value={form.tested_by} onChange={ch} style={inpS} placeholder="Technician name" />
              </label>
              <div style={{ gridColumn:'1 / -1', display:'flex', gap:'10px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} style={btnSecondary}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Saving…' : (editingId ? 'Update' : 'Record Test')}
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
const editBtn       = { display:'inline-flex', alignItems:'center', gap:'5px', padding:'5px 10px', borderRadius:'6px', fontSize:'0.78rem', fontWeight:600, border:'1px solid #e5e7eb', background:'#fff', color:'#374151', cursor:'pointer' };
const delBtn        = { display:'inline-flex', alignItems:'center', gap:'5px', padding:'5px 10px', borderRadius:'6px', fontSize:'0.78rem', fontWeight:600, border:'1px solid #fecaca', background:'#fff', color:'#991b1b', cursor:'pointer' };
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
