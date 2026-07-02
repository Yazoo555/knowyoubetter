/**
 * ============================================================================
 *  QUESTIONNAIRE -> GOOGLE DOC
 *  Receives a JSON payload posted from the web app and appends a nicely
 *  formatted write-up of the answers to a Google Doc.
 *
 *  Deploying changes:
 *  Saving this file is NOT enough to update the live web app — Apps Script
 *  freezes a "Web app" deployment to whatever code existed when it was last
 *  deployed. After editing this file, go to Deploy > Manage deployments >
 *  (pencil icon) > New version, or the URL will keep serving old code.
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------

const CONFIG = {
  DOC_ID: '1T8uL1-YN56jA3--IgsTiDPxzdDjaGgEAhV87SDmgMzU',
  SECURITY_TOKEN: 'zfSODhzV2XodMrYxARvH1yF8CpnxPUze8ulM069eNod',
};

// Theme — aligned with the web app's palette (--plum, --ember).
const THEME = {
  fontHeading: 'Georgia',
  fontBody: 'Arial',
  plum: '#2C3E50',
  ember: '#2980B9',
  gray: '#7F8C8D',
  hairline: '#D7DEE2',
  calloutBg: '#F4F8FB',   // soft ember-tinted neutral
  highlightBg: '#FEF9E7', // soft gold tint
};

// Ordered list of the "core" questions, used to format Section 1 and to
// look up each answer by id in the posted payload.
// `long: true` renders the answer in a bordered callout instead of a plain line.
// `note: true` means this question also has an optional "<id>Note" free-text
// field from the front end, which — if present — is appended as a sub-line.
const QUESTIONS_LIST = [
  { id: 'feeling', q: 'How are you honestly feeling about all of this?', note: true },
  { id: 'impression', q: 'What was your first impression of me?', note: true },
  { id: 'firstMeeting', q: 'What do you think our first meeting felt like?', note: true },
  { id: 'archInspiration', q: 'As an architect, which style of space do you feel most drawn to?', note: true },
  { id: 'archDream', q: 'If you could design any building — no budget, no limits — what would it be and why?', long: true },
  { id: 'messageComfort', q: 'How comfortable are you chatting over messages?', note: true },
  { id: 'communication', q: 'What kind of communication do you enjoy?', note: true },
  { id: 'qualities', q: 'What qualities matter most to you?', note: true },
  { id: 'birthday', q: 'When is your special day?' },
  { id: 'career', q: 'What does your career path look like right now?', note: true },
  { id: 'living', q: 'Where would you imagine settling down?', note: true },
  { id: 'worries', q: 'What worries you the most about an arranged marriage?', long: true },
  { id: 'emotionalSafety', q: 'What makes someone feel emotionally safe for you?', long: true },
];
// Note: "dreams", "fiveYears", "travel", and "hopedRelationship" were removed —
// the front end no longer asks these. "archInspiration", "archDream", and
// "birthday" were added to match the front end's current question set, and
// `note: true` was added once the front end gained optional free-text add-ons
// on choice/slider/checkbox/chips questions.

const FUN_QUESTIONS = [
  { id: 'fun1', a: 'Tea', b: 'Coffee' },
  { id: 'fun2', a: 'Mountains', b: 'Beaches' },
  { id: 'fun3', a: 'Cats', b: 'Dogs' },
  { id: 'fun4', a: 'Morning', b: 'Night' },
  { id: 'fun5', a: 'Books', b: 'Movies' },
  { id: 'fun6', a: 'Stay Home', b: 'Travel' },
  { id: 'fun7', a: 'Rain', b: 'Sunshine' },
  { id: 'fun8', a: 'Cooking together', b: 'Eating outside' },
];

// ---------------------------------------------------------------------------
// ENTRY POINT
// ---------------------------------------------------------------------------

/**
 * Handles the POST from the web app and writes the submission to the Doc.
 * Each section is written defensively (its own try/catch) so that a problem
 * formatting one part (e.g. the "fun preferences" table) can never prevent
 * the rest of the response — especially the open-ended "Questions for You"
 * answer — from being saved.
 */
function doPost(e) {
  try {
    const data = parseRequestBody_(e);

    if (!isAuthorized_(data)) {
      return textResponse_('Unauthorized');
    }

    const doc = DocumentApp.openById(CONFIG.DOC_ID);
    const body = doc.getBody();

    if (body.getText().trim() !== '') {
      body.appendPageBreak();
    }

    appendTitleBlock_(body, data);

    // Section 1 — the main Q&A, always attempted first.
    safely_('core responses', () => appendCoreResponsesSection_(body, data));

    // Section 2 — the open-ended reply to "Is there anything you'd like to
    // ask me?". This is written right after the core answers (deliberately
    // ahead of the purely decorative fun-preferences table below) so a bug
    // in that lower-priority section can never cause this one to be skipped.
    safely_('questions for you', () => appendQuestionsForYouSection_(body, data));

    // Section 3 — light, decorative "this or that" preferences table.
    safely_('fun preferences', () => appendFunPreferencesSection_(body, data));

    doc.saveAndClose();
    return textResponse_('Success');
  } catch (err) {
    Logger.log('doPost error: ' + err.toString());
    return textResponse_('Error: ' + err.toString());
  }
}

// ---------------------------------------------------------------------------
// REQUEST HELPERS
// ---------------------------------------------------------------------------

function parseRequestBody_(e) {
  return JSON.parse(e.postData.contents);
}

function isAuthorized_(data) {
  const token = CONFIG.SECURITY_TOKEN;
  if (!token || token === 'CHANGE_THIS_TO_A_SECRET_KEY') return true;
  return data.authToken === token;
}

function textResponse_(text) {
  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Runs `fn`, logging (but not throwing) any error, so a failure in one
 * section never stops the rest of doPost from running.
 */
function safely_(label, fn) {
  try {
    fn();
  } catch (err) {
    Logger.log('Failed to write section "' + label + '": ' + err.toString());
  }
}

// ---------------------------------------------------------------------------
// DOCUMENT SECTIONS
// ---------------------------------------------------------------------------

function appendTitleBlock_(body, data) {
  const timestamp = data.submittedAt
    ? new Date(data.submittedAt).toLocaleString('en-US', { hour12: true })
    : new Date().toLocaleString();

  body.appendParagraph('Questionnaire Response')
    .setFontFamily(THEME.fontHeading)
    .setFontSize(22)
    .setBold(true)
    .setForegroundColor(THEME.plum)
    .setSpacingBefore(12)
    .setSpacingAfter(4);

  body.appendParagraph('Submitted ' + timestamp)
    .setFontFamily(THEME.fontBody)
    .setFontSize(9.5)
    .setItalic(true)
    .setForegroundColor(THEME.gray)
    .setSpacingAfter(6);

  appendDivider_(body, THEME.hairline, 16);
}

function appendCoreResponsesSection_(body, data) {
  appendSectionLabel_(body, 'Core Responses');

  QUESTIONS_LIST.forEach(item => {
    const val = data[item.id];
    if (isEmptyValue_(val)) return;

    const qPara = body.appendParagraph(item.q);
    qPara.setFontFamily(THEME.fontBody)
      .setFontSize(10.5)
      .setBold(true)
      .setForegroundColor(THEME.ember)
      .setSpacingBefore(10)
      .setSpacingAfter(4);
    qPara.setLineSpacing(1.15);

    const answerText = formatValue_(val);

    if (item.long) {
      appendCallout_(body, answerText, THEME.calloutBg);
    } else {
      const aPara = body.appendParagraph(answerText);
      aPara.setFontFamily(THEME.fontHeading)
        .setFontSize(11.5)
        .setItalic(true)
        .setForegroundColor('#333333')
        .setIndentStart(14)
        .setSpacingAfter(item.note ? 2 : 6);
      aPara.setLineSpacing(1.25);
    }

    // Optional free-text add-on captured alongside choice/slider/checkbox/
    // chips questions (front end stores it under "<id>Note").
    if (item.note) {
      const noteVal = data[item.id + 'Note'];
      if (!isEmptyValue_(noteVal)) {
        const notePara = body.appendParagraph(formatValue_(noteVal));
        notePara.setFontFamily(THEME.fontBody)
          .setFontSize(10)
          .setItalic(true)
          .setForegroundColor(THEME.gray)
          .setIndentStart(14)
          .setSpacingAfter(6);
        notePara.setLineSpacing(1.2);
      }
    }
  });
}

function appendQuestionsForYouSection_(body, data) {
  const question = String(data.questionsForHim || '').trim();
  if (question === '') return;

  appendSectionLabel_(body, 'Questions for You', 22);
  appendCallout_(body, question, THEME.highlightBg, /* bold */ true);
}

function appendFunPreferencesSection_(body, data) {
  const rows = FUN_QUESTIONS
    .map(f => [f.a + ' vs ' + f.b, data[f.id]])
    .filter(row => !isEmptyValue_(row[1]));

  if (rows.length === 0) return;

  appendSectionLabel_(body, 'Quick Preferences', 22);

  const table = body.appendTable(rows);
  table.setBorderColor(THEME.hairline);
  table.setBorderWidth(0.75);

  for (let r = 0; r < table.getNumberOfRows(); r++) {
    const row = table.getRow(r);
    const rowBg = r % 2 === 0 ? '#FFFFFF' : '#FAFBFC';

    const promptCell = row.getCell(0);
    promptCell.setPaddingLeft(12).setPaddingTop(6).setPaddingBottom(6);
    promptCell.setBackgroundColor(rowBg);
    promptCell.getChild(0).asParagraph()
      .setFontFamily(THEME.fontBody).setFontSize(10).setForegroundColor('#333333');

    const answerCell = row.getCell(1);
    answerCell.setPaddingLeft(12).setPaddingTop(6).setPaddingBottom(6);
    answerCell.setBackgroundColor(rowBg);
    answerCell.getChild(0).asParagraph()
      .setFontFamily(THEME.fontHeading).setFontSize(10.5).setBold(true).setForegroundColor(THEME.ember);
  }

  body.appendParagraph('').setFontSize(2).setSpacingAfter(10);
}

// ---------------------------------------------------------------------------
// VALUE HELPERS
// ---------------------------------------------------------------------------

function isEmptyValue_(val) {
  if (val === undefined || val === null) return true;
  if (Array.isArray(val)) return val.length === 0;
  return String(val).trim() === '';
}

function formatValue_(val) {
  return Array.isArray(val) ? val.join(', ') : String(val);
}

// ---------------------------------------------------------------------------
// FORMATTING HELPERS
// ---------------------------------------------------------------------------

/** Small-caps-style section label with a colored rule beneath it. */
function appendSectionLabel_(body, text, spacingBefore) {
  body.appendParagraph(text.toUpperCase())
    .setFontFamily(THEME.fontBody)
    .setFontSize(11)
    .setBold(true)
    .setForegroundColor(THEME.plum)
    .setSpacingBefore(spacingBefore || 4)
    .setSpacingAfter(2);

  appendDivider_(body, THEME.hairline, 10);
}

/** Thin horizontal rule, simulated with a colored unicode line since
 *  DocumentApp doesn't expose paragraph borders directly. */
function appendDivider_(body, color, spacingAfter) {
  const p = body.appendParagraph('────────────────────────────────────────');
  p.editAsText().setForegroundColor(color).setFontSize(7);
  p.setSpacingBefore(0).setSpacingAfter(spacingAfter || 10);
}

/** Bordered "card" callout used for longer, more reflective answers. */
function appendCallout_(body, text, bgColor, bold) {
  const table = body.appendTable([['']]);
  table.setBorderColor(THEME.hairline);
  table.setBorderWidth(0.75);

  const cell = table.getRow(0).getCell(0);
  cell.setBackgroundColor(bgColor);
  cell.setPaddingLeft(14).setPaddingRight(14).setPaddingTop(10).setPaddingBottom(10);

  const p = cell.getChild(0).asParagraph();
  p.setText(text);
  p.setFontFamily(THEME.fontHeading)
    .setFontSize(11)
    .setItalic(true)
    .setBold(!!bold)
    .setForegroundColor('#333333');
  p.setLineSpacing(1.3);

  body.appendParagraph('').setFontSize(2).setSpacingAfter(8);
}
