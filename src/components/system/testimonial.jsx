"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    id: 1,
    quote: "I always felt lost in language classes before. At Tunalismus, Sema really listened and encouraged me—I found the confidence to speak for the first time.",
    name: "Sofia",
    role: "German Learner",
    image: "https://i.pinimg.com/736x/f2/67/82/f26782579295197834daa75e11919402.jpg"
  },
  {
    id: 2,
    quote: "The cultural immersion at Tunalismus made learning Turkish feel natural. After just 3 months, I could have real conversations with my in-laws!",
    name: "Raj",
    role: "Turkish Learner",
    image: "https://i.pinimg.com/1200x/4e/17/f5/4e17f5e36573260fa7198faff6678938.jpg"
  },
  {
    id: 3,
    quote: "As a visual learner, I struggled with traditional methods. The creative approach here helped me retain vocabulary 3x faster than other schools.",
    name: "Priya",
    role: "English Learner",
    image: "https://i.pinimg.com/1200x/c6/d0/ca/c6d0ca276dc099c634ab316e04522d3e.jpg"
  },
  {
    id: 4,
    quote: "The small group sessions created such a supportive environment. We weren't just classmates—we became friends cheering each other's progress.",
    name: "Carlos",
    role: "German Learner",
    image: "https://i.pinimg.com/1200x/4e/17/f5/4e17f5e36573260fa7198faff6678938.jpg"
  },
  {
    id: 5,
    quote: "I've taken language classes for years, but Tunalismus was the first place that helped me think in the language rather than translate everything.",
    name: "Aisha",
    role: "Turkish Learner",
    image: "https://i.pinimg.com/736x/e8/bd/f1/e8bdf198a66de37cfcd0f06e5e3b8db4.jpg"
  }
];

const TestimonialSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward

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