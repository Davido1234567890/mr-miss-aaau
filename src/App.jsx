// ============================================================
// SUPABASE SETUP (create these tables in your Supabase project)
// ============================================================
//
// Table: candidates
// | column      | type | constraints |
// |-------------|------|-------------|
// | id          | text | PRIMARY KEY |
// | name        | text | NOT NULL    |
// | photo_url   | text |             |
// | photo_url_2 | text |             |  -- NEW: second person's photo for couples
// | category    | text | NOT NULL    |  -- "singles_male", "singles_female", "couples"
//
// SQL to add the new column:
// ALTER TABLE candidates ADD COLUMN photo_url_2 text;
//
// Table: votes
// | column          | type      | constraints                          |
// |-----------------|-----------|--------------------------------------|
// | id              | int8      | PRIMARY KEY, auto_increment            |
// | email           | text      | NOT NULL, UNIQUE                     |
// | singles_male_id | text      | REFERENCES candidates(id)            |
// | singles_female_id| text     | REFERENCES candidates(id)            |
// | couples_id      | text      | REFERENCES candidates(id)            |
// | created_at      | timestamp | DEFAULT now()                        |
//
// IMPORTANT: Add a UNIQUE constraint on the `email` column in the votes table
// so one email = one submission total.
//
// ============================================================

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// ============================================================
// EDITABLE CONFIGURATION
// ============================================================
const SUPABASE_URL = "https://pqcqwxxxwrhgoclspjal.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxY3F3eHh4d3JoZ29jbHNwamFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNjM2NTYsImV4cCI6MjA5NzczOTY1Nn0.id8aXfwHq8c6hjie_E9vKwxyJFxa-EDnY0XDEP1TOwY";
const ADMIN_PASSWORD = 'Qwertyuiop123#'; // CHANGE THIS BEFORE DEPLOYING
// ============================================================

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ---------- Design Tokens ---------- */
const tokens = {
  bg: '#FFFFFF',
  cardBg: '#F5F5F5',
  text: '#1A1A1A',
  borderRadius: 10,
  fontHeading: "'Playfair Display', Georgia, serif",
  fontBody: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  gold: '#C9A84C',
  navy: '#0A1628',
  lavender: '#A8B2D8',
};

/* ---------- Google Fonts Loader ---------- */
function GoogleFonts() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
    </>
  );
}

/* ---------- Global CSS Animations ---------- */
function GlobalStyles() {
  return (
    <style>{`
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeInUpCard {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes shimmerBorder {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      @keyframes shimmerBtn {
        0% { left: -100%; }
        100% { left: 200%; }
      }
      @keyframes bounceIn {
        0% { transform: scale(0); }
        60% { transform: scale(1.2); }
        80% { transform: scale(0.95); }
        100% { transform: scale(1); }
      }
      @keyframes pulseGlow {
        0% { box-shadow: 0 0 0 0 rgba(201,168,76,0.6); }
        70% { box-shadow: 0 0 0 15px rgba(201,168,76,0); }
        100% { box-shadow: 0 0 0 0 rgba(201,168,76,0); }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(50px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes drawCheck {
        from { stroke-dashoffset: 30; }
        to { stroke-dashoffset: 0; }
      }
      @keyframes confettiFall {
        0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
        100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
      }
      @keyframes countUpAnim {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeUpBtn {
        0% { opacity: 0; transform: translateY(30px); }
        60% { opacity: 1; transform: translateY(-6px); }
        80% { transform: translateY(2px); }
        100% { transform: translateY(0); }
      }
      @keyframes ringSway {
        0% { transform: rotate(-10deg); }
        50% { transform: rotate(10deg); }
        100% { transform: rotate(-10deg); }
      }
      @keyframes ringPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.15); }
        100% { transform: scale(1); }
      }
    `}</style>
  );
}

/* ---------- Icons ---------- */
const CheckIcon = ({ animate }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" style={animate ? {
      strokeDasharray: 30,
      strokeDashoffset: 0,
      animation: 'drawCheck 0.6s ease-out forwards',
    } : {}} />
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

/* ---------- Confetti Particles (CSS only) ---------- */
function Confetti() {
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 40; i++) {
      arr.push({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 3}s`,
        duration: `${2.5 + Math.random() * 2}s`,
        size: `${4 + Math.random() * 8}px`,
        color: ['#C9A84C', '#E8D5A3', '#D4AF37', '#F0E68C', '#FFD700'][Math.floor(Math.random() * 5)],
        rotation: `${Math.random() * 360}deg`,
      });
    }
    return arr;
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100, overflow: 'hidden' }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            top: '-10px',
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            transform: `rotate(${p.rotation})`,
            animation: `confettiFall ${p.duration} linear ${p.delay} infinite`,
            opacity: 0.8,
          }}
        />
      ))}
    </div>
  );
}

/* ---------- Hash Router ---------- */
function getHashRoute() {
  return window.location.hash.replace('#', '') || '/';
}

/* ---------- App ---------- */
export default function App() {
  const [route, setRoute] = useState(getHashRoute());

  useEffect(() => {
    const onHash = () => setRoute(getHashRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return (
    <>
      <GoogleFonts />
      <GlobalStyles />
      <div style={{
        fontFamily: tokens.fontBody,
        background: tokens.bg,
        color: tokens.text,
        minHeight: '100vh',
        WebkitFontSmoothing: 'antialiased',
      }}>
        {route === '/admin' ? <AdminDashboard /> : <VotingPage />}
      </div>
    </>
  );
}

/* ---------- Animated Counter Hook ---------- */
function useCountUp(target, duration = 1000, start = false) {
  const [value, setValue] = useState(0);
  const startTime = useRef(null);
  const raf = useRef(null);

  useEffect(() => {
    if (!start) { setValue(0); return; }
    startTime.current = null;
    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        raf.current = requestAnimationFrame(animate);
      }
    };
    raf.current = requestAnimationFrame(animate);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration, start]);

  return value;
}

/* ============================================================
   VOTING PAGE
   ============================================================ */
function VotingPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selections, setSelections] = useState({
    singles_male: null,
    singles_female: null,
    couples: null,
  });

  const [activeTab, setActiveTab] = useState('singles_male');
  const [showConfirm, setShowConfirm] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tabSwitching, setTabSwitching] = useState(false);

  const isVotingClosed = localStorage.getItem('voting_closed') === 'true';

  const categories = [
    { key: 'singles_male', label: 'Singles Male' },
    { key: 'singles_female', label: 'Singles Female' },
    { key: 'couples', label: 'Couples' },
  ];

  const allSelected = selections.singles_male && selections.singles_female && selections.couples;

  useEffect(() => {
    fetchCandidates();
  }, []);

  async function fetchCandidates() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .order('name', { ascending: true });
    if (error) {
      setError('Failed to load candidates. Please refresh the page.');
    } else {
      setCandidates(data || []);
    }
    setLoading(false);
  }

  function selectCandidate(catKey, candidateId) {
    setSelections(prev => ({ ...prev, [catKey]: candidateId }));
  }

  function getCandidateById(id) {
    return candidates.find(c => c.id === id);
  }

  function validateEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  async function handleConfirmSubmit() {
    setEmailError('');
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);

    const { data: existing, error: checkErr } = await supabase
      .from('votes')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (checkErr) {
      setEmailError('Unable to verify email. Please try again.');
      setSubmitting(false);
      return;
    }

    if (existing) {
      setEmailError('This email has already voted.');
      setSubmitting(false);
      return;
    }

    const { error: insertErr } = await supabase.from('votes').insert({
      email: email.trim().toLowerCase(),
      singles_male_id: selections.singles_male,
      singles_female_id: selections.singles_female,
      couples_id: selections.couples,
    });

    if (insertErr) {
      setEmailError('Something went wrong submitting your vote. Please try again.');
      setSubmitting(false);
      return;
    }

    setShowConfirm(false);
    setSubmitted(true);
  }

  function handleTabSwitch(key) {
    setTabSwitching(true);
    setActiveTab(key);
    setTimeout(() => setTabSwitching(false), 300);
  }

  if (submitted) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 24,
        textAlign: 'center',
        animation: 'fadeIn 0.6s ease-out',
        background: tokens.navy,
      }}>
        <Confetti />
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: tokens.gold,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: tokens.navy,
          marginBottom: 28,
          animation: 'bounceIn 0.8s ease-out 0.3s both',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" style={{
              strokeDasharray: 30,
              strokeDashoffset: 30,
              animation: 'drawCheck 0.8s ease-out 0.6s forwards',
            }} />
          </svg>
        </div>
        <h1 style={{
          fontFamily: tokens.fontHeading,
          fontSize: 36,
          fontWeight: 700,
          margin: '0 0 12px',
          color: tokens.gold,
          animation: 'fadeInUp 0.6s ease-out 0.8s both',
        }}>Thank you!</h1>
        <p style={{
          fontSize: 17,
          color: tokens.lavender,
          maxWidth: 400,
          lineHeight: 1.6,
          animation: 'fadeInUp 0.6s ease-out 1.1s both',
        }}>
          Your votes have been submitted.
        </p>
        <p style={{
          fontSize: 14,
          color: 'rgba(168,178,216,0.6)',
          marginTop: 8,
          animation: 'fadeInUp 0.6s ease-out 1.4s both',
        }}>
          We appreciate your participation.
        </p>
      </div>
    );
  }

  if (isVotingClosed) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 24,
        textAlign: 'center',
      }}>
        <div style={{
          background: tokens.navy,
          borderRadius: tokens.borderRadius,
          padding: '32px 40px',
          maxWidth: 480,
          width: '100%',
          animation: 'fadeInUp 0.6s ease-out',
        }}>
          <h2 style={{ fontFamily: tokens.fontHeading, fontSize: 22, fontWeight: 700, margin: '0 0 8px', color: tokens.gold }}>Voting is currently closed</h2>
          <p style={{ fontSize: 15, color: tokens.lavender, margin: 0 }}>Please check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <header style={{
        textAlign: 'center',
        padding: '48px 20px 32px',
        borderBottom: '1px solid rgba(201,168,76,0.2)',
        background: tokens.navy,
      }}>
        <h1 style={{
          fontFamily: tokens.fontHeading,
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 700,
          letterSpacing: '2px',
          margin: '0 0 10px',
          color: tokens.gold,
          lineHeight: 1.2,
          animation: 'fadeInUp 0.8s ease-out',
        }}>
          👑 Mr & Miss AAAU 2024
        </h1>
        <p style={{
          fontFamily: tokens.fontBody,
          fontSize: 16,
          fontWeight: 300,
          color: tokens.lavender,
          margin: '0 0 24px',
          letterSpacing: '0.5px',
          animation: 'fadeInUp 0.8s ease-out 0.2s both',
        }}>
          Cast your vote across all three categories
        </p>
        <div style={{
          width: '60%',
          maxWidth: 400,
          height: 1,
          background: tokens.gold,
          margin: '0 auto',
          opacity: 0.6,
          animation: 'fadeIn 0.8s ease-out 0.4s both',
        }} />
      </header>

      {/* Progress */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 24,
        padding: '16px 20px',
        borderBottom: '1px solid #eee',
        fontSize: 13,
        fontWeight: 600,
        color: '#888',
        flexWrap: 'wrap',
        animation: 'fadeIn 0.6s ease-out 0.5s both',
      }}>
        {categories.map(cat => (
          <span key={cat.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              background: selections[cat.key] ? tokens.gold : '#ddd',
              color: selections[cat.key] ? tokens.navy : '#888',
              transition: 'all 0.3s ease',
            }}>
              {selections[cat.key] ? <CheckIcon /> : ''}
            </span>
            {selections[cat.key] ? 'Selected' : 'Not yet selected'}
            <span style={{ color: '#bbb' }}>— {cat.label}</span>
          </span>
        ))}
      </div>

      {/* Tabs with sliding indicator */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 0,
        borderBottom: '1px solid #eee',
        position: 'sticky',
        top: 0,
        background: '#fff',
        zIndex: 10,
        animation: 'fadeIn 0.6s ease-out 0.6s both',
      }}>
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => handleTabSwitch(cat.key)}
            style={{
              padding: '16px 24px',
              fontFamily: tokens.fontHeading,
              fontSize: 18,
              fontWeight: 500,
              color: activeTab === cat.key ? tokens.text : '#888',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.3s ease',
              letterSpacing: '0.5px',
              position: 'relative',
            }}
          >
            {cat.label}
            {activeTab === cat.key && (
              <span style={{
                position: 'absolute',
                bottom: 0,
                left: '10%',
                right: '10%',
                height: 3,
                background: tokens.gold,
                borderRadius: '2px 2px 0 0',
                animation: 'fadeIn 0.3s ease',
              }} />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <main style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '24px 20px',
        opacity: tabSwitching ? 0 : 1,
        transform: tabSwitching ? 'translateY(8px)' : 'translateY(0)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
            <div style={{
              width: 32,
              height: 32,
              border: '3px solid #eee',
              borderTopColor: tokens.gold,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            Loading candidates...
          </div>
        )}

        {error && (
          <div style={{
            background: '#fff0f0',
            color: '#c00',
            padding: 16,
            borderRadius: tokens.borderRadius,
            textAlign: 'center',
            fontSize: 14,
            fontWeight: 500,
            animation: 'fadeInUp 0.4s ease-out',
          }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}>
            {candidates
              .filter(c => c.category === activeTab)
              .map((candidate, idx) => {
                const isSelected = selections[activeTab] === candidate.id;
                const isCouples = activeTab === 'couples';

                if (isCouples) {
                  return (
                    <CouplesCard
                      key={candidate.id}
                      candidate={candidate}
                      isSelected={isSelected}
                      idx={idx}
                      onSelect={() => selectCandidate(activeTab, candidate.id)}
                    />
                  );
                }

                return (
                  <div
                    key={candidate.id}
                    onClick={() => selectCandidate(activeTab, candidate.id)}
                    style={{
                      background: tokens.cardBg,
                      borderRadius: tokens.borderRadius,
                      cursor: 'pointer',
                      overflow: 'hidden',
                      position: 'relative',
                      animation: `fadeInUpCard 0.5s ease-out ${idx * 0.1}s both`,
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      transform: 'translateY(0)',
                      boxShadow: 'none',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(201, 168, 76, 0.4)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Animated gold border for selected */}
                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: tokens.borderRadius,
                        padding: 2,
                        background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.8), transparent, rgba(201,168,76,0.8), transparent)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmerBorder 2s linear infinite',
                        pointerEvents: 'none',
                        zIndex: 1,
                      }}>
                        <div style={{
                          width: '100%',
                          height: '100%',
                          background: tokens.cardBg,
                          borderRadius: tokens.borderRadius - 2,
                        }} />
                      </div>
                    )}

                    {/* Pulse glow on selection */}
                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: tokens.borderRadius,
                        animation: 'pulseGlow 1.5s ease-out',
                        pointerEvents: 'none',
                        zIndex: 0,
                      }} />
                    )}

                    {/* Checkmark badge with bounce */}
                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: tokens.gold,
                        color: tokens.navy,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 3,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        animation: 'bounceIn 0.5s ease-out',
                      }}>
                        <CheckIcon animate />
                      </div>
                    )}

                    {/* Photo */}
                    <div style={{
                      width: '100%',
                      aspectRatio: '1 / 1',
                      background: '#e0e0e0',
                      overflow: 'hidden',
                      position: 'relative',
                      zIndex: 2,
                    }}>
                      {candidate.photo_url ? (
                        <img
                          src={candidate.photo_url}
                          alt={candidate.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                            transition: 'transform 0.4s ease',
                          }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#bbb',
                          fontSize: 14,
                        }}>
                          No Photo
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ padding: '14px 16px 16px', position: 'relative', zIndex: 2 }}>
                      <div style={{
                        fontFamily: tokens.fontHeading,
                        fontSize: 16,
                        fontWeight: 600,
                        marginBottom: 10,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {candidate.name}
                      </div>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 14px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: '0.3px',
                        textTransform: 'uppercase',
                        background: isSelected ? tokens.gold : '#fff',
                        color: isSelected ? tokens.navy : tokens.text,
                        border: `1.5px solid ${tokens.gold}`,
                        transition: 'all 0.3s ease',
                      }}>
                        {isSelected ? (
                          <><CheckIcon /> Selected</>
                        ) : (
                          'Select'
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </main>

      {/* Sticky Submit with shimmer */}
      {allSelected && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px 20px 24px',
          background: 'linear-gradient(to top, rgba(255,255,255,1) 60%, rgba(255,255,255,0))',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 20,
          animation: 'fadeUpBtn 0.6s ease-out',
        }}>
          <button
            onClick={() => setShowConfirm(true)}
            style={{
              background: tokens.gold,
              color: tokens.navy,
              border: 'none',
              borderRadius: tokens.borderRadius,
              padding: '16px 48px',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(201,168,76,0.3)',
              letterSpacing: '0.3px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 30px rgba(201,168,76,0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,168,76,0.3)';
            }}
          >
            {/* Shimmer sweep */}
            <span style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '50%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              animation: 'shimmerBtn 3s ease-in-out infinite',
            }} />
            Submit My Votes
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10,22,40,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          zIndex: 50,
          animation: 'fadeIn 0.3s ease-out',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: tokens.borderRadius,
            maxWidth: 460,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px 28px 24px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            animation: 'slideUp 0.4s ease-out',
          }}>
            <h2 style={{ fontFamily: tokens.fontHeading, fontSize: 20, fontWeight: 700, margin: '0 0 20px' }}>Confirm Your Votes</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              {categories.map((cat, idx) => {
                const c = getCandidateById(selections[cat.key]);
                return (
                  <div key={cat.key} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: tokens.cardBg,
                    borderRadius: tokens.borderRadius,
                    padding: 10,
                    animation: `fadeInUp 0.4s ease-out ${idx * 0.1}s both`,
                  }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 6,
                      background: '#ddd',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}>
                      {c?.photo_url ? (
                        <img src={c.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : null}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>
                        {cat.label}
                      </div>
                      <div style={{ fontFamily: tokens.fontHeading, fontSize: 14, fontWeight: 600 }}>{c?.name || '—'}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginBottom: 20, animation: 'fadeInUp 0.4s ease-out 0.3s both' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: 14,
                  borderRadius: 8,
                  border: `1.5px solid ${emailError ? '#e74c3c' : '#ddd'}`,
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s ease',
                }}
              />
              {emailError && (
                <div style={{ color: '#e74c3c', fontSize: 12, marginTop: 6, fontWeight: 500, animation: 'fadeIn 0.3s ease' }}>
                  {emailError}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, animation: 'fadeInUp 0.4s ease-out 0.4s both' }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: tokens.borderRadius,
                  border: '1.5px solid #ddd',
                  background: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: tokens.text,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: tokens.borderRadius,
                  border: 'none',
                  background: tokens.gold,
                  color: tokens.navy,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                {submitting ? 'Submitting…' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   COUPLES CARD COMPONENT
   ============================================================ */
function CouplesCard({ candidate, isSelected, idx, onSelect }) {
  const [isHovered, setIsHovered] = useState(false);

  const goldFilter = 'brightness(0) saturate(100%) invert(77%) sepia(55%) saturate(500%) hue-rotate(5deg) brightness(95%)';
  const dropShadow = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: tokens.cardBg,
        borderRadius: tokens.borderRadius,
        cursor: 'pointer',
        overflow: 'hidden',
        position: 'relative',
        animation: `fadeInUpCard 0.5s ease-out ${idx * 0.1}s both`,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 0 20px rgba(201, 168, 76, 0.4)' : 'none',
      }}
    >
      {/* Animated gold border for selected */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: tokens.borderRadius,
          padding: 2,
          background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.8), transparent, rgba(201,168,76,0.8), transparent)',
          backgroundSize: '200% 100%',
          animation: 'shimmerBorder 2s linear infinite',
          pointerEvents: 'none',
          zIndex: 1,
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            background: tokens.cardBg,
            borderRadius: tokens.borderRadius - 2,
          }} />
        </div>
      )}

      {/* Pulse glow on selection */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: tokens.borderRadius,
          animation: 'pulseGlow 1.5s ease-out',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
      )}

      {/* Checkmark badge with bounce */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: tokens.gold,
          color: tokens.navy,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          animation: 'bounceIn 0.5s ease-out',
        }}>
          <CheckIcon animate />
        </div>
      )}

      {/* Couples Photos Area */}
      <div style={{
        width: '100%',
        padding: '24px 0',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        overflow: 'hidden',
      }}>
        {/* Romantic gradient glow background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(201,168,76,0.2) 0%, rgba(201,168,76,0.05) 50%, transparent 70%)',
          transition: 'opacity 0.3s ease',
          opacity: isHovered || isSelected ? 1 : 0.6,
        }} />

        {/* Left Photo - 120px wide, 160px tall, portrait rectangular with rounded corners */}
        <div style={{
          width: 120,
          height: 160,
          borderRadius: 12,
          overflow: 'hidden',
          position: 'relative',
          zIndex: 2,
          marginRight: -16,
          border: `3px solid ${isSelected ? tokens.gold : '#fff'}`,
          boxShadow: isSelected ? '0 0 15px rgba(201,168,76,0.5)' : '0 2px 10px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
        }}>
          {candidate.photo_url ? (
            <img
              src={candidate.photo_url}
              alt="Partner 1"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.4s ease',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ddd',
              color: '#999',
              fontSize: 12,
            }}>
              No Photo
            </div>
          )}
        </div>

        {/* Wedding Rings Icon - positioned absolute, centered between photos, overlapping both */}
        <div style={{
          position: 'relative',
          zIndex: 4,
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: -4,
          marginRight: -4,
          animation: isHovered || isSelected ? 'ringPulse 1.5s ease-in-out infinite' : 'none',
        }}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/3074/3074987.png"
            alt="Wedding Rings"
            width={40}
            height={40}
            style={{
              filter: `${goldFilter} ${dropShadow}`,
              animation: 'ringSway 2s ease-in-out infinite',
              display: 'block',
            }}
          />
        </div>

        {/* Right Photo - 120px wide, 160px tall, portrait rectangular with rounded corners */}
        <div style={{
          width: 120,
          height: 160,
          borderRadius: 12,
          overflow: 'hidden',
          position: 'relative',
          zIndex: 2,
          marginLeft: -16,
          border: `3px solid ${isSelected ? tokens.gold : '#fff'}`,
          boxShadow: isSelected ? '0 0 15px rgba(201,168,76,0.5)' : '0 2px 10px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
        }}>
          {candidate.photo_url_2 ? (
            <img
              src={candidate.photo_url_2}
              alt="Partner 2"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.4s ease',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ddd',
              color: '#999',
              fontSize: 12,
            }}>
              No Photo
            </div>
          )}
        </div>
      </div>

      {/* Couple Name */}
      <div style={{ padding: '14px 16px 16px', position: 'relative', zIndex: 2, textAlign: 'center' }}>
        <div style={{
          fontFamily: tokens.fontHeading,
          fontSize: 16,
          fontWeight: 600,
          marginBottom: 10,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {candidate.name}
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 14px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.3px',
          textTransform: 'uppercase',
          background: isSelected ? tokens.gold : '#fff',
          color: isSelected ? tokens.navy : tokens.text,
          border: `1.5px solid ${tokens.gold}`,
          transition: 'all 0.3s ease',
        }}>
          {isSelected ? (
            <><CheckIcon /> Selected</>
          ) : (
            'Select'
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ADMIN DASHBOARD
   ============================================================ */
function AdminDashboard() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState('');

  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('singles_male');
  const [votingClosed, setVotingClosed] = useState(() => localStorage.getItem('voting_closed') === 'true');
  const [dataLoaded, setDataLoaded] = useState(false);

  const categories = [
    { key: 'singles_male', label: 'Singles Male' },
    { key: 'singles_female', label: 'Singles Female' },
    { key: 'couples', label: 'Couples' },
  ];

  useEffect(() => {
    if (loggedIn) fetchData();
  }, [loggedIn]);

  async function fetchData() {
    setLoading(true);
    setError('');
    setDataLoaded(false);
    const [{ data: candData, error: candErr }, { data: voteData, error: voteErr }] = await Promise.all([
      supabase.from('candidates').select('*').order('name', { ascending: true }),
      supabase.from('votes').select('*'),
    ]);
    if (candErr || voteErr) {
      setError('Failed to load data from Supabase.');
    } else {
      setCandidates(candData || []);
      setVotes(voteData || []);
      setDataLoaded(true);
    }
    setLoading(false);
  }

  function handleLogin() {
    if (password === ADMIN_PASSWORD) {
      setLoggedIn(true);
      setPwError('');
    } else {
      setPwError('Incorrect password.');
    }
  }

  function toggleVoting() {
    const next = !votingClosed;
    setVotingClosed(next);
    localStorage.setItem('voting_closed', String(next));
  }

  const leaderboard = useMemo(() => {
    const catCandidates = candidates.filter(c => c.category === activeTab);
    const voteFieldMap = {
      singles_male: 'singles_male_id',
      singles_female: 'singles_female_id',
      couples: 'couples_id',
    };
    const field = voteFieldMap[activeTab];
    const totalVotesForCat = votes.filter(v => v[field]).length;

    const rows = catCandidates.map(c => {
      const count = votes.filter(v => v[field] === c.id).length;
      const pct = totalVotesForCat > 0 ? (count / totalVotesForCat) * 100 : 0;
      return { ...c, count, pct };
    }).sort((a, b) => b.count - a.count);

    return { rows, totalVotesForCat };
  }, [candidates, votes, activeTab]);

  const grandTotal = votes.length;
  const animatedGrandTotal = useCountUp(grandTotal, 1000, dataLoaded);

  if (!loggedIn) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 20,
      }}>
        <div style={{
          background: tokens.cardBg,
          borderRadius: tokens.borderRadius,
          padding: '36px 32px',
          maxWidth: 360,
          width: '100%',
          textAlign: 'center',
          animation: 'fadeInUp 0.6s ease-out',
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: tokens.gold,
            color: tokens.navy,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}>
            <LockIcon />
          </div>
          <h2 style={{ fontFamily: tokens.fontHeading, fontSize: 20, fontWeight: 700, margin: '0 0 6px' }}>Admin Login</h2>
          <p style={{ fontSize: 13, color: '#888', margin: '0 0 20px' }}>Enter the admin password to continue</p>

          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setPwError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Password"
            style={{
              width: '100%',
              padding: '12px 14px',
              fontSize: 14,
              borderRadius: 8,
              border: `1.5px solid ${pwError ? '#e74c3c' : '#ddd'}`,
              outline: 'none',
              fontFamily: 'inherit',
              marginBottom: pwError ? 6 : 14,
              boxSizing: 'border-box',
              transition: 'border-color 0.3s ease',
            }}
          />
          {pwError && (
            <div style={{ color: '#e74c3c', fontSize: 12, marginBottom: 14, fontWeight: 500, animation: 'fadeIn 0.3s ease' }}>
              {pwError}
            </div>
          )}

          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: tokens.borderRadius,
              border: 'none',
              background: tokens.gold,
              color: tokens.navy,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(201,168,76,0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Top bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid #eee',
        flexWrap: 'wrap',
        gap: 12,
        position: 'sticky',
        top: 0,
        background: '#fff',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <h2 style={{ fontFamily: tokens.fontHeading, fontSize: 18, fontWeight: 700, margin: 0 }}>Admin Dashboard</h2>
          <div style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>
            Grand total: <strong style={{ color: tokens.text, fontSize: 16 }}>{animatedGrandTotal}</strong> votes cast
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={toggleVoting}
            style={{
              padding: '8px 16px',
              borderRadius: tokens.borderRadius,
              border: '1.5px solid #ddd',
              background: votingClosed ? '#fff0f0' : '#f0fff4',
              color: votingClosed ? '#c0392b' : '#27ae60',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {votingClosed ? 'Open Voting' : 'Close Voting'}
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            style={{
              padding: '8px 16px',
              borderRadius: tokens.borderRadius,
              border: '1.5px solid #ddd',
              background: '#fff',
              color: tokens.text,
              fontSize: 13,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s ease',
            }}
          >
            <RefreshIcon /> Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 0,
        borderBottom: '1px solid #eee',
      }}>
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveTab(cat.key)}
            style={{
              padding: '14px 24px',
              fontFamily: tokens.fontHeading,
              fontSize: 18,
              fontWeight: 500,
              color: activeTab === cat.key ? tokens.text : '#888',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.3s ease',
              position: 'relative',
            }}
          >
            {cat.label}
            {activeTab === cat.key && (
              <span style={{
                position: 'absolute',
                bottom: 0,
                left: '10%',
                right: '10%',
                height: 3,
                background: tokens.gold,
                borderRadius: '2px 2px 0 0',
                animation: 'fadeIn 0.3s ease',
              }} />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '24px 20px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
            <div style={{
              width: 28,
              height: 28,
              border: '3px solid #eee',
              borderTopColor: tokens.gold,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 12px',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            Loading results…
          </div>
        )}

        {error && (
          <div style={{
            background: '#fff0f0',
            color: '#c00',
            padding: 14,
            borderRadius: tokens.borderRadius,
            textAlign: 'center',
            fontSize: 14,
            fontWeight: 500,
            marginBottom: 20,
            animation: 'fadeInUp 0.4s ease-out',
          }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div style={{ marginBottom: 20, fontSize: 13, color: '#888', fontWeight: 500 }}>
              Total votes in this category: <strong style={{ color: tokens.text }}>{leaderboard.totalVotesForCat}</strong>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}>
              {leaderboard.rows.map((row, idx) => (
                <LeaderboardRow
                  key={row.id}
                  row={row}
                  idx={idx}
                  dataLoaded={dataLoaded}
                />
              ))}

              {leaderboard.rows.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, color: '#aaa', fontSize: 14 }}>
                  No candidates found for this category.
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

/* ---------- Animated Leaderboard Row ---------- */
function LeaderboardRow({ row, idx, dataLoaded }) {
  const animatedCount = useCountUp(row.count, 1000, dataLoaded);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    if (dataLoaded) {
      const timer = setTimeout(() => setBarWidth(row.pct), 100);
      return () => clearTimeout(timer);
    }
  }, [dataLoaded, row.pct]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: tokens.cardBg,
        borderRadius: tokens.borderRadius,
        padding: '12px 16px',
        animation: `fadeInUpCard 0.5s ease-out ${idx * 0.08}s both`,
      }}
    >
      <div style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: idx < 3 ? tokens.gold : '#ddd',
        color: idx < 3 ? tokens.navy : '#888',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 800,
        flexShrink: 0,
      }}>
        {idx + 1}
      </div>

      <div style={{
        width: 40,
        height: 40,
        borderRadius: 6,
        background: '#ddd',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {row.photo_url ? (
          <img src={row.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : null}
      </div>

      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontFamily: tokens.fontHeading, fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {row.name}
        </div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 2, fontWeight: 500 }}>
          {animatedCount} vote{row.count !== 1 ? 's' : ''}
        </div>
      </div>

      <div style={{ width: 120, flexShrink: 0 }}>
        <div style={{
          height: 6,
          borderRadius: 3,
          background: '#ddd',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${barWidth}%`,
            height: '100%',
            background: tokens.gold,
            borderRadius: 3,
            transition: 'width 1s ease-out',
          }} />
        </div>
        <div style={{ fontSize: 11, color: '#888', marginTop: 4, textAlign: 'right', fontWeight: 600 }}>
          {row.pct.toFixed(1)}%
        </div>
      </div>
    </div>
  );
}
