import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { UserRoundPlus, Pencil, Trash2, X } from 'lucide-react';

const API = 'http://localhost:5000/api/patients';
const EMPTY = { first_name: '', last_name: '', gender: 'M', date_of_birth: '', blood_type_id: '', hospital_id: '', phone: '' };

export default function Patients() {
  const [patients,   setPatients]   = useState([]);
  const [formData,   setFormData]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [success,    setSuccess]    = useState(null);
  const [showForm,   setShowForm]   = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [form,       setForm]       = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formError,  setFormError]  = useState(null);

  const fetchPatients = useCallback(() => {
    setLoading(true);
    axios.get(API).then(r => { setPatients(r.data); setError(null); }).catch(() => setError('Failed to load patients.')).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPatients();
    axios.get(`${API}/form-data`).then(r => setFormData(r.data));
  }, [fetchPatients]);

  function openCreate() { setEditingId(null); setForm(EMPTY); setFormError(null); setShowForm(true); }

  function openEdit(p) {
    setEditingId(p.PATIENT_ID);
    setForm({ first_name: p.FIRST_NAME, last_name: p.LAST_NAME, gender: p.GENDER, date_of_birth: p.DATE_OF_BIRTH || '', blood_type_id: p.BLOOD_TYPE_ID?.toString() || '', hospital_id: p.HOSPITAL_ID?.toString() || '', phone: p.PHONE || '' });
    setFormError(null); setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true); setFormError(null);
    try {
      if (editingId) { await axios.put(`${API}/${editingId}`, form); setSuccess('Patient updated.'); }
      else           { await axios.post(API, form);                  setSuccess('Patient added.');   }
      setShowForm(false); setTimeout(() => setSuccess(null), 4000); fetchPatients();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Operation failed.');
    } finally { setSubmitting(false); }
  }

  async function handleDelete(p) {
    if (!window.confirm(`Delete ${p.FIRST_NAME} ${p.LAST_NAME}? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API}/${p.PATIENT_ID}`);
      setSuccess('Patient deleted.'); setTimeout(() => setSuccess(null), 4000); fetchPatients();
    } catch (err) { setError(err.response?.data?.error || 'Failed to delete. Patient may have associated records.'); }
  }

  const ch = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div style={{ padding:'28px 32px', fontFamily:'inherit' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
        <div>
          <h1 style={{ margin:0, fontSize:'1.45rem', fontWeight:700, color:'#111827' }}>Patients</h1>
          <p style={{ margin:0, fontSize:'0.82rem', color:'#6b7280' }}>{patients.length} admitted patients</p>
        </div>
        <button onClick={openCreate} style={btnPrimary}><UserRoundPlus size={16} />Add Patient</button>
      </div>

      {success && <div style={successBanner}>{success}</div>}
      {error   && <div style={errorBanner}>{error}</div>}

      <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div style={{ padding:'48px', textAlign:'center', color:'#6b7280' }}>Loading…</div>
        ) : patients.length === 0 ? (
          <div style={{ padding:'48px', textAlign:'center', color:'#6b7280' }}>No patients found.</div>
        ) : (
          <table style={tbl}>
            <thead>
              <tr style={thead}>
                {['Full Name','Blood Group','Gender','Date of Birth','Hospital','Phone','Admitted','Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.PATIENT_ID} style={{ borderBottom:'1px solid #f3f4f6' }}>
                  <td style={{ ...tdStyle, fontWeight:600 }}>{p.FIRST_NAME} {p.LAST_NAME}</td>
                  <td style={tdStyle}><span style={bloodBadge}>{p.BLOOD_GROUP}</span></td>
                  <td style={tdStyle}>{p.GENDER === 'M' ? 'Male' : p.GENDER === 'F' ? 'Female' : p.GENDER}</td>
                  <td style={{ ...tdStyle, whiteSpace:'nowrap' }}>{p.DATE_OF_BIRTH || '—'}</td>
                  <td style={tdStyle}>{p.HOSPITAL_NAME}</td>
                  <td style={tdStyle}>{p.PHONE || '—'}</td>
                  <td style={{ ...tdStyle, whiteSpace:'nowrap' }}>{p.ADMISSION_DATE || '—'}</td>
                  <td style={tdStyle}>
                    <div style={{ display:'flex', gap:'6px' }}>
                      <button style={editBtn} onClick={() => openEdit(p)}><Pencil size={12} />Edit</button>
                      <button style={delBtn}  onClick={() => handleDelete(p)}><Trash2 size={12} />Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div style={overlay} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={panel}>
            <div style={panelHeader}>
              <span style={{ fontWeight:700, fontSize:'1.05rem' }}>{editingId ? 'Edit Patient' : 'Add Patient'}</span>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280' }}><X size={20} /></button>
            </div>
            {formError && <div style={{ ...errorBanner, margin:'0 20px' }}>{formError}</div>}
            <form onSubmit={handleSubmit} style={formGrid}>
              <label style={labelStyle}>First Name<input name="first_name" value={form.first_name} onChange={ch} required style={inputStyle} /></label>
              <label style={labelStyle}>Last Name<input name="last_name" value={form.last_name} onChange={ch} required style={inputStyle} /></label>
              <label style={labelStyle}>Gender
                <select name="gender" value={form.gender} onChange={ch} style={inputStyle}>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </label>
              <label style={labelStyle}>Date of Birth<input name="date_of_birth" type="date" value={form.date_of_birth} onChange={ch} required style={inputStyle} /></label>
              <label style={labelStyle}>Blood Type
                <select name="blood_type_id" value={form.blood_type_id} onChange={ch} required style={inputStyle}>
                  <option value="">— Select —</option>
                  {formData?.blood_types.map(bt => <option key={bt.BLOOD_TYPE_ID} value={bt.BLOOD_TYPE_ID}>{bt.BLOOD_GROUP}</option>)}
                </select>
              </label>
              <label style={labelStyle}>Hospital
                <select name="hospital_id" value={form.hospital_id} onChange={ch} required style={inputStyle}>
                  <option value="">— Select —</option>
                  {formData?.hospitals.map(h => <option key={h.HOSPITAL_ID} value={h.HOSPITAL_ID}>{h.HOSPITAL_NAME}</option>)}
                </select>
              </label>
              <label style={{ ...labelStyle, gridColumn:'1 / -1' }}>Phone<input name="phone" value={form.phone} onChange={ch} style={inputStyle} /></label>
              <div style={{ gridColumn:'1 / -1', display:'flex', gap:'10px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} style={btnSecondary}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Saving…' : (editingId ? 'Update' : 'Add Patient')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const btnPrimary   = { display:'flex', alignItems:'center', gap:'7px', background:'#8B0000', color:'#fff', padding:'9px 18px', borderRadius:'8px', fontSize:'0.88rem', fontWeight:600, cursor:'pointer', border:'none' };
const btnSecondary = { padding:'9px 18px', borderRadius:'8px', fontSize:'0.88rem', fontWeight:600, border:'1px solid #e5e7eb', background:'#fff', cursor:'pointer', color:'#374151' };
const editBtn      = { display:'inline-flex', alignItems:'center', gap:'5px', padding:'5px 10px', borderRadius:'6px', fontSize:'0.78rem', fontWeight:600, border:'1px solid #e5e7eb', background:'#fff', color:'#374151', cursor:'pointer' };
const delBtn       = { display:'inline-flex', alignItems:'center', gap:'5px', padding:'5px 10px', borderRadius:'6px', fontSize:'0.78rem', fontWeight:600, border:'1px solid #fecaca', background:'#fff', color:'#991b1b', cursor:'pointer' };
const successBanner = { background:'#dcfce7', color:'#166534', border:'1px solid #86efac', borderRadius:'8px', padding:'10px 14px', marginBottom:'16px', fontSize:'0.875rem' };
const errorBanner   = { background:'#fee2e2', color:'#991b1b', border:'1px solid #fca5a5', borderRadius:'8px', padding:'10px 14px', marginBottom:'16px', fontSize:'0.875rem' };
const tbl       = { width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' };
const thead     = { background:'#f9fafb', borderBottom:'1px solid #e5e7eb' };
const thStyle   = { padding:'11px 14px', textAlign:'left', fontSize:'0.78rem', fontWeight:600, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.04em', whiteSpace:'nowrap' };
const tdStyle   = { padding:'11px 14px', verticalAlign:'middle' };
const bloodBadge = { display:'inline-block', background:'#fef2f2', color:'#991b1b', border:'1px solid #fecaca', borderRadius:'6px', padding:'2px 8px', fontWeight:700, fontSize:'0.8rem' };
const overlay   = { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 };
const panel     = { background:'#fff', borderRadius:'14px', width:'100%', maxWidth:'540px', boxShadow:'0 20px 60px rgba(0,0,0,0.2)', display:'flex', flexDirection:'column', gap:'20px', paddingBottom:'24px', maxHeight:'90vh', overflowY:'auto' };
const panelHeader = { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 20px 0' };
const formGrid  = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', padding:'0 20px' };
const labelStyle = { display:'flex', flexDirection:'column', gap:'5px', fontSize:'0.82rem', fontWeight:600, color:'#374151' };
const inputStyle = { padding:'9px 11px', borderRadius:'7px', border:'1px solid #d1d5db', fontSize:'0.875rem', outline:'none', fontFamily:'inherit', background:'#fff', color:'#111827' };
