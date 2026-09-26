/**
 * Facts about Itqaan shown on this fundraising page, in both languages.
 *
 * Every number here is Itqaan's own published figure, read from
 * app.itkan.info on 2026-09-26: the programme pages' "إحصائيات المشروع" tables
 * where they exist (reading, safra, online), otherwise the home page's graduate
 * banner (mahir, maqari, teacher training). The page never shows these raw —
 * formatCount() rounds them DOWN, so the page can only understate.
 *
 * When Itqaan publishes new totals, change the numbers here and nowhere else.
 */

export type Lang = 'ar' | 'en';
export type L10n = Record<Lang, string>;

export const DATA_SOURCE = { url: 'app.itkan.info', readOn: '2026-09-26' } as const;

/** Round down to a figure nobody can call inflated: 106,473 → 106,000. */
export function roundDown(n: number): number {
  const step = n >= 10000 ? 1000 : n >= 1000 ? 100 : 10;
  return Math.floor(n / step) * step;
}

/**
 * A number as the page shows it. Western digits in BOTH languages: that is the
 * practice of Arabic charity sites (Qatar Charity, UNHCR Arabic, Islamic Relief
 * Arabic) and of Itqaan's own site. Formatted with en-US so the output does not
 * depend on how a given ICU build treats plain 'ar'.
 */
export function num(n: number, _lang: Lang): string {
  return new Intl.NumberFormat('en-US').format(n);
}

/**
 * "More than" only when rounding actually dropped something; an exact round
 * figure (1,300) is "at least", or the page would overstate it.
 */
export function countPrefix(n: number, lang: Lang): string {
  const exact = roundDown(n) === n;
  if (lang === 'ar') return exact ? 'لا يقل عن' : 'أكثر من';
  return exact ? 'At least' : 'More than';
}

/** "أكثر من 106,000" / "More than 106,000". Written out, never as "+106K". */
export function formatCount(n: number, lang: Lang): string {
  return `${countPrefix(n, lang)} ${num(roundDown(n), lang)}`;
}

/** Itqaan's own words: the slogan on its stats banner and the values on app.itkan.info. */
export const motto: L10n = { ar: 'جيلٌ يُسهم في نهضة المجتمع', en: 'A generation that helps its community rise' };
export const values: L10n[] = [
  { ar: 'الإتقان', en: 'Mastery' },
  { ar: 'القدوة', en: 'Example' },
  { ar: 'الإسناد', en: 'Support' },
  { ar: 'الأمان', en: 'Safety' },
];

export interface Programme {
  id: 'reading' | 'safra' | 'mahir' | 'maqari';
  count: number;
  /** The counted noun, set after the number. */
  countLabel: L10n;
  name: L10n;
  teaches: L10n;
  meta: L10n;
}

/** In the order a student climbs them. Descriptions follow Itqaan's programme pages. */
export const programmes: Programme[] = [
  {
    id: 'reading',
    count: 106473,
    countLabel: { ar: 'خرّيج وخرّيجة', en: 'graduates' },
    name: { ar: 'بالقراءة نحيا', en: 'Bil-Qira’ah Nahya' },
    teaches: {
      ar: 'القراءة والكتابة العربية السليمة، مع برنامج تربوي مصاحب',
      en: 'Correct Arabic reading and writing, with a character-education programme',
    },
    meta: { ar: 'من عمر 5 سنوات، من 4 إلى 6 أشهر', en: 'From age 5 · 4–6 months' },
  },
  {
    id: 'safra',
    count: 11161,
    countLabel: { ar: 'خرّيج وخرّيجة', en: 'graduates' },
    name: { ar: 'السفرة', en: 'Al-Safarah' },
    teaches: {
      ar: 'تلاوة القرآن الكريم كاملًا نظرًا مع أحكام التجويد',
      en: 'Reading the whole Qur’an from the page, with tajweed (the rules of recitation)',
    },
    meta: { ar: 'خمس مراحل، من سنتين إلى ثلاث سنوات', en: 'Five stages · 2–3 years' },
  },
  {
    id: 'mahir',
    count: 2083,
    countLabel: { ar: 'حافظ وحافظة', en: 'have memorised the Qur’an' },
    name: { ar: 'الماهر بالقرآن', en: 'Al-Mahir bil-Qur’an' },
    teaches: {
      ar: 'حفظ القرآن الكريم كاملًا غيبًا، مع برنامج شرعي وتربوي',
      en: 'Memorising the whole Qur’an, with Islamic studies',
    },
    meta: { ar: 'من عمر 11 سنة، من سنة ونصف إلى سنتين', en: 'From age 11 · 18 months to 2 years' },
  },
  {
    id: 'maqari',
    count: 1325,
    countLabel: { ar: 'مُجاز ومُجازة', en: 'ijaza holders' },
    name: { ar: 'المقارئ القرآنية', en: 'Al-Maqari’ al-Qur’aniyyah' },
    teaches: {
      ar: 'إقراء القرآن بالقراءات المتواترة للحفّاظ والحافظات',
      en: 'Teaching the canonical readings to those who have memorised the Qur’an',
    },
    meta: { ar: 'من سنة إلى سنة ونصف', en: '1 to 1½ years' },
  },
];

/** The chain's last link. */
export const ijazaLine: L10n = {
  ar: 'إجازةٌ بالسند المتصل إلى رسول الله ﷺ',
  en: 'An ijaza, with a chain of teachers unbroken back to the Prophet (peace be upon him)',
};

/** Places taken in teacher-training courses — a parallel track, not a step. */
export const teacherTraining = { count: 14309 } as const;

/** بالقراءة نحيا graduates online: "إلكتروني" 4,996 + "إلكتروني سوريا" 92. */
export const onlineReadingGraduates = 4996 + 92;

/** A place Itqaan teaches, with its city's approximate coordinates for the schematic map. */
export interface Area extends L10n { lat: number; lon: number; hq?: boolean }

export const areas: { syria: Area[]; turkey: Area[] } = {
  syria: [
    { ar: 'ريف دمشق', en: 'Rif Dimashq (Damascus countryside)', lat: 33.51, lon: 36.29 },
    { ar: 'حلب وأريافها', en: 'Aleppo and its countryside', lat: 36.2, lon: 37.15 },
    { ar: 'إدلب وأريافها', en: 'Idlib and its countryside', lat: 35.93, lon: 36.63 },
    { ar: 'مدينة حماة', en: 'Hama', lat: 35.13, lon: 36.75 },
  ],
  turkey: [
    { ar: 'غازي عنتاب (المركز الرئيسي)', en: 'Gaziantep (headquarters)', lat: 37.07, lon: 37.38, hq: true },
    { ar: 'إسطنبول', en: 'Istanbul', lat: 41.01, lon: 28.98 },
    { ar: 'كهرمان مرعش', en: 'Kahramanmaraş', lat: 37.58, lon: 36.93 },
    { ar: 'نزيب', en: 'Nizip', lat: 37.01, lon: 37.79 },
    { ar: 'كلس', en: 'Kilis', lat: 36.72, lon: 37.12 },
  ],
};

/**
 * Students' own words, from Itqaan's site. Months are Itqaan's current figures.
 * First names only and no photos: their ages are unknown, and a fundraising
 * page treats every student as a possible minor.
 */
export const voices: { quote: L10n; name: L10n; role: L10n; months: number }[] = [
  {
    quote: { ar: 'إتقان الجميلة اسمٌ على مسمّى', en: 'The beautiful Itqaan truly lives up to its name.' },
    name: { ar: 'يمنى', en: 'Yumna' },
    role: { ar: 'طالبة', en: 'Student' },
    months: 32,
  },
  {
    quote: { ar: 'الحلقة جميلة، والأستاذ رائع', en: 'The circle is beautiful, and the teacher is wonderful.' },
    name: { ar: 'علي', en: 'Ali' },
    role: { ar: 'طالب', en: 'Student' },
    months: 55,
  },
  {
    quote: {
      ar: 'ما شاء الله عليكم، وبارك الله بكم، ونفعنا ونفع أولادنا من علمكم',
      en: 'Masha’Allah. May Allah bless you, and benefit us and our children through your knowledge.',
    },
    name: { ar: 'أحمد', en: 'Ahmed' },
    role: { ar: 'طالب', en: 'Student' },
    months: 52,
  },
];
