import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api, useToast } from '../App';
import { Receipt, Plus, Trash2, CheckCircle2, Send, Copy, Download } from 'lucide-react';

const CURRENCIES = ['KES', 'USD', 'EUR', 'GBP', 'NGN', 'ZAR'];

export default function InvoicePanel() {
  const { addToast } = useToast();
  const toastRef = useRef(addToast);
  toastRef.current = addToast;
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState({ total_billed: 0, total_paid: 0, total_outstanding: 0 });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    client_name: '',
    client_email: '',
    currency: 'KES',
    due_date: '',
    tax_rate: 0,
    payment_method: 'pesapal',
    notes: '',
  });
  const [items, setItems] = useState([{ description: '', qty: 1, unit_price: 0 }]);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/invoices');
      setInvoices(res.data?.invoices || []);
      setSummary(res.data?.summary || { total_billed: 0, total_paid: 0, total_outstanding: 0 });
    } catch (err) {
      toastRef.current('Error', err.response?.data?.detail || 'Failed to load invoices', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const addItem = () => setItems((prev) => [...prev, { description: '', qty: 1, unit_price: 0 }]);
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));
  const updateItem = (idx, field, val) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: val } : it)));
  };

  const subtotal = items.reduce((acc, it) => acc + Number(it.qty || 0) * Number(it.unit_price || 0), 0);
  const taxAmount = subtotal * (Number(form.tax_rate || 0) / 100);
  const total = subtotal + taxAmount;

  const handleCreate = async (e) => {
    e.preventDefault();
    const validItems = items.filter((it) => it.description.trim());
    if (!form.client_name.trim() || validItems.length === 0) {
      addToast('Missing Details', 'Enter client name and at least one line item.', 'error');
      return;
    }
    setCreating(true);
    try {
      const res = await api.post('/api/invoices', {
        ...form,
        tax_rate: Number(form.tax_rate || 0),
        items: validItems.map((it) => ({
          description: it.description.trim(),
          qty: Number(it.qty || 1),
          unit_price: Number(it.unit_price || 0),
        })),
      });
      if (res.data?.invoice) {
        addToast('Invoice Created', res.data.invoice.invoice_number, 'success');
        setForm({ ...form, client_name: '', client_email: '', due_date: '', notes: '' });
        setItems([{ description: '', qty: 1, unit_price: 0 }]);
        loadInvoices();
      }
    } catch (err) {
      addToast('Error', err.response?.data?.detail || 'Failed to create invoice', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await api.patch(`/api/invoices/${id}/status`, { status });
      addToast('Updated', `Invoice marked as ${status}`, 'success');
      loadInvoices();
    } catch {
      addToast('Error', 'Failed to update invoice status', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/invoices/${id}`);
      addToast('Deleted', 'Invoice removed', 'success');
      loadInvoices();
    } catch {
      addToast('Error', 'Failed to delete invoice', 'error');
    }
  };

  const handleCopyLink = async (inv) => {
    await navigator.clipboard.writeText(inv.payment_link || '');
    addToast('Copied', 'Payment link copied to clipboard', 'success');
  };

  const handleDownload = (inv) => {
    const lines = [
      `INVOICE ${inv.invoice_number}`,
      `Status: ${inv.status.toUpperCase()}`,
      `Client: ${inv.client_name} (${inv.client_email || 'N/A'})`,
      `Due Date: ${inv.due_date || 'Upon Receipt'}`,
      `Payment Method: ${inv.payment_method.toUpperCase()}`,
      '',
      'ITEMS:',
      ...(inv.items || []).map((it) => `- ${it.description}: ${it.qty} x ${inv.currency} ${it.unit_price} = ${inv.currency} ${it.line_total}`),
      '',
      `Subtotal: ${inv.currency} ${inv.subtotal}`,
      `Tax (${inv.tax_rate}%): ${inv.currency} ${inv.tax_amount}`,
      `TOTAL: ${inv.currency} ${inv.total}`,
      '',
      `Pay online: ${inv.payment_link}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${inv.invoice_number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '24px', color: '#e2e8f0', maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: '#f8fafc' }}>
          <Receipt size={22} color="#10b981" />
          Invoice & Payments
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
          Create client invoices for design, production, and booking fees with Pesapal/M-Pesa and Stripe payment links.
        </p>
      </div>

      {/* KPI Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div style={kpiCard}>
          <div style={kpiLabel}>Total Billed</div>
          <div style={kpiValue}>{summary.total_billed.toLocaleString()}</div>
        </div>
        <div style={kpiCard}>
          <div style={kpiLabel}>Collected (Paid)</div>
          <div style={{ ...kpiValue, color: '#34d399' }}>{summary.total_paid.toLocaleString()}</div>
        </div>
        <div style={kpiCard}>
          <div style={kpiLabel}>Outstanding</div>
          <div style={{ ...kpiValue, color: '#fbbf24' }}>{summary.total_outstanding.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.3fr)', gap: '20px', alignItems: 'start' }}>
        {/* Create Invoice Form */}
        <form onSubmit={handleCreate} style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>New Invoice</div>

          <input type="text" placeholder="Client / Company Name *" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} required style={inputStyle} />
          <input type="email" placeholder="Client Email" value={form.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })} style={inputStyle} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} style={inputStyle}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} style={inputStyle} />
            <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} style={inputStyle}>
              <option value="pesapal">Pesapal / M-Pesa</option>
              <option value="stripe">Stripe (Card)</option>
            </select>
          </div>

          <div style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginTop: '4px' }}>Line Items</div>
          {items.map((it, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 0.7fr 1fr auto', gap: '6px', alignItems: 'center' }}>
              <input type="text" placeholder="Description *" value={it.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} style={inputStyle} />
              <input type="number" min="1" step="1" placeholder="Qty" value={it.qty} onChange={(e) => updateItem(idx, 'qty', e.target.value)} style={inputStyle} />
              <input type="number" min="0" step="0.01" placeholder="Price" value={it.unit_price} onChange={(e) => updateItem(idx, 'unit_price', e.target.value)} style={inputStyle} />
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={addItem} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: '1px dashed rgba(255,255,255,0.2)', color: '#94a3b8', padding: '6px 10px', borderRadius: '3px', fontSize: '12px', cursor: 'pointer' }}>
            <Plus size={13} /> Add Line Item
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignItems: 'center' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#94a3b8' }}>Tax Rate (%)</label>
              <input type="number" min="0" max="100" step="0.5" value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: e.target.value })} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Invoice Total</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#10b981' }}>
                {form.currency} {total.toFixed(2)}
              </div>
            </div>
          </div>

          <textarea rows={2} placeholder="Notes / Payment Instructions..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={inputStyle} />

          <button type="submit" disabled={creating} style={{ padding: '10px 16px', borderRadius: '3px', border: 'none', background: '#10b981', color: '#022c22', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
            {creating ? 'Creating...' : 'Create Invoice →'}
          </button>
        </form>

        {/* Invoices List */}
        <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', padding: '18px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', marginBottom: '12px' }}>
            Recent Invoices ({invoices.length})
          </div>
          {loading ? (
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>Loading invoices...</div>
          ) : invoices.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#64748b' }}>No invoices created yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {invoices.map((inv) => (
                <div key={inv.id} style={{ background: '#0f172a', borderRadius: '3px', padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>{inv.invoice_number}</span>
                      <span style={{ marginLeft: '8px', fontSize: '12px', color: '#94a3b8' }}>· {inv.client_name}</span>
                    </div>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: '3px',
                      background: inv.status === 'paid' ? 'rgba(16,185,129,0.2)' : inv.status === 'sent' ? 'rgba(56,189,248,0.2)' : 'rgba(245,158,11,0.2)',
                      color: inv.status === 'paid' ? '#34d399' : inv.status === 'sent' ? '#38bdf8' : '#fbbf24',
                    }}>
                      {inv.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>
                    <span>{inv.payment_method.toUpperCase()} {inv.due_date ? `· Due ${inv.due_date}` : ''}</span>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>{inv.currency} {Number(inv.total).toLocaleString()}</span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                    {inv.status !== 'sent' && inv.status !== 'paid' && (
                      <button type="button" onClick={() => handleStatus(inv.id, 'sent')} style={actionBtn}>
                        <Send size={12} /> Mark Sent
                      </button>
                    )}
                    {inv.status !== 'paid' && (
                      <button type="button" onClick={() => handleStatus(inv.id, 'paid')} style={{ ...actionBtn, color: '#34d399' }}>
                        <CheckCircle2 size={12} /> Mark Paid
                      </button>
                    )}
                    <button type="button" onClick={() => handleCopyLink(inv)} style={actionBtn}>
                      <Copy size={12} /> Pay Link
                    </button>
                    <button type="button" onClick={() => handleDownload(inv)} style={actionBtn}>
                      <Download size={12} /> .txt
                    </button>
                    <button type="button" onClick={() => handleDelete(inv.id)} style={{ ...actionBtn, color: '#f87171', marginLeft: 'auto' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const kpiCard = { background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', padding: '14px 16px' };
const kpiLabel = { fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 };
const kpiValue = { fontSize: '22px', fontWeight: 700, color: '#f8fafc', marginTop: '4px' };
const inputStyle = { padding: '8px 10px', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.12)', background: '#0f172a', color: '#f8fafc', fontSize: '13px' };
const actionBtn = { display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 8px', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.12)', background: '#1e293b', color: '#cbd5e1', fontSize: '11px', cursor: 'pointer' };
