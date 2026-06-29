import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { UserPlus, Pencil, Trash2, X, Check, XCircle } from 'lucide-react';

const API = 'http://localhost:5000/api/donors';

const EMPTY_FORM = {
  first_name: '', last_name: '', gender: 'M',
  date_of_birth: '', blood_type_id: '', phone: '', email: '', is_eligible: 'Y',
};

export default function Donors() {
  const [donors,     setDonors]     = useState([]);
  const [bloodTypes, setBloodTypes] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [showForm,   setShowForm]   = useState(false);
  const [editingId,  setEditingId]  = useState(null);   // null = create, number = edit
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError,  setFormError]  = useState(null);
  const [success,    setSuccess]    = useState(null);

  const fetchDonors = useCallback(() => {
    setLoading(true);
    setError(null);
    axios.get(API)
      .then(r => setDonors(r.data))
      .catch(() => setError('Failed to load donors.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchDonors();
    axios.get(`${API}/blood-types`).then(r => setBloodTypes(r.data));
  }, [fetchDonors]);

  function handleCreate() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, blood_type_id: bloodTypes[0]?.BLOOD_TYPE_ID ?? '' });
    setFormError(null);
    setShowForm(true);
  }

  function handleEdit(donor) {
    setEditingId(donor.DONOR_ID);
    setForm({
      first_name:    donor.FIRST_NAME,
      last_name:     donor.LAST_NAME,
      gender:        donor.GENDER,
      date_of_birth: donor.DATE_OF_BIRTH ?? '',
      blood_type_id: bloodTypes.find(bt => bt.BLOOD_GROUP === donor.BLOOD_GROUP)?.BLOOD_TYPE_ID ?? '',
      phone:         donor.PHONE ?? '',
      email:         donor.EMAIL ?? '',
      is_eligible:   donor.IS_ELIGIBLE,
    });
    setFormError(null);
    setShowForm(true);
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      if (editingId) {
        await axios.put(`${API}/${editingId}`, form);
        setSuccess('Donor updated successfully.');
      } else {
        await axios.post(API, form);
        setSuccess('Donor registered successfully.');
      }
      setShowForm(false);
      setTimeout(() => setSuccess(null), 4000);
      fetchDonors();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(donor) {
    if (!window.confirm(`Delete donor "${donor.FIRST_NAME} ${donor.LAST_NAME}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API}/${donor.DONOR_ID}`);
      setSuccess('Donor deleted successfully.');
      setTimeout(() => setSuccess(null), 4000);
      fetchDonors();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete donor.');
    }
  }

  function handleClose() {
    setShowForm(false);
    setEditingId(null);
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1>Donors</h1>
          <p>Manage registered blood donors</p>
        </div>
        <button onClick={handleCreate} style={btnPrimary}>
          <UserPlus size={16} strokeWidth={2} />
          Register New Donor
        </button>
      </div>

      {success && <div className="error-banner" style={successStyle}>{success}</div>}
      {error   && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={theadRow}>
                {['ID','Full Name','Blood Group','Gender','Date of Birth','Phone','Email','Eligible',''].map(h => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {donors.length === 0 ? (
                <tr><td colSpan={9} style={{ ...td, textAlign: 'center', color: '#6b7280' }}>No donors found.</td></tr>
              ) : donors.map((d, i) => (
                <tr key={d.DONOR_ID} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  <td style={{ ...td, color: '#6b7280', fontSize: '0.82rem' }}>{d.DONOR_ID}</td>
                  <td style={{ ...td, fontWeight: 600 }}>{d.FIRST_NAME} {d.LAST_NAME}</td>
                  <td style={td}><span style={bloodBadge}>{d.BLOOD_GROUP}</span></td>
                  <td style={td}>{d.GENDER === 'M' ? 'Male' : 'Female'}</td>
                  <td style={td}>{d.DATE_OF_BIRTH ?? '—'}</td>
                  <td style={td}>{d.PHONE ?? '—'}</td>
                  <td style={td}>{d.EMAIL ?? '—'}</td>
                  <td style={td}>
                    {d.IS_ELIGIBLE === 'Y'
                      ? <span style={badgeGreen}><Check size={12} strokeWidth={3} /> Yes</span>
                      : <span style={badgeRed}><XCircle size={12} strokeWidth={2} /> No</span>}
                  </td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleEdit(d)} style={editBtn} title="Edit donor">
                        <Pencil size={14} strokeWidth={2} /> Edit
                      </button>
                      <button onClick={() => handleDelete(d)} style={deleteBtn} title="Delete donor">
                        <Trash2 size={14} strokeWidth={2} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div style={overlay}>
          <div style={panel}>
            <div style={panelHeader}>
              <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                {editingId ? `Edit Donor #${editingId}` : 'Register New Donor'}
              </span>
              <button onClick={handleClose} style={{ color: '#6b7280' }}>
                <X size={20} />
              </button>
            </div>

            {formError && <div className="error-banner" style={{ margin: '0 20px' }}>{formError}</div>}

            <form onSubmit={handleSubmit} style={formGrid}>
              <label style={labelStyle}>
                First Name
                <input name="first_name" value={form.first_name} onChange={handleChange}
                  required style={inputStyle} placeholder="e.g. Ahmed" />
              </label>
              <label style={labelStyle}>
                Last Name
                <input name="last_name" value={form.last_name} onChange={handleChange}
                  required style={inputStyle} placeholder="e.g. Ali" />
              </label>
              <label style={labelStyle}>
                Gender
                <select name="gender" value={form.gender} onChange={handleChange} style={inputStyle}>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </label>
              <label style={labelStyle}>
                Date of Birth
                <input name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange}
                  required style={inputStyle} />
              </label>
              <label style={labelStyle}>
                Blood Type
                <select name="blood_type_id" value={form.blood_type_id} onChange={handleChange}
                  required style={inputStyle}>
                  {bloodTypes.map(bt => (
                    <option key={bt.BLOOD_TYPE_ID} value={bt.BLOOD_TYPE_ID}>{bt.BLOOD_GROUP}</option>
                  ))}
                </select>
              </label>
              <label style={labelStyle}>
                Eligible to Donate
                <select name="is_eligible" value={form.is_eligible} onChange={handleChange} style={inputStyle}>
                  <option value="Y">Yes</option>
                  <option value="N">No</option>
                </select>
              </label>
              <label style={labelStyle}>
                Phone
                <input name="phone" value={form.phone} onChange={handleChange}
                  style={inputStyle} placeholder="e.g. 0612345678" />
              </label>
              <label style={labelStyle}>
                Email
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  style={inputStyle} placeholder="e.g. donor@example.com" />
              </label>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button type="button" onClick={handleClose} style={btnSecondary}>Cancel</button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ ...btnPrimary, opacity: submitting ? 0.65 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting
                    ? (editingId ? 'Saving…' : 'Registering…')
                    : (editingId ? 'Save Changes' : 'Register Donor')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── styles ── */
const btnPrimary = {
  display: 'flex', alignItems: 'center', gap: '7px',
  background: '#8B0000', color: '#fff',
  padding: '9px 18px', borderRadius: '8px',
  fontSize: '0.88rem', fontWeight: 600,
  cursor: 'pointer', border: 'none',
};
const btnSecondary = {
  padding: '9px 18px', borderRadius: '8px',
  fontSize: '0.88rem', fontWeight: 600,
  border: '1px solid #e5e7eb', background: '#fff',
  cursor: 'pointer', color: '#374151',
};
const editBtn = {
  display: 'inline-flex', alignItems: 'center', gap: '5px',
  padding: '5px 10px', borderRadius: '6px',
  fontSize: '0.78rem', fontWeight: 600,
  border: '1px solid #e5e7eb', background: '#fff',
  color: '#374151', cursor: 'pointer',
};
const deleteBtn = {
  display: 'inline-flex', alignItems: 'center', gap: '5px',
  padding: '5px 10px', borderRadius: '6px',
  fontSize: '0.78rem', fontWeight: 600,
  border: '1px solid #fecaca', background: '#fff',
  color: '#991b1b', cursor: 'pointer',
};
const successStyle = {
  background: '#dcfce7', color: '#166534',
  border: '1px solid #86efac', marginBottom: '16px',
};
const tableStyle  = { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' };
const theadRow    = { background: '#f9fafb', borderBottom: '1px solid #e5e7eb' };
const th = {
  padding: '11px 14px', textAlign: 'left',
  fontSize: '0.78rem', fontWeight: 600, color: '#6b7280',
  whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em',
};
const td          = { padding: '11px 14px', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' };
const bloodBadge  = {
  display: 'inline-block', background: '#fef2f2', color: '#991b1b',
  border: '1px solid #fecaca', borderRadius: '6px', padding: '2px 8px',
  fontWeight: 700, fontSize: '0.8rem',
};
const badgeGreen  = {
  display: 'inline-flex', alignItems: 'center', gap: '4px',
  background: '#dcfce7', color: '#166534',
  borderRadius: '20px', padding: '3px 9px', fontSize: '0.78rem', fontWeight: 600,
};
const badgeRed    = {
  display: 'inline-flex', alignItems: 'center', gap: '4px',
  background: '#fee2e2', color: '#991b1b',
  borderRadius: '20px', padding: '3px 9px', fontSize: '0.78rem', fontWeight: 600,
};
const overlay     = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
};
const panel       = {
  background: '#fff', borderRadius: '14px',
  width: '100%', maxWidth: '560px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  display: 'flex', flexDirection: 'column', gap: '20px',
  paddingBottom: '24px', maxHeight: '90vh', overflowY: 'auto',
};
const panelHeader = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '20px 20px 0',
};
const formGrid    = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', padding: '0 20px' };
const labelStyle  = { display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.82rem', fontWeight: 600, color: '#374151' };
const inputStyle  = { padding: '9px 11px', borderRadius: '7px', border: '1px solid #d1d5db', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', background: '#fff', color: '#111827' };
