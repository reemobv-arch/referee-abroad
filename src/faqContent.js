// Frequently asked questions, grouped by audience.
// Content mirrors the public FAQ on refereeabroad.com/faq, rewritten for the app.
// Keep this in sync with the website so referees and observers see one answer.

export const FAQ_GROUPS = [
  {
    key: 'referees',
    title: 'Referees',
    items: [
      {
        q: 'How does refereeing abroad work?',
        a: 'You create a profile, get matched with tournaments that fit your level, apply, and get selected. From there you travel to the host country, officiate the tournament and are supported by on-site staff throughout. Accommodation during the tournament is included; travel to and from the host country is your own, but we are happy to advise.',
      },
      {
        q: 'Is there a minimum age to take part?',
        a: 'Most tournaments ask referees to be at least 16. Tournaments outside Europe usually require 18. Anyone under 18 needs an accompanying adult or a signed liability waiver. In exceptional cases referees under 16 may be considered when accompanied by an adult guardian.',
      },
      {
        q: 'Do I need to be a registered referee?',
        a: 'Yes. You must be registered with a FIFA-recognised football association or a National Olympic Committee.',
      },
      {
        q: 'Do I need permission from my association?',
        a: 'Yes, permission from your association is mandatory. We do not routinely check it when you register, but we may verify it if there is any concern, and we can suspend or exclude referees where needed.',
      },
      {
        q: 'Do I need a background check?',
        a: 'Referees are not checked individually; we presume your federation has vetted you. We may run checks when needed, and a background check is required for tournaments in the USA. On site, safeguarding-trained staff are available for any concerns.',
      },
      {
        q: 'What does the tournament fee include?',
        a: 'The fee covers accommodation, meals, Referee Abroad merchandise, local transport, training sessions, coaches and on-site staff support. Travel is not included, except for USA tournaments where it is.',
      },
      {
        q: 'How is travel organised?',
        a: 'Outside the USA you book your own travel around the dates the tournament staff give you; extra nights are not covered. Send your travel details to the travel address at least a month before the tournament. For USA tournaments we handle the travel logistics.',
      },
      {
        q: 'Will I get paid at tournaments?',
        a: 'No. Taking part is voluntary and unpaid.',
      },
      {
        q: 'Why is there a credit card guarantee?',
        a: 'The guarantee discourages people from applying to many tournaments at once without real commitment, which helps us build a reliable pool of referees.',
      },
      {
        q: 'What about visa support?',
        a: 'We do not provide visa support, invitation letters or visa documentation. You must hold a valid visa when you apply, and the fee is non-refundable if entry is later refused.',
      },
    ],
  },
  {
    key: 'observers',
    title: 'Observers',
    items: [
      {
        q: 'I am a qualified observer, how can I join?',
        a: 'Qualified observers or assessors registered with their national or local FA can apply by contacting the observers coordinator by email.',
      },
      {
        q: 'What costs are involved?',
        a: 'Observers cover their own travel to and from their home country. Some tournaments may contribute part of this, but it is not guaranteed.',
      },
      {
        q: 'What if I can no longer participate?',
        a: 'Let the organisers know as soon as possible, ideally at least 60 days before the start, so a replacement can be found. Dropping out without good reason may make future selection unlikely.',
      },
    ],
  },
]

// Flat list of every FAQ item, used by the FAQ editor and the assistant's
// keyless fallback so there is a single FAQ source across the app.
export const FAQ_ITEMS = FAQ_GROUPS.flatMap((g) => g.items.map((it) => ({ ...it, group: g.title })))
