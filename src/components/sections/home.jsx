"use client";
import React, { useState, useEffect } from 'react';
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import Dolphin from '@/components/system/dolphin';
import HorizontalScrollCarousel from '@/components/system/horizontal-scroll-carousel';
import TestimonialSection from '@/components/system/testimonial';
import FAQ from '@/components/system/faq';
import { TextAnimate } from '@/components/system/text-animate';
import Link from 'next/link';
import Globe3D from '../system/globe';

export default function HomePage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isModelLoading, setIsModelLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      setScrollProgress(Math.max(0, Math.min(1, p)));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Easing for smoothness
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const lerp = (a, b, t) => a + (b - a) * t;

  // ⬇️ Keyframes: edit these to place the whale for each phase/section
  // x: left(-) / right(+), y: up(+)/down(-), z: depth (smaller negative = closer to camera behind? depends on your scene)
  const KF = [
    { pos: [0.0, -0.6, 1.0], rot: [0, 0 * Math.PI, 0] },  // start (slightly turned)
    { pos: [2.0, 1.0, -1.0], rot: [0, -0.15 * Math.PI, 0] },  // move right, maintain forward
    { pos: [0.0, 0.6, -1.0], rot: [0, 0.00 * Math.PI, 0] },   // center, facing camera
    { pos: [-2.0, 1.0, -1.0], rot: [0, 0.15 * Math.PI, 0] },  // move left, maintain forward
    { pos: [0.0, 0.2, 0.5], rot: [0, 0.25 * Math.PI, 0] },    // center, slightly turned
  ];

  // Compute piecewise position/rotation along keyframes
  const segs = KF.length - 1;
  const scaled = scrollProgress * segs;
  const i = Math.max(0, Math.min(segs - 1, Math.floor(scaled)));
  const tLocal = easeInOut(scaled - i);
  const from = KF[i];
  const to = KF[i + 1];

  const positionOverride = [
    lerp(from.pos[0], to.pos[0], tLocal),
    lerp(from.pos[1], to.pos[1], tLocal),
    lerp(from.pos[2], to.pos[2], tLocal),
  ];
  const rotationOverride = [
    lerp(from.rot[0], to.rot[0], tLocal),
    lerp(from.rot[1], to.rot[1], tLocal),
    lerp(from.rot[2], to.rot[2], tLocal),
  ];

  return (
    <main className='relative'>
      {isModelLoading && (
        <div className="fixed inset-0 z-[999999] bg-[var(--color-warm-zinc)] flex flex-col items-center justify-center">
          <div className="relative z-10 text-center">
            <h1 className="md:text-7xl text-2xl text-black font-mono">
              {Math.round(loadProgress)}% Loaded
            </h1>
          </div>
        </div>
      )}
      <div className='fixed w-full h-full pointer-events-none z-10'>
        <Canvas camera={{ position: [0, 0, 5], fov: 40 }} shadows>
          <Environment preset="city" />
          <Dolphin
            scrollProgress={scrollProgress}
            startPosition={[0, -0.6, 1]}
            endPosition={[2, 1, -1]}
            startRotation={[0, 0, 0]}
            endRotation={[0, Math.PI, 0]}
            tiltAmount={1.15}
            scale={4.5}
            positionOverride={positionOverride}
            rotationOverride={rotationOverride}
            onLoadProgress={(progress) => setLoadProgress(progress)}
            onLoadStatus={(loaded) => setIsModelLoading(!loaded)}
          />
        </Canvas>
      </div>

      {/* First Section */}
      <div className="w-full p-5 transition-all duration-500 ease-in-out"
        style={{
          padding: `${20 - scrollProgress * 20}px`,
        }}
      >
        <section className="relative h-[95vh] rounded-4xl bg-[var(--color-muted-zinc)] overflow-hidden">
          <img src="/bg.png" alt="Background" className="absolute w-full h-full object-cover rounded-4xl blur-md z-0 border-0" />
          <div className="container mx-auto px-4 md:py-32 py-28 relative z-50">
            <h1 className="text-3xl md:text-[6em] font-bold text-center mb-6 text-[var(--color-warm-zinc)] uppercase">
              <TextAnimate by="word" animation="slideUp" startOnView={true} delay={0.6} duration={0.9}>
                Personalized Language Learning for You
              </TextAnimate>
            </h1>
            <p className="text-lg md:text-[1.8rem] text-center text-[var(--color-warm-zinc)] max-w-5xl mx-auto">
              <TextAnimate animation="blurIn" by="line" startOnView={true} delay={0.8} duration={0.9}>Hi there! I'm Sema, and I'm here to guide you on your language learning journey with love, patience, and caring mentorship.</TextAnimate>
            </p>
          </div>
          <div className="w-[300px] h-12 px-6 bg-white dark:bg-zinc-950 rounded-t-full font-bold text-center text-[var(--color-muted-zinc)] flex items-end justify-center bottom-0 mx-auto absolute left-0 right-0">
            Connect via love of language
          </div>
        </section>
      </div>

      {/* Second Section */}
      <section className="py-20 overflow-hidden bg-[#eff2f2] dark:bg-zinc-900" id="second-section">
        <div className="container mx-auto px-5 sm:px-10 md:px-12 lg:px-5 relative z-50">
          {/* Decorative elements */}
          <div className="absolute left-0 w-1/3 h-[600px] bg-[var(--color-soft-blue)] opacity-5 dark:opacity-10 -z-10 rounded-full blur-3xl" />
          <div className="absolute right-0 top-1/4 w-1/4 h-[400px] bg-[var(--color-muted-zinc)] opacity-5 dark:opacity-10 -z-10 rounded-full blur-3xl" />

          <div className="flex flex-col lg:flex-row gap-12 xl:gap-20 items-center">
            {/* Text content with creative layout */}
            <div className="flex-1 space-y-8 relative">
              <div className="relative">
                <h2 className="text-4xl md:text-7xl lg:text-[5.5rem] font-bold text-[var(--color-muted-zinc)] dark:text-[var(--color-muted-zinc-light)] leading-tight">
                  <span className="block mb-2">About Me</span>
                  <span className="block pl-8">My story with you.</span>
                </h2>
                <div className="absolute left-0 top-1/2 w-16 h-1 bg-[var(--color-dusty-rose)] transform -translate-y-1/2" />
              </div>

              <div className="space-y-8 max-w-2xl">
                <div className="relative pl-8 border-l-4 border-[var(--color-soft-blue)] dark:border-[var(--color-soft-blue-dark)]">
                  <p className="text-xl md:text-2xl italic text-zinc-700 dark:text-zinc-300 mb-6 leading-relaxed">
                    I believe language learning is about more than memorizing grammar—it's about  <span className="font-semibold text-[var(--color-muted-zinc)] dark:text-[var(--color-muted-zinc-light)]">unlocking your potential to connect with the world.</span>.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#f8f9fa] dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                    <h3 className="text-xl font-bold text-[var(--color-muted-zinc)] dark:text-[var(--color-muted-zinc-light)] mb-3">My Journey</h3>
                    <p className="text-zinc-700 dark:text-zinc-300">
                      From my home in Hamburg (Germany), I've created Tunalismus with one simple belief: languages are bridges to other cultures and to parts of yourself you never knew existed.
                    </p>
                  </div>

                  <div className="bg-[#f8f9fa] dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                    <h3 className="text-xl font-bold text-[var(--color-muted-zinc)] dark:text-[var(--color-muted-zinc-light)] mb-3">How I Teach</h3>
                    <p className="text-zinc-700 dark:text-zinc-300">
                      I create safe spaces where you can explore languages naturally, focusing on being heard and understood rather than just speaking perfectly.
                    </p>
                  </div>
                </div>

                <div className="bg-[var(--color-warm-zinc)] bg-opacity-10 dark:bg-zinc-800 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold text-[var(--color-muted-zinc)] dark:text-[var(--color-muted-zinc-light)] mb-4">My Promise to You</h3>
                  <ul className="space-y-4">
                    {[
                      {
                        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                        </svg>
                        , title: 'Listen', text: 'Every learner\'s journey is unique'
                      },
                      {
                        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.520-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                        </svg>
                        , title: 'Guide', text: 'Support with modern teaching infused with kindness'
                      },
                      {
                        icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.630 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z" />
                        </svg>
                        , title: 'Adapt', text: 'Your pace and story shape every lesson'
                      }
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-4">
                        <span className="text-2xl text-[var(--color-muted-zinc)] dark:text-[var(--color-muted-zinc-light)]">{item.icon}</span>
                        <div className="text-zinc-700 dark:text-zinc-300">
                          <span className="font-semibold text-[var(--color-muted-zinc)] dark:text-[var(--color-muted-zinc-light)]">{item.title}.</span> {item.text}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Image with creative frame */}
            <div className="w-full lg:w-1/2 xl:w-[45%] relative">
              <div className="relative group">
                {/* Image with hover effect */}
                <img
                  src="/sama.png"
                  alt="Founder Sema teaching"
                  className="relative z-10 w-full h-auto rounded-2xl transform group-hover:-translate-y-2 transition-all duration-500"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-tr from-zinc-100 to-zinc-300 dark:from-zinc-900 dark:to-zinc-700 rounded-3xl" />
                {/* Floating badge */}
                <div className="absolute -bottom-6 -right-6 bg-[var(--color-dusty-rose)] text-white px-6 py-3 rounded-full shadow-lg z-20">
                  <span className="font-bold">Sema, Founder</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Third Section */}
      <section className="min-h-screen w-full bg-[var(--color-dusty-rose)] rounded-b-full">
        <div className="container mx-auto px-4 md:pt-32 pt-28 relative">
          <h2 className="text-3xl md:mb-0 mb-4 md:text-[6rem] font-bold text-center">
            What I Offer You.
          </h2>
          <p className="text-md md:text-[2rem] text-center max-w-2xl mx-auto">
            Explore my range of language courses designed to connect you with cultures and people.
          </p>
          <HorizontalScrollCarousel />
        </div>
      </section>

      {/* Fourth Section */}
      <section className="py-32">
        <div className="container mx-auto px-5 sm:px-10 md:px-12 lg:px-5 relative z-50">
          <div className="flex flex-col space-y-16">
            <div className="flex flex-col justify-center text-center mx-auto md:max-w-7xl space-y-5">
              <span className="rounded-lg bg-[var(--color-soft-blue)]/10 dark:bg-[var(--color-soft-blue)]/20 px-2.5 py-1 text-xs w-max mx-auto font-semibold tracking-wide text-[var(--color-muted-zinc)] dark:text-[var(--color-soft-blue)]">
                Why Choose Me?
              </span>
              <h1 className="text-2xl md:text-[6rem] font-bold text-center text-[var(--color-muted-zinc)] dark:text-white">
                Language Learning, Designed for Real Life
              </h1>
              <p className="text-zinc-700 dark:text-zinc-300 max-w-3xl mx-auto md:text-xl">
                When you learn with me, it's never just about grammar—it's about connection, confidence, and being truly understood.
              </p>
            </div>
            <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-4 lg:items-center">
              {/* Feature 1 */}
              <div className="order-1 grid gap-10 sm:grid-cols-2 md:order-1 md:grid-cols-1 lg:order-1">
                <div className="flex flex-col space-y-6 justify-center md:justify-start">
                  <span className="p-2 rounded-md bg-[var(--color-soft-blue)]/10 dark:bg-[var(--color-soft-blue)]/20 text-[var(--color-soft-blue)] flex w-max">
                    {/* Personalized icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M10 3.5a4 4 0 014 4c0 2-1.5 3.5-4 3.5S6 9.5 6 7.5a4 4 0 014-4zm2 9.5a8 8 0 01-8 0C4 15 10 15 12 13z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <h1 className="flex text-lg font-semibold capitalize text-zinc-900 dark:text-white">
                    Personalized Learning
                  </h1>
                  <p className="text-sm font-light text-zinc-700 dark:text-zinc-300">
                    Lessons adapt to your goals, pace, and story. You're not just a student—you're the center of the experience.
                  </p>
                </div>
                <div className="flex flex-col space-y-6 justify-center md:justify-start">
                  <span className="p-2 rounded-md bg-[var(--color-muted-zinc)]/10 dark:bg-[var(--color-muted-zinc)]/20 text-[var(--color-muted-zinc)] flex w-max">
                    {/* Community icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M10 2a4 4 0 011 7.87V12a2 2 0 103.165 1.575A2.5 2.5 0 0010 14a2.5 2.5 0 00-4.165-2.425A2 2 0 109 12V9.87A4 4 0 0110 2z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <h1 className="flex text-lg font-semibold capitalize text-zinc-900 dark:text-white">
                    Welcoming Community
                  </h1>
                  <p className="text-sm font-light text-zinc-700 dark:text-zinc-300">
                    Learn with support, encouragement, and celebration for every step. Tunalismus is a safe space for every learner.
                  </p>
                </div>
              </div>
              {/* Center visual / illustration */}
              <div className="flex items-center justify-center order-3 md:col-span-2 lg:order-2 lg:row-span-2 lg:h-full">
                <Globe3D modelPath="/earth/scene.gltf" />
              </div>
              {/* Feature 2 */}
              <div className="order-1 grid gap-10 sm:grid-cols-2 md:order-2 md:grid-cols-1 lg:order-3">
                <div className="flex flex-col space-y-6 justify-center md:justify-start">
                  <span className="p-2 rounded-md bg-[var(--color-dusty-rose)]/10 dark:bg-[var(--color-dusty-rose)]/20 text-[var(--color-dusty-rose)] flex w-max">
                    {/* Real world icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path d="M2 10a8 8 0 1116 0A8 8 0 012 10zm8 6a6 6 0 100-12 6 6 0 000 12zm0-2a4 4 0 110-8 4 4 0 010 8z" />
                    </svg>
                  </span>
                  <h1 className="flex text-lg font-semibold capitalize text-zinc-900 dark:text-white">
                    Real-World Focus
                  </h1>
                  <p className="text-sm font-light text-zinc-700 dark:text-zinc-300">
                    Practice with conversations and scenarios you'll actually face in life, travel, and work—so you feel ready for the real world.
                  </p>
                </div>
                <div className="flex flex-col space-y-6 justify-center md:justify-start">
                  <span className="p-2 rounded-md bg-[var(--color-warm-zinc)]/50 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex w-max">
                    {/* Expertise icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm3 8a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <h1 className="flex text-lg font-semibold capitalize text-zinc-900 dark:text-white">
                    Experience Across Cultures
                  </h1>
                  <p className="text-sm font-light text-zinc-700 dark:text-zinc-300">
                    Learn from a lifelong connector who's taught and lived in multilingual environments around the world.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fifth Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-[var(--color-warm-zinc)] to-white dark:from-zinc-800 dark:to-zinc-900 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-block bg-[var(--color-soft-blue)]/10 text-[var(--color-muted-zinc)] dark:bg-blue-900/20 dark:text-zinc-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Learning Resources
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-4">
              Language Learning Tips & Guides
            </h2>
            <p className="text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto text-base md:text-lg">
              Discover proven strategies, cultural insights, and practical tips to accelerate your language learning journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "5 Daily Habits That Will Transform Your Language Skills",
                excerpt: "Simple yet powerful daily routines that native speakers use to maintain fluency and continue growing their vocabulary.",
                category: "Learning Tips",
                readTime: "7 min read",
                image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop",
                slug: "daily-habits-transform-language-skills"
              },
              {
                title: "Cultural Context: Why Grammar Rules Aren't Everything",
                excerpt: "Understanding the cultural nuances behind language use and how context shapes meaning in real conversations.",
                category: "Cultural Insights",
                readTime: "5 min read",
                image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=250&fit=crop",
                slug: "cultural-context-grammar-rules"
              },
              {
                title: "From Beginner to Conversational in 90 Days",
                excerpt: "A structured approach to reaching conversational level quickly while building solid foundations for long-term success.",
                category: "Study Plans",
                readTime: "10 min read",
                image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop",
                slug: "beginner-to-conversational-90-days"
              }
            ].map((article, index) => (
              <Link key={index} href={`/blog/${article.slug}`}>
                <article className="bg-white dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl dark:hover:shadow-zinc-700/50 transition-all duration-300 group cursor-pointer">
                <div className="relative overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-[var(--color-dusty-rose)] dark:bg-[var(--color-dusty-rose)] text-white px-3 py-1 rounded-full text-xs font-medium">
                      {article.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl text-[var(--color-muted-zinc)] dark:text-zinc-300 mb-3 group-hover:text-[var(--color-dusty-rose)] dark:group-hover:text-[var(--color-dusty-rose)] transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-300 text-sm mb-4 leading-relaxed">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{article.readTime}</span>
                    <div className="flex items-center text-[var(--color-dusty-rose)] dark:text-[var(--color-dusty-rose)] font-medium text-sm">
                      Read more
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </article>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/blog" className="inline-flex items-center px-8 py-4 bg-zinc-950 dark:bg-zinc-700 text-white rounded-full font-semibold hover:bg-zinc-950/90 dark:hover:bg-zinc-600 transition-colors duration-300">
              View All Articles
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Sixth Section  */}
      <section className="py-16 md:py-24 relative overflow-hidden z-10">
        <div className="absolute inset-0 opacity-10 z-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-soft-blue)] dark:bg-blue-800 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[var(--color-dusty-rose)] dark:bg-pink-800 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-block bg-white/10 dark:bg-zinc-700 text-[var(--color-dusty-rose)] dark:text-[var(--color-dusty-rose)] px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Book Your Consultation
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 dark:text-white">
              Start Your Language Journey
            </h2>
            <p className="text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto text-base md:text-lg">
              Let's discuss your language learning goals and create a personalized plan that works for you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Individual Consultation",
                icon: "👤",
                description: "Perfect for personal language learning goals",
                features: [
                  "Personalized learning assessment",
                  "Custom study plan creation",
                  "Goal setting & timeline",
                  "Learning style evaluation",
                  "Cultural context discussion",
                  "Flexible scheduling options"
                ],
                cta: "Book Individual Consultation",
                popular: false,
                bgColor: "bg-white/5 dark:bg-zinc-800/50",
                formType: "individual",
                url: "/consultation/individual"
              },
              {
                name: "Corporate Consultation",
                icon: "🏢",
                description: "Language training solutions for your organization",
                features: [
                  "Team needs assessment",
                  "Custom training programs",
                  "Corporate culture integration",
                  "Progress tracking systems",
                  "Flexible delivery options",
                  "ROI-focused approach"
                ],
                cta: "Book Corporate Consultation",
                popular: true,
                bgColor: "bg-[var(--color-dusty-rose)] dark:bg-[var(--color-dusty-rose)]",
                formType: "corporate",
                url: "/consultation/corporate"
              },
              {
                name: "Education Institute Consultation",
                icon: "🎓",
                description: "Language programs for schools and institutions",
                features: [
                  "Curriculum development",
                  "Teacher training programs",
                  "Student assessment tools",
                  "Cultural exchange programs",
                  "Technology integration",
                  "Academic partnership opportunities"
                ],
                cta: "Book Institutional Consultation",
                popular: false,
                bgColor: "bg-white/5 dark:bg-zinc-800/50",
                formType: "school",
                url: "/consultation/institutional"
              }
            ].map((plan, index) => (
              <div key={index} className={`relative rounded-2xl p-8 ${plan.bgColor} ${plan.popular ? 'ring-2 ring-[var(--color-dusty-rose)] dark:ring-[var(--color-dusty-rose)] scale-105' : ''} transition-all duration-300 hover:scale-105`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[var(--color-dusty-rose)] dark:bg-[var(--color-dusty-rose)] text-white px-4 py-2 rounded-full text-sm font-bold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className="text-4xl mb-4">{plan.icon}</div>
                  <h3 className="text-xl font-bold mb-2 dark:text-white">{plan.name}</h3>
                  <p className="text-zinc-300 dark:text-zinc-100/80 text-xs">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm dark:text-zinc-300">
                      <svg className="w-5 h-5 text-[var(--color-dusty-rose)] dark:text-[var(--color-dusty-rose)] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.url}
                  className={`w-full py-3 px-6 rounded-full font-semibold transition-all duration-300 block text-center ${plan.popular
                    ? 'bg-white text-[var(--color-muted-green)] dark:bg-white dark:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-200'
                    : 'bg-[var(--color-dusty-rose)] dark:bg-[var(--color-dusty-rose)] text-white hover:bg-[var(--color-dusty-rose)]/90 dark:hover:bg-[var(--color-dusty-rose)]/20'
                    }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 pt-8 border-t border-white/10 dark:border-zinc-700">
            <p className="text-zinc-600 dark:text-zinc-300 text-sm">
              💝 All consultations are personalized to your specific needs and goals.
              <br className="hidden sm:block" />
              <strong className="dark:text-white">Custom pricing</strong> based on your requirements and learning objectives.
            </p>
          </div>
        </div>
      </section>


      {/* Siventh Section  */}
      <FAQ />

      {/* Eight Section  */}
      <section className="py-24 bg-white dark:bg-zinc-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-5 sm:px-10 md:px-12 lg:px-5 relative z-50 backdrop-blur-3xl">
          <div className="w-full relative py-8 md:py-10 px-6 md:px-8 rounded-2xl bg-gradient-to-tr from-amber-50 to-blue-50/20 dark:from-zinc-800 dark:to-blue-900/20 shadow-lg dark:shadow-zinc-800/20">
            {/* Top-right abstract accents */}
            <div className="absolute right-0 top-0 h-full w-full flex justify-end pointer-events-none">
              <div className="w-28 h-28 overflow-hidden flex rounded-xl relative blur-2xl">
                <span className="absolute w-16 h-16 -top-1 -right-1 bg-blue-200 dark:bg-blue-700 rounded-md rotate-45" />
                <span className="absolute w-16 h-16 -bottom-1 -right-1 bg-zinc-300 dark:bg-zinc-600 rounded-md rotate-45" />
                <span className="absolute w-16 h-16 -bottom-1 -left-1 bg-yellow-300 dark:bg[var(--color-dusty-rose)] rounded-md rotate-45" />
              </div>
            </div>
            {/* Bottom-left abstract accents */}
            <div className="absolute left-0 bottom-0 h-full w-full flex items-end pointer-events-none">
              <div className="w-28 h-28 overflow-hidden flex rounded-xl relative blur-2xl">
                <span className="absolute w-16 h-16 -top-1 -right-1 bg-blue-200 dark:bg-indigo-700 rounded-md rotate-45" />
                <span className="absolute w-16 h-16 -bottom-1 -right-1 bg-zinc-300 dark:bg-zinc-600 rounded-md rotate-45" />
                <span className="absolute w-16 h-16 -bottom-1 -left-1 bg-yellow-300 dark:bg-[var(--color-dusty-rose)] rounded-md rotate-45" />
              </div>
            </div>
            <div className="mx-auto text-center max-w-xl md:max-w-2xl relative space-y-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-zinc-600 to-[var(--color-dusty-rose)] dark:from-zinc-300 dark:to-[var(--color-dusty-rose)] uppercase">
                Ready to Start Your Language Journey?
              </h1>
              <p className="text-zinc-600 dark:text-zinc-300">
                Book a free intro session or dive right in, discover language learning that's modern, kind, and made for you.
              </p>
              <div className="flex justify-center items-center flex-wrap mx-auto gap-4">
                <a href="#" className="flex items-center h-12 px-6 rounded-full bg-[var(--color-dusty-rose)] text-white border border-[var(--color-dusty-rose)] hover:bg-[var(--color-dusty-rose)]/40 dark:hover:bg-[var(--color-dusty-rose)]/40 transition-colors">
                  Get in touch
                </a>
                <a href="#" className="flex items-center h-12 px-6 rounded-full bg-zinc-700 dark:bg-zinc-600 text-zinc-100 dark:text-zinc-200 border border-zinc-600 dark:border-zinc-500 hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors">
                  Learn more
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--color-muted-zinc)] dark:bg-zinc-900 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-[var(--color-dusty-rose)] rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <h3 className="text-2xl font-bold">Tunalismus</h3>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Learn languages the human way. Personalized, caring, and real-world focused language learning with Sema.
              </p>
              <div className="flex space-x-4">
                {/* Social Media Links */}
                <a 
                  href="https://facebook.com/tunalismus" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-700 hover:bg-[var(--color-dusty-rose)] rounded-full flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                
                <a 
                  href="https://instagram.com/tunalismus" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-700 hover:bg-[var(--color-dusty-rose)] rounded-full flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.281H7.721c-.49 0-.875.385-.875.875v8.449c0 .49.385.875.875.875h8.449c.49 0 .875-.385.875-.875V8.582c0-.49-.385-.875-.875-.875z"/>
                  </svg>
                </a>
                
                <a 
                  href="https://twitter.com/tunalismus" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-700 hover:bg-[var(--color-dusty-rose)] rounded-full flex items-center justify-center transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                
                <a 
                  href="https://linkedin.com/company/tunalismus" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-700 hover:bg-[var(--color-dusty-rose)] rounded-full flex items-center justify-center transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                
                <a 
                  href="https://youtube.com/@tunalismus" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-700 hover:bg-[var(--color-dusty-rose)] rounded-full flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/courses" className="text-gray-300 hover:text-white transition-colors">Courses</a></li>
                <li><a href="/about" className="text-gray-300 hover:text-white transition-colors">About</a></li>
                <li><a href="/blog" className="text-gray-300 hover:text-white transition-colors">Blog</a></li>
                <li><a href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-300">
                <p>📍 Hyderabad, India</p>
                <p>📧 contact@tunalismus.com</p>
                <p>📞 +91 80196 82031</p>
                <p>🌐 www.tunalismus.com</p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Tunalismus. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}
