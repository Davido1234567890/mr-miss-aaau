// ============================================================
// SUPABASE SETUP (create these tables in your Supabase project)
// ============================================================
//
// Table: candidates
// | column     | type | constraints |
// |------------|------|-------------|
// | id         | text | PRIMARY KEY |
// | name       | text | NOT NULL    |
// | photo_url  | text |             |
// | category   | text | NOT NULL    |  -- "singles_male", "singles_female", "couples"
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

import React, { useState, useEffect, useMemo } from 'react';
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

/* ---------- Icons ---------- */
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
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
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: tokens.gold,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: tokens.navy,
          marginBottom: 24,
        }}>
          <CheckIcon />
        </div>
        <h1 style={{ fontFamily: tokens.fontHeading, fontSize: 28, fontWeight: 700, margin: '0 0 12px', color: tokens.gold }}>Thank you!</h1>
        <p style={{ fontSize: 16, color: tokens.lavender, maxWidth: 400, lineHeight: 1.5 }}>
          Your votes have been submitted.
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
        borderBottom: '1px solid #eee',
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
        }}>
          👑 Mr & Miss AAAU 2026
        </h1>
        <p style={{
          fontFamily: tokens.fontBody,
          fontSize: 16,
          fontWeight: 300,
          color: tokens.lavender,
          margin: '0 0 24px',
          letterSpacing: '0.5px',
        }}>
          Cast your vote across all three categories
        </p>
        {/* Decorative gold divider */}
        <div style={{
          width: '60%',
          maxWidth: 400,
          height: 1,
          background: tokens.gold,
          margin: '0 auto',
          opacity: 0.6,
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
            }}>
              {selections[cat.key] ? <CheckIcon /> : ''}
            </span>
            {selections[cat.key] ? 'Selected' : 'Not yet selected'}
            <span style={{ color: '#bbb' }}>— {cat.label}</span>
          </span>
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 0,
        borderBottom: '1px solid #eee',
        position: 'sticky',
        top: 0,
        background: '#fff',
        zIndex: 10,
      }}>
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveTab(cat.key)}
            style={{
              padding: '16px 24px',
              fontFamily: tokens.fontHeading,
              fontSize: 18,
              fontWeight: 500,
              color: activeTab === cat.key ? tokens.text : '#888',
              background: 'none',
              border: 'none',
              borderBottom: `3px solid ${activeTab === cat.key ? tokens.gold : 'transparent'}`,
              cursor: 'pointer',
              transition: 'all .2s',
              letterSpacing: '0.5px',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px' }}>
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
              .map(candidate => {
                const isSelected = selections[activeTab] === candidate.id;
                return (
                  <div
                    key={candidate.id}
                    onClick={() => selectCandidate(activeTab, candidate.id)}
                    style={{
                      background: tokens.cardBg,
                      borderRadius: tokens.borderRadius,
                      border: `2px solid ${isSelected ? tokens.gold : 'transparent'}`,
                      cursor: 'pointer',
                      overflow: 'hidden',
                      transition: 'border-color .2s, transform .15s',
                      position: 'relative',
                    }}
                  >
                    {/* Checkmark badge */}
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
                        zIndex: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      }}>
                        <CheckIcon />
                      </div>
                    )}

                    {/* Photo */}
                    <div style={{
                      width: '100%',
                      aspectRatio: '1 / 1',
                      background: '#e0e0e0',
                      overflow: 'hidden',
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
                          }}
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
                    <div style={{ padding: '14px 16px 16px' }}>
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
                        transition: 'all .2s',
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

      {/* Sticky Submit */}
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
          animation: 'fadeUp .4s ease-out',
        }}>
          <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
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
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              letterSpacing: '0.3px',
            }}
          >
            Submit My Votes
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10,22,40,0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          zIndex: 50,
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
          }}>
            <h2 style={{ fontFamily: tokens.fontHeading, fontSize: 20, fontWeight: 700, margin: '0 0 20px' }}>Confirm Your Votes</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              {categories.map(cat => {
                const c = getCandidateById(selections[cat.key]);
                return (
                  <div key={cat.key} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: tokens.cardBg,
                    borderRadius: tokens.borderRadius,
                    padding: 10,
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

            <div style={{ marginBottom: 20 }}>
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
                }}
              />
              {emailError && (
                <div style={{ color: '#e74c3c', fontSize: 12, marginTop: 6, fontWeight: 500 }}>
                  {emailError}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
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
                }}
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
    const [{ data: candData, error: candErr }, { data: voteData, error: voteErr }] = await Promise.all([
      supabase.from('candidates').select('*').order('name', { ascending: true }),
      supabase.from('votes').select('*'),
    ]);
    if (candErr || voteErr) {
      setError('Failed to load data from Supabase.');
    } else {
      setCandidates(candData || []);
      setVotes(voteData || []);
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
            }}
          />
          {pwError && (
            <div style={{ color: '#e74c3c', fontSize: 12, marginBottom: 14, fontWeight: 500 }}>
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
            Grand total: <strong style={{ color: tokens.text }}>{grandTotal}</strong> votes cast
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
              borderBottom: `3px solid ${activeTab === cat.key ? tokens.gold : 'transparent'}`,
              cursor: 'pointer',
            }}
          >
            {cat.label}
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
                <div
                  key={row.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    background: tokens.cardBg,
                    borderRadius: tokens.borderRadius,
                    padding: '12px 16px',
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
                      {row.count} vote{row.count !== 1 ? 's' : ''}
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
                        width: `${row.pct}%`,
                        height: '100%',
                        background: tokens.gold,
                        borderRadius: 3,
                        transition: 'width .6s ease',
                      }} />
                    </div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 4, textAlign: 'right', fontWeight: 600 }}>
                      {row.pct.toFixed(1)}%
                    </div>
                  </div>
                </div>
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
