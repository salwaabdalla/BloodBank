import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { PlusCircle, Pencil, Trash2, X } from 'lucide-react';

const API = 'http://localhost:5000/api/donations';

const EMPTY_ADD  = { p_donor_id: '', p_blood_type_id: '', p_bank_id: '', p_camp_id: '', p_units: 1 };
const EMPTY_EDIT = { donor_id: '', blood_type_id: '', bank_id: '', camp_id: '', units: 1, status: 'Completed', donation_date: '' };

const STATUS_STYLE = {
  Completed: { background:'#dcfce7', color:'#166534' },
  COMPLETED: { background:'#dcfce7', color:'#166534' },
  Pending:   { background:'#fef9c3', color:'#854d0e' },
  PENDING:   { background:'#fef9c3', color:'#854d0e' },
  Rejected:  { background:'#fee2e2', color:'#991b1b' },
  REJECTED:  { background:'#fee2e2', color:'#991b1b' },
};

export default function Donations() {
  const [donations,  setDonations]  = useState([]);
  const [formData,   setFormData]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [success,    setSuccess]    = useState(null);
  const [showForm,   setShowForm]   = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [form,       setForm]       = useState(EMPTY_ADD);
  const [editForm,   setEditForm]   = useState(EMPTY_EDIT);
  const [submitting, setSubmitting] = useState(false);
  const [formError,  setFormError]  = useState(null);

  const fetchDonations = useCallback(() => {
    setLoading(true);
    axios.get(API).then(r => { setDonations(r.data); setError(null); }).catch(() => setError('Failed to load donations.')).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchDonations();
    axios.get(`${API}/form-data`).then(r => setFormData(r.data));
  }, [fetchDonations]);

  function openCreate() { setEditingId(null); setForm(EMPTY_ADD); setFormError(null); setShowForm(true); }

  function openEdit(d) {
    setEditingId(d.DONATION_ID);
    setEditForm({ donor_id: d.DONOR_ID, blood_type_id: d.BLOOD_TYPE_ID?.toString() || '', bank_id: d.BANK_ID?.toString() || '', camp_id: d.CAMP_ID?.toString() || '', units: d.UNITS, status: d.STATUS || 'Completed', donation_date: d.DONATION_DATE || '' });
    setFormError(null); setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true); setFormError(null);
    try {
      if (editingId) {
        await axios.put(`${API}/${editingId}`, editForm);
        setSuccess('Donation updated.');
      } else {
        await axios.post(API, form);
        setSuccess('Donation recorded successfully.');
      }
      setShowForm(false); setTimeout(() => setSuccess(null), 4000); fetchDonations();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Operation failed.');
    } finally { setSubmitting(false); }
  }

  async function handleDelete(d) {
    if (!window.confirm(`Delete donation #${d.DONATION_ID}? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API}/${d.DONATION_ID}`);
      setSuccess('Donation deleted.'); setTimeout(() => setSuccess(null), 4000); fetchDonations();
    } catch (err) { setError(err.response?.data?.error || 'Failed to delete. Donation may have associated tests.'); }
  }

  const chA = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const chE = e => setEditForm(f => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div style={{ padding:'28px 32px', fontFamily:'inherit' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
        <div>
          <h1 style={{ margin:0, fontSize:'1.45rem', fontWeight:700, color:'#111827' }}>Donations</h1>
          <p style={{ margin:0, fontSize:'0.82rem', color:'#6b7280' }}>{donations.length} donation records</p>
        </div>
        <button onClick={openCreate} style={btnPrimary}><PlusCircle size={16} />Record Donation</button>
      </div>

      {success && <div style={successBanner}>{success}</div>}
      {error   && <div style={errorBanner}>{error}</div>}

      <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div style={{ padding:'48px', textAlign:'center', color:'#6b7280' }}>Loading…</div>
        ) : donations.length === 0 ? (
          <div style={{ padding:'48px', textAlign:'center', color:'#6b7280' }}>No donations yet.</div>
        ) : (
          <table style={tbl}>
            <thead>
              <tr style={thead}>
                {['Donor','Blood Group','Bank','Camp','Units','Date','Status','Actions'].map(h => <th key={h} style={thS}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {donations.map(d => (
                <tr key={d.DONATION_ID} style={{ borderBottom:'1px solid #f3f4f6' }}>
                  <td style={{ ...tdS, fontWeight:600 }}>{d.DONOR_NAME}</td>
                  <td style={tdS}><span style={bloodBadge}>{d.BLOOD_GROUP}</span></td>
                  <td style={tdS}>{d.BANK_NAME}</td>
                  <td style={tdS}>{d.CAMP_NAME}</td>
                  <td style={{ ...tdS, textAlign:'center', fontWeight:600 }}>{d.UNITS}</td>
                  <td style={{ ...tdS, whiteSpace:'nowrap' }}>{d.DONATION_DATE}</td>
                  <td style={tdS}>
                    <span style={{ ...(STATUS_STYLE[d.STATUS] || STATUS_STYLE.Pending), display:'inline-block', borderRadius:'20px', padding:'3px 10px', fontSize:'0.78rem', fontWeight:600 }}>{d.STATUS}</span>
                  </td>
                  <td style={tdS}>
                    <div style={{ display:'flex', gap:'6px' }}>
                      <button style={editBtn} onClick={() => openEdit(d)}><Pencil size={12} />Edit</button>
                      <button style={delBtn}  onClick={() => handleDelete(d)}><Trash2 size={12} />Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit modal */}
      {showForm && (
        <div style={overlay} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={panel}>
            <div style={panelHeader}>
              <span style={{ fontWeight:700, fontSize:'1.05rem' }}>{editingId ? 'Edit Donation' : 'Record New Donation'}</span>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280' }}><X size={20} /></button>
            </div>
            {formError && <div style={{ ...errorBanner, margin:'0 20px' }}>{formError}</div>}

            {editingId === null ? (
              /* ── Add form (stored proc) ── */
              <form onSubmit={handleSubmit} style={formGrid}>
                <label style={{ ...labelS, gridColumn:'1 / -1' }}>Donor (eligible only)
                  <select name="p_donor_id" value={form.p_donor_id} onChange={chA} required style={inpS}>
                    <option value="">— Select donor —</option>
                    {formData?.donors.map(d => <option key={d.DONOR_ID} value={d.DONOR_ID}>{d.FULL_NAME}</option>)}
                  </select>
                </label>
                <label style={labelS}>Blood Type
                  <select name="p_blood_type_id" value={form.p_blood_type_id} onChange={chA} required style={inpS}>
                    <option value="">— Select —</option>
                    {formData?.blood_types.map(bt => <option key={bt.BLOOD_TYPE_ID} value={bt.BLOOD_TYPE_ID}>{bt.BLOOD_GROUP}</option>)}
                  </select>
                </label>
                <label style={labelS}>Units
                  <input name="p_units" type="number" min={1} max={5} value={form.p_units} onChange={chA} required style={inpS} />
                </label>
                <label style={labelS}>Blood Bank
                  <select name="p_bank_id" value={form.p_bank_id} onChange={chA} required style={inpS}>
                    <option value="">— Select —</option>
                    {formData?.banks.map(b => <option key={b.BANK_ID} value={b.BANK_ID}>{b.BANK_NAME}</option>)}
                  </select>
                </label>
                <label style={labelS}>Camp
                  <select name="p_camp_id" value={form.p_camp_id} onChange={chA} required style={inpS}>
                    <option value="">— Select —</option>
                    {formData?.camps.map(c => <option key={c.CAMP_ID} value={c.CAMP_ID}>{c.CAMP_NAME}</option>)}
                  </select>
                </label>
                <div style={{ gridColumn:'1 / -1', display:'flex', gap:'10px', justifyContent:'flex-end' }}>
                  <button type="button" onClick={() => setShowForm(false)} style={btnSecondary}>Cancel</button>
                  <button type="submit" disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.7 : 1 }}>{submitting ? 'Recording…' : 'Record Donation'}</button>
                </div>
              </form>
            ) : (
              /* ── Edit form (direct SQL) ── */
              <form onSubmit={handleSubmit} style={formGrid}>
                <label style={labelS}>Blood Type
                  <select name="blood_type_id" value={editForm.blood_type_id} onChange={chE} required style={inpS}>
                    <option value="">— Select —</option>
                    {formData?.blood_types.map(bt => <option key={bt.BLOOD_TYPE_ID} value={bt.BLOOD_TYPE_ID}>{bt.BLOOD_GROUP}</option>)}
                  </select>
                </label>
                <label style={labelS}>Units
                  <input name="units" type="number" min={1} max={5} value={editForm.units} onChange={chE} required style={inpS} />
                </label>
                <label style={labelS}>Blood Bank
                  <select name="bank_id" value={editForm.bank_id} onChange={chE} required style={inpS}>
                    <option value="">— Select —</option>
                    {formData?.banks.map(b => <option key={b.BANK_ID} value={b.BANK_ID}>{b.BANK_NAME}</option>)}
                  </select>
                </label>
                <label style={labelS}>Camp
                  <select name="camp_id" value={editForm.camp_id} onChange={chE} required style={inpS}>
                    <option value="">— Select —</option>
                    {formData?.camps.map(c => <option key={c.CAMP_ID} value={c.CAMP_ID}>{c.CAMP_NAME}</option>)}
                  </select>
                </label>
                <label style={labelS}>Status
                  <select name="status" value={editForm.status} onChange={chE} style={inpS}>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </label>
                <label style={labelS}>Donation Date
                  <input name="donation_date" type="date" value={editForm.donation_date} onChange={chE} style={inpS} />
                </label>
                <div style={{ gridColumn:'1 / -1', display:'flex', gap:'10px', justifyContent:'flex-end' }}>
                  <button type="button" onClick={() => setShowForm(false)} style={btnSecondary}>Cancel</button>
                  <button type="submit" disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.7 : 1 }}>{submitting ? 'Saving…' : 'Update Donation'}</button>
                </div>
              </form>
            )}
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
const bloodBadge = { display:'inline-block', background:'#fef2f2', color:'#991b1b', border:'1px solid #fecaca', borderRadius:'6px', padding:'2px 8px', fontWeight:700, fontSize:'0.8rem' };
const overlay    = { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 };
const panel      = { background:'#fff', borderRadius:'14px', width:'100%', maxWidth:'520px', boxShadow:'0 20px 60px rgba(0,0,0,0.2)', display:'flex', flexDirection:'column', gap:'20px', paddingBottom:'24px', maxHeight:'90vh', overflowY:'auto' };
const panelHeader = { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 20px 0' };
const formGrid   = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', padding:'0 20px' };
const labelS     = { display:'flex', flexDirection:'column', gap:'5px', fontSize:'0.82rem', fontWeight:600, color:'#374151' };
const inpS       = { padding:'9px 11px', borderRadius:'7px', border:'1px solid #d1d5db', fontSize:'0.875rem', outline:'none', fontFamily:'inherit', background:'#fff', color:'#111827' };
