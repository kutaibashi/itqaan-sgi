import { useState, useEffect } from 'react';

const testimonials = [
  {
    quote: "لولا مؤسسة إتقان، ما كنتُ سأتمكن من حفظ ثلاثة أجزاء من القرآن الكريم في سنة واحدة. المعلمون يتميزون بالصبر والإتقان.",
    name: "أحمد - طالب",
    location: "غازي عنتاب",
  },
  {
    quote: "أرسلتُ ابني إلى مركز إتقان وهو لا يجيد القراءة الصحيحة، والآن -بفضل الله- يقرأ القرآن بتجويد ويتقدم بخطوات ثابتة.",
    name: "أم محمد",
    location: "إدلب",
  },
  {
    quote: "دورة تأهيل الكوادر غيّرت نظرتي للتعليم القرآني. الآن أدرّس بثقة وعلم، وأرى ثمار ذلك في طلابي.",
    name: "المعلمة فاطمة",
    location: "حلب",
  },
  {
    quote: "المركز الإلكتروني مكّنني من متابعة حفظ القرآن رغم بعد المسافة. فكرة رائعة تصل العلم إلى كل مكان.",
    name: "عبد الرحمن",
    location: "إسطنبول",
  },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [mounted]);

  return (
    <section className="py-20 md:py-28 bg-[#f9fbfb] relative overflow-hidden border-y border-[#1a9a98]/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#1a9a98]/20 text-[#0a3d62] text-sm font-bold rounded-md mb-4 shadow-sm">
            قصص النجاح
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0a3d62] mb-3 font-heading">
            صوت من <span className="text-[#1a9a98]">قلوبهم</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            هذه شهادات حقيقية من طلابنا وأولياء أمورهم ومعلمينا.
          </p>
        </div>

        {/* Main testimonial */}
        <div className="relative bg-white rounded-lg p-8 md:p-12 border border-[#1a9a98]/20 shadow-md">
          <div className="absolute -top-5 right-8 w-10 h-10 bg-[#0a3d62] rounded-md flex items-center justify-center border border-[#1a9a98]/30">
            <svg className="w-5 h-5 text-[#8bc34a]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
            </svg>
          </div>

          <div className="min-h-[140px] flex items-center justify-center">
            <blockquote suppressHydrationWarning className="text-xl md:text-2xl text-[#0a3d62] leading-relaxed font-bold font-heading text-center">
              {mounted ? testimonials[active].quote : testimonials[0].quote}
            </blockquote>
          </div>

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p suppressHydrationWarning className="font-bold text-[#1a9a98] text-lg">{mounted ? testimonials[active].name : testimonials[0].name}</p>
            <p suppressHydrationWarning className="text-gray-500 text-sm mt-1">{mounted ? testimonials[active].location : testimonials[0].location}</p>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === active ? 'bg-[#0a3d62] w-8' : 'bg-gray-300 hover:bg-gray-400 w-2.5'
                }`}
                aria-label={`شهادة ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
