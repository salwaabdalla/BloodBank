import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, X, Package } from 'lucide-react';

const API      = 'http://localhost:5000/api/inventory';
const FORM_API = 'http://localhost:5000/api/inventory/form-data';
const EMPTY    = { bank_id: '', blood_type_id: '', units: 1, collection_date: '', expiry_date: '' };

function isExpired(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

export default function Inventory() {
  const [items,      setItems]      = useState([]);
  const [formData,   setFormData]   = useState(null);
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
    axios.get(API).then(r => { setItems(r.data); setError(null); }).catch(() => setError('Failed to load inventory.')).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchItems();
    axios.get(FORM_API).then(r => setFormData(r.data));
  }, [fetchItems]);

  function openCreate() { setEditingId(null); setForm(EMPTY); setFormError(null); setShowForm(true); }

  function openEdit(i) {
    setEditingId(i.INVENTORY_ID);
    setForm({ bank_id: i.BANK_ID?.toString() || '', blood_type_id: i.BLOOD_TYPE_ID?.toString() || '', units: i.UNITS, collection_date: i.COLLECTION_DATE || '', expiry_date: i.EXPIRY_DATE || '' });
    setFormError(null); setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.expiry_date) { setFormError('Expiry date is required.'); return; }
    setSubmitting(true); setFormError(null);
    try {
      if (editingId) { await axios.put(`${API}/${editingId}`, form); setSuccess('Inventory record updated.'); }
      else           { await axios.post(API, form);                  setSuccess('Inventory record added.');   }
      setShowForm(false); setTimeout(() => setSuccess(null), 4000); fetchItems();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Operation failed.');
    } finally { setSubmitting(false); }
  }

  async function handleDelete(i) {
    if (!window.confirm(`Delete this inventory record (${i.BLOOD_GROUP} — ${i.UNITS} units)? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API}/${i.INVENTORY_ID}`);
      setSuccess('Record deleted.'); setTimeout(() => setSuccess(null), 4000); fetchItems();
    } catch (err) { setError(err.response?.data?.error || 'Failed to delete.'); }
  }

  const ch = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const totalUnits = items.filter(i => !isExpired(i.EXPIRY_DATE)).reduce((acc, i) => acc + (i.UNITS || 0), 0);

  return (
    <div style={{ padding:'28px 32px', fontFamily:'inherit' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <Package size={26} color="#8B0000" />
          <div>
            <h1 style={{ margin:0, fontSize:'1.45rem', fontWeight:700, color:'#111827' }}>Inventory</h1>
            <p style={{ margin:0, fontSize:'0.82rem', color:'#6b7280' }}>{totalUnits} valid units across {items.length} records</p>
          </div>
        </div>
        <button style={btnPrimary} onClick={openCreate}><Plus size={16} />Add Stock</button>
      </div>

      {success && <div style={successBanner}>{success}</div>}
      {error   && <div style={errorBanner}>{error}</div>}

      <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
        {loading ? (
          <div style={{ padding:'48px', textAlign:'center', color:'#6b7280' }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ padding:'48px', textAlign:'center', color:'#6b7280' }}>No inventory records.</div>
        ) : (
          <table style={tbl}>
            <thead>
              <tr style={thead}>
                {['Blood Group','Bank','Units','Collected','Expires','Status','Actions'].map(h => <th key={h} style={thS}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const expired = isExpired(item.EXPIRY_DATE);
                return (
                  <tr key={item.INVENTORY_ID} style={{ borderBottom:'1px solid #f3f4f6' }}>
                    <td style={tdS}><span style={bloodBadge}>{item.BLOOD_GROUP}</span></td>
                    <td style={{ ...tdS, color:'#374151' }}>{item.BANK_NAME}</td>
                    <td style={{ ...tdS, fontWeight:700, color:'#111827', textAlign:'center' }}>{item.UNITS}</td>
                    <td style={{ ...tdS, color:'#374151', whiteSpace:'nowrap' }}>{item.COLLECTION_DATE || '—'}</td>
                    <td style={{ ...tdS, color: expired ? '#991b1b' : '#374151', whiteSpace:'nowrap' }}>{item.EXPIRY_DATE || '—'}</td>
                    <td style={tdS}>
                      <span style={{ background: expired ? '#fee2e2' : '#dcfce7', color: expired ? '#991b1b' : '#166534', padding:'3px 10px', borderRadius:'99px', fontSize:'0.74rem', fontWeight:600 }}>
                        {expired ? 'Expired' : 'Valid'}
                      </span>
                    </td>
                    <td style={tdS}>
                      <div style={{ display:'flex', gap:'6px' }}>
                        <button style={editBtn} onClick={() => openEdit(item)}><Pencil size={12} />Edit</button>
                        <button style={delBtn}  onClick={() => handleDelete(item)}><Trash2 size={12} />Delete</button>
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
              <h2 style={{ margin:0, fontSize:'1.1rem', fontWeight:700 }}>{editingId ? 'Edit Stock Record' : 'Add Blood Stock'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280' }}><X size={20} /></button>
            </div>
            {formError && <div style={{ ...errorBanner, margin:'0 20px' }}>{formError}</div>}
            <form onSubmit={handleSubmit} style={formGrid}>
              <label style={labelS}>Blood Type *
                <select name="blood_type_id" value={form.blood_type_id} onChange={ch} required style={inpS}>
                  <option value="">— Select —</option>
                  {formData?.blood_types.map(bt => <option key={bt.BLOOD_TYPE_ID} value={bt.BLOOD_TYPE_ID}>{bt.BLOOD_GROUP}</option>)}
                </select>
              </label>
              <label style={labelS}>Blood Bank *
                <select name="bank_id" value={form.bank_id} onChange={ch} required style={inpS}>
                  <option value="">— Select —</option>
                  {formData?.banks.map(b => <option key={b.BANK_ID} value={b.BANK_ID}>{b.BANK_NAME}</option>)}
                </select>
              </label>
              <label style={labelS}>Units *
                <input name="units" type="number" min={1} value={form.units} onChange={ch} required style={inpS} />
              </label>
              <label style={labelS}>Collection Date
                <input name="collection_date" type="date" value={form.collection_date} onChange={ch} style={inpS} />
              </label>
              <label style={{ ...labelS, gridColumn:'1 / -1' }}>Expiry Date *
                <input name="expiry_date" type="date" value={form.expiry_date} onChange={ch} required style={inpS} />
              </label>
              <div style={{ gridColumn:'1 / -1', display:'flex', gap:'10px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} style={btnSecondary}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Saving…' : (editingId ? 'Update' : 'Add Stock')}
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
const bloodBadge = { display:'inline-block', background:'#fef2f2', color:'#991b1b', border:'1px solid #fecaca', borderRadius:'6px', padding:'2px 8px', fontWeight:700, fontSize:'0.8rem' };
const overlay    = { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 };
const panel      = { background:'#fff', borderRadius:'14px', width:'100%', maxWidth:'500px', boxShadow:'0 20px 60px rgba(0,0,0,0.2)', display:'flex', flexDirection:'column', gap:'20px', paddingBottom:'24px', maxHeight:'90vh', overflowY:'auto' };
const panelHeader = { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 20px 0' };
const formGrid   = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', padding:'0 20px' };
const labelS     = { display:'flex', flexDirection:'column', gap:'5px', fontSize:'0.82rem', fontWeight:600, color:'#374151' };
const inpS       = { padding:'9px 11px', borderRadius:'7px', border:'1px solid #d1d5db', fontSize:'0.875rem', outline:'none', fontFamily:'inherit', background:'#fff', color:'#111827' };
