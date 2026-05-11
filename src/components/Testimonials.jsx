import { useState, useEffect } from 'react';

const testimonials = [
  {
    quote: "إتقان الجميلة إسم على مسمىٰ",
    name: "يمنى شحيبر",
    image: "/avatar-ymn.png",
    duration: "28 شهراً",
    role: "طالبة",
  },
  {
    quote: "شكرا لكم على هذه الحلقه وشكرا لمعلمتي الغاليه هدى المصري🌷",
    name: "رفيف عثمان",
    image: "/avatar-rf.png",
    duration: "22 شهراً",
    role: "طالبة",
  },
  {
    quote: "الحلقة جميلة، والأستاذ رائع",
    name: "علي البلخي",
    image: "/avatar-ali.png",
    duration: "51 شهراً",
    role: "طالب",
  },
  {
    quote: "معهد ممتاز جداً لي تعليم القران الكريم",
    name: "حسين محمد",
    image: "/avatar-hsn.png",
    duration: "8 شهراً",
    role: "طالب",
  },
  {
    quote: "ماشاءالله عليكم وبارك الله بكم ونفعنا ونفع أولادنا من علمكم",
    name: "أحمد رواس",
    image: "/avatar-ahm.png",
    duration: "48 شهراً",
    role: "طالب",
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

  const current = mounted ? testimonials[active] : testimonials[0];

  return (
    <section className="py-20 md:py-28 bg-[#f9fbfb] relative overflow-hidden border-y border-[#1a9a98]/20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#1a9a98]/20 text-[#0a3d62] text-sm font-bold rounded-md mb-4 shadow-sm">
            طلابنا
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0a3d62] mb-3 font-heading">
            ماذا يقول <span className="text-[#1a9a98]">الطلاب</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            هذه شهادات حقيقية من طلابنا وأولياء أمورهم ومعلمينا.
          </p>
        </div>

        {/* Main testimonial card */}
        <div className="relative bg-white rounded-lg p-8 md:p-12 border border-[#1a9a98]/20 shadow-md">
          <div className="absolute -top-5 right-8 w-10 h-10 bg-[#0a3d62] rounded-md flex items-center justify-center border border-[#1a9a98]/30">
            <svg className="w-5 h-5 text-[#8bc34a]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
            </svg>
          </div>

          {/* Author info */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#1a9a98]/20 flex-shrink-0">
              <img
                src={current.image}
                alt={current.name}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div>
              <h4 className="font-bold text-[#0a3d62] text-lg">{current.name}</h4>
              <p className="text-gray-500 text-sm">{current.role}</p>
            </div>
          </div>

          {/* Quote */}
          <div className="min-h-[100px] flex items-center justify-center mb-6">
            <blockquote className="text-xl md:text-2xl text-[#0a3d62] leading-relaxed font-bold font-heading text-center">
              "{current.quote}"
            </blockquote>
          </div>

          {/* Footer: duration */}
          <div className="text-center border-t border-gray-100 pt-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#1a9a98]/10 text-[#0a3d62] text-sm font-bold rounded-full">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
              {current.duration}
            </span>
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
