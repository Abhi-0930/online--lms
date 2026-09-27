"use client";

import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";

interface CarouselProps {
  items: React.ReactNode[];
  initialScroll?: number;
}

type CardType = {
  src: string;
  title: string;
  category: string;
  description?: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
};

export const CarouselContext = createContext<{
  onCardClose: (index: number) => void;
  currentIndex: number;
}>({
  onCardClose: () => {},
  currentIndex: 0,
});

export const Carousel = ({ items, initialScroll = 0 }: CarouselProps) => {
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }
  }, [initialScroll]);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -340, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 340, behavior: "smooth" });
    }
  };

  const handleCardClose = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = isMobile() ? 240 : 384; // (md:w-96)
      const gap = isMobile() ? 16 : 32;
      const scrollPosition = (cardWidth + gap) * (index + 1);
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  const isMobile = () => {
    return typeof window !== "undefined" && window.innerWidth < 768;
  };

  return (
    <CarouselContext.Provider
      value={{ onCardClose: handleCardClose, currentIndex }}
    >
      <div className="relative w-full">
        <div
          className="flex w-full overflow-x-scroll overscroll-x-auto py-10 md:py-16 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          ref={carouselRef}
          onScroll={checkScrollability}
        >
          <div
            className={cn(
              "absolute right-0 z-[1000] h-auto w-[5%] overflow-hidden bg-gradient-to-l from-[#151c2e] to-transparent pointer-events-none"
            )}
          />

          <div
            className={cn(
              "flex flex-row justify-start gap-4 md:gap-8 pl-4",
              "max-w-7xl mx-auto"
            )}
          >
            {items.map((item, index) => (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: 0.1 * index,
                    ease: "easeOut",
                  },
                }}
                key={"card" + index}
                className="last:pr-[5%] md:last:pr-[33%] rounded-3xl"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Floating Navigation Controls */}
        <div className="flex justify-end gap-2 mr-4 md:mr-10">
          <button
            className="relative z-40 h-10 w-10 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-100 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-md border border-slate-600/60 cursor-pointer"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            aria-label="Previous cards"
          >
            <ArrowLeft className="h-5 w-5 text-slate-200" />
          </button>
          <button
            className="relative z-40 h-10 w-10 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-100 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-md border border-slate-600/60 cursor-pointer"
            onClick={scrollRight}
            disabled={!canScrollRight}
            aria-label="Next cards"
          >
            <ArrowRight className="h-5 w-5 text-slate-200" />
          </button>
        </div>
      </div>
    </CarouselContext.Provider>
  );
};

export const Card = ({
  card,
  index,
  layout = false,
}: {
  card: CardType;
  index: number;
  layout?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onCardClose } = useContext(CarouselContext);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useOutsideClick(containerRef, () => handleClose());

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    onCardClose(index);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 h-screen z-50 overflow-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-black/70 backdrop-blur-md h-full w-full fixed inset-0"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              ref={containerRef}
              layoutId={layout ? `card-${card.title}` : undefined}
              className="max-w-4xl mx-auto bg-white dark:bg-neutral-900 h-fit z-[60] my-10 p-4 md:p-10 rounded-3xl font-sans relative shadow-2xl border border-slate-200 dark:border-neutral-800"
            >
              <button
                className="sticky top-4 right-0 ml-auto bg-black dark:bg-white text-white dark:text-black h-8 w-8 rounded-full flex items-center justify-center z-50 cursor-pointer shadow-md hover:scale-105 transition-transform"
                onClick={handleClose}
                aria-label="Close card dialog"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2.5">
                {card.icon && (
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    {card.icon}
                  </div>
                )}
                <motion.p
                  layoutId={layout ? `category-${card.title}` : undefined}
                  className="text-xs md:text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400"
                >
                  {card.category}
                </motion.p>
              </div>
              <motion.h3
                layoutId={layout ? `title-${card.title}` : undefined}
                className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white mt-2 leading-tight"
              >
                {card.title}
              </motion.h3>
              {card.description && (
                <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {card.description}
                </p>
              )}
              <div className="py-6">{card.content}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.button
        layoutId={layout ? `card-${card.title}` : undefined}
        onClick={handleOpen}
        className="rounded-3xl bg-slate-100 dark:bg-neutral-900 h-80 w-56 md:h-[36rem] md:w-96 overflow-hidden flex flex-col items-start justify-start relative z-10 text-left group cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 border border-slate-700/40"
      >
        <div className="absolute h-full top-0 inset-x-0 bg-gradient-to-b from-black/80 via-black/40 to-black/85 z-30 pointer-events-none group-hover:from-black/70 group-hover:to-black/90 transition-all duration-300" />
        
        <div className="relative z-40 p-6 md:p-8 flex flex-col justify-between h-full w-full">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              {card.icon && (
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-sm">
                  {card.icon}
                </div>
              )}
              <motion.p
                layoutId={layout ? `category-${card.category}` : undefined}
                className="text-white/80 text-xs md:text-sm font-semibold uppercase tracking-wider ml-auto"
              >
                {card.category}
              </motion.p>
            </div>

            <motion.h3
              layoutId={layout ? `title-${card.title}` : undefined}
              className="text-white text-xl md:text-2xl font-bold max-w-xs text-left [text-wrap:balance] font-sans leading-snug drop-shadow-sm"
            >
              {card.title}
            </motion.h3>

            {card.description && (
              <p className="mt-2.5 text-xs md:text-sm text-slate-200/90 leading-relaxed max-w-xs font-normal">
                {card.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 text-white/90 text-xs md:text-sm font-semibold group-hover:text-white transition-colors mt-4">
            <span className="px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 transition-colors">
              Explore details →
            </span>
          </div>
        </div>

        <img
          src={card.src}
          alt={card.title}
          className="object-cover absolute z-10 inset-0 w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
        />
      </motion.button>
    </>
  );
};
