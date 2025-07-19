"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  useScrollAnimation,
  useScrollAnimationMultiple,
  useCountAnimation,
  useTypingAnimation
} from "@/hooks/use-scroll-animation";

export default function Home() {
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  // Enhanced scroll animations with delays
  const heroAnimation = useScrollAnimation(0.1, 300);
  const featuresAnimation = useScrollAnimation(0.1, 200);
  const howItWorksAnimation = useScrollAnimation(0.1, 100);
  const benefitsAnimation = useScrollAnimation(0.1, 150);
  const testimonialsAnimation = useScrollAnimation(0.1, 100);
  const blogAnimation = useScrollAnimation(0.1, 120);

  // Multiple item animations with stagger
  const { createRef: createFeatureRef, isVisible: isFeatureVisible } = useScrollAnimationMultiple(0.1, 200);
  const { createRef: createStepRef, isVisible: isStepVisible } = useScrollAnimationMultiple(0.1, 150);
  const { createRef: createTestimonialRef, isVisible: isTestimonialVisible } = useScrollAnimationMultiple(0.1, 250);
  const { createRef: createBlogRef, isVisible: isBlogVisible } = useScrollAnimationMultiple(0.1, 200);

  // Counter animations for statistics
  const satisfactionCounter = useCountAnimation(98, 2000);
  const scansCounter = useCountAnimation(2.3, 2500);
  const ratingCounter = useCountAnimation(4.8, 2200);

  // Typing animation for hero title
  const heroTitle = useTypingAnimation("Level Up Your", 80);

  // Scroll detection for sticky header
  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById('hero-section');
      if (heroSection) {
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        const scrollPosition = window.scrollY + 100; // Add some offset
        setShowStickyHeader(scrollPosition > heroBottom);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80; // Account for sticky header height
      const elementPosition = element.offsetTop - headerOffset;

      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  // Scroll to features section (end of hero)
  const scrollToFeatures = () => {
    scrollToSection('features-section');
  };

  return (
    <div className="broglow-landing-page min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sticky Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${showStickyHeader
          ? 'translate-y-0 opacity-100 backdrop-blur-md bg-white/90 shadow-lg border-b border-gray-200'
          : '-translate-y-full opacity-0'
        }`}>
        <div className="container mx-auto px-6 lg:px-20">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center">
              <Image
                src="/broglow-logo.png"
                width={120}
                height={36}
                alt="BroGlow Logo"
                className="cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => scrollToSection('hero-section')}
              />
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('features-section')}
                className="text-slate-700 hover:text-primary-blue font-medium transition-colors duration-300 hover:scale-105 transform cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works-section')}
                className="text-slate-700 hover:text-primary-blue font-medium transition-colors duration-300 hover:scale-105 transform cursor-pointer"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('benefits-section')}
                className="text-slate-700 hover:text-primary-blue font-medium transition-colors duration-300 hover:scale-105 transform cursor-pointer"
              >
                Benefits
              </button>
              <button
                onClick={() => scrollToSection('testimonials-section')}
                className="text-slate-700 hover:text-primary-blue font-medium transition-colors duration-300 hover:scale-105 transform cursor-pointer"
              >
                Reviews
              </button>
              <button
                onClick={() => scrollToSection('blog-section')}
                className="text-slate-700 hover:text-primary-blue font-medium transition-colors duration-300 hover:scale-105 transform cursor-pointer"
              >
                Blog
              </button>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="hidden sm:block text-slate-700 hover:text-primary-blue font-medium transition-colors duration-300"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-primary-blue to-primary-lightblue text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:scale-105 transform transition-all duration-300 magnetic-btn"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero-section" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Enhanced Background Animation */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse parallax-bg"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000 parallax-bg"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-primary-blue rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000 parallax-bg"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-20 text-center relative z-10">
          <div
            ref={heroAnimation.ref}
            className={`transform transition-all duration-1200 ${heroAnimation.isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'
              }`}
          >
            <Image
              src="/broglow-logo.png"
              width={300}
              height={90}
              alt="BroGlow Logo"
              className="mx-auto mb-8 filter brightness-0 invert transform hover:scale-110 transition-transform duration-500"
              priority
            />

            <div className="overflow-hidden">
              <h1
                ref={heroTitle.ref}
                className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight"
              >
                {heroTitle.displayText || "Level Up Your"}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent block animate-pulse">
                  Skin Game
                </span>
              </h1>
            </div>

            <p className={`text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed transform transition-all duration-1000 delay-500 ${heroAnimation.isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
              }`}>
              Revolutionary AI-powered skincare designed specifically for men.
              Scan, track, and transform your skin with personalized recommendations.
            </p>

            <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 transform transition-all duration-1000 delay-700 ${heroAnimation.isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
              }`}>
              <Link
                href="/register"
                className="btn-primary magnetic-btn ripple-btn enhanced-glow bg-gradient-to-r from-primary-blue to-primary-lightblue text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300 min-w-[200px]"
              >
                Start Your Journey
              </Link>
              <Link
                href="/login"
                className="btn-primary magnetic-btn border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-slate-900 transform transition-all duration-300 min-w-[200px]"
              >
                Already Have Account
              </Link>
            </div>

            <div className={`flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-gray-400 text-sm sm:text-base transform transition-all duration-1000 delay-900 ${heroAnimation.isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
              }`}>
              <div className="flex items-center gap-2 hover:scale-110 transition-transform duration-300 cursor-pointer">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span>AI-Powered Analysis</span>
              </div>
              <div className="flex items-center gap-2 hover:scale-110 transition-transform duration-300 cursor-pointer">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <span>Personalized Solutions</span>
              </div>
              <div className="flex items-center gap-2 hover:scale-110 transition-transform duration-300 cursor-pointer">
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                <span>Progress Tracking</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Scroll Indicator with Click Handler */}
        <div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hover:scale-110 transition-transform duration-300 cursor-pointer group"
          onClick={scrollToFeatures}
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center group-hover:border-blue-400 transition-colors duration-300">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse group-hover:bg-blue-400 transition-colors duration-300"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-20">
          <div
            ref={featuresAnimation.ref}
            className={`text-center mb-16 scroll-fade-up ${featuresAnimation.isVisible ? 'animate-in' : ''}`}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
              Why Choose <span className="text-primary-blue">BroGlow</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built specifically for men who want results, not complexity. Our AI technology delivers personalized skincare that actually works.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div
              ref={createFeatureRef(0)}
              className={`text-center group hover:transform hover:scale-105 transition-all duration-700 stagger-item ${isFeatureVisible(0) ? 'animate-in' : ''
                }`}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-primary-blue to-primary-lightblue rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:shadow-2xl enhanced-glow transform group-hover:rotate-12 transition-all duration-500 cursor-pointer">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">AI Skin Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced computer vision analyzes your skin in seconds, identifying issues and tracking improvements over time.
              </p>
            </div>

            <div
              ref={createFeatureRef(1)}
              className={`text-center group hover:transform hover:scale-105 transition-all duration-700 stagger-item ${isFeatureVisible(1) ? 'animate-in' : ''
                }`}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:shadow-2xl enhanced-glow transform group-hover:rotate-12 transition-all duration-500 cursor-pointer">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Smart Recommendations</h3>
              <p className="text-gray-600 leading-relaxed">
                Get personalized product suggestions based on your skin type, concerns, and goals - no guesswork required.
              </p>
            </div>

            <div
              ref={createFeatureRef(2)}
              className={`text-center group hover:transform hover:scale-105 transition-all duration-700 stagger-item ${isFeatureVisible(2) ? 'animate-in' : ''
                }`}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:shadow-2xl enhanced-glow transform group-hover:rotate-12 transition-all duration-500 cursor-pointer">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Progress Tracking</h3>
              <p className="text-gray-600 leading-relaxed">
                Watch your skin transform with detailed progress photos and analytics that show real results over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works-section" className="py-20 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="container mx-auto px-6 lg:px-20">
          <div
            ref={howItWorksAnimation.ref}
            className={`text-center mb-16 scroll-fade-up ${howItWorksAnimation.isVisible ? 'animate-in' : ''}`}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, effective, and designed for your busy lifestyle
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {[
              { number: 1, title: "Scan Your Skin", desc: "Take a quick photo using our AI-powered camera for instant analysis", color: "bg-primary-blue" },
              { number: 2, title: "Get Analysis", desc: "Our AI identifies skin concerns and creates your personalized profile", color: "bg-primary-lightblue" },
              { number: 3, title: "Follow Routine", desc: "Receive customized product recommendations and daily routines", color: "bg-cyan-500" },
              { number: 4, title: "Track Progress", desc: "Monitor improvements and adjust your routine for optimal results", color: "bg-green-500" }
            ].map((step, index) => (
              <div
                key={index}
                ref={createStepRef(index)}
                className={`text-center stagger-item ${isStepVisible(index) ? 'animate-in' : ''}`}
              >
                <div className={`w-16 h-16 ${step.color} text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold hover:scale-110 hover:shadow-lg hover:rotate-12 transition-all duration-500 enhanced-glow cursor-pointer`}>
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits-section" className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-6 lg:px-20">
          <div
            ref={benefitsAnimation.ref}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div className={`scroll-slide-left ${benefitsAnimation.isVisible ? 'animate-in' : ''}`}>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Built for the Modern Man
              </h2>
              <div className="space-y-6">
                {[
                  { color: "bg-primary-blue", title: "Time-Efficient", desc: "Quick 2-minute routines that fit your busy schedule" },
                  { color: "bg-cyan-400", title: "Science-Backed", desc: "Recommendations based on dermatological research and AI analysis" },
                  { color: "bg-green-400", title: "Results-Driven", desc: "See visible improvements in as little as 2 weeks" }
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4 hover:transform hover:translate-x-4 transition-all duration-500 group">
                    <div className={`w-6 h-6 ${benefit.color} rounded-full flex-shrink-0 mt-1 animate-pulse enhanced-glow group-hover:scale-125 transition-transform duration-300`}></div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-gray-300">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`text-center scroll-slide-right ${benefitsAnimation.isVisible ? 'animate-in' : ''}`}>
              <div className="bg-gradient-to-r from-primary-blue to-cyan-500 rounded-3xl p-8 transform hover:scale-105 hover:shadow-2xl transition-all duration-500 enhanced-glow hover:rotate-1">
                <h3 className="text-3xl font-bold mb-4">Join 50K+ Men</h3>
                <p className="text-xl mb-6">Who&apos;ve upgraded their skincare game</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div
                    ref={satisfactionCounter.ref}
                    className="hover:scale-110 transition-transform duration-300 cursor-pointer"
                  >
                    <div className="text-2xl font-bold">{satisfactionCounter.currentValue}%</div>
                    <div className="text-sm">Satisfaction Rate</div>
                  </div>
                  <div
                    ref={scansCounter.ref}
                    className="hover:scale-110 transition-transform duration-300 cursor-pointer"
                  >
                    <div className="text-2xl font-bold">{scansCounter.currentValue}M</div>
                    <div className="text-sm">Skin Scans</div>
                  </div>
                  <div
                    ref={ratingCounter.ref}
                    className="hover:scale-110 transition-transform duration-300 cursor-pointer"
                  >
                    <div className="text-2xl font-bold">{ratingCounter.currentValue}★</div>
                    <div className="text-sm">App Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials-section" className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-20">
          <div
            ref={testimonialsAnimation.ref}
            className={`text-center mb-16 scroll-fade-up ${testimonialsAnimation.isVisible ? 'animate-in' : ''}`}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
              What Men Are Saying
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real results from real users who&apos;ve transformed their skincare routine
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { initial: "M", name: "Mike Chen", gradient: "from-primary-blue to-cyan-500", quote: "Finally, a skincare app that gets it. No complicated routines, just results. My skin has never looked better and it takes me 2 minutes a day." },
              { initial: "A", name: "Alex Rodriguez", gradient: "from-green-500 to-emerald-500", quote: "The AI analysis blew my mind. It identified issues I didn't even know I had and the product recommendations actually work. Game changer!" },
              { initial: "D", name: "David Kim", gradient: "from-purple-500 to-pink-500", quote: "As someone who never cared about skincare, this app made it so simple. The progress tracking keeps me motivated and I can see real changes." }
            ].map((testimonial, index) => (
              <div
                key={index}
                ref={createTestimonialRef(index)}
                className={`bg-slate-50 rounded-2xl p-6 hover:shadow-xl transition-all duration-500 hover:scale-105 hover:-rotate-1 enhanced-glow stagger-item ${isTestimonialVisible(index) ? 'animate-in' : ''
                  }`}
              >
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${testimonial.gradient} rounded-full flex items-center justify-center text-white font-bold text-lg hover:rotate-12 transition-transform duration-300`}>
                    {testimonial.initial}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold text-slate-800">{testimonial.name}</h4>
                    <div className="flex text-yellow-400">
                      {"★".repeat(5)}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  &quot;{testimonial.quote}&quot;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog-section" className="py-20 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="container mx-auto px-6 lg:px-20">
          <div
            ref={blogAnimation.ref}
            className={`text-center mb-16 scroll-fade-up ${blogAnimation.isVisible ? 'animate-in' : ''}`}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
              Latest <span className="text-primary-blue">Insights</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Expert tips, guides, and the latest trends in men&apos;s skincare to help you achieve your best skin
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                category: "AI Technology",
                title: "How AI is Revolutionizing Men's Skincare",
                excerpt: "Discover how artificial intelligence is changing the game in personalized skincare routines for modern men.",
                image: "/home-chat-img.svg",
                readTime: "5 min read",
                date: "Dec 15, 2024",
                color: "from-primary-blue to-primary-lightblue"
              },
              {
                category: "Skincare Tips",
                title: "The 5-Minute Morning Routine That Changed Everything",
                excerpt: "A simple yet effective morning skincare routine that busy men can follow for maximum results.",
                image: "/home-upload-img.svg",
                readTime: "3 min read",
                date: "Dec 12, 2024",
                color: "from-green-500 to-emerald-500"
              },
              {
                category: "Product Guide",
                title: "Choosing the Right Products for Your Skin Type",
                excerpt: "Navigate the overwhelming world of skincare products with our comprehensive guide tailored for men.",
                image: "/home-share-img.svg",
                readTime: "7 min read",
                date: "Dec 10, 2024",
                color: "from-purple-500 to-pink-500"
              }
            ].map((article, index) => (
              <div
                key={index}
                ref={createBlogRef(index)}
                className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 enhanced-glow stagger-item group cursor-pointer ${isBlogVisible(index) ? 'animate-in' : ''
                  }`}
              >
                {/* Article Image */}
                <div className="relative h-48 bg-gradient-to-br from-slate-100 to-blue-100 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-r ${article.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-20 h-20 bg-gradient-to-r ${article.color} rounded-full flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                      {index === 0 && (
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      )}
                      {index === 1 && (
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {index === 2 && (
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`bg-gradient-to-r ${article.color} text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide`}>
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Article Content */}
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {article.readTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {article.date}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-primary-blue transition-colors duration-300">
                    {article.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed mb-4">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <button className="text-primary-blue font-semibold hover:text-primary-darkblue transition-colors duration-300 flex items-center gap-2 group">
                      Read More
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>

                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-300 group">
                        <svg className="w-4 h-4 text-gray-500 group-hover:text-primary-blue transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                      <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-300 group">
                        <svg className="w-4 h-4 text-gray-500 group-hover:text-primary-blue transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All Articles Button */}
          <div className={`text-center mt-12 transform transition-all duration-1000 delay-300 ${blogAnimation.isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
            }`}>
            <button className="bg-gradient-to-r from-primary-blue to-primary-lightblue text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300 magnetic-btn enhanced-glow">
              View All Articles
              <svg className="w-5 h-5 ml-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="py-20 bg-gradient-to-r from-primary-blue to-primary-lightblue text-white">
        <div className="container mx-auto px-6 lg:px-20 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 hover:scale-105 transition-transform duration-300">
            Ready to Transform Your Skin?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Download BroGlow today and join thousands of men who&apos;ve already upgraded their skincare routine
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              href="/register"
              className="btn-primary magnetic-btn ripple-btn bg-white text-primary-blue px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300 min-w-[200px] enhanced-glow"
            >
              Get Started - Web App
            </Link>
            <a
              href="#"
              className="btn-primary magnetic-btn border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-primary-blue transform transition-all duration-300 min-w-[200px]"
            >
              Download iOS App
            </a>
          </div>

          <p className="text-blue-100 hover:text-white transition-colors duration-300">
            ✨ Free to start • No credit card required • Available on Web & iOS
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-gray-400 py-12">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="hover:transform hover:scale-105 transition-all duration-300">
              <Image
                src="/broglow-logo.png"
                width={150}
                height={45}
                alt="BroGlow Logo"
                className="mb-4 filter brightness-0 invert hover:brightness-100 hover:invert-0 transition-all duration-300"
              />
              <p className="text-sm leading-relaxed">
                Revolutionary AI-powered skincare designed specifically for men who want real results.
              </p>
            </div>
            {[
              { title: "Product", links: ["Features", "How it Works", "Pricing", "FAQ"] },
              { title: "Company", links: ["About Us", "Blog", "Careers", "Contact"] },
              { title: "Support", links: ["Help Center", "Privacy Policy", "Terms of Service", "Contact Support"] }
            ].map((section, index) => (
              <div key={index}>
                <h4 className="text-white font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2 text-sm">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block transform">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 BroGlow by STEPNAVI Labs. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Enhanced Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          href="/register"
          className="bg-gradient-to-r from-primary-blue to-primary-lightblue text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transform transition-all duration-300 enhanced-glow magnetic-btn animate-pulse-glow"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
