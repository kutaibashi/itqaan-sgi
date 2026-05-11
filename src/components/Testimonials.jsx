import { useState, useEffect } from 'react';

const testimonials = [
  {
    quote: "إتقان الجميلة إسم على مسمىٰ",
    name: "يمنى شحيبر",
    image: "https://itkan.info/profile/text/img_avatar_fmale25.png",
    rating: 5,
    duration: "28 شهراً",
    role: "طالبة",
  },
  {
    quote: "شكرا لكم على هذه الحلقه وشكرا لمعلمتي الغاليه هدى المصري🌷",
    name: "رفيف عثمان",
    image: "https://itkan.info/profile/text/img_avatar_fmale25.png",
    rating: 5,
    duration: "22 شهراً",
    role: "طالبة",
  },
  {
    quote: "الحلقة جميلة، والأستاذ رائع",
    name: "علي البلخي",
    image: "https://itkan.info/profile/text/1753682107.png",
    rating: 4,
    duration: "51 شهراً",
    role: "طالب",
  },
  {
    quote: "معهد ممتاز جداً لي تعليم القران الكريم",
    name: "حسين محمد",
    image: "https://itkan.info/profile/text/1761394444.png",
    rating: 5,
    duration: "8 شهراً",
    role: "طالب",
  },
  {
    quote: "ماشاءالله عليكم وبارك الله بكم ونفعنا ونفع أولادنا من علمكم",
    name: "أحمد رواس",
    image: "https://itkan.info/profile/text/1658152227.png",
    rating: 5,
    duration: "48 شهراً",
    role: "طالب",
  },
];

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5 justify-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-[#FABC1C]' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

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
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="text-end">
              <h4 className="font-bold text-[#0a3d62] text-lg">{current.name}</h4>
              <StarRating rating={current.rating} />
            </div>
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#1a9a98]/20 flex-shrink-0">
              <img
                src={current.image}
                alt={current.name}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          {/* Quote */}
          <div className="min-h-[100px] flex items-center justify-center mb-6">
            <blockquote className="text-xl md:text-2xl text-[#0a3d62] leading-relaxed font-bold font-heading text-center">
              "{current.quote}"
            </blockquote>
          </div>

          {/* Footer: duration + role */}
          <div className="text-center border-t border-gray-100 pt-6">
            <div className="flex items-center justify-center gap-3 text-sm">
              <span className="text-[#1a9a98] font-bold">{current.duration}</span>
              <span className="w-px h-4 bg-gray-300"></span>
              <span className="text-gray-500">{current.role}</span>
            </div>
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
