
const SUPABASE_URL = 'https://ccmsjcnuyrngqxwrswfe.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjbXNqY251eXJuZ3F4d3Jzd2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MjU2MjgsImV4cCI6MjA2NzIwMTYyOH0.dkjCo2bgDMf923VKESkyMLsULo7IhmsYb6r-4Dn6SRY';

// ── TICKER ──
const tickerItems = [
  'GOAL MARKET RESEARCH', 'BETTOR INSIGHTS', 'FOOTBALL DATA',
  'POWERED BY YOU', 'SHAPE THE ODDS', 'ANONYMOUS & SECURE',
  'FREE BETDATA PRO ACCESS'
];

const ti = document.getElementById('tickerInner');
const doubled = [...tickerItems, ...tickerItems];
ti.innerHTML = doubled.map(t => `<span>${t}</span><span class="ticker-dot">·</span>`).join('');

// ── STATE ──
let currentStep = 1;
const totalSteps = 6;
const answers = {};

// ── START SURVEY ──
function startSurvey() {
  document.getElementById('hero').style.display = 'none';
  document.querySelector('.ticker').style.display = 'none';
  document.getElementById('survey').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  updateProgress(1);
}

// ── PROGRESS BAR ──
function updateProgress(step) {
  const pct = Math.round(((step - 1) / totalSteps) * 100);
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressPct').textContent = pct + '%';
  const labels = ['', 'Quick check', 'Your profile', 'How you bet', 'Goal markets', 'New markets', 'Claim reward'];
  document.getElementById('progressLabel').textContent =
    labels[step] + ' · ' + step + ' of ' + totalSteps;
}

// ── RADIO SELECT ──
function selectOption(el, qId, action) {
  document.getElementById(qId)
    .querySelectorAll('.option-item')
    .forEach(i => i.classList.remove('selected'));
  el.classList.add('selected');
  el.querySelector('input').checked = true;
  answers[qId] = el.querySelector('input').value;
  hideError('err-' + qId);
  if (action === 'exit') showExit();
}

// ── CHECKBOX TOGGLE ──
function toggleCheckbox(el, qId) {
  el.classList.toggle('selected');
  el.querySelector('input').checked = el.classList.contains('selected');
  if (!answers[qId]) answers[qId] = [];
  const val = el.querySelector('input').value;
  if (el.classList.contains('selected')) {
    if (!answers[qId].includes(val)) answers[qId].push(val);
  } else {
    answers[qId] = answers[qId].filter(v => v !== val);
  }
}

// ── ERROR HELPERS ──
function hideError(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}

function showError(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('show');
}

// ── VALIDATION ──
function validateStep(step) {
  const stepEl = document.querySelector(`.survey-step[data-step="${step}"]`);
  let valid = true;
  stepEl.querySelectorAll('[data-required="true"]').forEach(el => {
    if (!answers[el.id]) {
      showError('err-' + el.id);
      valid = false;
    }
  });
  return valid;
}

// ── NAVIGATION ──
function nextStep(from) {
  if (!validateStep(from)) return;
  const next = from + 1;
  document.querySelector(`.survey-step[data-step="${from}"]`).classList.remove('active');
  document.querySelector(`.survey-step[data-step="${next}"]`).classList.add('active');
  currentStep = next;
  updateProgress(next);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevStep(from) {
  const prev = from - 1;
  document.querySelector(`.survey-step[data-step="${from}"]`).classList.remove('active');
  document.querySelector(`.survey-step[data-step="${prev}"]`).classList.add('active');
  currentStep = prev;
  updateProgress(prev);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── EXIT FOR NON-BETTORS ──
function showExit() {
  setTimeout(() => {
    document.getElementById('survey').innerHTML = `
      <div style="text-align:center; padding:80px 24px;">
        <p style="font-family:'Bebas Neue',sans-serif; font-size:36px; margin-bottom:12px;">
          Thanks for stopping by
        </p>
        <p style="color:#888; font-size:14px; line-height:1.7; max-width:360px; margin:0 auto;">
          This survey is for football bettors. Come back if you ever start betting — BetData Pro will still be waiting.
        </p>
      </div>`;
  }, 400);
}

// ── SUBMIT TO SUPABASE ──
async function submitSurvey() {
  const email = document.getElementById('emailInput').value.trim();
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailReg.test(email)) {
    showError('err-email');
    return;
  }

  answers.q13 = document.getElementById('q13').value.trim();
  const token = 'BETDATA-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  const submitBtn = document.getElementById('submitBtn');
  const statusEl = document.getElementById('submitStatus');
  submitBtn.disabled = true;
  statusEl.className = 'submit-status loading';
  statusEl.textContent = 'Saving your responses...';

  const payload = {
    email:         email,
    q1:            answers.q1   || null,
    q2:            answers.q2   || null,
    q3:            answers.q3   || null,
    q4:            answers.q4   || null,
    q5:            answers.q5   || [],
    q6:            answers.q6   || [],
    q7:            answers.q7   || null,
    q8:            answers.q8   || [],
    q9:            answers.q9   || [],
    q10:           answers.q10  || null,
    q11:           answers.q11  || null,
    q12:           answers.q12  || null,
    q13:           answers.q13  || null,
    q14:           answers.q14  || [],
    q15:           answers.q15  || null,
    q16:           answers.q16  || null,
    q17:           answers.q17  || null,
    access_token:  token
  };

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/survey_responses`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':         SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer':         'return=minimal'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }

    // Show success screen
    document.getElementById('survey').style.display = 'none';
    document.querySelector('footer').style.display = 'none';
    const successEl = document.getElementById('success');
    successEl.classList.add('visible');
    document.getElementById('successToken').textContent = 'ACCESS · ' + token;
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (err) {
    console.error('Supabase error:', err);
    statusEl.className = 'submit-status error';
    statusEl.textContent = 'Something went wrong. Please try again.';
    submitBtn.disabled = false;
  }
}


