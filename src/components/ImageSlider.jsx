import { useState, useEffect, useCallback } from 'react';

const sliderImages = [
  { src: "/slider-1.jpg", alt: "أنشطة مؤسسة إتقان لتعليم القرآن الكريم" },
  { src: "/slider-2.jpg", alt: "طلاب أكاديمية إتقان في حلقات التحفيظ" },
  { src: "/slider-3.jpg", alt: "برامج مؤسسة إتقان التعليمية" },
  { src: "/slider-4.jpg", alt: "حفظة القرآن الكريم في مؤسسة إتقان" },
  { src: "/slider-5.jpg", alt: "فعاليات وأنشطة أكاديمية إتقان" },
  { src: "/slider-6.jpg", alt: "الحياة اليومية في أكاديمية إتقان" },
  { src: "/slider-7.jpg", alt: "طلاب إتقان في رحلة تعليمية" },
];

export default function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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
    <section className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a9a98]/10 text-[#0a3d62] text-sm font-bold rounded-full mb-5">
            <svg className="w-4 h-4 text-[#1a9a98]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
            </svg>
            لحظات من إتقان
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-[#0a3d62] mb-5">
            صور من <span className="gradient-text">أكاديميتنا</span>
          </h2>
          <p className="text-xl text-gray-500">
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
          <div className="relative aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl bg-gray-100 border-4 border-white">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
            aria-label="الصورة السابقة"
          >
            <svg className="w-6 h-6 text-[#0a3d62]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
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
                className={`h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-[#1a9a98] w-8'
                    : 'bg-gray-300 hover:bg-gray-400 w-3'
                }`}
                aria-label={`الانتقال إلى الصورة ${index + 1}`}
              />
            ))}
          </div>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
            {currentIndex + 1} / {sliderImages.length}
          </div>
        </div>
      </div>
    </section>
  );
}
