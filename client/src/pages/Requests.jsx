import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { PlusCircle, Pencil, Trash2, X, Zap } from 'lucide-react';

const API = 'http://localhost:5000/api/requests';
const EMPTY = { patient_id: '', hospital_id: '', blood_type_id: '', units: 1, urgency: 'NORMAL' };

const URGENCY_STYLE = {
  CRITICAL: { background:'#fee2e2', color:'#991b1b' },
  HIGH:     { background:'#ffedd5', color:'#9a3412' },
  NORMAL:   { background:'#fef9c3', color:'#854d0e' },
  LOW:      { background:'#dbeafe', color:'#1e40af' },
};
const STATUS_STYLE = {
  FULFILLED: { background:'#dcfce7', color:'#166534' },
  PENDING:   { background:'#fef9c3', color:'#854d0e' },
  APPROVED:  { background:'#dbeafe', color:'#1e40af' },
  REJECTED:  { background:'#fee2e2', color:'#991b1b' },
  CANCELLED: { background:'#f3f4f6', color:'#6b7280' },
};
const normalizeKey = s => (s || '').toUpperCase();

export default function Requests() {
  const [requests,      setRequests]      = useState([]);
  const [formData,      setFormData]      = useState(null);
  const [banks,         setBanks]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [success,       setSuccess]       = useState(null);

  const [showForm,      setShowForm]      = useState(false);
  const [editingId,     setEditingId]     = useState(null);
  const [form,          setForm]          = useState(EMPTY);
  const [submitting,    setSubmitting]    = useState(false);
  const [formError,     setFormError]     = useState(null);

  const [processing,    setProcessing]    = useState(null);
  const [bankId,        setBankId]        = useState('');
  const [procSubmitting,setProcSubmitting] = useState(false);
  const [procError,     setProcError]     = useState(null);

  const fetchRequests = useCallback(() => {
    setLoading(true);
    axios.get(API).then(r => { setRequests(r.data); setError(null); }).catch(() => setError('Failed to load blood requests.')).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchRequests();
    axios.get(`${API}/form-data`).then(r => setFormData(r.data));
    axios.get(`${API}/banks`).then(r => setBanks(r.data));
  }, [fetchRequests]);

  const ch = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  function openCreate() { setEditingId(null); setForm(EMPTY); setFormError(null); setShowForm(true); }

  function openEdit(r) {
    setEditingId(r.REQUEST_ID);
    setForm({ patient_id: r.PATIENT_ID?.toString() || '', hospital_id: r.HOSPITAL_ID?.toString() || '', blood_type_id: r.BLOOD_TYPE_ID?.toString() || '', units: r.UNITS, urgency: normalizeKey(r.URGENCY) || 'NORMAL' });
    setFormError(null); setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true); setFormError(null);
    try {
      if (editingId) { await axios.put(`${API}/${editingId}`, form); setSuccess('Request updated.'); }
      else           { await axios.post(API, form);                  setSuccess('Blood request created.'); }
      setShowForm(false); setTimeout(() => setSuccess(null), 4000); fetchRequests();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Operation failed.');
    } finally { setSubmitting(false); }
  }

  async function handleDelete(r) {
    if (!window.confirm(`Delete request #${r.REQUEST_ID}? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API}/${r.REQUEST_ID}`);
      setSuccess('Request deleted.'); setTimeout(() => setSuccess(null), 4000); fetchRequests();
    } catch (err) { setError(err.response?.data?.error || 'Failed to delete. Request may have associated payments.'); }
  }

  function openProcess(r) { setProcessing(r); setBankId(banks[0]?.BANK_ID ?? ''); setProcError(null); }

  async function handleProcess(e) {
    e.preventDefault();
    setProcSubmitting(true); setProcError(null);
    try {
      await axios.put(`${API}/${processing.REQUEST_ID}/process`, { bank_id: bankId });
      setProcessing(null);
      setSuccess(`Request #${processing.REQUEST_ID} processed.`);
      setTimeout(() => setSuccess(null), 4000); fetchRequests();
    } catch (err) { setProcError(err.response?.data?.error || 'Failed to process.'); }
    finally { setProcSubmitting(false); }
  }

  return (
    <div style={{ padding:'28px 32px', fontFamily:'inherit' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
        <div>
          <h1 style={{ margin:0, fontSize:'1.45rem', fontWeight:700, color:'#111827' }}>Blood Requests</h1>
          <p style={{ margin:0, fontSize:'0.82rem', color:'#6b7280' }}>{requests.length} requests</p>
        </div>
        <button onClick={openCreate} style={btnPrimary}><PlusCircle size={16} />New Request</button>
      </div>

      {success && <div style={successBanner}>{success}</div>}
      {error   && <div style={errorBanner}>{error}</div>}

      <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div style={{ padding:'48px', textAlign:'center', color:'#6b7280' }}>Loading…</div>
        ) : requests.length === 0 ? (
          <div style={{ padding:'48px', textAlign:'center', color:'#6b7280' }}>No requests found.</div>
        ) : (
          <table style={tbl}>
            <thead>
              <tr style={thead}>
                {['Patient','Hospital','Blood Group','Units','Urgency','Date','Status','Actions'].map(h => <th key={h} style={thS}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {requests.map(r => {
                const uk = normalizeKey(r.URGENCY);
                const sk = normalizeKey(r.STATUS);
                return (
                  <tr key={r.REQUEST_ID} style={{ borderBottom:'1px solid #f3f4f6' }}>
                    <td style={{ ...tdS, fontWeight:600 }}>{r.PATIENT_NAME}</td>
                    <td style={tdS}>{r.HOSPITAL_NAME}</td>
                    <td style={tdS}><span style={bloodBadge}>{r.BLOOD_GROUP}</span></td>
                    <td style={{ ...tdS, textAlign:'center', fontWeight:600 }}>{r.UNITS}</td>
                    <td style={tdS}><span style={{ ...(URGENCY_STYLE[uk] || URGENCY_STYLE.NORMAL), ...pill }}>{r.URGENCY}</span></td>
                    <td style={{ ...tdS, whiteSpace:'nowrap' }}>{r.REQUEST_DATE}</td>
                    <td style={tdS}><span style={{ ...(STATUS_STYLE[sk] || STATUS_STYLE.PENDING), ...pill }}>{r.STATUS}</span></td>
                    <td style={tdS}>
                      <div style={{ display:'flex', gap:'5px', flexWrap:'wrap' }}>
                        <button onClick={() => openProcess(r)} style={processBtn}><Zap size={12} />Process</button>
                        <button style={editBtn} onClick={() => openEdit(r)}><Pencil size={12} />Edit</button>
                        <button style={delBtn}  onClick={() => handleDelete(r)}><Trash2 size={12} />Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit modal */}
      {showForm && (
        <div style={overlay} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={panel}>
            <div style={panelHeader}>
              <span style={{ fontWeight:700, fontSize:'1.05rem' }}>{editingId ? 'Edit Request' : 'New Blood Request'}</span>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280' }}><X size={20} /></button>
            </div>
            {formError && <div style={{ ...errorBanner, margin:'0 20px' }}>{formError}</div>}
            <form onSubmit={handleSubmit} style={formGrid}>
              <label style={{ ...labelS, gridColumn:'1 / -1' }}>Patient
                <select name="patient_id" value={form.patient_id} onChange={ch} required style={inpS}>
                  <option value="">— Select patient —</option>
                  {formData?.patients.map(p => <option key={p.PATIENT_ID} value={p.PATIENT_ID}>{p.FULL_NAME}</option>)}
                </select>
              </label>
              <label style={labelS}>Hospital
                <select name="hospital_id" value={form.hospital_id} onChange={ch} required style={inpS}>
                  <option value="">— Select —</option>
                  {formData?.hospitals.map(h => <option key={h.HOSPITAL_ID} value={h.HOSPITAL_ID}>{h.HOSPITAL_NAME}</option>)}
                </select>
              </label>
              <label style={labelS}>Blood Type
                <select name="blood_type_id" value={form.blood_type_id} onChange={ch} required style={inpS}>
                  <option value="">— Select —</option>
                  {formData?.blood_types.map(bt => <option key={bt.BLOOD_TYPE_ID} value={bt.BLOOD_TYPE_ID}>{bt.BLOOD_GROUP}</option>)}
                </select>
              </label>
              <label style={labelS}>Units
                <input name="units" type="number" min={1} value={form.units} onChange={ch} required style={inpS} />
              </label>
              <label style={labelS}>Urgency
                <select name="urgency" value={form.urgency} onChange={ch} style={inpS}>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="NORMAL">Normal</option>
                  <option value="LOW">Low</option>
                </select>
              </label>
              <div style={{ gridColumn:'1 / -1', display:'flex', gap:'10px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} style={btnSecondary}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Saving…' : (editingId ? 'Update' : 'Submit Request')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Process modal */}
      {processing && (
        <div style={overlay} onClick={e => e.target === e.currentTarget && setProcessing(null)}>
          <div style={{ ...panel, maxWidth:'380px' }}>
            <div style={panelHeader}>
              <span style={{ fontWeight:700, fontSize:'1.05rem' }}>Process Request #{processing.REQUEST_ID}</span>
              <button onClick={() => setProcessing(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280' }}><X size={20} /></button>
            </div>
            <div style={{ padding:'0 20px', fontSize:'0.875rem', color:'#6b7280' }}>
              {processing.PATIENT_NAME} — <strong>{processing.BLOOD_GROUP}</strong> × {processing.UNITS} units
            </div>
            {procError && <div style={{ ...errorBanner, margin:'0 20px' }}>{procError}</div>}
            <form onSubmit={handleProcess} style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:'14px' }}>
              <label style={labelS}>Fulfilling Blood Bank
                <select value={bankId} onChange={e => setBankId(e.target.value)} required style={inpS}>
                  {banks.map(b => <option key={b.BANK_ID} value={b.BANK_ID}>{b.BANK_NAME}</option>)}
                </select>
              </label>
              <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setProcessing(null)} style={btnSecondary}>Cancel</button>
                <button type="submit" disabled={procSubmitting} style={{ ...btnPrimary, opacity: procSubmitting ? 0.7 : 1 }}>
                  {procSubmitting ? 'Processing…' : 'Confirm & Process'}
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
const processBtn    = { display:'inline-flex', alignItems:'center', gap:'5px', padding:'5px 10px', borderRadius:'6px', fontSize:'0.78rem', fontWeight:600, border:'1px solid #bfdbfe', background:'#eff6ff', color:'#1d4ed8', cursor:'pointer' };
const successBanner = { background:'#dcfce7', color:'#166534', border:'1px solid #86efac', borderRadius:'8px', padding:'10px 14px', marginBottom:'16px', fontSize:'0.875rem' };
const errorBanner   = { background:'#fee2e2', color:'#991b1b', border:'1px solid #fca5a5', borderRadius:'8px', padding:'10px 14px', marginBottom:'16px', fontSize:'0.875rem' };
const tbl   = { width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' };
const thead = { background:'#f9fafb', borderBottom:'1px solid #e5e7eb' };
const thS   = { padding:'11px 14px', textAlign:'left', fontSize:'0.78rem', fontWeight:600, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.04em', whiteSpace:'nowrap' };
const tdS   = { padding:'11px 14px', verticalAlign:'middle' };
const bloodBadge = { display:'inline-block', background:'#fef2f2', color:'#991b1b', border:'1px solid #fecaca', borderRadius:'6px', padding:'2px 8px', fontWeight:700, fontSize:'0.8rem' };
const pill       = { display:'inline-block', borderRadius:'20px', padding:'3px 10px', fontSize:'0.78rem', fontWeight:600 };
const overlay    = { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 };
const panel      = { background:'#fff', borderRadius:'14px', width:'100%', maxWidth:'520px', boxShadow:'0 20px 60px rgba(0,0,0,0.2)', display:'flex', flexDirection:'column', gap:'20px', paddingBottom:'24px', maxHeight:'90vh', overflowY:'auto' };
const panelHeader = { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 20px 0' };
const formGrid   = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', padding:'0 20px' };
const labelS     = { display:'flex', flexDirection:'column', gap:'5px', fontSize:'0.82rem', fontWeight:600, color:'#374151' };
const inpS       = { padding:'9px 11px', borderRadius:'7px', border:'1px solid #d1d5db', fontSize:'0.875rem', outline:'none', fontFamily:'inherit', background:'#fff', color:'#111827' };
