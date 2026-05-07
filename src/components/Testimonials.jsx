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
    quote: "دورة تأهيل الكوادر غيّرت نظرتي للتعليم القرآني. الآن أدرّس بثقة وعلم، وأرى ثمار ذلك في طلابي every day.",
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

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-[#1a9a98]/5 rounded-full blur-2xl" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#8bc34a]/10 rounded-full blur-2xl" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a9a98]/10 text-[#0a3d62] text-sm font-bold rounded-full mb-4">
            قصص النجاح
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-[#0a3d62] mb-3">
            صوت من <span className="gradient-text">قلوبهم</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            هذه شهادات حقيقية من طلابنا وأولياء أمورهم ومعلمينا.
          </p>
        </div>

        {/* Main testimonial */}
        <div className="relative bg-gradient-to-br from-[#f0f7f7] to-white rounded-3xl p-8 md:p-12 border border-[#1a9a98]/10 shadow-lg">
          <div className="absolute -top-5 right-8 w-10 h-10 bg-[#1a9a98] rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
            </svg>
          </div>

          <div className="min-h-[140px] flex items-center">
            <blockquote className="text-xl md:text-2xl text-gray-700 leading-relaxed font-medium text-center">
              {testimonials[active].quote}
            </blockquote>
          </div>

          <div className="mt-8 text-center">
            <p className="font-bold text-[#0a3d62] text-lg">{testimonials[active].name}</p>
            <p className="text-gray-400 text-sm">{testimonials[active].location}</p>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === active ? 'bg-[#1a9a98] w-8' : 'bg-gray-300 hover:bg-gray-400'
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
