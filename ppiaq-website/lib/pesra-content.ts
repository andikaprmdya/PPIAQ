export type PesraLanguage = 'id' | 'en';

export interface PesraContentValue {
  id: string;
  en: string;
  size?: string;
  placement?: string;
}

export interface PesraContentItem {
  id: string;
  key: string;
  section: string;
  content: PesraContentValue;
  image?: string | null;
  order?: number;
  type?: string;
  page?: string;
}

export const PESRA_TEXT_DEFAULTS: Record<string, PesraContentValue> = {
  pesta_event_date: {
    id: 'Captain Burke Park, 30 Agustus 2026',
    en: 'Captain Burke Park, 30 August 2026',
  },
  pesta_event_intro: {
    id: 'Diselenggarakan di Captain Burke Park, Pesta Rakyat 2026 – Aruna Nusantara menyoroti harapan, awal yang baru, dan perjalanan bersama menuju masa depan yang lebih cerah, terinspirasi oleh cahaya merah matahari terbit dan kepulauan Indonesia yang bersatu.\n\nPesta Rakyat 2026 berlangsung pada Minggu, 30 Agustus, pukul 09.00–17.00 di Captain Burke Park.\n\nTiket masuk gratis; pendaftaran kompetisi telah dibuka di bit.ly/CompetitionRegistrationPesra2026',
    en: 'Staged at the Captain Burke Park, Pesta Rakyat 2026 – Aruna Nusantara shines a spotlight on hope, new beginnings, and the shared journey towards a brighter future, inspired by the red glow of sunrise and Indonesia’s united archipelago.\n\nPesta Rakyat 2026 runs Sunday, 30 August, 9:00 am – 5:00 pm at Captain Burke Park.\n\nEntry is free; competition registrations open now at bit.ly/CompetitionRegistrationPesra2026',
  },
  pesta_event_description: {
    id: 'Lebih dari sekadar festival, Pesta Rakyat (PESRA) adalah perayaan tahunan Hari Kemerdekaan Indonesia terbesar di Queensland, menyatukan ribuan mahasiswa Indonesia, keluarga diaspora, dan komunitas Australia yang lebih luas dalam pertunjukan budaya, musik, makanan, dan kebanggaan nasional yang spektakuler di jantung Brisbane.\n\nNikmati rangkaian pertunjukan yang meriah, kuliner Indonesia, permainan seru, dan undian berhadiah eksklusif.',
    en: "More than a festival, Pesta Rakyat (PESRA) is Queensland's largest annual celebration of Indonesian Independence Day, uniting thousands of Indonesian students, diaspora families and the wider Australian community in a spectacular showcase of culture, music, food and national pride in the heart of Brisbane.\n\nExpect a vibrant lineup of performances, Indonesian cuisines, fun games, and a raffle with exclusive prizes.",
  },
  pesta_sponsors_heading: {
    id: 'Pesta Rakyat 2026 dengan bangga disponsori oleh',
    en: 'Pesta Rakyat 2026 is proudly sponsored by',
  },
  pesta_community_heading: {
    id: 'Dan dimungkinkan oleh anggota komunitas Indonesia di seluruh Queensland:',
    en: 'And made possible by members of Indonesian communities across Queensland:',
  },
};

export const DEFAULT_PESRA_SPONSORS: PesraContentItem[] = [
  {
    id: '',
    key: 'pesta_sponsor_brisbane_city_council',
    section: 'sponsors',
    content: {
      id: 'Brisbane City Council',
      en: 'Brisbane City Council',
      size: 'L',
      placement: 'featured',
    },
    image: '/images/pesra/brisbane-city-council.png',
    order: 1,
    type: 'IMAGE',
    page: 'pesta-rakyat',
  },
  {
    id: '',
    key: 'pesta_sponsor_pt_perentjana_djaja',
    section: 'sponsors',
    content: { id: 'PT. Perentjana Djaja', en: 'PT. Perentjana Djaja', size: 'M', placement: 'standard' },
    image: '/images/pesra/pt-perentjana-djaja.jpeg',
    order: 2,
    type: 'IMAGE',
    page: 'pesta-rakyat',
  },
  {
    id: '',
    key: 'pesta_sponsor_indomie',
    section: 'sponsors',
    content: { id: 'Indomie', en: 'Indomie', size: 'M', placement: 'standard' },
    image: '/images/pesra/indomie.png',
    order: 3,
    type: 'IMAGE',
    page: 'pesta-rakyat',
  },
  {
    id: '',
    key: 'pesta_sponsor_eccq',
    section: 'sponsors',
    content: { id: 'Ethnic Communities Council of Queensland', en: 'Ethnic Communities Council of Queensland', size: 'M', placement: 'standard' },
    image: '/images/pesra/eccq.png',
    order: 4,
    type: 'IMAGE',
    page: 'pesta-rakyat',
  },
];

export const DEFAULT_PESRA_COMMUNITY_SUPPORTERS: PesraContentItem[] = [
  {
    id: '',
    key: 'pesta_supporter_piq',
    section: 'community-supporters',
    content: { id: 'Perhimpunan Indonesia Queensland', en: 'Perhimpunan Indonesia Queensland' },
    image: '/images/pesra/piq.jpeg',
    order: 1,
    type: 'IMAGE',
    page: 'pesta-rakyat',
  },
  {
    id: '',
    key: 'pesta_supporter_aicwa',
    section: 'community-supporters',
    content: { id: 'Australian Indonesian Culture and Welfare Association Inc', en: 'Australian Indonesian Culture and Welfare Association Inc' },
    image: '/images/pesra/aicwa.jpeg',
    order: 2,
    type: 'IMAGE',
    page: 'pesta-rakyat',
  },
  {
    id: '',
    key: 'pesta_supporter_iisb',
    section: 'community-supporters',
    content: { id: 'Indonesian Islamic Society of Brisbane', en: 'Indonesian Islamic Society of Brisbane' },
    image: '/images/pesra/iisb.jpeg',
    order: 3,
    type: 'IMAGE',
    page: 'pesta-rakyat',
  },
  {
    id: '',
    key: 'pesta_supporter_kkmq',
    section: 'community-supporters',
    content: { id: 'Kerukunan Keluarga Maesaan Queensland (KKMQ)', en: 'Kerukunan Keluarga Maesaan Queensland (KKMQ)' },
    order: 4,
    type: 'TEXT',
    page: 'pesta-rakyat',
  },
  {
    id: '',
    key: 'pesta_supporter_campbell',
    section: 'community-supporters',
    content: { id: 'Alistair & Kiara Campbell', en: 'Alistair & Kiara Campbell' },
    order: 5,
    type: 'TEXT',
    page: 'pesta-rakyat',
  },
];

export function mergePesraDefaults(
  defaults: PesraContentItem[],
  storedItems: PesraContentItem[],
): PesraContentItem[] {
  const storedByKey = new Map(storedItems.map((item) => [item.key, item]));
  const defaultKeys = new Set(defaults.map((item) => item.key));
  const mergedDefaults = defaults.map((item) => storedByKey.get(item.key) || item);
  const customItems = storedItems.filter((item) => !defaultKeys.has(item.key));

  return [...mergedDefaults, ...customItems].sort((a, b) => (a.order || 999) - (b.order || 999));
}

export function getPesraText(
  items: PesraContentItem[],
  key: string,
  language: PesraLanguage,
): string {
  const fallback = PESRA_TEXT_DEFAULTS[key]?.[language] || PESRA_TEXT_DEFAULTS[key]?.en || '';
  const item = items.find((candidate) => candidate.key === key);
  return item?.content?.[language] || item?.content?.en || fallback;
}
