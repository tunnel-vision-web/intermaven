import React, { useState, useEffect, useCallback } from 'react';
import { api, useAuth } from '../App';
import { useRegion } from '../RegionContext';
import { 
  Smartphone, CreditCard, DollarSign, RefreshCw, 
  CheckCircle, XCircle, ArrowLeft, History, ShoppingBag 
} from 'lucide-react';

export default function POSPanel() {
  const { user, updateUser } = useAuth();
  const { isWestern, isAfrican, contactPhone } = useRegion() || {};

  const [mode, setMode] = useState('collect'); // 'collect' | 'history'
  
  // Payment inputs
  const [phone, setPhone] = useState(contactPhone || '');
  const [amount, setAmount] = useState('200');
  const [item, setItem] = useState('VIP Concert Ticket');

  // Western Card inputs
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // UI state
  const [status, setStatus] = useState('idle'); // 'idle' | 'initiating' | 'polling' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [transactions, setTransactions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch Transaction History
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const response = await api.get('/api/payments/transactions');
      // Filter for POS transactions
      const posTx = (response.data.transactions || []).filter(
        t => t.type === 'mpesa_stk' || t.type === 'card_pos'
      );
      setTransactions(posTx);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (mode === 'history') {
      fetchHistory();
    }
  }, [mode, fetchHistory]);

  // STK PIN countdown timer
  useEffect(() => {
    let timer;
    if (status === 'polling' && countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    } else if (status === 'polling' && countdown === 0) {
      setStatus('error');
      setErrorMessage('Verification timed out. Please try again.');
    }
    return () => clearTimeout(timer);
  }, [status, countdown]);

  // Poll transaction status
  useEffect(() => {
    let interval;
    if (status === 'polling' && checkoutRequestId) {
      interval = setInterval(async () => {
        try {
          const response = await api.get(`/api/payments/mpesa/status/${checkoutRequestId}`);
          if (response.data.status === 'completed') {
            clearInterval(interval);
            setStatus('success');
            // Refresh user session to show updated credits
            const profileRes = await api.get('/api/user/profile');
            updateUser(profileRes.data);
          } else if (response.data.status === 'failed') {
            clearInterval(interval);
            setStatus('error');
            setErrorMessage('Payment request declined or failed on phone.');
          }
        } catch (err) {
          // Keep polling
        }
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [status, checkoutRequestId, updateUser]);

  const handleMpesaCollect = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      alert('Please enter a phone number.');
      return;
    }
    if (!amount || parseInt(amount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    setStatus('initiating');
    setErrorMessage('');
    
    try {
      const response = await api.post('/api/payments/mpesa/stkpush', {
        phone,
        amount: parseInt(amount),
        item
      });
      if (response.data.success) {
        setCheckoutRequestId(response.data.checkout_request_id);
        setCountdown(30);
        setStatus('polling');
      } else {
        setStatus('error');
        setErrorMessage('Failed to trigger STK Push.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.response?.data?.detail || 'Network error initiating payment.');
    }
  };

  const handleCardCollect = async (e) => {
    e.preventDefault();
    if (!cardName.trim() || !cardNumber.trim()) {
      alert('Please fill out card details.');
      return;
    }
    if (!amount || parseInt(amount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    setStatus('initiating');
    setErrorMessage('');

    try {
      const response = await api.post('/api/payments/card/collect', {
        card_name: cardName,
        card_number: cardNumber,
        amount: parseInt(amount),
        item
      });
      if (response.data.success) {
        setCheckoutRequestId(response.data.checkout_request_id);
        setCountdown(10); // Faster simulation for cards
        setStatus('polling');
      } else {
        setStatus('error');
        setErrorMessage('Failed to process card.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.response?.data?.detail || 'Network error processing card.');
    }
  };

  const resetForm = () => {
    setStatus('idle');
    setCheckoutRequestId('');
    setErrorMessage('');
    if (mode === 'history') {
      fetchHistory();
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* App Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        borderBottom: '1px solid #1e293b',
        paddingBottom: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smartphone color="#0ea5e9" size={24} />
            Intermaven POS Terminal
          </h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
            {isWestern 
              ? 'Collect digital credit card payments instantly (USD / CAD region active).' 
              : 'Collect mobile money payments instantly via Lipa Na M-Pesa (East Africa region active).'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setMode('collect')}
            style={{
              background: mode === 'collect' ? '#0ea5e9' : 'transparent',
              color: mode === 'collect' ? '#fff' : '#cbd5e1',
              border: mode === 'collect' ? 'none' : '1px solid #334155',
              padding: '6px 14px',
              borderRadius: '3px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ShoppingBag size={14} />
            Collect
          </button>
          <button 
            onClick={() => setMode('history')}
            style={{
              background: mode === 'history' ? '#0ea5e9' : 'transparent',
              color: mode === 'history' ? '#fff' : '#cbd5e1',
              border: mode === 'history' ? 'none' : '1px solid #334155',
              padding: '6px 14px',
              borderRadius: '3px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <History size={14} />
            History
          </button>
        </div>
      </div>

      {status === 'idle' && mode === 'collect' && (
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '3px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: '#f1f5f9' }}>
            New POS Charge
          </h3>

          {!isWestern ? (
            /* AFRICAN PORTAL: M-Pesa STK Push Form */
            <form onSubmit={handleMpesaCollect} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                  Customer M-Pesa Phone Number
                </label>
                <input 
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="2547XXXXXXXX or 07XXXXXXXX"
                  style={{
                    width: '100%',
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '3px',
                    padding: '12px 16px',
                    color: '#fff',
                    fontSize: '15px'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                  Amount (KES)
                </label>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount in KES"
                  style={{
                    width: '100%',
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '3px',
                    padding: '12px 16px',
                    color: '#fff',
                    fontSize: '15px'
                  }}
                  required
                />
                {/* Quick presets */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  {['100', '250', '500', '1000'].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      style={{
                        background: '#1e293b',
                        color: '#cbd5e1',
                        border: '1px solid #334155',
                        borderRadius: '3px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      KES {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                  Item / Service Description
                </label>
                <input 
                  type="text"
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  placeholder="E.g. Concert Ticket, Show entry, Album copy"
                  style={{
                    width: '100%',
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '3px',
                    padding: '12px 16px',
                    color: '#fff',
                    fontSize: '15px'
                  }}
                  required
                />
              </div>

              <button 
                type="submit"
                style={{
                  background: '#10b981',
                  color: '#0f172a',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '14px',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: 'pointer',
                  marginTop: '10px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Smartphone size={18} />
                Initiate M-Pesa STK Push
              </button>
            </form>
          ) : (
            /* WESTERN PORTAL: Stripe / Credit Card Terminal */
            <form onSubmit={handleCardCollect} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                  Cardholder Name
                </label>
                <input 
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  style={{
                    width: '100%',
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '3px',
                    padding: '12px 16px',
                    color: '#fff',
                    fontSize: '15px'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                  Card Number
                </label>
                <input 
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4111 1111 1111 1111"
                  style={{
                    width: '100%',
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '3px',
                    padding: '12px 16px',
                    color: '#fff',
                    fontSize: '15px'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                    Expiration Date
                  </label>
                  <input 
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    style={{
                      width: '100%',
                      background: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '3px',
                      padding: '12px 16px',
                      color: '#fff',
                      fontSize: '15px'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                    CVC Code
                  </label>
                  <input 
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="123"
                    style={{
                      width: '100%',
                      background: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '3px',
                      padding: '12px 16px',
                      color: '#fff',
                      fontSize: '15px'
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                  Amount (USD)
                </label>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount in USD"
                  style={{
                    width: '100%',
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '3px',
                    padding: '12px 16px',
                    color: '#fff',
                    fontSize: '15px'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                  Item / Service Description
                </label>
                <input 
                  type="text"
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  placeholder="Album vinyl, merch shirt, support tip"
                  style={{
                    width: '100%',
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '3px',
                    padding: '12px 16px',
                    color: '#fff',
                    fontSize: '15px'
                  }}
                  required
                />
              </div>

              <button 
                type="submit"
                style={{
                  background: '#10b981',
                  color: '#0f172a',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '14px',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: 'pointer',
                  marginTop: '10px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <CreditCard size={18} />
                Charge Card via Stripe
              </button>
            </form>
          )}
        </div>
      )}

      {/* Charging Loader / STK Notification Modal */}
      {(status === 'initiating' || status === 'polling') && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px', 
          background: '#111827', 
          border: '1px solid #1e293b', 
          borderRadius: '3px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{ position: 'relative', width: '80px', height: '80px' }}>
            <div className="spinner" style={{
              width: '80px',
              height: '80px',
              border: '4px solid rgba(14, 165, 233, 0.1)',
              borderTop: '4px solid #0ea5e9',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '18px',
              fontWeight: '800',
              color: '#0ea5e9'
            }}>
              {countdown}s
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
              {status === 'initiating' ? 'Contacting Network Gateway...' : 'Payment Request Transmitted'}
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '400px', margin: '0 auto', lineHeight: '1.6' }}>
              {!isWestern 
                ? `An M-Pesa STK PIN prompt has been sent to ${phone}. Please enter your secret PIN on your mobile device to complete payment.`
                : 'Stripe Terminal is securely processing the card credentials. Please wait...'}
            </p>
          </div>
        </div>
      )}

      {/* Success View */}
      {status === 'success' && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px', 
          background: '#111827', 
          border: '1px solid #1e293b', 
          borderRadius: '3px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <CheckCircle color="#10b981" size={72} style={{ animation: 'scaleUp 0.3s ease-out' }} />
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>
              Payment Captured Successfully!
            </h3>
            <p style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '14px' }}>
              Collected **{!isWestern ? 'KES' : 'USD'} {amount}** for **{item}**.
            </p>
            <div style={{ 
              display: 'inline-block', 
              background: 'rgba(16, 185, 129, 0.1)', 
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '3px',
              padding: '6px 14px',
              fontSize: '12px',
              color: '#10b981',
              fontWeight: '700'
            }}>
              +{amount} CREDITS ADDED TO POOL
            </div>
          </div>
          <button
            onClick={resetForm}
            style={{
              background: '#0ea5e9',
              color: '#fff',
              border: 'none',
              borderRadius: '3px',
              padding: '10px 24px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '12px'
            }}
          >
            Collect Another Payment
          </button>
        </div>
      )}

      {/* Error View */}
      {status === 'error' && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px', 
          background: '#111827', 
          border: '1px solid #1e293b', 
          borderRadius: '3px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <XCircle color="#ef4444" size={72} />
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>
              Payment Failed
            </h3>
            <p style={{ fontSize: '13px', color: '#fca5a5' }}>
              {errorMessage || 'The payment request failed or was cancelled.'}
            </p>
          </div>
          <button
            onClick={resetForm}
            style={{
              background: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155',
              borderRadius: '3px',
              padding: '10px 24px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '12px'
            }}
          >
            Return to Terminal
          </button>
        </div>
      )}

      {/* History View */}
      {mode === 'history' && (
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '3px', padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#f1f5f9' }}>
            Collection Logs
          </h3>
          
          {loadingHistory ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <RefreshCw size={24} className="spin-icon" style={{ animation: 'spin 2s linear infinite' }} />
            </div>
          ) : transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              No payments collected yet. Run a charge from the Collect tab!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e293b', color: '#94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '12px 8px' }}>Date</th>
                    <th style={{ padding: '12px 8px' }}>Customer</th>
                    <th style={{ padding: '12px 8px' }}>Description</th>
                    <th style={{ padding: '12px 8px' }}>Amount</th>
                    <th style={{ padding: '12px 8px' }}>Method</th>
                    <th style={{ padding: '12px 8px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #1e293b', color: '#cbd5e1' }}>
                      <td style={{ padding: '12px 8px' }}>
                        {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        {tx.phone || tx.card_name || 'Walk-in Customer'}
                      </td>
                      <td style={{ padding: '12px 8px' }}>{tx.item || 'Payment'}</td>
                      <td style={{ padding: '12px 8px', fontWeight: '700' }}>
                        {tx.type === 'mpesa_stk' ? 'KES' : 'USD'} {tx.amount}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        {tx.type === 'mpesa_stk' ? 'M-Pesa STK' : 'Stripe Card'}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{
                          background: tx.status === 'completed' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                          color: tx.status === 'completed' ? '#10b981' : '#ef4444',
                          padding: '3px 8px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: '700'
                        }}>
                          {tx.status === 'completed' ? 'Success' : tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Inline styles for keyframe animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes scaleUp {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
