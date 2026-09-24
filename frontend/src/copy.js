const copy = {
  en: {
    skip: "Skip to content",
    help: "I need help",
    exit: "Quick exit",
    helpBar: "Free, confidential, 24/7",
    nav: [
      { id: "helplines", label: "Get help" },
      { id: "learn", label: "Learn" },
      { id: "rights", label: "Rights" },
      { id: "document", label: "Private record" },
    ],
    eyebrow: "Free, confidential support",
    heroTitle: "You decide what happens next.",
    heroLine:
      "Nia is for adults in Kenya who have faced sexual harassment. Learn what it can look like, see your options, and reach a verified line — in your own time.",
    ctaReach: "Get help now",
    channelNumber: "1195",
    channelCaption: "GBV helpline",
    channels: [
      { image: "/images/portrait.png", label: "Call" },
      { image: "/images/conversation.png", label: "Talk" },
      { image: "/images/support.png", label: "Care" },
    ],
    iWantTitle: "I want to…",
    paths: [
      {
        id: "helplines",
        title: "Get help now",
        line: "Call a labeled line. You will know who answers.",
      },
      {
        id: "support-someone",
        title: "Support someone I care about",
        line: "If someone tells you what happened, here is how to listen.",
      },
      {
        id: "rights",
        title: "Know my options",
        line: "Source-backed information. Nia does not decide for you.",
      },
      {
        id: "document",
        title: "Keep a private record",
        line: "A private note. Nothing is saved yet.",
      },
    ],
    howTitle: "How Nia helps",
    howLine: "No matter what you have been through, you can start here. The next step stays yours.",
    how: [
      {
        id: "helplines",
        title: "Support",
        line: "Verified helplines in Kenya, each one labeled so you know who answers.",
        image: "/images/support.png",
      },
      {
        id: "learn",
        title: "Learn",
        line: "What concerning behaviour can look like, and how to support someone who tells you.",
        image: "/images/learn.png",
      },
      {
        id: "rights",
        title: "Your options",
        line: "Information you can use when you are ready. You choose whether to report.",
        image: "/images/rights.png",
      },
    ],
    decision: "The decision stays with you.",
    helpNote: "Nia is not an emergency service.",
    allLines: "All helplines",
    callNow: "Call now",
    organisations: "Organisations",
    helplinesTitle: "Helplines in Kenya.",
    helplinesLine: "Each number is labeled, so you know who answers.",
    unhcrNote: "Partner offices are listed on the UNHCR Kenya help page.",
    quickLines: [
      { label: "Police", numbers: ["999", "112"] },
      { label: "GBV helpline", numbers: ["1195"] },
      { label: "Under 18", numbers: ["116"] },
    ],
    footer: "Kenya · Adults 18+",
    screens: {
      learn: {
        index: "01",
        title: "Recognise it.",
        body: "Sexual harassment is unwanted sexual behaviour. It can be words, pictures, or touch.",
        next: "rights",
        nextLabel: "Rights",
        sectionsTitle: "What it can look like",
        sectionsLede: "You do not have to be sure of the legal name before you ask for support.",
        sections: [
          {
            title: "Words, pictures, and touch",
            body: "It can look like any of these:",
            points: [
              "Comments about your body, your sex life, or what you should do sexually.",
              "Pressure for a date, for sex, or for photos.",
              "Touch you did not agree to.",
              "Someone using a job, a grade, money, or a threat to pressure you.",
              "Intimate images shared without your agreement.",
            ],
          },
          {
            title: "Where it happens",
            body: "At work, at school, at home, online, or in a public place. It can come from a stranger, a partner, a supervisor, or someone you know.",
          },
          {
            title: "It still counts",
            body: "You may have frozen, laughed, stayed, or not said no out loud. You do not need injuries for it to matter.",
          },
        ],
        guide: {
          title: "Help someone",
          lede: "If someone shares an instance of sexual harassment with you, these suggestions are meant to help you support them.",
          sections: [
            {
              title: "Listen",
              body: "Allow the person who is disclosing to guide the conversation.",
            },
            {
              title: "Validate",
              body: "Validate their feelings and give them options. Supportive statements include:",
              points: [
                "I hear you.",
                "This is not your fault.",
                "That sounds like a difficult situation.",
                "How can I best support you right now?",
                "Would you like to talk about it?",
              ],
            },
            {
              title: "Ask how you can help",
              body: "Ask what you can do to assist them:",
              points: [
                "Do they need medical support?",
                "Would they like to go somewhere else — more private, or a different building?",
                "Would they like to contact someone, or have a friend with them?",
              ],
            },
            {
              title: "Be inclusive",
              body: "Sexual harassment can affect anyone. All genders, gender identities, ethnicities, sexual orientations, and backgrounds can experience it.",
            },
            {
              title: "Mention resources",
              body: "Point them to verified lines: the GBV helpline 1195, police 999 or 112, and counselling 1190. Organisations such as COVAW, LVCT, and MSF are on the Helplines page.",
              action: { id: "helplines", label: "Helplines" },
            },
            {
              title: "Be aware of what you say",
              body: "Refrain from judgmental, blaming, or dismissive comments. Do not ask biased questions that can hurt. Hurtful comments include:",
              examples: [
                "How much did you have to drink?",
                "What were you wearing?",
                "Haven’t you gone out with that person before?",
                "That’s not that big of a deal.",
              ],
            },
            {
              title: "Recognise the effects of trauma",
              body: "Trauma affects people in different ways and can affect memory. Someone may be experiencing trauma and not act the way you expect. They may come forward immediately or years later. How long they wait does not change the support they should receive.",
            },
            {
              title: "Respect their privacy",
              body: "Do not tell anyone else what they shared. Do not contact the other people involved, and do not try to investigate on your own.",
            },
            {
              title: "Do not try to fix it",
              body: "Let them decide the next steps, including whether to report to the police or to an organisation. Do not try to mediate, and do not discourage them from making a report.",
            },
            {
              title: "Seek self-care",
              body: "Someone sharing this can be hard for them and for you. Take care of yourself, and seek support if you need it. The same helplines are there for you.",
            },
          ],
        },
      },
      rights: {
        index: "02",
        title: "Know your options.",
        body: "These are options people in Kenya use. Nia does not give legal advice, and Nia does not decide for you.",
        next: "helplines",
        nextLabel: "Get help",
        sectionsTitle: "You choose the next step",
        sectionsLede: "You can use one of these, several, or none. Waiting does not erase what happened.",
        sections: [
          {
            title: "Take your time",
            body: "You do not have to report today. You can learn, talk to someone, get medical care, or wait until you are ready.",
          },
          {
            title: "Medical care",
            body: "A hospital or clinic can treat injuries and offer emergency care. You can ask for care even if you are not ready to speak to the police.",
            action: { id: "helplines", label: "Helplines" },
          },
          {
            title: "The police",
            body: "You can report sexual violence to the police. Call 999 or 112 if you are in danger, or go to a station when you are ready. Reporting is your choice.",
          },
          {
            title: "Work or school",
            body: "If it happened at work, you can tell your employer. Under Kenya’s Employment Act, an employer with 20 or more employees must have a sexual harassment policy. A college or university may have its own reporting office. You can also choose not to tell them.",
          },
          {
            title: "A confidential line",
            body: "The national GBV helpline is 1195. Counselling is 1190. These lines are for support. They are not the police.",
          },
          {
            title: "Not legal advice",
            body: "A law can depend on the facts, and procedures change. A lawyer, a legal aid organisation, or a helpline can talk about your own situation. Nia only lists options.",
          },
        ],
      },
      support: {
        index: "03",
        title: "Reach someone verified.",
        body: "Official lines are in Helplines. Each one is labeled.",
        next: "helplines",
        nextLabel: "Helplines",
      },
      document: {
        index: "04",
        title: "A private record.",
        body: "A short note can help you remember. Nothing on this page is saved.",
        next: "home",
        nextLabel: "Home",
        sectionsTitle: "What to write down",
        sectionsLede: "Write it somewhere only you can open. Do not send it to the person who harmed you.",
        sections: [
          {
            title: "The facts you still remember",
            body: "Include what you can:",
            points: [
              "The date, time, and place.",
              "What the person said or did.",
              "Who else was there.",
              "Messages, photos, or emails you still have.",
              "How it affected you, including sleep, work, or your body.",
            ],
          },
          {
            title: "Nothing here is saved",
            body: "Sign-in is not available yet, so Nia does not store a record. Keep the note on a device or in a place only you can open.",
          },
          {
            title: "Why a note can help",
            body: "Memory can change after a frightening event. A note made soon after can help if you later speak to a doctor, an employer, or the police. You never have to use it.",
          },
        ],
      },
    },
  },
  sw: {
    skip: "Ruka hadi maudhui",
    help: "Nahitaji msaada",
    exit: "Toka haraka",
    helpBar: "Bure, faragha, saa 24",
    nav: [
      { id: "helplines", label: "Pata msaada" },
      { id: "learn", label: "Jifunze" },
      { id: "rights", label: "Haki" },
      { id: "document", label: "Kumbukumbu" },
    ],
    eyebrow: "Msaada wa bure, wa faragha",
    heroTitle: "Wewe unaamua kinachofuata.",
    heroLine:
      "Nia ni kwa watu wazima Kenya waliokumbana na unyanyasaji wa kingono. Jifunze, ona chaguo zako, na ufikie nambari iliyothibitishwa — kwa wakati wako.",
    ctaReach: "Pata msaada sasa",
    channelNumber: "1195",
    channelCaption: "Simu ya GBV",
    channels: [
      { image: "/images/portrait.png", label: "Piga" },
      { image: "/images/conversation.png", label: "Zungumza" },
      { image: "/images/support.png", label: "Tibiwa" },
    ],
    iWantTitle: "Nataka…",
    paths: [
      {
        id: "helplines",
        title: "Pata msaada sasa",
        line: "Piga nambari yenye jina. Utajua nani anapokea.",
      },
      {
        id: "support-someone",
        title: "Msaidie mtu ninayemjali",
        line: "Mtu akikueleza yaliyotokea, hivi ndivyo ya kusikiliza.",
      },
      {
        id: "rights",
        title: "Jua chaguo zangu",
        line: "Taarifa zenye chanzo. Nia haiamui badala yako.",
      },
      {
        id: "document",
        title: "Weka kumbukumbu ya faragha",
        line: "Andiko la faragha. Hakuna kinachohifadhiwa bado.",
      },
    ],
    howTitle: "Nia inasaidiaje",
    howLine: "Haijalishi umepitia nini, unaweza kuanza hapa. Hatua inayofuata ni yako.",
    how: [
      {
        id: "helplines",
        title: "Msaada",
        line: "Nambari zilizothibitishwa Kenya, kila moja ina jina ujue nani anapokea.",
        image: "/images/support.png",
      },
      {
        id: "learn",
        title: "Jifunze",
        line: "Tabia inayotia wasiwasi inaweza kuonekanaje, na jinsi ya kumsaidia mtu anayekueleza.",
        image: "/images/learn.png",
      },
      {
        id: "rights",
        title: "Chaguo zako",
        line: "Taarifa unazoweza kutumia ukiwa tayari. Wewe unaamua kama utaripoti.",
        image: "/images/rights.png",
      },
    ],
    decision: "Uamuzi uko kwako.",
    helpNote: "Nia si huduma ya dharura.",
    allLines: "Nambari zote",
    callNow: "Piga sasa",
    organisations: "Mashirika",
    helplinesTitle: "Nambari za msaada Kenya.",
    helplinesLine: "Kila nambari ina jina, ujue nani anapokea.",
    unhcrNote: "Ofisi za washirika ziko kwenye ukurasa wa UNHCR Kenya.",
    quickLines: [
      { label: "Polisi", numbers: ["999", "112"] },
      { label: "Simu ya GBV", numbers: ["1195"] },
      { label: "Chini ya miaka 18", numbers: ["116"] },
    ],
    footer: "Kenya · Miaka 18+",
    screens: {
      learn: {
        index: "01",
        title: "Tambua.",
        body: "Unyanyasaji wa kingono ni tabia ya kingono isiyotakikana. Inaweza kuwa maneno, picha, au mguso.",
        next: "rights",
        nextLabel: "Haki",
        sectionsTitle: "Inaweza kuonekanaje",
        sectionsLede: "Huhitaji kuwa na uhakika wa jina la kisheria kabla ya kuomba msaada.",
        sections: [
          {
            title: "Maneno, picha, na mguso",
            body: "Inaweza kuonekana hivi:",
            points: [
              "Maneno kuhusu mwili wako, maisha yako ya kingono, au unachopaswa kufanya kingono.",
              "Shinikizo la miadi, ngono, au picha.",
              "Mguso usioukubali.",
              "Mtu anayetumia kazi, alama, pesa, au tishio kukushinikiza.",
              "Picha za faragha zilizosambazwa bila ridhaa yako.",
            ],
          },
          {
            title: "Inatokea wapi",
            body: "Kazini, shuleni, nyumbani, mtandaoni, au mahali pa umma. Inaweza kutoka kwa mgeni, mpenzi, msimamizi, au mtu unayemfahamu.",
          },
          {
            title: "Bado ina maana",
            body: "Unaweza kuwa umeganda, umecheka, umebaki, au hukusema hapana kwa sauti. Huhitaji majeraha ili iwe na maana.",
          },
        ],
        guide: {
          title: "Msaidie mtu",
          lede: "Mtu akishiriki tukio la unyanyasaji wa kingono, mapendekezo haya yanakusaidia kumsaidia.",
          sections: [
            {
              title: "Sikiliza",
              body: "Mwachie mtu anayeshiriki aongoze mazungumzo.",
            },
            {
              title: "Thibitisha",
              body: "Thibitisha hisia zake na umpe chaguo. Maneno ya kuunga mkono ni pamoja na:",
              points: [
                "Nakusikia.",
                "Hili si kosa lako.",
                "Hiyo inaonekana kuwa hali ngumu.",
                "Ninawezaje kukusaidia vizuri sasa hivi?",
                "Ungependa kuzungumza kuhusu hilo?",
              ],
            },
            {
              title: "Uliza jinsi ya kusaidia",
              body: "Uliza unachoweza kufanya:",
              points: [
                "Je, anahitaji msaada wa matibabu?",
                "Je, angependa kwenda mahali pengine — faragha zaidi, au jengo lingine?",
                "Je, angependa kuwasiliana na mtu, au awe na rafiki?",
              ],
            },
            {
              title: "Kuwa jumuishi",
              body: "Unyanyasaji wa kingono unaweza kumpata mtu yeyote. Jinsia zote, utambulisho wa kijinsia, makabila, mwelekeo wa kingono, na asili zote zinaweza kuukumbana.",
            },
            {
              title: "Taja msaada",
              body: "Waonyeshe nambari zilizothibitishwa: simu ya GBV 1195, polisi 999 au 112, na ushauri 1190. Mashirika kama COVAW, LVCT, na MSF yako kwenye ukurasa wa Nambari.",
              action: { id: "helplines", label: "Nambari" },
            },
            {
              title: "Jihadhari na unachosema",
              body: "Epuka maneno ya kuhukumu, kulaumu, au kudharau. Usiulize maswali yenye upendeleo yanayoweza kuumiza. Maneno yanayoumiza ni pamoja na:",
              examples: [
                "Ulikunywa kiasi gani?",
                "Ulikuwa umevaa nini?",
                "Hukuwahi kutoka na mtu huyo?",
                "Hilo si jambo kubwa.",
              ],
            },
            {
              title: "Tambua athari za kiwewe",
              body: "Kiwewe kinawaathiri watu kwa njia tofauti, na kinaweza kuathiri kumbukumbu. Mtu anaweza kuwa na kiwewe na asitende kama unavyotarajia. Anaweza kuja mara moja au baada ya miaka. Muda haubadilishi msaada anayestahili.",
            },
            {
              title: "Heshimu faragha",
              body: "Usimwambie mtu mwingine alichoshiriki. Usiwasiliane na watu wengine waliohusika, wala usifanye uchunguzi peke yako.",
            },
            {
              title: "Usijaribu kulirekebisha",
              body: "Waache waamue hatua zinazofuata, pamoja na kama wanataka kuripoti kwa polisi au kwa shirika. Usijaribu kupatanisha, wala usiwazuie kutoa taarifa.",
            },
            {
              title: "Jitunze",
              body: "Mtu kushiriki haya kunaweza kuwa kugumu kwake na kwako. Jitunze, na utafute msaada ukihitaji. Nambari zile zile zipo kwa ajili yako pia.",
            },
          ],
        },
      },
      rights: {
        index: "02",
        title: "Jua chaguo zako.",
        body: "Haya ni chaguo watu hutumia Kenya. Nia haitoi ushauri wa kisheria, na Nia haiamui badala yako.",
        next: "helplines",
        nextLabel: "Pata msaada",
        sectionsTitle: "Wewe unachagua hatua inayofuata",
        sectionsLede: "Unaweza kutumia moja, kadhaa, au hakuna. Kusubiri hakufuti yaliyotokea.",
        sections: [
          {
            title: "Chukua muda wako",
            body: "Huhitaji kuripoti leo. Unaweza kujifunza, kuzungumza na mtu, kupata matibabu, au kusubiri utakapokuwa tayari.",
          },
          {
            title: "Matibabu",
            body: "Hospitali au kliniki inaweza kutibu majeraha na kutoa huduma ya dharura. Unaweza kuomba matibabu hata kama hujajiandaa kuzungumza na polisi.",
            action: { id: "helplines", label: "Nambari" },
          },
          {
            title: "Polisi",
            body: "Unaweza kuripoti unyanyasaji wa kingono kwa polisi. Piga 999 au 112 ukiwa hatarini, au nenda kituoni utakapokuwa tayari. Kuripoti ni chaguo lako.",
          },
          {
            title: "Kazi au shule",
            body: "Ikitokea kazini, unaweza kumwambia mwajiri wako. Chini ya Sheria ya Ajira ya Kenya, mwajiri mwenye wafanyakazi 20 au zaidi lazima awe na sera ya unyanyasaji wa kingono. Chuo kinaweza kuwa na ofisi yake ya kuripoti. Unaweza pia ukachagua kutowaambia.",
          },
          {
            title: "Simu ya faragha",
            body: "Simu ya kitaifa ya GBV ni 1195. Ushauri ni 1190. Hizi ni kwa msaada. Si polisi.",
          },
          {
            title: "Si ushauri wa kisheria",
            body: "Sheria inaweza kutegemea ukweli, na taratibu hubadilika. Mwanasheria, shirika la msaada wa kisheria, au simu ya msaada inaweza kuzungumzia hali yako. Nia inaorodhesha chaguo tu.",
          },
        ],
      },
      support: {
        index: "03",
        title: "Fikia msaada uliothibitishwa.",
        body: "Nambari rasmi ziko kwenye Nambari. Kila moja ina jina.",
        next: "helplines",
        nextLabel: "Nambari",
      },
      document: {
        index: "04",
        title: "Kumbukumbu ya faragha.",
        body: "Andiko fupi linaweza kukusaidia kukumbuka. Hakuna kinachohifadhiwa kwenye ukurasa huu.",
        next: "home",
        nextLabel: "Mwanzo",
        sectionsTitle: "Andika nini",
        sectionsLede: "Andika mahali unapoweza kufungua wewe peke yako. Usimtumie mtu aliyekudhuru.",
        sections: [
          {
            title: "Ukweli unaokumbuka",
            body: "Weka unachoweza:",
            points: [
              "Tarehe, saa, na mahali.",
              "Mtu alisema nini au alifanya nini.",
              "Nani mwingine alikuwepo.",
              "Ujumbe, picha, au barua pepe bado unazo.",
              "Ilikuathirije, pamoja na usingizi, kazi, au mwili wako.",
            ],
          },
          {
            title: "Hakuna kinachohifadhiwa hapa",
            body: "Kuingia kwenye akaunti bado hakujafika, kwa hiyo Nia haihifadhi kumbukumbu. Weka andiko kwenye kifaa au mahali unapoweza kufungua wewe peke yako.",
          },
          {
            title: "Kwa nini andiko linaweza kusaidia",
            body: "Kumbukumbu inaweza kubadilika baada ya tukio linalotisha. Andiko la muda mfupi baadaye linaweza kusaidia ukizungumza na daktari, mwajiri, au polisi. Huhitaji kulitumia.",
          },
        ],
      },
    },
  },
};

export default copy;
