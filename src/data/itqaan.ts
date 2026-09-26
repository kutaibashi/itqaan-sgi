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
 * A number in the page's digits. 'ar-SY', NOT 'ar': in Node's ICU plain 'ar'
 * formats with Latin digits, which would mix numeral systems on the page.
 */
export function num(n: number, lang: Lang): string {
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-SY' : 'en-US').format(n);
}

/** "أكثر من ١٠٦٬٠٠٠" / "More than 106,000". Written out, never as "+106K". */
export function formatCount(n: number, lang: Lang): string {
  return `${lang === 'ar' ? 'أكثر من' : 'More than'} ${num(roundDown(n), lang)}`;
}

export interface Programme {
  id: 'reading' | 'safra' | 'mahir' | 'maqari';
  count: number;
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
    countLabel: { ar: 'عدد الخرّيجين', en: 'graduates' },
    name: { ar: 'بالقراءة نحيا', en: 'Bil-Qira’ah Nahya' },
    teaches: {
      ar: 'القراءة والكتابة العربية السليمة، مع برنامج تربوي مصاحب',
      en: 'Correct Arabic reading and writing, with a character-education programme',
    },
    meta: { ar: 'من عمر ٥ سنوات · ٤–٦ أشهر', en: 'From age 5 · 4–6 months' },
  },
  {
    id: 'safra',
    count: 11161,
    countLabel: { ar: 'عدد الخرّيجين', en: 'graduates' },
    name: { ar: 'السفرة', en: 'Al-Safarah' },
    teaches: {
      ar: 'تلاوة القرآن الكريم كاملًا نظرًا مع أحكام التجويد',
      en: 'Reading the whole Qur’an from the page, with tajweed',
    },
    meta: { ar: 'خمس مراحل · سنتان إلى ثلاث سنوات', en: 'Five stages · 2–3 years' },
  },
  {
    id: 'mahir',
    count: 2083,
    countLabel: { ar: 'عدد الحفّاظ والحافظات', en: 'have memorised the Qur’an' },
    name: { ar: 'الماهر بالقرآن', en: 'Al-Mahir bil-Qur’an' },
    teaches: {
      ar: 'حفظ القرآن الكريم كاملًا غيبًا، مع برنامج شرعي وتربوي',
      en: 'Memorising the whole Qur’an, with Islamic studies',
    },
    meta: { ar: 'من عمر ١١ سنة · سنة ونصف إلى سنتين', en: 'From age 11 · 18 months to 2 years' },
  },
  {
    id: 'maqari',
    count: 1325,
    countLabel: { ar: 'عدد المُجازين والمُجازات', en: 'ijaza holders' },
    name: { ar: 'المقارئ القرآنية', en: 'Al-Maqari’ al-Qur’aniyyah' },
    teaches: {
      ar: 'إقراء القرآن بالقراءات المتواترة للحفّاظ والحافظات',
      en: 'Teaching the canonical readings to those who have memorised the Qur’an',
    },
    meta: { ar: 'سنة إلى سنة ونصف', en: '1 to 1½ years' },
  },
];

/** The chain's last link. */
export const ijazaLine: L10n = {
  ar: 'إجازةٌ بالسند المتصل إلى رسول الله ﷺ',
  en: 'An ijaza, with a chain of teachers unbroken back to the Prophet ﷺ',
};

/** Places taken in teacher-training courses — a parallel track, not a step. */
export const teacherTraining = { count: 14309 } as const;

/** بالقراءة نحيا graduates online: "إلكتروني" 4,996 + "إلكتروني سوريا" 92. */
export const onlineReadingGraduates = 4996 + 92;

export const areas: { syria: L10n[]; turkey: L10n[] } = {
  syria: [
    { ar: 'ريف دمشق', en: 'Rif Dimashq (Damascus countryside)' },
    { ar: 'حلب وأريافها', en: 'Aleppo and its countryside' },
    { ar: 'إدلب وأريافها', en: 'Idlib and its countryside' },
    { ar: 'مدينة حماة', en: 'Hama' },
  ],
  turkey: [
    { ar: 'غازي عنتاب · المركز الرئيسي', en: 'Gaziantep · headquarters' },
    { ar: 'إسطنبول', en: 'Istanbul' },
    { ar: 'كهرمان مرعش', en: 'Kahramanmaraş' },
    { ar: 'نزيب', en: 'Nizip' },
    { ar: 'كلس', en: 'Kilis' },
  ],
};

/**
 * Students' own words, from Itqaan's site. Months are Itqaan's current figures.
 * No photos: these are named young people, and a fundraising page does not
 * need their faces.
 */
export const voices: { quote: L10n; name: L10n; role: L10n; months: number }[] = [
  {
    quote: { ar: 'إتقان الجميلة اسمٌ على مسمّى', en: 'The beautiful Itqaan truly lives up to its name.' },
    name: { ar: 'يمنى شحيبر', en: 'Yumna Shehaiber' },
    role: { ar: 'طالبة', en: 'Student' },
    months: 32,
  },
  {
    quote: { ar: 'الحلقة جميلة، والأستاذ رائع', en: 'The circle is beautiful, and the teacher is wonderful.' },
    name: { ar: 'علي البلخي', en: 'Ali Al-Balkhi' },
    role: { ar: 'طالب', en: 'Student' },
    months: 55,
  },
  {
    quote: {
      ar: 'ما شاء الله عليكم، وبارك الله بكم، ونفعنا ونفع أولادنا من علمكم',
      en: 'Masha’Allah. May Allah bless you, and benefit us and our children through your knowledge.',
    },
    name: { ar: 'أحمد رواس', en: 'Ahmed Rawas' },
    role: { ar: 'طالب', en: 'Student' },
    months: 52,
  },
];
