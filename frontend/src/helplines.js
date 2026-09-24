const DIRECTORY = [
  {
    group: "now",
    name: { en: "Police", sw: "Polisi" },
    who: { en: "Emergency", sw: "Dharura" },
    actions: [
      { en: "Call 999", sw: "Piga 999", href: "tel:999" },
      { en: "Call 112", sw: "Piga 112", href: "tel:112" },
    ],
  },
  {
    group: "now",
    name: { en: "GBV helpline", sw: "Simu ya GBV" },
    who: { en: "National line · 24/7", sw: "Nambari ya kitaifa · saa 24" },
    actions: [{ en: "Call 1195", sw: "Piga 1195", href: "tel:1195" }],
  },
  {
    group: "now",
    name: { en: "Counselling", sw: "Ushauri" },
    who: { en: "one2one hotline", sw: "Simu ya one2one" },
    actions: [{ en: "Call 1190", sw: "Piga 1190", href: "tel:1190" }],
    site: { label: "one2onekenya.org", href: "https://one2onekenya.org" },
  },
  {
    group: "now",
    name: { en: "Child Helpline", sw: "Simu ya watoto" },
    who: { en: "Under 18 · 24/7", sw: "Chini ya miaka 18 · saa 24" },
    actions: [
      { en: "Call 116", sw: "Piga 116", href: "tel:116" },
      { en: "WhatsApp 0722 116 116", sw: "WhatsApp 0722 116 116", href: "https://wa.me/254722116116" },
    ],
    site: { label: "childlinekenya.co.ke", href: "https://childlinekenya.co.ke" },
  },
  {
    group: "now",
    name: { en: "UNHCR", sw: "UNHCR" },
    who: { en: "Toll-free help line", sw: "Simu ya bure" },
    actions: [{ en: "Call 1517", sw: "Piga 1517", href: "tel:1517" }],
    site: { label: "help.unhcr.org/kenya", href: "https://help.unhcr.org/kenya/" },
  },
  {
    group: "org",
    name: { en: "COVAW", sw: "COVAW" },
    who: { en: "Women · 24/7", sw: "Wanawake · saa 24" },
    actions: [
      { en: "Call 0800 720 553", sw: "Piga 0800 720 553", href: "tel:0800720553" },
      { en: "Text 0722 594 794", sw: "Ujumbe 0722 594 794", href: "sms:0722594794" },
      { en: "WhatsApp", sw: "WhatsApp", href: "https://wa.me/254722594794" },
    ],
    site: { label: "covaw.or.ke", href: "https://covaw.or.ke" },
  },
  {
    group: "org",
    name: { en: "AMANI Counselling", sw: "AMANI Counselling" },
    who: { en: "Telecounselling", sw: "Ushauri kwa simu" },
    actions: [{ en: "Call 0800 720 600", sw: "Piga 0800 720 600", href: "tel:0800720600" }],
  },
  {
    group: "org",
    name: { en: "LVCT", sw: "LVCT" },
    who: { en: "Toll-free counselling", sw: "Ushauri wa bure" },
    actions: [{ en: "Call 0800 720 121", sw: "Piga 0800 720 121", href: "tel:0800720121" }],
  },
  {
    group: "org",
    name: { en: "MSF", sw: "MSF" },
    who: { en: "Medical hotline", sw: "Simu ya matibabu" },
    actions: [{ en: "Call 0711 400 506", sw: "Piga 0711 400 506", href: "tel:0711400506" }],
  },
  {
    group: "org",
    name: { en: "HIAS", sw: "HIAS" },
    who: { en: "Support for survivors", sw: "Msaada kwa walionusurika" },
    actions: [
      { en: "Call 0770 451 236", sw: "Piga 0770 451 236", href: "tel:0770451236" },
      { en: "Call 0777 784 009", sw: "Piga 0777 784 009", href: "tel:0777784009" },
    ],
  },
  {
    group: "org",
    name: { en: "NCCK", sw: "NCCK" },
    who: { en: "Health coordination", sw: "Uratibu wa afya" },
    actions: [{ en: "Call 0704 873 342", sw: "Piga 0704 873 342", href: "tel:0704873342" }],
  },
  {
    group: "org",
    name: { en: "Center for Victims of Torture", sw: "Center for Victims of Torture" },
    who: { en: "Psychosocial support", sw: "Msaada wa kisaikolojia" },
    actions: [{ en: "Call 0790 781 359", sw: "Piga 0790 781 359", href: "tel:0790781359" }],
  },
  {
    group: "org",
    name: { en: "Befrienders Kenya", sw: "Befrienders Kenya" },
    who: { en: "If you are thinking about suicide", sw: "Ukiwa na mawazo ya kujiua" },
    actions: [
      { en: "Call 0722 178 177", sw: "Piga 0722 178 177", href: "tel:0722178177" },
      { en: "WhatsApp", sw: "WhatsApp", href: "https://wa.me/254722178177" },
    ],
  },
];

export function linesFor(language, group) {
  return DIRECTORY.filter((entry) => entry.group === group).map((entry) => ({
    name: entry.name[language],
    who: entry.who[language],
    actions: entry.actions.map((action) => ({
      label: action[language],
      href: action.href,
    })),
    site: entry.site,
  }));
}
