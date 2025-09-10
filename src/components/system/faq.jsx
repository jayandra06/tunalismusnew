"use client";
import { useState } from "react";

const faqs = [
  {
    question: "Do I need any prior experience to join?",
    answer:
      "Not at all! Whether you're a complete beginner or looking to improve, our lessons are tailored to meet you where you are.",
  },
  {
    question: "Are classes online or in-person?",
    answer:
      "I offer flexible learning options including online classes accessible worldwide and in-person sessions in Hyderabad.",
  },
  {
    question: "How are lessons structured?",
    answer:
      "Each lesson is personalized, blending conversation practice, culture, and real-life language you can use every day.",
  },
  {
    question: "Will I receive personal feedback?",
    answer:
      "Absolutely. Feedback is core to growth and confidence — expect guidance, encouragement, and actionable tips from your instructor.",
  },
  {
    question: "Can I book a trial lesson?",
    answer:
      "Yes! I offer free introductory sessions so you can experience Tunalismus learning before committing.",
  },
  {
    question: "Which languages do you teach?",
    answer:
      "Currently, we offer courses in German, Turkish, and English — all rooted in practical teaching methods.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-[var(--color-dusty-rose)] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 z-0">
        <svg
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="rhombusPattern"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0,20 L20,0 L40,20 L20,40 Z"
                fill="var(--color-muted-green)"
                fillOpacity="0.2"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#rhombusPattern)" />
        </svg>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-5 sm:px-10 md:px-12 space-y-12 relative z-10">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-6 text-[var(--color-muted-green)] invert">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded-lg bg-white shadow-sm cursor-pointer"
              onClick={() => toggleFAQ(index)}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && toggleFAQ(index)}
              role="button"
              aria-expanded={openIndex === index}
              aria-controls={`faq-${index}`}
              aria-label={faq.question}
            >
              <div className="flex justify-between items-center p-5">
                <h3 className="text-md font-medium text-gray-800">{faq.question}</h3>
                <span className={`transform transition-transform duration-300 ${openIndex === index ? "rotate-45" : "rotate-0"}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-[var(--color-muted-green)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v12m6-6H6" />
                  </svg>
                </span>
              </div>
              <div
                id={`faq-${index}`}
                className={`overflow-hidden transition-all duration-300 px-5 text-gray-700 text-sm leading-relaxed ${openIndex === index ? "max-h-96 py-3" : "max-h-0"}`}
              >
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
