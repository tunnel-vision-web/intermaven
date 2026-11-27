import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api, useToast } from '../App';
import { Globe, MapPin, Calendar, Users, Trash2, Plus, Hotel, ExternalLink } from 'lucide-react';

export default function TourManager() {
  const { addToast } = useToast();
  const toastRef = useRef(addToast);
  toastRef.current = addToast;
  const [events, setEvents] = useState([]);
  const [filterMine, setFilterMine] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  const [form, setForm] = useState({
    title: '',
    date: '',
    time: '20:00',
    city: '',
    country: 'KE',
    venue: '',
    hotel: '',
    routing_notes: '',
    ticket_url: '',
    payment_mode: 'paid_ticket',
    ticket_price: 1500,
    currency: 'KES',
    is_public: true,
    sync_to_epk: true,
  });

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/events?mine=${filterMine}`);
      setEvents(res.data?.events || []);
    } catch (err) {
      toastRef.current('Error', err.response?.data?.detail || 'Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterMine]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !form.city.trim() || !form.venue.trim()) {
      addToast('Missing Details', 'Title, Date, City, and Venue are required.', 'error');
      return;
    }
    setCreating(true);
    try {
      const res = await api.post('/api/events', {
        ...form,
        ticket_price: Number(form.ticket_price || 0),
      });
      if (res.data?.event) {
        addToast('Show Added', 'Synced to TuneMavens Events Network', 'success');
        setForm({ ...form, title: '', date: '', city: '', venue: '', hotel: '', routing_notes: '', ticket_url: '' });
        setSelectedEvent(res.data.event);
        loadEvents();
      }
    } catch (err) {
      addToast('Error', err.response?.data?.detail || 'Failed to create tour stop', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !guestName.trim()) return;
    try {
      const res = await api.post(`/api/events/${selectedEvent.id}/guests`, {
        name: guestName.trim(),
        email: guestEmail.trim(),
        plus_ones: 0,
      });
      if (res.data?.event) {
        setSelectedEvent(res.data.event);
        setGuestName('');
        setGuestEmail('');
        loadEvents();
        addToast('Guest Added', 'Added to VIP guest list', 'success');
      }
    } catch (err) {
      addToast('Error', err.response?.data?.detail || 'Could not add guest (only event owner can edit)', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/events/${id}`);
      if (selectedEvent?.id === id) setSelectedEvent(null);
      loadEvents();
      addToast('Removed', 'Tour stop deleted', 'success');
    } catch (err) {
      addToast('Error', err.response?.data?.detail || 'Could not delete event', 'error');
    }
  };

  return (
    <div style={{ padding: '24px', color: '#e2e8f0', maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: '#f8fafc' }}>
            <Globe size={22} color="#22d3ee" />
            Tour Manager · TuneMavens Events Network
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
            Schedule shows, hotels, routing, and guest lists — synced directly with TuneMavens Events, Smart CRM campaigns, and your EPK.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button type="button" onClick={() => setFilterMine(false)} style={{ ...tabBtn, borderColor: !filterMine ? '#22d3ee' : 'rgba(255,255,255,0.12)', color: !filterMine ? '#22d3ee' : '#94a3b8' }}>
            Network Events
          </button>
          <button type="button" onClick={() => setFilterMine(true)} style={{ ...tabBtn, borderColor: filterMine ? '#22d3ee' : 'rgba(255,255,255,0.12)', color: filterMine ? '#22d3ee' : '#94a3b8' }}>
            My Tour Dates
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.3fr)', gap: '20px', alignItems: 'start' }}>
        {/* Add Tour Stop */}
        <form onSubmit={handleCreate} style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '11px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>Add Tour Date / Live Event</div>

          <input type="text" placeholder="Event / Show Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required style={inputStyle} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required style={inputStyle} />
            <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '8px' }}>
            <input type="text" placeholder="City *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required style={inputStyle} />
            <input type="text" placeholder="Country (KE)" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} style={inputStyle} />
          </div>

          <input type="text" placeholder="Venue Name *" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} required style={inputStyle} />
          <input type="text" placeholder="Hotel / Accommodation (optional)" value={form.hotel} onChange={(e) => setForm({ ...form, hotel: e.target.value })} style={inputStyle} />
          <textarea rows={2} placeholder="Routing, load-in, soundcheck & travel notes..." value={form.routing_notes} onChange={(e) => setForm({ ...form, routing_notes: e.target.value })} style={inputStyle} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <select value={form.payment_mode} onChange={(e) => setForm({ ...form, payment_mode: e.target.value })} style={inputStyle}>
              <option value="paid_ticket">Paid Ticket</option>
              <option value="free_rsvp">Free RSVP</option>
            </select>
            <input type="number" min="0" placeholder="Ticket Price" value={form.ticket_price} onChange={(e) => setForm({ ...form, ticket_price: e.target.value })} style={inputStyle} />
          </div>

          <input type="url" placeholder="Ticket URL (optional)" value={form.ticket_url} onChange={(e) => setForm({ ...form, ticket_url: e.target.value })} style={inputStyle} />

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cbd5e1', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_public} onChange={(e) => setForm({ ...form, is_public: e.target.checked })} />
            Publish to TuneMavens Events Network (for Smart CRM promo)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cbd5e1', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.sync_to_epk} onChange={(e) => setForm({ ...form, sync_to_epk: e.target.checked })} />
            Sync show date to my Artist EPK
          </label>

          <button type="submit" disabled={creating} style={{ padding: '10px 16px', borderRadius: '3px', border: 'none', background: '#0891b2', color: '#ffffff', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
            {creating ? 'Saving Show...' : 'Add Tour Stop →'}
          </button>
        </form>

        {/* Right: Events List & Guest List Drawer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', padding: '18px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', marginBottom: '12px' }}>
              Upcoming Shows & Network Events ({events.length})
            </div>
            {loading ? (
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>Loading events...</div>
            ) : events.length === 0 ? (
              <div style={{ fontSize: '13px', color: '#64748b' }}>No events found. Add your first tour stop on the left.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    style={{
                      background: '#0f172a',
                      borderRadius: '3px',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      border: `1px solid ${selectedEvent?.id === ev.id ? '#22d3ee' : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>{ev.title}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#22d3ee', textTransform: 'uppercase' }}>
                        {ev.source === 'tunemavens_network' ? 'Network' : ev.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#94a3b8' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {ev.date} {ev.time}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {ev.venue}, {ev.city}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={12} /> {ev.rsvp_count || 0} RSVPs · {(ev.guest_list || []).length} VIPs</span>
                    </div>
                    {(ev.hotel || ev.routing_notes) && (
                      <div style={{ marginTop: '6px', fontSize: '11px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {ev.hotel && <span><Hotel size={11} style={{ verticalAlign: 'middle' }} /> {ev.hotel}</span>}
                        {ev.routing_notes && <span>· {ev.routing_notes}</span>}
                      </div>
                    )}
                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        {ev.payment_mode === 'free_rsvp' ? 'Free RSVP' : `${ev.currency} ${ev.ticket_price}`}
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {ev.ticket_url && (
                          <a href={ev.ticket_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: '#38bdf8', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            Tickets <ExternalLink size={11} />
                          </a>
                        )}
                        {ev.source === 'tour_manager' && (
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleDelete(ev.id); }} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 0 }}>
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedEvent && selectedEvent.source === 'tour_manager' && (
            <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', padding: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginBottom: '10px' }}>
                VIP Guest List — {selectedEvent.title}
              </div>
              <form onSubmit={handleAddGuest} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input type="text" placeholder="Guest Name *" value={guestName} onChange={(e) => setGuestName(e.target.value)} required style={{ ...inputStyle, flex: 1 }} />
                <input type="email" placeholder="Email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', borderRadius: '3px', border: 'none', background: '#10b981', color: '#022c22', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                  <Plus size={14} /> Add
                </button>
              </form>
              {(selectedEvent.guest_list || []).length === 0 ? (
                <div style={{ fontSize: '12px', color: '#64748b' }}>No VIP guests added yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedEvent.guest_list.map((g) => (
                    <div key={g.guest_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', background: '#0f172a', padding: '8px 10px', borderRadius: '3px' }}>
                      <span>{g.name}</span>
                      <span style={{ color: '#94a3b8' }}>{g.email || 'VIP'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle = { padding: '8px 10px', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.12)', background: '#0f172a', color: '#f8fafc', fontSize: '13px' };
const tabBtn = { padding: '7px 12px', borderRadius: '3px', border: '1px solid', background: '#1e293b', fontSize: '12px', fontWeight: 600, cursor: 'pointer' };
