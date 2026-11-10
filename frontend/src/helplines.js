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
      { en: "Text 022 116 116", sw: "Ujumbe 022 116 116", href: "sms:022116116" },
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
    actions: [
      { en: "Call 0711 400 506", sw: "Piga 0711 400 506", href: "tel:0711400506" },
      { en: "Call 0800 721 100", sw: "Piga 0800 721 100", href: "tel:0800721100" },
    ],
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
  {
    group: "now",
    name: { en: "GBV helpline, men", sw: "Simu ya GBV, wanaume" },
    who: { en: "Toll-free", sw: "Simu ya bure" },
    actions: [{ en: "Call 1196", sw: "Piga 1196", href: "tel:1196" }],
  },
  {
    group: "now",
    name: { en: "Kenya Red Cross", sw: "Kenya Red Cross" },
    who: { en: "Toll-free", sw: "Simu ya bure" },
    actions: [{ en: "Call 1199", sw: "Piga 1199", href: "tel:1199" }],
  },
  {
    group: "org",
    name: { en: "Mater Hospital", sw: "Mater Hospital" },
    who: { en: "ISHTAR MSM", sw: "ISHTAR MSM" },
    actions: [
      { en: "Call 0726 856 853", sw: "Piga 0726 856 853", href: "tel:0726856853" },
      { en: "Call 0735 108 402", sw: "Piga 0735 108 402", href: "tel:0735108402" },
    ],
  },
  {
    group: "org",
    name: { en: "LOCO Hospital (Railways)", sw: "LOCO Hospital (Railways)" },
    who: { en: "ISHTAR MSM", sw: "ISHTAR MSM" },
    actions: [{ en: "Call 0726 856 853", sw: "Piga 0726 856 853", href: "tel:0726856853" }],
  },
  {
    group: "org",
    name: { en: "Casino Center (Nairobi)", sw: "Casino Center (Nairobi)" },
    who: { en: "ISHTAR MSM", sw: "ISHTAR MSM" },
    actions: [{ en: "Call 0726 856 853", sw: "Piga 0726 856 853", href: "tel:0726856853" }],
  },
  {
    group: "org",
    name: { en: "Ngara Hospital (Park Road)", sw: "Ngara Hospital (Park Road)" },
    who: { en: "ISHTAR MSM", sw: "ISHTAR MSM" },
    actions: [{ en: "Call 0726 856 853", sw: "Piga 0726 856 853", href: "tel:0726856853" }],
  },
  {
    group: "org",
    name: { en: "Kangemi Hospital", sw: "Kangemi Hospital" },
    who: { en: "Testing services · ISHTAR MSM", sw: "Huduma za upimaji · ISHTAR MSM" },
    actions: [{ en: "Call 0726 856 853", sw: "Piga 0726 856 853", href: "tel:0726856853" }],
  },
  {
    group: "org",
    name: { en: "Gender Affirming Care", sw: "Huduma ya uthibitisho wa jinsia" },
    who: { en: "ISHTAR MSM", sw: "ISHTAR MSM" },
    actions: [{ en: "Call 0726 856 853", sw: "Piga 0726 856 853", href: "tel:0726856853" }],
  },
  {
    group: "org",
    name: { en: "GVRC Nairobi", sw: "GVRC Nairobi" },
    who: { en: "NGLHRC", sw: "NGLHRC" },
    actions: [
      { en: "Call 0709 667 130", sw: "Piga 0709 667 130", href: "tel:0709667130" },
      { en: "Call +254 110 922 255", sw: "Piga +254 110 922 255", href: "tel:+254110922255" },
    ],
  },
  {
    group: "org",
    name: { en: "Trailer Park, Busia", sw: "Trailer Park, Busia" },
    who: { en: "OUTSTAR", sw: "OUTSTAR" },
    actions: [{ en: "Call +254 700 251 672", sw: "Piga +254 700 251 672", href: "tel:+254700251672" }],
  },
  {
    group: "org",
    name: { en: "Mathare Hospital", sw: "Mathare Hospital" },
    who: { en: "Hospital", sw: "Hospitali" },
    actions: [
      { en: "Call 0768 971 143", sw: "Piga 0768 971 143", href: "tel:0768971143" },
      { en: "Call 0780 503 231", sw: "Piga 0780 503 231", href: "tel:0780503231" },
    ],
  },
  {
    group: "org",
    name: { en: "Ngara Methadone Clinic", sw: "Ngara Methadone Clinic" },
    who: { en: "Methadone clinic", sw: "Kliniki ya methadone" },
    actions: [{ en: "Call 0780 505 694", sw: "Piga 0780 505 694", href: "tel:0780505694" }],
  },
  {
    group: "org",
    name: { en: "Karuri Health", sw: "Karuri Health" },
    who: { en: "Health centre", sw: "Kituo cha afya" },
    actions: [{ en: "Call 0793 268 681", sw: "Piga 0793 268 681", href: "tel:0793268681" }],
  },
  {
    group: "org",
    name: { en: "Mama Lucy Kibaki Hospital", sw: "Mama Lucy Kibaki Hospital" },
    who: { en: "Hospital", sw: "Hospitali" },
    actions: [{ en: "Call 0732 985 031", sw: "Piga 0732 985 031", href: "tel:0732985031" }],
  },
  {
    group: "org",
    name: { en: "Mbagathi Sub County Hospital", sw: "Mbagathi Sub County Hospital" },
    who: { en: "Hospital", sw: "Hospitali" },
    actions: [{ en: "Call 0721 311 808", sw: "Piga 0721 311 808", href: "tel:0721311808" }],
  },
  {
    group: "org",
    name: { en: "Coptic Hospital", sw: "Coptic Hospital" },
    who: { en: "Hospital", sw: "Hospitali" },
    actions: [{ en: "Call 0735 777 058", sw: "Piga 0735 777 058", href: "tel:0735777058" }],
  },
  {
    group: "org",
    name: { en: "Gender Violence Recovery Center", sw: "Gender Violence Recovery Center" },
    who: { en: "Recovery centre", sw: "Kituo cha nafuu" },
    actions: [{ en: "Call 0719 638 006", sw: "Piga 0719 638 006", href: "tel:0719638006" }],
  },
  {
    group: "org",
    name: { en: "Jinsiangu", sw: "Jinsiangu" },
    who: { en: "Toll-free helpline", sw: "Simu ya bure" },
    actions: [{ en: "Call 0800 720 955", sw: "Piga 0800 720 955", href: "tel:0800720955" }],
  },
  {
    group: "org",
    name: { en: "CREAW", sw: "CREAW" },
    who: { en: "Rights education", sw: "Elimu ya haki" },
    actions: [
      { en: "Call 020 386 1016", sw: "Piga 020 386 1016", href: "tel:0203861016" },
      { en: "Call 0720 357 664", sw: "Piga 0720 357 664", href: "tel:0720357664" },
    ],
  },
  {
    group: "org",
    name: { en: "Q-Initiative", sw: "Q-Initiative" },
    who: { en: "Support", sw: "Msaada" },
    actions: [{ en: "Call 0715 847 056", sw: "Piga 0715 847 056", href: "tel:0715847056" }],
  },
  {
    group: "org",
    name: { en: "GALCK", sw: "GALCK" },
    who: { en: "Support", sw: "Msaada" },
    actions: [
      { en: "Call 0758 950 322", sw: "Piga 0758 950 322", href: "tel:0758950322" },
      { en: "Call 0795 095 956", sw: "Piga 0795 095 956", href: "tel:0795095956" },
      { en: "Call 0717 580 245", sw: "Piga 0717 580 245", href: "tel:0717580245" },
    ],
  },
  {
    group: "org",
    name: { en: "ISHTAR", sw: "ISHTAR" },
    who: { en: "Counselling", sw: "Ushauri" },
    actions: [{ en: "Call 0726 812 498", sw: "Piga 0726 812 498", href: "tel:0726812498" }],
  },
  {
    group: "org",
    name: { en: "Wangu Kanja Foundation", sw: "Wangu Kanja Foundation" },
    who: { en: "Text Help to 21094", sw: "Tuma Help kwenda 21094" },
    actions: [
      { en: "Call +254 722 790 404", sw: "Piga +254 722 790 404", href: "tel:+254722790404" },
      { en: "Call +254 774 746 699", sw: "Piga +254 774 746 699", href: "tel:+254774746699" },
      { en: "Text 21094", sw: "Ujumbe 21094", href: "sms:21094" },
    ],
  },
  {
    group: "org",
    name: { en: "Centre for Domestic Training and Development", sw: "Centre for Domestic Training and Development" },
    who: { en: "Support", sw: "Msaada" },
    actions: [
      { en: "Call +254 20 608 085", sw: "Piga +254 20 608 085", href: "tel:+25420608085" },
      { en: "Call +254 725 377 819", sw: "Piga +254 725 377 819", href: "tel:+254725377819" },
    ],
  },
  {
    group: "org",
    name: { en: "Kenya Women Wellness and Children Center", sw: "Kenya Women Wellness and Children Center" },
    who: { en: "Support", sw: "Msaada" },
    actions: [{ en: "Call 0730 976 000", sw: "Piga 0730 976 000", href: "tel:0730976000" }],
  },
  {
    group: "org",
    name: { en: "NGLHRC", sw: "NGLHRC" },
    who: { en: "Legal aid", sw: "Msaada wa kisheria" },
    actions: [
      { en: "Call 0700 010 743", sw: "Piga 0700 010 743", href: "tel:0700010743" },
      { en: "Call 0700 010 637", sw: "Piga 0700 010 637", href: "tel:0700010637" },
      { en: "Call 0700 010 574", sw: "Piga 0700 010 574", href: "tel:0700010574" },
    ],
  },
  {
    group: "org",
    name: { en: "BHESP", sw: "BHESP" },
    who: { en: "Legal aid", sw: "Msaada wa kisheria" },
    actions: [{ en: "Call 0742 444 781", sw: "Piga 0742 444 781", href: "tel:0742444781" }],
  },
  {
    group: "org",
    name: { en: "Trans Alliance", sw: "Trans Alliance" },
    who: { en: "Legal aid", sw: "Msaada wa kisheria" },
    actions: [{ en: "Call 0710 632 755", sw: "Piga 0710 632 755", href: "tel:0710632755" }],
  },
  {
    group: "org",
    name: { en: "Legal Resources Foundation", sw: "Legal Resources Foundation" },
    who: { en: "Legal aid", sw: "Msaada wa kisheria" },
    actions: [
      { en: "Call 0724 244 849", sw: "Piga 0724 244 849", href: "tel:0724244849" },
      { en: "Call 0722 209 822", sw: "Piga 0722 209 822", href: "tel:0722209822" },
    ],
  },
  {
    group: "org",
    name: { en: "Kituo Cha Sheria", sw: "Kituo Cha Sheria" },
    who: { en: "Legal aid", sw: "Msaada wa kisheria" },
    actions: [{ en: "Call 0784 651 635", sw: "Piga 0784 651 635", href: "tel:0784651635" }],
  },
  {
    group: "org",
    name: { en: "Defenders Coalition", sw: "Defenders Coalition" },
    who: { en: "Legal aid", sw: "Msaada wa kisheria" },
    actions: [
      { en: "Call +254 716 200 100", sw: "Piga +254 716 200 100", href: "tel:+254716200100" },
      { en: "Call 0719 423 558", sw: "Piga 0719 423 558", href: "tel:0719423558" },
    ],
  },
  {
    group: "org",
    name: { en: "Office of the Director of Public Prosecutions", sw: "Office of the Director of Public Prosecutions" },
    who: { en: "Toll-free", sw: "Simu ya bure" },
    actions: [{ en: "Call 0800 723 377", sw: "Piga 0800 723 377", href: "tel:0800723377" }],
  },
  {
    group: "org",
    name: { en: "FIDA Kenya", sw: "FIDA Kenya" },
    who: { en: "Legal aid", sw: "Msaada wa kisheria" },
    actions: [
      { en: "Call 0722 509 760", sw: "Piga 0722 509 760", href: "tel:0722509760" },
      { en: "Call 0800 720 501", sw: "Piga 0800 720 501", href: "tel:0800720501" },
    ],
  },
  {
    group: "org",
    name: { en: "Kenya Human Rights Commission", sw: "Kenya Human Rights Commission" },
    who: { en: "Human rights", sw: "Haki za binadamu" },
    actions: [
      { en: "Call 020 204 4545", sw: "Piga 020 204 4545", href: "tel:0202044545" },
      { en: "Call 020 387 4998", sw: "Piga 020 387 4998", href: "tel:0203874998" },
    ],
  },
  {
    group: "org",
    name: { en: "National Council for Children Services", sw: "National Council for Children Services" },
    who: { en: "Children's services", sw: "Huduma za watoto" },
    actions: [{ en: "Call 0800 221 0080", sw: "Piga 0800 221 0080", href: "tel:08002210080" }],
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
