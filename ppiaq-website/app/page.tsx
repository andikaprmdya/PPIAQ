'use client';

import HeroSection from '@/components/sections/hero';
import MissionSection from '@/components/sections/mission';
import CTASection from '@/components/sections/cta';
import FAQSection from '@/components/sections/faq';
import NewsletterSection from '@/components/sections/newsletter';
import FeaturesSection from '@/components/sections/features';

export default function Home() {
  return (
    <>
      <HeroSection />
      <MissionSection />
      <FeaturesSection />
      <CTASection />
      <FAQSection />
      <NewsletterSection />
    </>
  );
}
