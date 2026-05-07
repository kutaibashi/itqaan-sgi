import { useState, useEffect, useRef } from 'react';

function Counter({ end, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTime = null;
          const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * end));
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return (
    <span ref={ref}>
      {count.toLocaleString('ar-SA')}{suffix}
    </span>
  );
}

export default function StatsCounter() {
  const stats = [
    { value: 500, suffix: '+', label: 'طالب وطالبة', color: 'text-[#8bc34a]' },
    { value: 15, suffix: '+', label: 'مركز تعليمي', color: 'text-[#8bc34a]' },
    { value: 7, suffix: '', label: 'مشاريع نوعية', color: 'text-[#8bc34a]' },
    { value: 9, suffix: '+', label: 'مدينة ومنطقة', color: 'text-[#8bc34a]' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-6 border border-white/10 text-center group hover:bg-white/15 transition-all duration-300 hover:-translate-y-1"
        >
          <p className={`text-3xl md:text-4xl font-black ${stat.color} mb-1`}>
            <Counter end={stat.value} suffix={stat.suffix} />
          </p>
          <p className="text-sm text-white/70">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
