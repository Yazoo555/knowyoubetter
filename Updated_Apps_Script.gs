const DOC_ID = "1T8uL1-YN56jA3--IgsTiDPxzdDjaGgEAhV87SDmgMzU";
const SECURITY_TOKEN = "zfSODhzV2XodMrYxARvH1yF8CpnxPUze8ulM069eNod";

// Ordered questions list to format the output nicely
const QUESTIONS_LIST = [
  { id: "feeling", q: "How are you honestly feeling about all of this?" },
  { id: "impression", q: "What was your first impression of me?" },
  { id: "firstMeeting", q: "What do you think our first meeting felt like?" },
  { id: "archInspiration", q: "As an architect, which style of space do you feel most drawn to?" },
  { id: "archDream", q: "If you could design any building — no budget, no limits — what would it be and why?", long: true },
  { id: "messageComfort", q: "How comfortable are you chatting over messages?" },
  { id: "communication", q: "What kind of communication do you enjoy?" },
  { id: "qualities", q: "What qualities matter most to you?" },
  { id: "birthday", q: "When is your special day?" },
  { id: "career", q: "What does your career path look like right now?" },
  { id: "living", q: "Where would you imagine settling down?" },
  { id: "worries", q: "What worries you the most about an arranged marriage?", long: true },
  { id: "emotionalSafety", q: "What makes someone feel emotionally safe for you?", long: true },
];
// Note: "dreams", "fiveYears", "travel", and "hopedRelationship" were removed from this list —
// the frontend no longer asks these questions. "archInspiration", "archDream", and "birthday"
// were added to match the frontend's current question set.

const FUN_QUESTIONS = [
  { id: 'fun1', a: 'Tea', b: 'Coffee' },
  { id: 'fun2', a: 'Mountains', b: 'Beaches' },
  { id: 'fun3', a: 'Cats', b: 'Dogs' },
  { id: 'fun4', a: 'Morning', b: 'Night' },
  { id: 'fun5', a: 'Books', b: 'Movies' },
  { id: 'fun6', a: 'Stay Home', b: 'Travel' },
  { id: 'fun7', a: 'Rain', b: 'Sunshine' },
  { id: 'fun8', a: 'Cooking together', b: 'Eating outside' }
];

// ---------------------------------------------------------
// THEME — aligned with the web app's actual palette
// (--plum: #2C3E50, --ember: #2980B9, --gold: #F1C40F)
// ---------------------------------------------------------
const THEME = {
  fontHeading: "Georgia",
  fontBody: "Arial",
  plum: "#2C3E50",
  ember: "#2980B9",
  gray: "#7F8C8D",
  hairline: "#D7DEE2",
  calloutBg: "#F4F8FB",   // soft ember-tinted neutral
  highlightBg: "#FEF9E7", // soft gold tint, unchanged
};

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    Logger.log("questionsForHim received: " + JSON.stringify(data.questionsForHim));

    // Security check
    if (SECURITY_TOKEN && SECURITY_TOKEN !== "CHANGE_THIS_TO_A_SECRET_KEY" && data.authToken !== SECURITY_TOKEN) {
      return ContentService.createTextOutput("Unauthorized").setMimeType(ContentService.MimeType.TEXT);
    }

    const doc = DocumentApp.openById(DOC_ID);
    const body = doc.getBody();

    // Append a clean page break if document is not empty
    if (body.getText().trim() !== "") {
      body.appendPageBreak();
    }

    // ---- Title block ----
    const timestamp = data.submittedAt
      ? new Date(data.submittedAt).toLocaleString('en-US', { hour12: true })
      : new Date().toLocaleString();

    const title = body.appendParagraph("Questionnaire Response");
    title.setFontFamily(THEME.fontHeading)
         .setFontSize(22)
         .setBold(true)
         .setForegroundColor(THEME.plum)
         .setSpacingBefore(12)
         .setSpacingAfter(4);

    const subtitle = body.appendParagraph("Submitted " + timestamp);
    subtitle.setFontFamily(THEME.fontBody)
            .setFontSize(9.5)
            .setItalic(true)
            .setForegroundColor(THEME.gray)
            .setSpacingAfter(6);

    appendDivider_(body, THEME.hairline, 16);

    // ---- Section 1: Core Responses ----
    appendSectionLabel_(body, "Core Responses");

    QUESTIONS_LIST.forEach(item => {
      const val = data[item.id];
      const isEmpty = val === undefined || val === "" ||
        (Array.isArray(val) && val.length === 0);
      if (isEmpty) return;

      const qPara = body.appendParagraph(item.q);
      qPara.setFontFamily(THEME.fontBody)
           .setFontSize(10.5)
           .setBold(true)
           .setForegroundColor(THEME.ember)
           .setSpacingBefore(10)
           .setSpacingAfter(4);
      qPara.setLineSpacing(1.15);

      const answerText = Array.isArray(val) ? val.join(", ") : val.toString();

      if (item.long) {
        appendCallout_(body, answerText, THEME.calloutBg);
      } else {
        const aPara = body.appendParagraph(answerText);
        aPara.setFontFamily(THEME.fontHeading)
             .setFontSize(11.5)
             .setItalic(true)
             .setForegroundColor("#333333")
             .setIndentStart(14)
             .setSpacingAfter(6);
        aPara.setLineSpacing(1.25);
      }
    });

    // ---- Section 2: Quick Preferences ----
    const funTableData = [];
    FUN_QUESTIONS.forEach(f => {
      const selectedVal = data[f.id];
      if (selectedVal) {
        funTableData.push([f.a + " vs " + f.b, selectedVal]);
      }
    });

    if (funTableData.length > 0) {
      appendSectionLabel_(body, "Quick Preferences", 22);

      const funTable = body.appendTable(funTableData);
      funTable.setBorderColor(THEME.hairline);
      funTable.setBorderWidth(0.75);

      for (let r = 0; r < funTable.getNumberOfRows(); r++) {
        const row = funTable.getRow(r);

        const cell0 = row.getCell(0);
        cell0.setPaddingLeft(12).setPaddingTop(6).setPaddingBottom(6);
        cell0.setBackgroundColor(r % 2 === 0 ? "#FFFFFF" : "#FAFBFC");
        const p0 = cell0.getChild(0).asParagraph();
        p0.setFontFamily(THEME.fontBody).setFontSize(10).setForegroundColor("#333333");

        const cell1 = row.getCell(1);
        cell1.setPaddingLeft(12).setPaddingTop(6).setPaddingBottom(6);
        cell1.setBackgroundColor(r % 2 === 0 ? "#FFFFFF" : "#FAFBFC");
        const p1 = cell1.getChild(0).asParagraph();
        p1.setFontFamily(THEME.fontHeading).setFontSize(10.5).setBold(true).setForegroundColor(THEME.ember);
      }

      body.appendParagraph("").setFontSize(2).setSpacingAfter(10);
    }

    // ---- Section 3: Questions for Him ----
    if (data.questionsForHim && data.questionsForHim.trim() !== "") {
      appendSectionLabel_(body, "Questions for You", 22);
      appendCallout_(body, data.questionsForHim, THEME.highlightBg, true);
    }

    doc.saveAndClose();
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}

// ---------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------

// Small-caps-style section label with a colored rule beneath it,
// used instead of emoji for a cleaner, more professional look.
function appendSectionLabel_(body, text, spacingBefore) {
  const label = body.appendParagraph(text.toUpperCase());
  label.setFontFamily(THEME.fontBody)
       .setFontSize(11)
       .setBold(true)
       .setForegroundColor(THEME.plum)
       .setSpacingBefore(spacingBefore || 4)
       .setSpacingAfter(2);

  appendDivider_(body, THEME.hairline, 10);
}

// Thin horizontal rule, simulated with a colored unicode line since
// DocumentApp's basic API doesn't expose paragraph borders directly.
function appendDivider_(body, color, spacingAfter) {
  const p = body.appendParagraph("────────────────────────────────────────");
  p.editAsText().setForegroundColor(color).setFontSize(7);
  p.setSpacingBefore(0).setSpacingAfter(spacingAfter || 10);
}

// Bordered "card" callout used for longer, more reflective answers.
function appendCallout_(body, text, bgColor, bold) {
  const table = body.appendTable([[""]]);
  table.setBorderColor(THEME.hairline);
  table.setBorderWidth(0.75);

  const cell = table.getRow(0).getCell(0);
  cell.setBackgroundColor(bgColor);
  cell.setPaddingLeft(14);
  cell.setPaddingRight(14);
  cell.setPaddingTop(10);
  cell.setPaddingBottom(10);

  const p = cell.getChild(0).asParagraph();
  p.setText(text);
  p.setFontFamily(THEME.fontHeading)
   .setFontSize(11)
   .setItalic(true)
   .setBold(!!bold)
   .setForegroundColor("#333333");
  p.setLineSpacing(1.3);

  body.appendParagraph("").setFontSize(2).setSpacingAfter(8);
}