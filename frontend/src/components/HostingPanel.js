import React, { useState, useEffect } from 'react';
import { api, useAuth } from '../App';
import { 
  Globe, Search, Server, Plus, Trash2, CheckCircle, 
  XCircle, Loader2, ArrowRight, RefreshCw, KeyRound, ShieldCheck 
} from 'lucide-react';

export default function HostingPanel() {
  const { user, updateUser } = useAuth();
  
  // App views
  const [activeTab, setActiveTab] = useState('domains'); // 'domains' | 'packages'
  const [selectedDomain, setSelectedDomain] = useState(null); // domain object for DNS editor
  
  // Domain checker states
  const [searchDomain, setSearchDomain] = useState('');
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [registering, setRegistering] = useState(false);

  // DNS records editor states
  const [dnsType, setDnsType] = useState('A');
  const [dnsName, setDnsName] = useState('@');
  const [dnsValue, setDnsValue] = useState('');
  const [updatingDns, setUpdatingDns] = useState(false);

  // Lists
  const [myDomains, setMyDomains] = useState([]);
  const [loadingDomains, setLoadingDomains] = useState(false);
  const [packages, setPackages] = useState([]);

  const fetchDomains = async () => {
    setLoadingDomains(true);
    try {
      const response = await api.get('/api/hosting/domains');
      setMyDomains(response.data.domains || []);
      // If we are editing a domain, sync the selectedDomain object
      if (selectedDomain) {
        const updated = (response.data.domains || []).find(d => d.domain === selectedDomain.domain);
        if (updated) setSelectedDomain(updated);
      }
    } catch (err) {
      console.error('Error fetching domains:', err);
    } finally {
      setLoadingDomains(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await api.get('/api/hosting/packages');
      setPackages(response.data.packages || []);
    } catch (err) {
      console.error('Error fetching packages:', err);
    }
  };

  useEffect(() => {
    fetchDomains();
    fetchPackages();
  }, []);

  const handleCheckDomain = async (e) => {
    e.preventDefault();
    if (!searchDomain.trim() || !searchDomain.includes('.')) {
      alert('Please enter a valid domain name (e.g. creative.co.ke).');
      return;
    }
    setChecking(true);
    setCheckResult(null);
    try {
      const response = await api.get(`/api/hosting/domains/check?domain=${searchDomain}`);
      setCheckResult(response.data);
    } catch (err) {
      alert(err.response?.data?.detail || 'Error checking domain availability.');
    } finally {
      setChecking(false);
    }
  };

  const handleRegisterDomain = async () => {
    if (!checkResult) return;
    setRegistering(true);
    try {
      const response = await api.post('/api/hosting/domains/register', {
        domain: checkResult.domain,
        years: 1
      });
      if (response.data.success) {
        alert(response.data.message);
        setSearchDomain('');
        setCheckResult(null);
        // Refresh profile credits and domains list
        const profileRes = await api.get('/api/user/profile');
        updateUser(profileRes.data);
        fetchDomains();
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Error registering domain.');
    } finally {
      setRegistering(false);
    }
  };

  const handleAddDnsRecord = async (e) => {
    e.preventDefault();
    if (!dnsValue.trim()) {
      alert('Please enter a DNS value.');
      return;
    }
    setUpdatingDns(true);
    try {
      const response = await api.post('/api/hosting/dns/change', {
        domain: selectedDomain.domain,
        action: 'add',
        record_type: dnsType,
        name: dnsName,
        value: dnsValue
      });
      if (response.data.success) {
        setDnsName('@');
        setDnsValue('');
        fetchDomains();
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Error adding DNS record.');
    } finally {
      setUpdatingDns(false);
    }
  };

  const handleDeleteDnsRecord = async (record) => {
    setUpdatingDns(true);
    try {
      const response = await api.post('/api/hosting/dns/change', {
        domain: selectedDomain.domain,
        action: 'delete',
        record_type: record.type,
        name: record.name,
        value: record.value
      });
      if (response.data.success) {
        fetchDomains();
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Error deleting DNS record.');
    } finally {
      setUpdatingDns(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
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
            <Globe color="#10b981" size={24} />
            Hosting & Domains Manager
          </h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
            Register custom domain names and manage Web Server containers, subdomains, and DNS settings.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => { setActiveTab('domains'); setSelectedDomain(null); }}
            style={{
              background: activeTab === 'domains' ? '#10b981' : 'transparent',
              color: activeTab === 'domains' ? '#0f172a' : '#cbd5e1',
              border: activeTab === 'domains' ? 'none' : '1px solid #334155',
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
            <Globe size={14} />
            Domains ({myDomains.length})
          </button>
          <button 
            onClick={() => { setActiveTab('packages'); setSelectedDomain(null); }}
            style={{
              background: activeTab === 'packages' ? '#10b981' : 'transparent',
              color: activeTab === 'packages' ? '#0f172a' : '#cbd5e1',
              border: activeTab === 'packages' ? 'none' : '1px solid #334155',
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
            <Server size={14} />
            Web Hosting
          </button>
        </div>
      </div>

      {activeTab === 'domains' && !selectedDomain && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
          {/* Left Column: Domain Search & Availability Check */}
          <div>
            <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '3px', padding: '20px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
                Truehost Domain Lookup
              </h3>
              
              <form onSubmit={handleCheckDomain} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={searchDomain}
                  onChange={(e) => setSearchDomain(e.target.value)}
                  placeholder="e.g. mybrandname.com"
                  style={{
                    flex: 1,
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '3px',
                    padding: '10px 14px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
                <button
                  type="submit"
                  disabled={checking}
                  style={{
                    background: '#10b981',
                    color: '#0f172a',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '10px 18px',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {checking ? <Loader2 size={16} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={16} />}
                  Check
                </button>
              </form>

              {checkResult && (
                <div style={{ 
                  marginTop: '20px', 
                  padding: '16px', 
                  background: checkResult.available ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                  border: checkResult.available ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '3px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h4 style={{ 
                      fontSize: '14px', 
                      fontWeight: '700', 
                      color: checkResult.available ? '#10b981' : '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      margin: '0 0 4px'
                    }}>
                      {checkResult.available ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      {checkResult.domain} {checkResult.available ? 'is available!' : 'is taken'}
                    </h4>
                    {checkResult.available && (
                      <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                        Registration price: ${checkResult.price.toFixed(2)}/yr ({checkResult.credits_cost} credits)
                      </p>
                    )}
                  </div>
                  {checkResult.available && (
                    <button
                      onClick={handleRegisterDomain}
                      disabled={registering || (user?.credits || 0) < checkResult.credits_cost}
                      style={{
                        background: '#10b981',
                        color: '#0f172a',
                        border: 'none',
                        borderRadius: '3px',
                        padding: '8px 16px',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {registering ? 'Registering...' : 'Register'}
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Registered Domains List */}
          <div>
            <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '3px', padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
                Your Domains
              </h3>

              {loadingDomains ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                  <RefreshCw size={20} className="spin-icon" style={{ animation: 'spin 2s linear infinite' }} />
                </div>
              ) : myDomains.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '20px' }}>
                  You don't own any domains yet. Search and register above.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {myDomains.map((dom) => (
                    <div 
                      key={dom.id}
                      style={{
                        background: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '3px',
                        padding: '12px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{dom.domain}</span>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', display: 'flex', gap: '8px' }}>
                          <span style={{ color: '#10b981' }}>● Active</span>
                          <span>{dom.dns_records.length} DNS Records</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedDomain(dom)}
                        style={{
                          background: '#334155',
                          color: '#f1f5f9',
                          border: 'none',
                          borderRadius: '3px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Manage DNS
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DNS Records Editor View */}
      {activeTab === 'domains' && selectedDomain && (
        <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '3px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <button 
              onClick={() => setSelectedDomain(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              ← Back
            </button>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0 }}>
              DNS Records: {selectedDomain.domain}
            </h3>
          </div>

          {/* Records Table */}
          <div style={{ overflowX: 'auto', marginBottom: '32px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e293b', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '12px 8px' }}>Type</th>
                  <th style={{ padding: '12px 8px' }}>Host/Name</th>
                  <th style={{ padding: '12px 8px' }}>Value</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedDomain.dns_records.map((rec, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #1e293b', color: '#cbd5e1' }}>
                    <td style={{ padding: '12px 8px', fontWeight: '700', color: '#10b981' }}>{rec.type}</td>
                    <td style={{ padding: '12px 8px' }}>{rec.name}</td>
                    <td style={{ padding: '12px 8px', fontFamily: 'monospace' }}>{rec.value}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteDnsRecord(rec)}
                        disabled={updatingDns}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add New Record Form */}
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
              Add New Record
            </h4>
            <form onSubmit={handleAddDnsRecord} style={{ display: 'grid', gridTemplateColumns: '0.8fr 1fr 2fr 0.8fr', gap: '12px', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>Type</label>
                <select
                  value={dnsType}
                  onChange={(e) => setDnsType(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '3px',
                    padding: '10px',
                    color: '#fff'
                  }}
                >
                  <option value="A">A</option>
                  <option value="CNAME">CNAME</option>
                  <option value="MX">MX</option>
                  <option value="TXT">TXT</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>Host / Name</label>
                <input
                  type="text"
                  value={dnsName}
                  onChange={(e) => setDnsName(e.target.value)}
                  placeholder="e.g. @ or www"
                  style={{
                    width: '100%',
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '3px',
                    padding: '10px',
                    color: '#fff'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>Value / Target</label>
                <input
                  type="text"
                  value={dnsValue}
                  onChange={(e) => setDnsValue(e.target.value)}
                  placeholder="e.g. 185.199.108.153"
                  style={{
                    width: '100%',
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '3px',
                    padding: '10px',
                    color: '#fff'
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={updatingDns}
                style={{
                  background: '#10b981',
                  color: '#0f172a',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Plus size={16} />
                Add
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Cloud Web Hosting Tab */}
      {activeTab === 'packages' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
              Modular Server Containers
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>
              Launch dedicated, isolated server containers for your EPK website, distribution platform, or creative portfolio. 
              Billed monthly using system credits.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {packages.map((pkg) => (
              <div 
                key={pkg.id}
                style={{
                  background: '#111827',
                  border: '1px solid #1e293b',
                  borderRadius: '3px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  position: 'relative'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: '0 0 4px' }}>{pkg.name}</h4>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981', margin: '12px 0' }}>
                    {pkg.monthly_credits} <span style={{ fontSize: '13px', fontWeight: '500', color: '#cbd5e1' }}>credits / mo</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Equivalent to ${pkg.price_usd.toFixed(2)}/mo
                  </div>
                </div>

                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  margin: '12px 0 20px', 
                  fontSize: '12px', 
                  color: '#cbd5e1', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '8px' 
                }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} color="#10b981" /> {pkg.storage}
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} color="#10b981" /> {pkg.databases}
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} color="#10b981" /> {pkg.bandwidth}
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <KeyRound size={14} color="#10b981" /> Free SSL Certificates
                  </li>
                </ul>

                <button
                  onClick={() => alert(`Server initialization triggered for ${pkg.name}. Dedicated container will spin up shortly.`)}
                  style={{
                    width: '100%',
                    background: '#1e293b',
                    color: '#cbd5e1',
                    border: '1px solid #334155',
                    borderRadius: '3px',
                    padding: '10px',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                    marginTop: 'auto',
                    textAlign: 'center'
                  }}
                >
                  Deploy Container
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inline styles for spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
