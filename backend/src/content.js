const VIEWS = new Set(["home", "helplines", "learn", "rights", "document", "complicated"]);
const PAIR_LIMIT = 200;

export function cleanText(value, max) {
  const text = String(value || "").replace(/\u0000/g, "").trim();
  if (!text || text.length > max) return null;
  return text;
}

export function optionalText(value, max) {
  const text = String(value || "").replace(/\u0000/g, "").trim();
  if (text.length > max) return null;
  return text;
}

export function pair(value, max = PAIR_LIMIT) {
  const en = cleanText(value?.en, max);
  const sw = cleanText(value?.sw, max);
  if (!en || !sw) return null;
  return { en, sw };
}

export function httpsUrl(value) {
  const text = optionalText(value, 300);
  if (text == null) return null;
  if (!text) return "";
  try {
    const url = new URL(text);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function phoneList(value) {
  const source = Array.isArray(value) ? value : String(value || "").split(/[\n,]/);
  const numbers = [];
  for (const item of source) {
    const display = String(item || "").trim();
    if (!display) continue;
    const digits = display.replace(/[^\d+]/g, "");
    if (digits.length < 3 || digits.length > 16 || !/^\+?\d+$/.test(digits)) return null;
    numbers.push(display.slice(0, 24));
    if (numbers.length > 4) return null;
  }
  if (numbers.length === 0) return null;
  return numbers;
}

export function checkedDate(value) {
  const text = String(value || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const date = new Date(`${text}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function readAction(value) {
  if (!value || typeof value !== "object") return undefined;
  const id = String(value.id || "");
  const label = cleanText(value.label, 80);
  const anchor = String(value.anchor || "");
  if (!VIEWS.has(id) || !label) return undefined;
  if (anchor && !/^[a-z0-9-]{1,40}$/.test(anchor)) return undefined;
  return { id, label, anchor };
}

function readSection(value) {
  const title = cleanText(value?.title, 200);
  const body = optionalText(value?.body, 8000);
  if (!title || body == null) return null;
  const source = Array.isArray(value?.points) ? value.points : [];
  if (source.length > 12) return null;
  const points = [];
  for (const point of source) {
    const text = cleanText(point, 500);
    if (!text) return null;
    points.push(text);
  }
  const section = { title, body, points };
  const action = readAction(value?.action);
  if (action) section.action = action;
  return section;
}

function readSections(value, max) {
  const source = Array.isArray(value) ? value : [];
  if (source.length > max) return null;
  const sections = [];
  for (const item of source) {
    const section = readSection(item);
    if (!section) return null;
    sections.push(section);
  }
  return sections;
}

export function readLocale(value, withGuide) {
  const title = cleanText(value?.title, 200);
  const body = cleanText(value?.body, 4000);
  const sectionsTitle = optionalText(value?.sectionsTitle, 200);
  const sectionsLede = optionalText(value?.sectionsLede, 500);
  const sections = readSections(value?.sections, 30);
  if (!title || !body || sectionsTitle == null || sectionsLede == null || !sections) return null;
  const locale = { title, body, sectionsTitle, sectionsLede, sections, guideTitle: "", guideLede: "", guideSections: [] };
  if (!withGuide) return locale;
  const guideTitle = optionalText(value?.guideTitle, 200);
  const guideLede = optionalText(value?.guideLede, 500);
  const guideSections = readSections(value?.guideSections, 20);
  if (guideTitle == null || guideLede == null || !guideSections) return null;
  if (guideTitle && guideSections.length === 0) return null;
  locale.guideTitle = guideTitle;
  locale.guideLede = guideLede;
  locale.guideSections = guideSections;
  return locale;
}

export function localeJson(locale) {
  return {
    title: locale.title,
    body: locale.body,
    sectionsTitle: locale.sectionsTitle,
    sectionsLede: locale.sectionsLede,
    sections: locale.sections.map(sectionJson),
    guideTitle: locale.guideTitle,
    guideLede: locale.guideLede,
    guideSections: (locale.guideSections || []).map(sectionJson),
  };
}

function sectionJson(section) {
  return {
    title: section.title,
    body: section.body,
    points: section.points || [],
    action: section.action?.id
      ? { id: section.action.id, anchor: section.action.anchor || "", label: section.action.label }
      : null,
  };
}
