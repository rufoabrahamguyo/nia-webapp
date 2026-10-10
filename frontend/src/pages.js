function sectionToDraft(section) {
  return {
    title: section.title || "",
    body: section.body || "",
    pointsText: (section.points || []).join("\n"),
    actionId: section.action?.id || "",
    actionAnchor: section.action?.anchor || "",
    actionLabel: section.action?.label || "",
  };
}

function sectionToPayload(section) {
  const payload = {
    title: section.title.trim(),
    body: section.body.trim(),
    points: section.pointsText.split("\n").map((point) => point.trim()).filter(Boolean),
  };
  if (section.actionId && section.actionLabel.trim()) {
    payload.action = {
      id: section.actionId,
      anchor: section.actionAnchor.trim(),
      label: section.actionLabel.trim(),
    };
  }
  return payload;
}

export function screenToDraft(screen) {
  return {
    title: screen.title || "",
    body: screen.body || "",
    sectionsTitle: screen.sectionsTitle || "",
    sectionsLede: screen.sectionsLede || "",
    sections: (screen.sections || []).filter((section) => !section.guestOnly).map(sectionToDraft),
    guideTitle: screen.guide?.title || "",
    guideLede: screen.guide?.lede || "",
    guideSections: (screen.guide?.sections || []).map(sectionToDraft),
  };
}

export function draftToPayload(draft) {
  return {
    title: draft.title.trim(),
    body: draft.body.trim(),
    sectionsTitle: draft.sectionsTitle.trim(),
    sectionsLede: draft.sectionsLede.trim(),
    sections: draft.sections.map(sectionToPayload),
    guideTitle: draft.guideTitle.trim(),
    guideLede: draft.guideLede.trim(),
    guideSections: draft.guideSections.map(sectionToPayload),
  };
}

export function storedToDraft(page) {
  return {
    title: page.title || "",
    body: page.body || "",
    sectionsTitle: page.sectionsTitle || "",
    sectionsLede: page.sectionsLede || "",
    sections: (page.sections || []).map(sectionToDraft),
    guideTitle: page.guideTitle || "",
    guideLede: page.guideLede || "",
    guideSections: (page.guideSections || []).map(sectionToDraft),
  };
}

function sectionForScreen(section) {
  const next = {
    title: section.title,
    body: section.body,
  };
  if (section.points?.length) next.points = section.points;
  if (section.action?.id) next.action = section.action;
  return next;
}

export function applyPage(screen, page) {
  if (!screen || !page) return screen;
  const next = {
    ...screen,
    title: page.title,
    body: page.body,
    sectionsTitle: page.sectionsTitle,
    sectionsLede: page.sectionsLede,
    sections: (page.sections || []).map(sectionForScreen),
  };
  if (page.guideTitle) {
    next.guide = {
      title: page.guideTitle,
      lede: page.guideLede,
      sections: (page.guideSections || []).map(sectionForScreen),
    };
  }
  return next;
}
