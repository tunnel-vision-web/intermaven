import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Briefcase, MapPin, Clock } from 'lucide-react';
import '../../styles/landing.css';

const JOBS = [
  {
    title: "Front-End Engineer (React)",
    dept: "Engineering",
    location: "Atlanta, GA / Remote (US)",
    type: "Full-time",
    desc: "We are looking for a React developer to lead the development of our B2B creative workspace interface, building out beautiful, high-performance dashboards and modular tools."
  },
  {
    title: "Developer Advocate",
    dept: "Developer Relations",
    location: "Nairobi, Kenya / Hybrid",
    type: "Full-time",
    desc: "Act as the bridge between Intermaven and the B2B tech ecosystem. Grow our API integrations, write technical documentation, and coordinate developer workshops."
  },
  {
    title: "AI Product Management Intern",
    dept: "Product",
    location: "Nairobi, Kenya / Remote (Africa)",
    type: "Internship (6 Months)",
    desc: "Collaborate with our AI research team to conceptualize, mock, and test new prompt-engineering features for local marketing tools."
  }
];

function CareersPage() {
  return (
    <div className="landing-wrapper">
      <Navbar currentPage="careers" />
      
      <div className="ph" style={{ marginTop: 'calc(var(--bh) + var(--nh))' }}>
        <div className="phi" style={{ background: 'var(--bg2)' }} />
        <div className="pho" />
        <div className="phc">
          <div className="bc">Careers</div>
          <h1 className="pht">Work with Intermaven</h1>
          <p className="phs">Join our distributed team building AI tools and operational platforms for B2B businesses and independent artists.</p>
        </div>
      </div>

      <div style={{ padding: '40px 0 80px' }}>
        <div className="cn">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '24px', borderBottom: '1px solid #1e2937', paddingBottom: '12px' }}>
              Open Positions
            </h2>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              {JOBS.map((job, idx) => (
                <div 
                  key={idx}
                  style={{
                    background: '#0f1117',
                    border: '1px solid #1e2937',
                    borderRadius: '16px',
                    padding: '28px',
                    transition: 'border-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#10b981'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1e2937'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>{job.title}</h3>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Briefcase size={14} /> {job.dept}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={14} /> {job.location}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} /> {job.type}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => alert(`Applying for ${job.title}. Application form coming soon!`)}
                      style={{
                        background: '#10b981',
                        color: '#0f172a',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '9999px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Apply Now
                    </button>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                    {job.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default CareersPage;
