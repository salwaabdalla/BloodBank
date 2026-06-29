import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, X, CreditCard } from 'lucide-react';

const API      = 'http://localhost:5000/api/payments';
const FORM_API = 'http://localhost:5000/api/payments/form-data';
const EMPTY    = { request_id: '', patient_id: '', amount: '', payment_date: '', payment_method: 'CASH', status: 'PENDING' };

const METHODS  = ['CASH', 'INSURANCE', 'BANK_TRANSFER', 'WAIVED'];
const STATUSES = ['PENDING', 'PAID', 'WAIVED', 'OVERDUE'];

const STATUS_STYLE = {
  PAID:    { background:'#dcfce7', color:'#166534' },
  WAIVED:  { background:'#dbeafe', color:'#1e40af' },
  PENDING: { background:'#fef9c3', color:'#854d0e' },
  OVERDUE: { background:'#fee2e2', color:'#991b1b' },
};

export default function Payments() {
  const [items,      setItems]      = useState([]);
  const [requests,   setRequests]   = useState([]);
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
    axios.get(API).then(r => { setItems(r.data); setError(null); }).catch(() => setError('Failed to load payments.')).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchItems();
    axios.get(FORM_API).then(r => setRequests(r.data.requests));
  }, [fetchItems]);

  function openCreate() { setEditingId(null); setForm(EMPTY); setFormError(null); setShowForm(true); }

  function openEdit(p) {
    setEditingId(p.PAYMENT_ID);
    setForm({ request_id: p.REQUEST_ID?.toString() || '', patient_id: p.PATIENT_ID?.toString() || '', amount: p.AMOUNT?.toString() || '', payment_date: p.PAYMENT_DATE || '', payment_method: (p.PAYMENT_METHOD || 'CASH').toUpperCase(), status: (p.STATUS || 'PENDING').toUpperCase() });
    setFormError(null); setShowForm(true);
  }

  function handleRequestChange(e) {
    const rid = e.target.value;
    const req = requests.find(r => r.REQUEST_ID?.toString() === rid);
    setForm(f => ({ ...f, request_id: rid, patient_id: req?.PATIENT_ID?.toString() || f.patient_id }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.request_id) { setFormError('Blood request is required.'); return; }
    setSubmitting(true); setFormError(null);
    try {
      if (editingId) { await axios.put(`${API}/${editingId}`, form); setSuccess('Payment updated.'); }
      else           { await axios.post(API, form);                  setSuccess('Payment recorded.'); }
      setShowForm(false); setTimeout(() => setSuccess(null), 4000); fetchItems();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Operation failed.');
    } finally { setSubmitting(false); }
  }

  async function handleDelete(p) {
    if (!window.confirm(`Delete payment #${p.PAYMENT_ID}? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API}/${p.PAYMENT_ID}`);
      setSuccess('Payment deleted.'); setTimeout(() => setSuccess(null), 4000); fetchItems();
    } catch (err) { setError(err.response?.data?.error || 'Failed to delete.'); }
  }

  const ch = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div style={{ padding:'28px 32px', fontFamily:'inherit' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <CreditCard size={26} color="#8B0000" />
          <div>
            <h1 style={{ margin:0, fontSize:'1.45rem', fontWeight:700, color:'#111827' }}>Payments</h1>
            <p style={{ margin:0, fontSize:'0.82rem', color:'#6b7280' }}>{items.length} payment records</p>
          </div>
        </div>
        <button style={btnPrimary} onClick={openCreate}><Plus size={16} />Record Payment</button>
      </div>

      {success && <div style={successBanner}>{success}</div>}
      {error   && <div style={errorBanner}>{error}</div>}

      <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div style={{ padding:'48px', textAlign:'center', color:'#6b7280' }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ padding:'48px', textAlign:'center', color:'#6b7280' }}>No payment records yet.</div>
        ) : (
          <table style={tbl}>
            <thead>
              <tr style={thead}>
                {['Patient','Request #','Amount','Date','Method','Status','Actions'].map(h => <th key={h} style={thS}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {items.map(p => {
                const sk = (p.STATUS || 'PENDING').toUpperCase();
                return (
                  <tr key={p.PAYMENT_ID} style={{ borderBottom:'1px solid #f3f4f6' }}>
                    <td style={{ ...tdS, fontWeight:600 }}>{p.PATIENT_NAME}</td>
                    <td style={{ ...tdS, color:'#6b7280' }}>#{p.REQUEST_ID}</td>
                    <td style={{ ...tdS, fontWeight:700, color:'#111827' }}>${Number(p.AMOUNT || 0).toFixed(2)}</td>
                    <td style={{ ...tdS, color:'#374151', whiteSpace:'nowrap' }}>{p.PAYMENT_DATE || '—'}</td>
                    <td style={{ ...tdS, color:'#374151' }}>{p.PAYMENT_METHOD || '—'}</td>
                    <td style={tdS}><span style={{ ...(STATUS_STYLE[sk] || STATUS_STYLE.PENDING), padding:'3px 10px', borderRadius:'99px', fontSize:'0.74rem', fontWeight:600 }}>{p.STATUS}</span></td>
                    <td style={tdS}>
                      <div style={{ display:'flex', gap:'6px' }}>
                        <button style={editBtn} onClick={() => openEdit(p)}><Pencil size={12} />Edit</button>
                        <button style={delBtn}  onClick={() => handleDelete(p)}><Trash2 size={12} />Delete</button>
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
              <h2 style={{ margin:0, fontSize:'1.1rem', fontWeight:700 }}>{editingId ? 'Edit Payment' : 'Record Payment'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280' }}><X size={20} /></button>
            </div>
            {formError && <div style={{ ...errorBanner, margin:'0 20px' }}>{formError}</div>}
            <form onSubmit={handleSubmit} style={formGrid}>
              <label style={{ ...labelS, gridColumn:'1 / -1' }}>Blood Request *
                <select name="request_id" value={form.request_id} onChange={handleRequestChange} required style={inpS}>
                  <option value="">— Select request —</option>
                  {requests.map(r => <option key={r.REQUEST_ID} value={r.REQUEST_ID}>#{r.REQUEST_ID} — {r.PATIENT_NAME} ({r.BLOOD_GROUP}, {r.URGENCY})</option>)}
                </select>
              </label>
              <label style={labelS}>Amount ($)
                <input name="amount" type="number" min={0} step="0.01" value={form.amount} onChange={ch} style={inpS} placeholder="0.00" />
              </label>
              <label style={labelS}>Payment Date
                <input name="payment_date" type="date" value={form.payment_date} onChange={ch} style={inpS} />
              </label>
              <label style={labelS}>Method
                <select name="payment_method" value={form.payment_method} onChange={ch} style={inpS}>
                  {METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
              </label>
              <label style={labelS}>Status
                <select name="status" value={form.status} onChange={ch} style={inpS}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </label>
              <div style={{ gridColumn:'1 / -1', display:'flex', gap:'10px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} style={btnSecondary}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Saving…' : (editingId ? 'Update' : 'Record Payment')}
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
