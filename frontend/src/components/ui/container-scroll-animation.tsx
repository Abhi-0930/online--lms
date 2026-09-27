"use client";
import React, { useRef, useState, useEffect } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Responsive scroll progress calculation
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center 0.45"],
  });

  const [windowWidth, setWindowWidth] = useState<number>(() => {
    if (typeof window !== "undefined") return window.innerWidth;
    return 1200;
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  const rotateXRange = isMobile ? [14, 0] : isTablet ? [18, 0] : [22, 0];
  const scaleRange = isMobile ? [0.88, 1] : isTablet ? [0.93, 1] : [1.05, 1];
  const translateRange = isMobile ? [0, -25] : isTablet ? [0, -50] : [0, -90];

  const rotate = useTransform(scrollYProgress, [0, 1], rotateXRange);
  const scale = useTransform(scrollYProgress, [0, 1], scaleRange);
  const translate = useTransform(scrollYProgress, [0, 1], translateRange);

  return (
    <div
      className="min-h-[30rem] sm:min-h-[40rem] md:min-h-[50rem] lg:min-h-[56rem] flex items-center justify-center relative px-3 sm:px-6 md:px-12 pt-10 pb-6 sm:pt-16 sm:pb-8 md:pt-20 md:pb-12 overflow-hidden"
      ref={containerRef}
    >
      <div
        className="w-full relative py-4 sm:py-6 md:py-8"
        style={{
          perspective: "1000px",
          WebkitPerspective: "1000px",
          transformStyle: "preserve-3d",
          WebkitTransformStyle: "preserve-3d",
        }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({
  translate,
  titleComponent,
}: {
  translate: MotionValue<number>;
  titleComponent: string | React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="max-w-5xl mx-auto text-center px-2 sm:px-4 mb-2 sm:mb-4 md:mb-6"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        transformStyle: "preserve-3d",
        WebkitTransformStyle: "preserve-3d",
        boxShadow:
          "0 20px 50px rgba(0,0,0,0.08), 0 35px 80px rgba(15,23,42,0.07), 0 0 0 1px rgba(226,232,240,0.8)",
        willChange: "transform",
      }}
      className="max-w-6xl -mt-4 sm:-mt-8 md:-mt-12 mx-auto w-full aspect-[16/9.6] border-2 sm:border-4 border-slate-200/90 p-1.5 sm:p-2.5 md:p-3.5 bg-white/95 rounded-2xl sm:rounded-[28px] md:rounded-[32px] shadow-2xl backdrop-blur-xl"
    >
      <div className="h-full w-full overflow-hidden rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-inner flex items-center justify-center">
        {children}
      </div>
    </motion.div>
  );
};
