'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { HOME_GALLERY } from '@/lib/home-gallery.generated';

type Connection = EventTarget & { saveData?: boolean; effectiveType?: string };

export default function HomePhotoCarousel({ language }: { language: string }) {
  const container = useRef<HTMLDivElement>(null);
  const loadedImages = useRef(new Set<number>());
  const [slides, setSlides] = useState({ requested: 0, displayed: 0, requestedImages: [0] });
  const [inView, setInView] = useState(false);
  const [canAutoplay, setCanAutoplay] = useState(false);

  const step = useCallback((direction: number) => {
    setSlides(previous => {
      const requested = (previous.requested + direction + HOME_GALLERY.length) % HOME_GALLERY.length;
      return {
        requested,
        displayed: loadedImages.current.has(requested) ? requested : previous.displayed,
        requestedImages: previous.requestedImages.includes(requested)
          ? previous.requestedImages : [...previous.requestedImages, requested],
      };
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 });
    if (container.current) observer.observe(container.current);
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    const update = () => setCanAutoplay(
      !document.hidden && !motion.matches && !connection?.saveData &&
      !['slow-2g', '2g'].includes(connection?.effectiveType || '')
    );
    update();
    document.addEventListener('visibilitychange', update);
    motion.addEventListener('change', update);
    connection?.addEventListener('change', update);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
      motion.removeEventListener('change', update);
      connection?.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    if (!inView || !canAutoplay) return;
    const timer = setInterval(() => step(1), 5000);
    return () => clearInterval(timer);
  }, [inView, canAutoplay, slides.requested, step]);

  return (
    <div ref={container} className="relative w-full aspect-[16/7] rounded-2xl overflow-hidden border border-[#E4DBCA] shadow-md bg-white">
      <button
        type="button"
        onClick={() => step(-1)}
        aria-label={language === 'id' ? 'Gambar sebelumnya' : 'Previous image'}
        className="absolute left-3 top-1/2 z-20 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 text-white font-bold text-lg hover:bg-black/65 transition-all"
      >←</button>
      <button
        type="button"
        onClick={() => step(1)}
        aria-label={language === 'id' ? 'Gambar selanjutnya' : 'Next image'}
        className="absolute right-3 top-1/2 z-20 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 text-white font-bold text-lg hover:bg-black/65 transition-all"
      >→</button>
      {HOME_GALLERY.map((image, index) => slides.requestedImages.includes(index) && (
        // These responsive WebP files are prepared at build time and served
        // directly from the CDN, without Vercel image transformations.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={image.src}
          {...image}
          sizes="(min-width: 1200px) 1152px, calc(100vw - 48px)"
          alt={language === 'id' ? `Aktivitas PPIAQ ${index + 1}` : `PPIAQ activities ${index + 1}`}
          loading={index === 0 ? 'lazy' : 'eager'}
          decoding="async"
          onLoad={() => {
            loadedImages.current.add(index);
            setSlides(previous => previous.requested === index ? { ...previous, displayed: index } : previous);
          }}
          aria-hidden={slides.displayed !== index}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 motion-reduce:transition-none ${
            slides.displayed === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </div>
  );
}
