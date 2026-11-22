import React from 'react';
import type { Metadata } from 'next';
import { HeroSection } from '../components/home/HeroSection';
import { ImpactMetricsSection } from '../components/home/ImpactMetricsSection';
import { ServicePillarsSection } from '../components/home/ServicePillarsSection';
import { MissionVisionSection } from '../components/home/MissionVisionSection';
import { HistorySection } from '../components/home/HistorySection';

export const metadata: Metadata = {
  title: 'Lions Club of Balangoda | District 306 Sri Lanka - We Serve',
  description:
    'Official community portal of Lions Club of Balangoda (District 306). Explore our mission, vision, history, and humanitarian service pillars across healthcare, education, environment, and poverty relief.',
  keywords: [
    'Lions Club of Balangoda',
    'Lions District 306',
    'Balangoda Charity',
    'Balangoda Community Projects',
    'Vision Screenings Sri Lanka',
    'Sabaragamuwa Humanitarian Service',
  ],
};

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1 w-full bg-white dark:bg-black text-zinc-900 dark:text-zinc-50">
      {/* 1. Hero Section with Welcome, District, Motto & CTAs */}
      <HeroSection />

      {/* 2. Key Verified Community Impact Metrics */}
      <ImpactMetricsSection />

      {/* 3. Four Core Humanitarian Service Pillars */}
      <ServicePillarsSection />

      {/* 4. Club Mission, Vision & Guiding Principles */}
      <MissionVisionSection />

      {/* 5. Balangoda Charter Heritage & Community Roots */}
      <HistorySection />
    </div>
  );
}
