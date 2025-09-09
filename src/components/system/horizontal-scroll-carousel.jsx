"use client";
import { useRef, useState } from "react";
import { motion, useTransform, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";

const HorizontalScrollCarousel = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["1%", "-95%"]);

  return (
    <section ref={targetRef} className="relative h-[300vh] w-full z-50">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div style={{ x }} className="flex gap-8 items-center pl-10">
          {cards.map((card) => (
            <FloatingCard card={card} key={card.id} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const FloatingCard = ({ card }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="relative h-[500px] w-[350px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Card */}
      <motion.div
        className="relative h-full w-full overflow-hidden rounded-3xl shadow-2xl"
        initial={{ y: 0 }}
        whileHover={{ y: -20 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 z-10" />
        <img
          src={card.url}
          alt={card.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent z-20">
          <h3 className="text-3xl font-bold text-white">{card.title}</h3>
          <p className="text-white/80 mt-2">{card.description}</p>
        </div>
      </motion.div>

      {/* Floating mini cards */}
      <AnimatePresence>
        {isHovered && (
          <>
            <motion.div
              className="absolute -left-10 -top-8 h-24 w-16 bg-white rounded-xl shadow-lg z-0"
              initial={{ x: -20, y: 40, rotate: -15, opacity: 0 }}
              animate={{ x: 0, y: 0, rotate: -5, opacity: 1 }}
              exit={{ x: -20, y: 40, rotate: -15, opacity: 0 }}
              transition={{ delay: 0.1, type: "spring" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl" />
            </motion.div>
            <motion.div
              className="absolute -right-8 -bottom-10 h-20 w-24 bg-white rounded-xl shadow-lg z-0"
              initial={{ x: 20, y: 40, rotate: 10, opacity: 0 }}
              animate={{ x: 0, y: 0, rotate: 5, opacity: 1 }}
              exit={{ x: 20, y: 40, rotate: 10, opacity: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200 rounded-xl" />
            </motion.div>
            <motion.div
              className="absolute -right-12 top-1/4 h-16 w-20 bg-white rounded-xl shadow-lg z-0"
              initial={{ x: 30, y: -20, rotate: 15, opacity: 0 }}
              animate={{ x: 0, y: 0, rotate: 8, opacity: 1 }}
              exit={{ x: 30, y: -20, rotate: 15, opacity: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HorizontalScrollCarousel;

const cards = [
  {
    url: "https://images.unsplash.com/photo-1571498664957-fde285d79857?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Personal Language Courses",
    description: "Interactive lessons I design just for you",
    id: 1,
  },
  {
    url: "https://images.unsplash.com/photo-1592487501226-7ed5e5dc80f2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Cultural Immersion Events",
    description: "Let me introduce you to traditions and customs",
    id: 2,
  },
  {
    url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    title: "Supportive Group Sessions",
    description: "Learn together in my welcoming community",
    id: 3,
  },
  {
    url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    title: "One-on-One Tutoring",
    description: "Personalized lessons focused entirely on you",
    id: 4,
  },
  {
    url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    title: "Learning Resources",
    description: "Access my materials and guidance anytime",
    id: 5,
  },
];