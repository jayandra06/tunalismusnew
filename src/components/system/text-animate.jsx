"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { memo } from "react";

const staggerTimings = {
  text: 0.08,
  word: 0.06,
  character: 0.04,
  line: 0.08,
};

const defaultContainerVariants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0,
      staggerChildren: 0.06,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.06,
      staggerDirection: -1,
    },
  },
};

const defaultItemVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { 
      ease: [0.16, 1, 0.3, 1],
      duration: 0.6 
    },
  },
  exit: {
    opacity: 0,
    transition: { 
      ease: [0.7, 0, 0.84, 0],
      duration: 0.5 
    },
  },
};

const defaultItemAnimationVariants = {
  fadeIn: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, y: 20 },
      show: {
        opacity: 1,
        y: 0,
        transition: {
          ease: [0.16, 1, 0.3, 1],
          duration: 0.7,
        },
      },
      exit: {
        opacity: 0,
        y: 20,
        transition: { 
          ease: [0.7, 0, 0.84, 0],
          duration: 0.6 
        },
      },
    },
  },
  blurIn: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: "blur(8px)" },
      show: {
        opacity: 1,
        filter: "blur(0px)",
        transition: {
          ease: [0.16, 1, 0.3, 1],
          duration: 0.8,
          filter: { duration: 0.9 },
        },
      },
      exit: {
        opacity: 0,
        filter: "blur(8px)",
        transition: { 
          ease: [0.7, 0, 0.84, 0],
          duration: 0.7 
        },
      },
    },
  },
  blurInUp: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: "blur(8px)", y: 20 },
      show: {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        transition: {
          ease: [0.16, 1, 0.3, 1],
          y: { duration: 0.8 },
          opacity: { duration: 0.9 },
          filter: { duration: 0.8 },
        },
      },
      exit: {
        opacity: 0,
        filter: "blur(8px)",
        y: 20,
        transition: {
          ease: [0.7, 0, 0.84, 0],
          y: { duration: 0.7 },
          opacity: { duration: 0.8 },
          filter: { duration: 0.7 },
        },
      },
    },
  },
  blurInDown: {
    container: defaultContainerVariants,
    item: {
      hidden: { opacity: 0, filter: "blur(8px)", y: -20 },
      show: {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        transition: {
          ease: [0.16, 1, 0.3, 1],
          y: { duration: 0.8 },
          opacity: { duration: 0.9 },
          filter: { duration: 0.8 },
        },
      },
    },
  },
  slideUp: {
    container: defaultContainerVariants,
    item: {
      hidden: { y: 20, opacity: 0 },
      show: {
        y: 0,
        opacity: 1,
        transition: {
          ease: [0.16, 1, 0.3, 1],
          duration: 0.7,
        },
      },
      exit: {
        y: -20,
        opacity: 0,
        transition: {
          ease: [0.7, 0, 0.84, 0],
          duration: 0.6,
        },
      },
    },
  },
  slideDown: {
    container: defaultContainerVariants,
    item: {
      hidden: { y: -20, opacity: 0 },
      show: {
        y: 0,
        opacity: 1,
        transition: { 
          ease: [0.16, 1, 0.3, 1],
          duration: 0.7 
        },
      },
      exit: {
        y: 20,
        opacity: 0,
        transition: { 
          ease: [0.7, 0, 0.84, 0],
          duration: 0.6 
        },
      },
    },
  },
  slideLeft: {
    container: defaultContainerVariants,
    item: {
      hidden: { x: 20, opacity: 0 },
      show: {
        x: 0,
        opacity: 1,
        transition: { 
          ease: [0.16, 1, 0.3, 1],
          duration: 0.7 
        },
      },
      exit: {
        x: -20,
        opacity: 0,
        transition: { 
          ease: [0.7, 0, 0.84, 0],
          duration: 0.6 
        },
      },
    },
  },
  slideRight: {
    container: defaultContainerVariants,
    item: {
      hidden: { x: -20, opacity: 0 },
      show: {
        x: 0,
        opacity: 1,
        transition: { 
          ease: [0.16, 1, 0.3, 1],
          duration: 0.7 
        },
      },
      exit: {
        x: 20,
        opacity: 0,
        transition: { 
          ease: [0.7, 0, 0.84, 0],
          duration: 0.6 
        },
      },
    },
  },
  scaleUp: {
    container: defaultContainerVariants,
    item: {
      hidden: { scale: 0.8, opacity: 0 },
      show: {
        scale: 1,
        opacity: 1,
        transition: {
          ease: [0.16, 1, 0.3, 1],
          duration: 0.8,
          scale: {
            type: "spring",
            damping: 10,
            stiffness: 200,
            mass: 0.5,
          },
        },
      },
      exit: {
        scale: 0.8,
        opacity: 0,
        transition: { 
          ease: [0.7, 0, 0.84, 0],
          duration: 0.7 
        },
      },
    },
  },
  scaleDown: {
    container: defaultContainerVariants,
    item: {
      hidden: { scale: 1.2, opacity: 0 },
      show: {
        scale: 1,
        opacity: 1,
        transition: {
          ease: [0.16, 1, 0.3, 1],
          duration: 0.8,
          scale: {
            type: "spring",
            damping: 10,
            stiffness: 200,
            mass: 0.5,
          },
        },
      },
      exit: {
        scale: 1.2,
        opacity: 0,
        transition: { 
          ease: [0.7, 0, 0.84, 0],
          duration: 0.7 
        },
      },
    },
  },
};

const TextAnimateBase = ({
  children,
  delay = 0,
  duration = 0.4,
  variants,
  className,
  segmentClassName,
  as: Component = "span",
  startOnView = true,
  once = false,
  by = "word",
  animation = "fadeIn",
  ...props
}) => {
  const MotionComponent = motion[Component] || motion.span;

  let segments = [];
  switch (by) {
    case "word":
      segments = children.split(/(\s+)/);
      break;
    case "character":
      segments = children.split("");
      break;
    case "line":
      segments = children.split("\n");
      break;
    case "text":
    default:
      segments = [children];
      break;
  }

  const finalVariants = variants
    ? {
        container: {
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              opacity: { duration: 0.01, delay },
              delayChildren: delay,
              staggerChildren: duration / segments.length,
            },
          },
          exit: {
            opacity: 0,
            transition: {
              staggerChildren: duration / segments.length,
              staggerDirection: -1,
            },
          },
        },
        item: variants,
      }
    : animation
    ? {
        container: {
          ...defaultItemAnimationVariants[animation].container,
          show: {
            ...defaultItemAnimationVariants[animation].container.show,
            transition: {
              delayChildren: delay,
              staggerChildren: duration / segments.length,
            },
          },
          exit: {
            ...defaultItemAnimationVariants[animation].container.exit,
            transition: {
              staggerChildren: duration / segments.length,
              staggerDirection: -1,
            },
          },
        },
        item: defaultItemAnimationVariants[animation].item,
      }
    : { container: defaultContainerVariants, item: defaultItemVariants };

  return (
    <AnimatePresence mode="popLayout">
      <MotionComponent
        variants={finalVariants.container}
        initial="hidden"
        whileInView={startOnView ? "show" : undefined}
        animate={startOnView ? undefined : "show"}
        exit="exit"
        className={cn("whitespace-pre-wrap", className)}
        viewport={{ once, margin: "20% 0px -20% 0px" }}
        {...props}
      >
        {segments.map((segment, i) => (
          <motion.span
            key={`${by}-${segment}-${i}`}
            variants={finalVariants.item}
            custom={i * staggerTimings[by]}
            className={cn(
              by === "line" ? "block" : "inline-block whitespace-pre",
              by === "character" && "",
              segmentClassName
            )}
          >
            {segment}
          </motion.span>
        ))}
      </MotionComponent>
    </AnimatePresence>
  );
};

// Export the memoized version
export const TextAnimate = memo(TextAnimateBase);