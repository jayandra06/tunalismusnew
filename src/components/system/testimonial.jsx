"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Placeholder for when we have real testimonials
const testimonials = [];

const TestimonialSection = () => {
  // Show placeholder message when no testimonials available
  if (testimonials.length === 0) {
    return (
      <section className="py-20 z-50 relative">
        <div className="container mx-auto px-5 sm:px-10 md:px-12 lg:px-5 space-y-16">
          <div className="space-y-4 max-w-2xl">
            <span className="text-[var(--color-dusty-rose)] font-semibold pl-6 relative before:absolute before:top-1/2 before:left-0 before:w-5 before:h-px before:bg-[var(--color-dusty-rose)] before:rounded-full">
              Student Stories
            </span>
            <h1 className="font-bold text-gray-800 text-3xl md:text-4xl">What Our Learners Say</h1>
          </div>

          <div className="relative">
            <div className="flex md:items-stretch gap-10 lg:gap-14 min-h-[400px]">
              {/* Placeholder Image */}
              <div className="hidden md:flex md:w-1/2 lg:w-2/5 h-full">
                <div className="w-full h-full bg-gradient-to-br from-[var(--color-soft-blue)]/20 to-[var(--color-dusty-rose)]/20 rounded-xl aspect-square flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-[var(--color-dusty-rose)]/20 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[var(--color-dusty-rose)]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">Student Photo Coming Soon</p>
                  </div>
                </div>
              </div>

              {/* Waiting Message */}
              <div className="flex-1 flex flex-col space-y-6 md:space-y-12 lg:space-y-16 md:py-6 lg:py-8 h-full justify-center backdrop-blur-2xl md:p-10 p-5">
                <div className="space-y-8 text-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-[var(--color-dusty-rose)]/10 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[var(--color-dusty-rose)]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800">
                      Waiting for Our Students to Share Their Stories
                    </h2>
                  </div>
                  
                  <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                    We're just getting started on this amazing language learning journey! 
                    Soon, our students will share their experiences and success stories here.
                  </p>
                  
                  <div className="bg-gradient-to-r from-[var(--color-soft-blue)]/10 to-[var(--color-dusty-rose)]/10 rounded-2xl p-6 max-w-xl mx-auto">
                    <p className="text-gray-700 italic">
                      "Be the first to share your Tunalismus story! 
                      Your experience could inspire the next generation of language learners."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Original testimonial carousel code (for when we have testimonials)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const nextTestimonial = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    },
    exit: (direction) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      transition: { duration: 0.5 }
    })
  };

  return (
    <section className="py-20 z-50 relative">
      <div className="container mx-auto px-5 sm:px-10 md:px-12 lg:px-5 space-y-16">
        <div className="space-y-4 max-w-2xl">
          <span className="text-[var(--color-dusty-rose)] font-semibold pl-6 relative before:absolute before:top-1/2 before:left-0 before:w-5 before:h-px before:bg-[var(--color-dusty-rose)] before:rounded-full">
            Student Stories
          </span>
          <h1 className="font-bold text-gray-800 text-3xl md:text-4xl">What Our Learners Say</h1>
        </div>

        <div className="relative">
          <div className="flex md:items-stretch gap-10 lg:gap-14 min-h-[400px]">
            {/* Large Image */}
            <div className="hidden md:flex md:w-1/2 lg:w-2/5 h-full">
              <AnimatePresence custom={direction} mode="wait">
                <motion.img
                  key={testimonials[currentIndex].id}
                  src={testimonials[currentIndex].image}
                  alt={`${testimonials[currentIndex].name} - Happy Tunalismus Student`}
                  className="w-full h-full object-cover rounded-xl aspect-square"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              </AnimatePresence>
            </div>

            {/* Testimonial Content */}
            <div className="flex-1 flex flex-col space-y-6 md:space-y-12 lg:space-y-16 md:py-6 lg:py-8 h-full justify-center backdrop-blur-2xl md:p-10 p-5">
              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={testimonials[currentIndex].id}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-8"
                >
                  <motion.p className="text-xl lg:text-2xl font-medium text-gray-700 leading-relaxed">
                    {testimonials[currentIndex].quote}
                  </motion.p>
                  <div className="flex items-start gap-4">
                    <img 
                      src={testimonials[currentIndex].image} 
                      alt={`${testimonials[currentIndex].name} avatar`} 
                      className="w-12 h-12 rounded-full flex md:hidden shadow-md" 
                    />
                    <div className="space-y-1 flex-1">
                      <h2 className="text-lg font-semibold leading-none text-gray-800">
                        {testimonials[currentIndex].name}
                      </h2>
                      <p className="text-gray-600 invert">
                        {testimonials[currentIndex].role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-12">
            {/* Dots Navigation */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${currentIndex === index ? 'bg-[var(--color-dusty-rose)] w-6' : 'bg-gray-300'}`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex gap-4">
              <button 
                onClick={prevTestimonial}
                aria-label="Previous testimonial"
                className="p-3 cursor-pointer rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-700">
                  <path fillRule="evenodd" d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z" clipRule="evenodd" />
                </svg>
              </button>
              <button 
                onClick={nextTestimonial}
                aria-label="Next testimonial"
                className="p-3 cursor-pointer rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-700">
                  <path fillRule="evenodd" d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;