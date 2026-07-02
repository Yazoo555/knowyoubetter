/* ---------------------------------------------------------
   DATA
--------------------------------------------------------- */
const QUESTIONS = [
  {
    id: 'feeling', type: 'choice', q: "How are you honestly feeling about all of this?",
    options: [{ l: 'Excited', e: '😊' }, { l: 'Curious', e: '🙂' }, { l: 'Unsure', e: '😅' }, { l: 'Just going with the flow', e: '😐' }, { l: 'Optimistic', e: '✨' }]
  },
  {
    id: 'impression', type: 'choiceOther', q: "What was your first impression of me?",
    options: [{ l: 'Friendly' }, { l: 'Quiet' }, { l: 'Funny' }, { l: 'Confusing 😂' }, { l: "Didn't get enough time to know" }]
  },
  {
    id: 'firstMeeting', type: 'choice', q: "What do you think our first meeting felt like?",
    options: [{ l: 'Awkward' }, { l: 'Comfortable' }, { l: 'Funny' }, { l: 'Too formal' }, { l: 'Wish we talked more' }]
  },
  {
    id: 'archInspiration', type: 'choice', q: "As an architect, which style of space do you feel most drawn to? 🏛️",
    options: [{ l: 'Clean & minimal' }, { l: 'Warm & cozy' }, { l: 'Bold & expressive' }, { l: 'Natural & organic' }, { l: 'A mix of everything' }]
  },
  { id: 'archDream', type: 'textarea', q: "If you could design any building — no budget, no limits — what would it be and why?", ph: "Dream big 🏗️" },
  {
    id: 'messageComfort', type: 'slider', q: "How comfortable are you chatting over messages?",
    labels: ['Pretty hesitant', 'Getting there', 'Fairly comfortable', 'Very comfortable', 'Completely at ease']
  },
  {
    id: 'communication', type: 'checkbox', q: "What kind of communication do you enjoy?",
    options: ['Texting', 'Phone calls', 'Meeting for coffee', 'Long walks', 'Voice notes', 'Anything works']
  },
  {
    id: 'qualities', type: 'chips', q: "What qualities matter most to you?",
    options: ['Kindness', 'Respect', 'Humor', 'Ambition', 'Family values', 'Honesty', 'Communication', 'Patience', 'Trust', 'Support', 'Growth', 'Empathy', 'Loyalty', 'Integrity']
  },
  { id: 'birthday', type: 'date', q: "Since your birthday is coming up soon, I wanted to ask—when is your special day? 🎂" },
  {
    id: 'career', type: 'choice', q: "What does your career path look like right now?",
    options: [{ l: 'Growing in architecture' }, { l: 'Exploring new directions' }, { l: 'Further studies' }, { l: 'Thinking of something independent' }, { l: 'Still figuring it out' }]
  },
  {
    id: 'living', type: 'choice', q: "Where would you imagine settling down?",
    options: [{ l: 'Stay in Nepal' }, { l: 'Move abroad someday' }, { l: 'Open to either' }, { l: 'Not sure yet' }]
  },
];

const NZ_INTRO = [
  "There's something I want to share honestly.",
  "I had plans to move to New Zealand — it was something I'd been working towards.",
  "But since we met, I've been reconsidering things.",
  "There's something about getting to know you that made me pause.",
  "I'm not saying anything definitive — just that life feels a little different now.",
  "And I wanted you to know that."
];

const QUESTIONS2 = [
  { id: 'worries', type: 'textarea', q: "What worries you the most about an arranged marriage?", ph: "This stays between us." },
  { id: 'emotionalSafety', type: 'textarea', q: "What makes someone feel emotionally safe for you?", ph: "" },
];

const FUN = [
  { id: 'fun1', a: 'Tea', b: 'Coffee' },
  { id: 'fun2', a: 'Mountains', b: 'Beaches' },
  { id: 'fun3', a: 'Cats', b: 'Dogs' },
  { id: 'fun4', a: 'Morning', b: 'Night' },
  { id: 'fun5', a: 'Books', b: 'Movies' },
  { id: 'fun6', a: 'Stay Home', b: 'Travel' },
  { id: 'fun7', a: 'Rain', b: 'Sunshine' },
  { id: 'fun8', a: 'Cooking together', b: 'Eating outside' },
];

function randomReflectionPct() {
  return Math.floor(Math.random() * 21) + 80; // random integer 80-100 inclusive
}

const REVEAL_AREAS = [
  { label: 'Values & Character', pct: randomReflectionPct },
  { label: 'Communication style', pct: randomReflectionPct },
  { label: 'Openness to connection', pct: randomReflectionPct },
  { label: 'Creative thinking', pct: randomReflectionPct },
  { label: 'Clarity on life goals', pct: randomReflectionPct },
  { label: 'Lifestyle & Preferences', pct: randomReflectionPct },
];

/* ---------------------------------------------------------
   GOOGLE SHEET SUBMISSION
   1. Follow the setup steps to create your Apps Script web app.
   2. Paste the deployment URL below between the quotes.
   3. Leave it as '' to disable saving (page still works fully offline).
--------------------------------------------------------- */
const SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwkLXSKYCJIM_pcC5nTIDYFFHcN6mW-g99x3zU9K64gvlxJnmJXQYepQVqtByuuCVlu/exec';

let submitted = false;
function submitToSheet() {
  if (!SHEET_WEBHOOK_URL || submitted) return;
  submitted = true;
  const payload = {
    ...answers,
    // Spelled out explicitly (in addition to the spread above) so this
    // field can never silently go missing from the payload, since it's
    // the one field set outside the main QUESTIONS/QUESTIONS2 flow.
    questionsForHim: answers.questionsForHim || '',
    submittedAt: new Date().toISOString(),
    authToken: 'zfSODhzV2XodMrYxARvH1yF8CpnxPUze8ulM069eNod'
  };
  fetch(SHEET_WEBHOOK_URL, {
    method: 'POST',
    mode: 'no-cors', // Apps Script web apps don't return readable CORS headers; this still delivers the request
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  }).catch(() => { submitted = false; });
}

/* ---------------------------------------------------------
   STATE
--------------------------------------------------------- */
let answers = {};

function saveAnswers() {
  // No caching in localStorage as per user request to start fresh on page refresh.
}

// Build full screen sequence
const SCREENS = [];
SCREENS.push({ type: 'welcome' });
SCREENS.push({
  type: 'story', lines: [
    "I know our first meeting was a little awkward.",
    "We were surrounded by family.",
    "Maybe neither of us knew what to say.",
    "That's okay.",
    "Real conversations take time."
  ]
});
SCREENS.push({
  type: 'story', lines: [
    "I don't know what you're thinking.",
    "You might like me.",
    "You might not.",
    "You may still be deciding.",
    "And that's completely okay."
  ]
});
QUESTIONS.forEach(q => SCREENS.push({ type: 'question', q }));
SCREENS.push({
  type: 'story', lines: [
    "By the way,",
    "just a quick detail about me—",
    "my eyeglass prescription power is -4.75.",
    "Just so you know!"
  ]
});
SCREENS.push({ type: 'story', lines: NZ_INTRO, isNZ: true });
QUESTIONS2.forEach(q => SCREENS.push({ type: 'question', q }));
SCREENS.push({ type: 'fun' });
SCREENS.push({ type: 'reveal' });
SCREENS.push({ type: 'letter' });
SCREENS.push({ type: 'final' });
SCREENS.push({ type: 'success' });

let current = 0;
const totalQuestionScreens = SCREENS.filter(s => s.type === 'question' || s.type === 'fun').length;

/* ---------------------------------------------------------
   RENDER HELPERS
--------------------------------------------------------- */
const app = document.getElementById('app');
const progressBar = document.getElementById('progress-bar');
const stepLabel = document.getElementById('step-label');

function setProgress() {
  const qIndex = SCREENS.slice(0, current + 1).filter(s => s.type === 'question' || s.type === 'fun').length;
  const pct = Math.min(100, Math.round((qIndex / totalQuestionScreens) * 100));
  if (current <= 1) { progressBar.style.width = '0%'; stepLabel.style.opacity = '0'; }
  else if (SCREENS[current].type === 'letter' || SCREENS[current].type === 'final' || SCREENS[current].type === 'success') {
    progressBar.style.width = '100%'; stepLabel.style.opacity = '0';
  } else {
    progressBar.style.width = pct + '%';
    stepLabel.style.opacity = '1';
    stepLabel.textContent = qIndex + ' / ' + totalQuestionScreens;
  }
}

function goTo(i) {
  if (i < 0 || i >= SCREENS.length) return;
  current = i;
  render();
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  setProgress();
}
function next() { goTo(current + 1); }
function prev() { goTo(current - 1); }

function rippleEffect(e, btn) {
  const r = document.createElement('span');
  r.className = 'ripple';
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  r.style.width = r.style.height = size + 'px';
  r.style.left = (e.clientX - rect.left - size / 2) + 'px';
  r.style.top = (e.clientY - rect.top - size / 2) + 'px';
  btn.appendChild(r);
  setTimeout(() => r.remove(), 650);
}
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (btn) rippleEffect(e, btn);
});

function spawnSparkle() {
  const h = document.createElement('div');
  h.className = 'float-sparkle';
  h.textContent = '✨';
  h.style.left = (40 + Math.random() * 20) + '%';
  h.style.bottom = '10%';
  document.body.appendChild(h);
  setTimeout(() => h.remove(), 3300);
}
let lastSparkle = 0;
function maybeSpawnSparkle() {
  const now = Date.now();
  if (now - lastSparkle > 14000 && Math.random() < 0.5) {
    lastSparkle = now;
    spawnSparkle();
  }
}

function navRow(opts) {
  const { showBack = true, nextLabel = 'Continue', onNext = next, nextDisabled = false } = opts || {};
  const wrap = document.createElement('div');
  wrap.className = 'nav-row';
  const backEl = document.createElement(showBack ? 'span' : 'div');
  if (showBack) {
    backEl.className = 'skip-link';
    backEl.textContent = '← Back';
    backEl.onclick = prev;
  }
  wrap.appendChild(backEl);
  const nb = document.createElement('button');
  nb.className = 'btn' + (nextDisabled ? '' : '');
  nb.innerHTML = `<span>${nextLabel}</span><span aria-hidden=\"true\">→</span>`;
  nb.style.opacity = nextDisabled ? '0.5' : '1';
  nb.style.pointerEvents = nextDisabled ? 'none' : 'auto';
  nb.onclick = onNext;
  wrap.appendChild(nb);
  return wrap;
}

function fadeInChildren(container) {
  const els = container.querySelectorAll('.fade-up');
  els.forEach((el, i) => {
    setTimeout(() => el.classList.add('in'), 120 + i * 90);
  });
}

/* ---------------------------------------------------------
   SCREEN RENDERERS
--------------------------------------------------------- */
function renderWelcome() {
  const stage = document.createElement('div');
  stage.className = 'stage stage-welcome';
  stage.innerHTML = `
    <div class="panel welcome-panel">
      <div class="eyebrow fade-up welcome-eyebrow">a small space, just for us</div>
      <h1 class="fade-up welcome-title">
        Maybe conversations<br/>don't always start easily&hellip;
      </h1>
      <p class="fade-up welcome-sub">
        So I thought I'd create a small space where we can know each other a little better — at your own pace, however you like.
      </p>
      <button class="btn fade-up" id="begin-btn"><span>Begin</span><span aria-hidden="true">→</span></button>
    </div>
  `;
  stage.querySelector('#begin-btn').onclick = next;
  return stage;
}

function renderStory(screen) {
  const stage = document.createElement('div');
  stage.className = 'stage';
  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.style.textAlign = 'center';
  screen.lines.forEach(line => {
    const p = document.createElement('p');
    p.className = 'story-line';
    p.textContent = line;
    panel.appendChild(p);
  });
  const btn = document.createElement('button');
  btn.className = 'btn fade-up';
  btn.style.marginTop = '10px';
  btn.innerHTML = `<span>${screen.isNZ ? "Okay, I'll answer honestly" : "Continue"}</span><span aria-hidden=\"true\">→</span>`;
  btn.onclick = next;
  panel.appendChild(btn);
  stage.appendChild(panel);
  return stage;
}

function activateStoryLines(stage) {
  const lines = stage.querySelectorAll('.story-line');
  lines.forEach((l, i) => setTimeout(() => l.classList.add('in'), 300 + i * 650));
  const btn = stage.querySelector('.btn');
  if (btn) {
    btn.style.opacity = '0'; btn.style.transition = 'opacity .8s ease';
    setTimeout(() => { btn.style.opacity = '1'; }, 300 + lines.length * 650 + 200);
  }
}

function renderQuestionShell(q) {
  const stage = document.createElement('div');
  stage.className = 'stage';
  const panel = document.createElement('div');
  panel.className = 'panel glass fade-up qpanel';

  const head = document.createElement('div');
  head.className = 'qhead';
  const num = document.createElement('div');
  num.className = 'num';
  num.textContent = 'Question';
  const h2 = document.createElement('h2');
  h2.textContent = q.q;
  head.appendChild(num); head.appendChild(h2);
  panel.appendChild(head);

  const body = document.createElement('div');
  body.className = 'qbody';
  panel.appendChild(body);

  stage.appendChild(panel);
  return { stage, panel, body };
}

// Small helper: appends an optional free-text input beneath a question body
// so answers that aren't naturally text-based (sliders, checkboxes, chips)
// still give the user a place to type something in their own words.
function addOptionalTextNote(body, q, opts) {
  const { placeholder = "Anything to add? (optional)" } = opts || {};
  const key = q.id + 'Note';
  const wrap = document.createElement('div');
  wrap.style.marginTop = '14px';
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = placeholder;
  input.value = answers[key] || '';
  input.addEventListener('input', () => {
    answers[key] = input.value;
    saveAnswers();
  });
  wrap.appendChild(input);
  body.appendChild(wrap);
  return input;
}

function renderQuestion(q) {
  const { stage, panel, body } = renderQuestionShell(q);
  let updateNextStateRef = () => { };
  function updateNextState() { updateNextStateRef(); }

  if (q.type === 'choice' || q.type === 'choiceOther') {
    // Every choice-style question now gets an "Other" option with a free-text
    // field, so there's always a way to answer in your own words — not just
    // the questions that were originally flagged as type: 'choiceOther'.
    const list = document.createElement('div');
    q.options.forEach(opt => {
      const label = typeof opt === 'string' ? opt : opt.l;
      const emoji = typeof opt === 'string' ? null : opt.e;
      const el = document.createElement('div');
      el.className = 'choice' + (answers[q.id] === label ? ' selected' : '');
      el.innerHTML = (emoji ? `<span class=\"emoji\">${emoji}</span>` : '') + `<span>${label}</span>`;
      el.onclick = () => {
        answers[q.id] = label;
        saveAnswers();
        [...list.children].forEach(c => c.classList.remove('selected'));
        el.classList.add('selected');
        otherInput.style.display = 'none';
        refreshNav();
      };
      list.appendChild(el);
    });

    const otherChoice = document.createElement('div');
    const isOtherSelected = answers[q.id] && !q.options.find(o => (typeof o === 'string' ? o : o.l) === answers[q.id]);
    otherChoice.className = 'choice' + (isOtherSelected ? ' selected' : '');
    otherChoice.innerHTML = `<span>Other</span>`;

    const otherInput = document.createElement('input');
    otherInput.type = 'text';
    otherInput.placeholder = 'Tell me in your own words…';
    otherInput.style.marginTop = '-4px';
    otherInput.style.marginBottom = '14px';
    otherInput.style.display = isOtherSelected ? 'block' : 'none';
    if (isOtherSelected) otherInput.value = answers[q.id];

    otherChoice.onclick = () => {
      [...list.children].forEach(c => c.classList.remove('selected'));
      otherChoice.classList.add('selected');
      otherInput.style.display = 'block';
      otherInput.focus();
    };
    otherInput.oninput = () => { answers[q.id] = otherInput.value; saveAnswers(); refreshNav(); };

    list.appendChild(otherChoice);
    body.appendChild(list);
    body.appendChild(otherInput);
  }

  else if (q.type === 'slider') {
    const wrap = document.createElement('div');
    const valLabel = document.createElement('div');
    valLabel.style.textAlign = 'center';
    valLabel.style.fontFamily = "'Fraunces',serif";
    valLabel.style.fontStyle = 'italic';
    valLabel.style.fontSize = '20px';
    valLabel.style.color = 'var(--ember)';
    valLabel.style.marginBottom = '8px';
    const slider = document.createElement('input');
    slider.type = 'range'; slider.min = 0; slider.max = 100;
    slider.value = answers[q.id] !== undefined ? answers[q.id] : 50;
    function labelFor(v) {
      const idx = Math.min(q.labels.length - 1, Math.floor(v / (101 / q.labels.length)));
      return q.labels[idx] + ' (' + v + ')';
    }
    valLabel.textContent = labelFor(slider.value);
    slider.oninput = () => {
      valLabel.textContent = labelFor(slider.value);
      answers[q.id] = Number(slider.value);
      saveAnswers();
      refreshNav();
    };
    wrap.appendChild(valLabel);
    wrap.appendChild(slider);
    const scale = document.createElement('div');
    scale.style.display = 'flex'; scale.style.justifyContent = 'space-between';
    scale.style.fontSize = '12px'; scale.style.color = 'var(--ink-soft)';
    scale.innerHTML = '<span>0</span><span>100</span>';
    wrap.appendChild(scale);
    body.appendChild(wrap);
    if (answers[q.id] === undefined) { answers[q.id] = 50; }
    addOptionalTextNote(body, q, { placeholder: 'Want to say more about that? (optional)' });
  }

  else if (q.type === 'checkbox') {
    const list = document.createElement('div');
    const selected = new Set(answers[q.id] || []);
    q.options.forEach(label => {
      const el = document.createElement('div');
      el.className = 'choice' + (selected.has(label) ? ' selected' : '');
      el.innerHTML = `<span>${label}</span>`;
      el.onclick = () => {
        if (selected.has(label)) { selected.delete(label); el.classList.remove('selected'); }
        else { selected.add(label); el.classList.add('selected'); }
        answers[q.id] = [...selected];
        saveAnswers();
        refreshNav();
      };
      list.appendChild(el);
    });
    body.appendChild(list);
    addOptionalTextNote(body, q, { placeholder: 'Anything else? (optional)' });
  }

  else if (q.type === 'chips') {
    const wrap = document.createElement('div');
    wrap.style.textAlign = 'center';
    const selected = new Set(answers[q.id] || []);
    q.options.forEach(label => {
      const chip = document.createElement('span');
      chip.className = 'chip' + (selected.has(label) ? ' selected' : '');
      chip.textContent = label;
      chip.onclick = () => {
        if (selected.has(label)) { selected.delete(label); chip.classList.remove('selected'); }
        else { selected.add(label); chip.classList.add('selected'); }
        answers[q.id] = [...selected];
        saveAnswers();
        refreshNav();
      };
      wrap.appendChild(chip);
    });
    body.appendChild(wrap);
    addOptionalTextNote(body, q, { placeholder: 'Anything else that matters to you? (optional)' });
  }

  else if (q.type === 'text' || q.type === 'date') {
    if (q.type === 'date') {
      const todayStr = new Date().toLocaleDateString('en-CA'); // 'YYYY-MM-DD'

      const wrapper = document.createElement('div');
      wrapper.className = 'date-wrapper';

      // Top row: icon + formatted label
      const labelRow = document.createElement('div');
      labelRow.className = 'date-label-row';

      const icon = document.createElement('span');
      icon.textContent = '📅';
      icon.style.fontSize = '22px';
      icon.style.flexShrink = '0';

      const displayLabel = document.createElement('span');
      displayLabel.className = 'date-display-text';

      function formatDate(val) {
        if (!val) return '';
        const [y, m, d] = val.split('-');
        const names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return `${parseInt(d)} ${names[parseInt(m) - 1]} ${y}`;
      }

      function updateLabel() {
        if (input.value) {
          displayLabel.textContent = formatDate(input.value);
          displayLabel.style.color = 'var(--ink)';
        } else {
          displayLabel.textContent = 'Tap to pick a date';
          displayLabel.style.color = 'var(--ink-soft)';
        }
      }

      labelRow.appendChild(icon);
      labelRow.appendChild(displayLabel);
      wrapper.appendChild(labelRow);

      // The real date input — visible, but styled to blend with theme
      const input = document.createElement('input');
      input.type = 'date';
      input.min = todayStr;
      input.value = answers[q.id] || '';
      input.className = 'date-real-input';
      // aria label for accessibility
      input.setAttribute('aria-label', 'Select your birthday');

      const errMsg = document.createElement('div');
      errMsg.className = 'date-error';
      errMsg.style.display = 'none';
      errMsg.textContent = 'Please pick a date from today onwards 🙂';

      input.addEventListener('change', () => {
        if (input.value && input.value < todayStr) {
          input.value = '';
          errMsg.style.display = 'block';
          answers[q.id] = '';
        } else {
          errMsg.style.display = 'none';
          answers[q.id] = input.value;
        }
        updateLabel();
        saveAnswers();
        refreshNav();
      });

      // Clicking the label row also opens the picker
      labelRow.addEventListener('click', () => {
        try { input.showPicker(); } catch (e) { input.click(); }
      });

      updateLabel();
      wrapper.appendChild(input);
      wrapper.appendChild(errMsg);
      body.appendChild(wrapper);
    } else {
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = q.ph || '';
      input.value = answers[q.id] || '';
      input.addEventListener('input', () => { answers[q.id] = input.value; saveAnswers(); refreshNav(); });
      body.appendChild(input);
    }
  }

  else if (q.type === 'textarea') {
    const ta = document.createElement('textarea');
    ta.rows = 5;
    ta.placeholder = q.ph || '';
    ta.value = answers[q.id] || '';
    ta.oninput = () => { answers[q.id] = ta.value; saveAnswers(); refreshNav(); };
    body.appendChild(ta);
  }

  const navHolder = document.createElement('div');
  panel.appendChild(navHolder);

  function hasAnswer() {
    const v = answers[q.id];
    if (q.type === 'checkbox' || q.type === 'chips') return v && v.length > 0;
    if (q.type === 'slider') return true;
    return v !== undefined && v !== null && String(v).trim() !== '';
  }
  function refreshNav() {
    navHolder.innerHTML = '';
    navHolder.appendChild(navRow({ showBack: current > 0, nextDisabled: !hasAnswer() }));
  }
  refreshNav();
  updateNextStateRef = refreshNav;

  return stage;
}

function renderFun() {
  const stage = document.createElement('div');
  stage.className = 'stage';
  const panel = document.createElement('div');
  panel.className = 'panel glass fade-up';
  panel.style.padding = 'clamp(28px,5vw,48px)';
  panel.innerHTML = `<div class="eyebrow" style="margin-bottom:8px;">just for fun</div>
  <h2 style="color:var(--plum); margin:0 0 26px 0; font-size:clamp(22px,4vw,28px);">A few lighter ones</h2>`;

  const grid = document.createElement('div');
  FUN.forEach(f => {
    const row = document.createElement('div');
    row.style.marginBottom = '18px';
    const label = document.createElement('div');
    label.style.fontSize = '13px'; label.style.color = 'var(--ink-soft)'; label.style.marginBottom = '8px';
    label.textContent = f.a + ' or ' + f.b + '?';
    row.appendChild(label);
    const pair = document.createElement('div');
    pair.style.display = 'flex'; pair.style.gap = '10px';
    [f.a, f.b].forEach(opt => {
      const chip = document.createElement('span');
      chip.className = 'chip' + (answers[f.id] === opt ? ' selected' : '');
      chip.style.flex = '1'; chip.style.textAlign = 'center'; chip.style.margin = '0';
      chip.textContent = opt;
      chip.onclick = () => {
        answers[f.id] = opt; saveAnswers();
        pair.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        refreshNav();
      };
      pair.appendChild(chip);
    });
    row.appendChild(pair);
    grid.appendChild(row);
  });
  panel.appendChild(grid);

  const navHolder = document.createElement('div');
  panel.appendChild(navHolder);
  function refreshNav() {
    navHolder.innerHTML = '';
    navHolder.appendChild(navRow({ showBack: true, nextLabel: 'See where we align' }));
  }
  refreshNav();

  stage.appendChild(panel);
  return stage;
}

function renderReveal() {
  const stage = document.createElement('div');
  stage.className = 'stage';
  const panel = document.createElement('div');
  panel.className = 'panel glass fade-up';
  panel.style.padding = 'clamp(28px,5vw,48px)';
  panel.innerHTML = `
    <div class="eyebrow" style="margin-bottom:8px;">a gentle reflection</div>
    <h2 style="color:var(--plum); margin:0 0 12px 0; font-size:clamp(22px,4vw,28px);">Here's a little of what you shared</h2>
    <p style="color:var(--ink-soft); line-height:1.7; margin:0 0 26px 0; font-size:14.5px;">
      Each bar reflects how much you shared in that area — the more you opened up, the fuller it appears.
    </p>
  `;
  const list = document.createElement('div');
  REVEAL_AREAS.forEach(area => {
    const filled = area.pct(answers);
    const row = document.createElement('div');
    row.className = 'reveal-row';
    row.innerHTML = `
      <div style="width:150px; font-size:14px; color:var(--plum); font-weight:600; flex-shrink:0;">${area.label}</div>
      <div class="reveal-bar-track"><div class="reveal-bar-fill" data-w="${filled}"></div></div>
      <div style="width:38px; text-align:right; font-size:13px; color:var(--ink-soft); font-weight:600; flex-shrink:0;">${filled}%</div>
    `;
    list.appendChild(row);
  });
  panel.appendChild(list);
  const navHolder = document.createElement('div');
  panel.appendChild(navHolder);
  navHolder.appendChild(navRow({ showBack: true, nextLabel: 'Continue' }));
  stage.appendChild(panel);
  return stage;
}

function activateReveal(stage) {
  setTimeout(() => {
    stage.querySelectorAll('.reveal-bar-fill').forEach(el => {
      el.style.width = el.dataset.w + '%';
    });
  }, 350);
}

function renderLetter() {
  const stage = document.createElement('div');
  stage.className = 'stage';
  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.style.textAlign = 'center';

  const env = document.createElement('div');
  env.className = 'envelope';
  env.innerHTML = `
    <div class="env-body"></div>
    <div class="env-flap"></div>
    <div class="env-seal">✉</div>
  `;
  const hint = document.createElement('div');
  hint.className = 'env-hint';
  hint.textContent = 'tap the envelope';

  const letterWrap = document.createElement('div');
  letterWrap.className = 'hide';
  letterWrap.style.marginTop = '30px';
  const lines = [
    "Thank you.",
    "I know this was unusual.",
    "I wasn't trying to impress you.",
    "I simply wanted to understand you better.",
    "I believe genuine conversations are more meaningful than perfect first impressions.",
    "No matter what you decide, I truly appreciate your honesty.",
    "Thank you for giving this a chance."
  ];
  const paper = document.createElement('div');
  paper.className = 'letter-paper';
  lines.forEach(l => {
    const p = document.createElement('p');
    p.textContent = l;
    paper.appendChild(p);
  });
  letterWrap.appendChild(paper);

  const navHolder = document.createElement('div');
  navHolder.className = 'hide';
  navHolder.style.marginTop = '28px';
  navHolder.style.maxWidth = '560px';
  navHolder.style.marginLeft = 'auto'; navHolder.style.marginRight = 'auto';
  navHolder.appendChild(navRow({ showBack: false, nextLabel: 'Continue' }));

  env.onclick = () => {
    if (env.classList.contains('open')) return;
    env.classList.add('open');
    hint.style.opacity = '0';
    setTimeout(() => {
      letterWrap.classList.remove('hide');
      navHolder.classList.remove('hide');
      const ps = paper.querySelectorAll('p');
      ps.forEach((p, i) => setTimeout(() => p.classList.add('in'), 200 + i * 450));
    }, 500);
  };

  panel.appendChild(env);
  panel.appendChild(hint);
  panel.appendChild(letterWrap);
  panel.appendChild(navHolder);
  stage.appendChild(panel);
  return stage;
}

function buildSummaryText() {
  let out = "What she shared:\n\n";
  const allQ = [...QUESTIONS, ...QUESTIONS2];
  allQ.forEach(q => {
    const v = answers[q.id];
    if (v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) return;
    out += "• " + q.q + "\n   " + (Array.isArray(v) ? v.join(', ') : v) + "\n\n";
  });
  FUN.forEach(f => {
    if (answers[f.id]) out += "• " + f.a + " or " + f.b + " → " + answers[f.id] + "\n";
  });
  return out;
}

function renderFinal() {
  const stage = document.createElement('div');
  stage.className = 'stage';
  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.style.textAlign = 'center';
  panel.innerHTML = `
    <p class="fade-up story-line" style="display:block;">Whatever happens from here&hellip;</p>
    <p class="fade-up story-line" style="display:block;">I'm glad we got to know each other a little better.</p>
    <p class="fade-up story-line" style="display:block;">Some journeys begin with a single conversation.</p>
  `;

  const askBack = document.createElement('div');
  askBack.className = 'glass fade-up';
  askBack.style.padding = 'clamp(24px,4vw,36px)';
  askBack.style.marginTop = '30px';
  askBack.style.textAlign = 'left';
  askBack.innerHTML = `
    <div class="eyebrow" style="margin-bottom:10px;">your turn, if you'd like</div>
    <h3 style="color:var(--plum); margin:0 0 10px 0; font-size:clamp(18px,3vw,22px);">Is there anything you'd like to ask me?</h3>
    <p style="color:var(--ink-soft); font-size:14px; line-height:1.7; margin:0 0 18px 0;">
      About my goals, my family, my career, the New Zealand plans — anything at all. This space works both ways.
    </p>
  `;
  const ta = document.createElement('textarea');
  ta.rows = 4;
  ta.placeholder = "Write anything you'd like to ask…";
  ta.value = answers['questionsForHim'] || '';
  ta.oninput = () => { answers['questionsForHim'] = ta.value; saveAnswers(); };
  askBack.appendChild(ta);

  const btnRow = document.createElement('div');
  btnRow.style.marginTop = '20px';
  btnRow.style.display = 'flex';
  btnRow.style.gap = '12px';
  btnRow.style.flexWrap = 'wrap';

  const copyBtn = document.createElement('button');
  copyBtn.className = 'btn btn-ghost btn-sm';
  copyBtn.innerHTML = '<span>Copy a summary of my answers</span>';
  copyBtn.onclick = () => {
    const text = buildSummaryText() + (answers['questionsForHim'] ? "\n\nQuestions for you:\n" + answers['questionsForHim'] : '');
    navigator.clipboard?.writeText(text).then(() => {
      copyBtn.innerHTML = '<span>Copied ✓</span>';
      setTimeout(() => copyBtn.innerHTML = '<span>Copy a summary of my answers</span>', 2200);
    }).catch(() => {
      alert(text);
    });
  };
  btnRow.appendChild(copyBtn);
  askBack.appendChild(btnRow);

  panel.appendChild(askBack);

  // A clear visual cue pointing at the final submit action
  const submitCue = document.createElement('div');
  submitCue.className = 'submit-cue fade-up';
  submitCue.innerHTML = `
    <span class="submit-cue-arrow" aria-hidden="true">↓</span>
    <span class="submit-cue-text">You're all done — tap below to submit</span>
    <span class="submit-cue-arrow" aria-hidden="true">↓</span>
  `;
  panel.appendChild(submitCue);

  const thanks = document.createElement('button');
  thanks.className = 'btn btn-cta fade-up';
  thanks.id = 'main-submit-btn';
  thanks.style.marginTop = '14px';
  thanks.innerHTML = '<span>Submit Responses</span><span aria-hidden="true">✨</span>';

  function doSubmit() {
    // Capture the latest value straight from the textarea we created above
    // (a direct reference, not a generic document-wide query) so it's never
    // possible to grab the wrong element or miss an unsaved keystroke.
    answers['questionsForHim'] = ta.value;
    saveAnswers();

    spawnSparkle();
    [thanks, ...document.querySelectorAll('.sticky-submit-bar .btn')].forEach(b => {
      b.innerHTML = '<span>✨ Sent successfully</span>';
      b.style.pointerEvents = 'none';
    });
    removeStickyFooter();

    // Send answers — this includes questionsForHim from answers object
    submitted = false;
    submitToSheet();

    setTimeout(() => {
      next();
    }, 1000);
  }
  thanks.onclick = doSubmit;
  panel.appendChild(thanks);

  stage.appendChild(panel);

  // Sticky footer so the submit action stays reachable on long forms,
  // especially on mobile where the button may sit below the fold.
  let footer = null;
  function removeStickyFooter() {
    if (footer) { footer.remove(); footer = null; }
    window.removeEventListener('scroll', updateFooterVisibility);
  }
  function updateFooterVisibility() {
    const btnRect = thanks.getBoundingClientRect();
    const isVisible = btnRect.top < window.innerHeight && btnRect.bottom > 0;
    if (footer) footer.classList.toggle('show', !isVisible);
  }
  footer = document.createElement('div');
  footer.className = 'sticky-submit-bar';
  footer.innerHTML = `
    <div class="sticky-submit-bar-inner">
      <span class="sticky-submit-label">Ready to send your answers?</span>
      <button class="btn btn-cta btn-sm"><span>Submit</span><span aria-hidden="true">✨</span></button>
    </div>
  `;
  footer.querySelector('button').onclick = doSubmit;
  document.body.appendChild(footer);
  window.addEventListener('scroll', updateFooterVisibility, { passive: true });
  updateFooterVisibility();
  window._stickyFooterCleanup = removeStickyFooter;

  return stage;
}

function renderSuccess() {
  const stage = document.createElement('div');
  stage.className = 'stage';
  const panel = document.createElement('div');
  panel.className = 'panel glass fade-up';
  panel.style.textAlign = 'center';
  panel.style.padding = 'clamp(32px,6vw,54px)';
  panel.innerHTML = `
    <div style="font-size: 64px; margin-bottom: 20px; animation: pulse 1.5s infinite alternate;">💌</div>
    <h1 style="color:var(--plum); font-size:clamp(26px,5vw,42px); margin:0 0 16px 0; font-family:'Fraunces',serif; font-style:italic;">
      Responses Saved!
    </h1>
    <p style="color:var(--ink-soft); font-size:16px; line-height:1.7; max-width:440px; margin:0 auto 28px auto;">
      Thank you so much for taking the time to share your honest thoughts. Everything has been safely saved.
    </p>
    <div style="border-top:1px dashed rgba(91,44,111,0.15); margin:24px 0; padding-top:20px;">
      <p style="font-size:13px; color:var(--ink-soft); font-style:italic;">
        You can now close this tab, or look back at the summary.
      </p>
    </div>
    <button class="btn btn-ghost" id="success-back-btn"><span>Review Answers</span></button>
  `;
  panel.querySelector('#success-back-btn').onclick = () => {
    goTo(SCREENS.findIndex(s => s.type === 'final'));
  };
  stage.appendChild(panel);
  return stage;
}

function runConfetti() {
  const canvas = document.createElement('canvas');
  canvas.id = 'success-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const colors = ['#5B4A63', '#D98B6C', '#F3E7DA', '#C9A26A', '#E3DCF0', '#F4B8A0'];
  const particles = [];

  for (let i = 0; i < 120; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height - height,
      r: 4 + Math.random() * 5,
      d: Math.random() * width,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.07 + 0.02,
      tiltAngle: 0
    });
  }

  const fireworks = [];
  function spawnFirework() {
    if (document.getElementById('success-canvas') === null) return;
    const startX = width * 0.2 + Math.random() * width * 0.6;
    const startY = height;
    const targetY = height * 0.1 + Math.random() * height * 0.4;
    const color = colors[Math.floor(Math.random() * colors.length)];
    fireworks.push({
      x: startX,
      y: startY,
      targetY: targetY,
      color: color,
      speed: 7 + Math.random() * 4,
      exploded: false,
      sparks: []
    });
  }

  for (let i = 0; i < 3; i++) {
    setTimeout(spawnFirework, i * 600);
  }
  const fwInterval = setInterval(spawnFirework, 1400);

  function draw() {
    if (document.getElementById('success-canvas') === null) return;
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p, idx) => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
      p.x += Math.sin(p.tiltAngle);
      p.tilt = Math.sin(p.tiltAngle - idx / 3) * 12;

      if (p.y > height) {
        p.x = Math.random() * width;
        p.y = -20;
        p.tilt = Math.random() * 10 - 5;
      }

      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.stroke();
    });

    fireworks.forEach((fw) => {
      if (!fw.exploded) {
        fw.y -= fw.speed;
        if (fw.y <= fw.targetY) {
          fw.exploded = true;
          for (let i = 0; i < 35; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 4.5;
            fw.sparks.push({
              x: fw.x,
              y: fw.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              alpha: 1,
              decay: 0.012 + Math.random() * 0.012
            });
          }
        } else {
          ctx.beginPath();
          ctx.arc(fw.x, fw.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = fw.color;
          ctx.fill();
        }
      } else {
        fw.sparks.forEach((s) => {
          s.x += s.vx;
          s.y += s.vy;
          s.vy += 0.04;
          s.alpha -= s.decay;

          if (s.alpha > 0) {
            ctx.beginPath();
            ctx.arc(s.x, s.y, 1.8, 0, Math.PI * 2);
            ctx.fillStyle = fw.color;
            ctx.globalAlpha = s.alpha;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        });
        fw.sparks = fw.sparks.filter(s => s.alpha > 0);
      }
    });

    for (let i = fireworks.length - 1; i >= 0; i--) {
      if (fireworks[i].exploded && fireworks[i].sparks.length === 0) {
        fireworks.splice(i, 1);
      }
    }

    requestAnimationFrame(draw);
  }

  draw();

  return () => {
    clearInterval(fwInterval);
    canvas.remove();
  };
}

/* ---------------------------------------------------------
   MAIN RENDER
--------------------------------------------------------- */
function render() {
  if (window._canvasCleanup) {
    window._canvasCleanup();
    window._canvasCleanup = null;
  }
  if (window._stickyFooterCleanup) {
    window._stickyFooterCleanup();
    window._stickyFooterCleanup = null;
  }
  app.innerHTML = '';
  const screen = SCREENS[current];
  let stage;
  if (screen.type === 'welcome') stage = renderWelcome();
  else if (screen.type === 'story') stage = renderStory(screen);
  else if (screen.type === 'question') stage = renderQuestion(screen.q);
  else if (screen.type === 'fun') stage = renderFun();
  else if (screen.type === 'reveal') stage = renderReveal();
  else if (screen.type === 'letter') stage = renderLetter();
  else if (screen.type === 'final') stage = renderFinal();
  else if (screen.type === 'success') stage = renderSuccess();
  app.appendChild(stage);
  fadeInChildren(stage);
  if (screen.type === 'story') activateStoryLines(stage);
  if (screen.type === 'reveal') activateReveal(stage);
  if (screen.type === 'success') {
    window._canvasCleanup = runConfetti();
  }
  maybeSpawnSparkle();
}

/* ---------------------------------------------------------
   AMBIENT FX
--------------------------------------------------------- */
function initParticles() {
  const wrap = document.getElementById('particles');
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = 2 + Math.random() * 4;
    p.style.width = size + 'px'; p.style.height = size + 'px';
    p.style.left = Math.random() * 100 + '%';
    p.style.bottom = '-20px';
    p.style.animationDuration = (14 + Math.random() * 14) + 's';
    p.style.animationDelay = (Math.random() * 14) + 's';
    wrap.appendChild(p);
  }
}
function initStars() {
  const wrap = document.getElementById('stars');
  for (let i = 0; i < 26; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 60 + '%';
    s.style.animationDelay = (Math.random() * 3.5) + 's';
    wrap.appendChild(s);
  }
}
document.addEventListener('mousemove', (e) => {
  const glow = document.getElementById('mouse-glow');
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduceMotion) {
  document.documentElement.style.setProperty('--motion', '0');
}

initParticles();
initStars();
render();
setProgress();
