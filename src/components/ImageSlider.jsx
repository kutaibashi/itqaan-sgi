import { useState, useEffect, useCallback } from 'react';

const sliderImagesAr = [
  { src: "/slider-1.jpg", alt: "أنشطة مؤسسة إتقان لتعليم القرآن الكريم" },
  { src: "/slider-2.jpg", alt: "طلاب أكاديمية إتقان في حلقات التحفيظ" },
  { src: "/slider-3.jpg", alt: "برامج مؤسسة إتقان التعليمية" },
  { src: "/slider-4.jpg", alt: "حفظة القرآن الكريم في مؤسسة إتقان" },
  { src: "/slider-5.jpg", alt: "فعاليات وأنشطة أكاديمية إتقان" },
  { src: "/slider-6.jpg", alt: "الحياة اليومية في أكاديمية إتقان" },
  { src: "/slider-7.jpg", alt: "طلاب إتقان في رحلة تعليمية" },
];

const sliderImagesEn = [
  { src: "/slider-1.jpg", alt: "Itkan Academy activities" },
  { src: "/slider-2.jpg", alt: "Students in memorization circles" },
  { src: "/slider-3.jpg", alt: "Educational programs at Itkan" },
  { src: "/slider-4.jpg", alt: "Qur'an memorizers at Itkan" },
  { src: "/slider-5.jpg", alt: "Events and activities at Itkan Academy" },
  { src: "/slider-6.jpg", alt: "Daily life at Itkan Academy" },
  { src: "/slider-7.jpg", alt: "Itkan students on an educational trip" },
];

export default function ImageSlider({ lang = 'ar' }) {
  const isEn = lang === 'en';
  const sliderImages = isEn ? sliderImagesEn : sliderImagesAr;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % sliderImages.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  }, []);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Auto-advance slides
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#8bc34a]/15 text-[#0a3d62] text-sm font-bold rounded-full mb-4">
            <svg className="w-4 h-4 text-[#8bc34a]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
            </svg>
            لحظات من إتقان
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#0a3d62] mb-4 font-heading">
            صور من <span className="text-[#1a9a98]">أكاديميتنا</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            لقطات من فعالياتنا وأنشطتنا التعليمية على أرض الواقع.
          </p>
        </div>

        {/* Slider Container */}
        <div
          className="relative max-w-5xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Main Image */}
          <div className="relative aspect-[16/10] rounded-lg overflow-hidden shadow-xl bg-gray-100 border border-[#1a9a98]/20">
            {sliderImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  index === currentIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white hover:bg-gray-50 border border-gray-200 rounded-md shadow-md flex items-center justify-center transition-colors duration-200 z-10"
            aria-label="الصورة السابقة"
          >
            <svg className="w-6 h-6 text-[#0a3d62]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white hover:bg-gray-50 border border-gray-200 rounded-md shadow-md flex items-center justify-center transition-colors duration-200 z-10"
            aria-label="الصورة التالية"
          >
            <svg className="w-6 h-6 text-[#0a3d62]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {sliderImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-[#0a3d62] w-8'
                    : 'bg-gray-300 hover:bg-gray-400 w-2'
                }`}
                aria-label={`الانتقال إلى الصورة ${index + 1}`}
              />
            ))}
          </div>

          {/* Image Counter */}
          <div suppressHydrationWarning className="absolute top-4 left-4 bg-[#0a3d62]/90 text-white px-4 py-1.5 rounded-md text-sm font-bold shadow-sm">
            {mounted ? `${currentIndex + 1} / ${sliderImages.length}` : `1 / ${sliderImages.length}`}
          </div>
        </div>
      </div>
    </section>
  );
}
