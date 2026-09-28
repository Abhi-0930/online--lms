"use client";

import React from "react";
import { motion } from "motion/react";
import dynamic from "next/dynamic";
import { Users, ArrowRight } from "lucide-react";
import { IN, US, GB, CA, AU, DE, SG } from "country-flag-icons/react/3x2";

const World = dynamic(() => import("../components/ui/globe").then((m) => m.World), {
  ssr: false,
});

function WhatsAppIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

export function CommunitySection() {
  const globeConfig = {
    pointSize: 4,
    globeColor: "#0b2559",
    showAtmosphere: true,
    atmosphereColor: "#60a5fa",
    atmosphereAltitude: 0.15,
    emissive: "#081b40",
    emissiveIntensity: 0.15,
    shininess: 0.9,
    polygonColor: "rgba(255,255,255,0.75)",
    ambientLight: "#38bdf8",
    directionalLeftLight: "#ffffff",
    directionalTopLight: "#ffffff",
    pointLight: "#ffffff",
    arcTime: 1000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    initialPosition: { lat: 22.3193, lng: 114.1694 },
    autoRotate: true,
    autoRotateSpeed: 0.6,
  };

  const colors = ["#06b6d4", "#3b82f6", "#6366f1"];
  const sampleArcs = [
    {
      order: 1,
      startLat: -19.885592,
      startLng: -43.951191,
      endLat: -22.9068,
      endLng: -43.1729,
      arcAlt: 0.1,
      color: colors[0],
    },
    {
      order: 1,
      startLat: 28.6139,
      startLng: 77.209,
      endLat: 3.139,
      endLng: 101.6869,
      arcAlt: 0.2,
      color: colors[1],
    },
    {
      order: 1,
      startLat: -19.885592,
      startLng: -43.951191,
      endLat: -1.303396,
      endLng: 36.852443,
      arcAlt: 0.5,
      color: colors[2],
    },
    {
      order: 2,
      startLat: 1.3521,
      startLng: 103.8198,
      endLat: 35.6762,
      endLng: 139.6503,
      arcAlt: 0.2,
      color: colors[0],
    },
    {
      order: 2,
      startLat: 51.5072,
      startLng: -0.1276,
      endLat: 3.139,
      endLng: 101.6869,
      arcAlt: 0.3,
      color: colors[1],
    },
    {
      order: 2,
      startLat: -15.785493,
      startLng: -47.909029,
      endLat: 36.162809,
      endLng: -115.119411,
      arcAlt: 0.3,
      color: colors[2],
    },
    {
      order: 3,
      startLat: -33.8688,
      startLng: 151.2093,
      endLat: 22.3193,
      endLng: 114.1694,
      arcAlt: 0.3,
      color: colors[0],
    },
    {
      order: 3,
      startLat: 21.3099,
      startLng: -157.8581,
      endLat: 40.7128,
      endLng: -74.006,
      arcAlt: 0.3,
      color: colors[1],
    },
    {
      order: 3,
      startLat: -6.2088,
      startLng: 106.8456,
      endLat: 51.5072,
      endLng: -0.1276,
      arcAlt: 0.3,
      color: colors[2],
    },
    {
      order: 4,
      startLat: 11.986597,
      startLng: 8.571831,
      endLat: -15.595412,
      endLng: -56.05918,
      arcAlt: 0.5,
      color: colors[0],
    },
    {
      order: 4,
      startLat: -34.6037,
      startLng: -58.3816,
      endLat: 22.3193,
      endLng: 114.1694,
      arcAlt: 0.7,
      color: colors[1],
    },
    {
      order: 4,
      startLat: 51.5072,
      startLng: -0.1276,
      endLat: 48.8566,
      endLng: -2.3522,
      arcAlt: 0.1,
      color: colors[2],
    },
    {
      order: 5,
      startLat: 14.5995,
      startLng: 120.9842,
      endLat: 51.5072,
      endLng: -0.1276,
      arcAlt: 0.3,
      color: colors[0],
    },
    {
      order: 5,
      startLat: 1.3521,
      startLng: 103.8198,
      endLat: -33.8688,
      endLng: 151.2093,
      arcAlt: 0.2,
      color: colors[1],
    },
    {
      order: 5,
      startLat: 34.0522,
      startLng: -118.2437,
      endLat: 48.8566,
      endLng: -2.3522,
      arcAlt: 0.2,
      color: colors[2],
    },
    {
      order: 6,
      startLat: -15.432563,
      startLng: 28.315853,
      endLat: 1.094136,
      endLng: -63.34546,
      arcAlt: 0.7,
      color: colors[0],
    },
    {
      order: 6,
      startLat: 37.5665,
      startLng: 126.978,
      endLat: 35.6762,
      endLng: 139.6503,
      arcAlt: 0.1,
      color: colors[1],
    },
    {
      order: 6,
      startLat: 22.3193,
      startLng: 114.1694,
      endLat: 51.5072,
      endLng: -0.1276,
      arcAlt: 0.3,
      color: colors[2],
    },
    {
      order: 7,
      startLat: -19.885592,
      startLng: -43.951191,
      endLat: -15.595412,
      endLng: -56.05918,
      arcAlt: 0.1,
      color: colors[0],
    },
    {
      order: 7,
      startLat: 48.8566,
      startLng: -2.3522,
      endLat: 52.52,
      endLng: 13.405,
      arcAlt: 0.1,
      color: colors[1],
    },
    {
      order: 7,
      startLat: 52.52,
      startLng: 13.405,
      endLat: 34.0522,
      endLng: -118.2437,
      arcAlt: 0.2,
      color: colors[2],
    },
    {
      order: 8,
      startLat: -8.833221,
      startLng: 13.264837,
      endLat: -33.936138,
      endLng: 18.436529,
      arcAlt: 0.2,
      color: colors[0],
    },
    {
      order: 8,
      startLat: 49.2827,
      startLng: -123.1207,
      endLat: 52.3676,
      endLng: 4.9041,
      arcAlt: 0.2,
      color: colors[1],
    },
    {
      order: 8,
      startLat: 1.3521,
      startLng: 103.8198,
      endLat: 40.7128,
      endLng: -74.006,
      arcAlt: 0.5,
      color: colors[2],
    },
    {
      order: 9,
      startLat: 51.5072,
      startLng: -0.1276,
      endLat: 34.0522,
      endLng: -118.2437,
      arcAlt: 0.2,
      color: colors[0],
    },
    {
      order: 9,
      startLat: 22.3193,
      startLng: 114.1694,
      endLat: -22.9068,
      endLng: -43.1729,
      arcAlt: 0.7,
      color: colors[1],
    },
    {
      order: 9,
      startLat: 1.3521,
      startLng: 103.8198,
      endLat: -34.6037,
      endLng: -58.3816,
      arcAlt: 0.5,
      color: colors[2],
    },
    {
      order: 10,
      startLat: -22.9068,
      startLng: -43.1729,
      endLat: 28.6139,
      endLng: 77.209,
      arcAlt: 0.7,
      color: colors[0],
    },
    {
      order: 10,
      startLat: 34.0522,
      startLng: -118.2437,
      endLat: 31.2304,
      endLng: 121.4737,
      arcAlt: 0.3,
      color: colors[1],
    },
    {
      order: 10,
      startLat: -6.2088,
      startLng: 106.8456,
      endLat: 52.3676,
      endLng: 4.9041,
      arcAlt: 0.3,
      color: colors[2],
    },
    {
      order: 11,
      startLat: 41.9028,
      startLng: 12.4964,
      endLat: 34.0522,
      endLng: -118.2437,
      arcAlt: 0.2,
      color: colors[0],
    },
    {
      order: 11,
      startLat: -6.2088,
      startLng: 106.8456,
      endLat: 31.2304,
      endLng: 121.4737,
      arcAlt: 0.2,
      color: colors[1],
    },
    {
      order: 11,
      startLat: 22.3193,
      startLng: 114.1694,
      endLat: 1.3521,
      endLng: 103.8198,
      arcAlt: 0.2,
      color: colors[2],
    },
    {
      order: 12,
      startLat: 34.0522,
      startLng: -118.2437,
      endLat: 37.7749,
      endLng: -122.4194,
      arcAlt: 0.1,
      color: colors[0],
    },
    {
      order: 12,
      startLat: 35.6762,
      startLng: 139.6503,
      endLat: 22.3193,
      endLng: 114.1694,
      arcAlt: 0.2,
      color: colors[1],
    },
    {
      order: 12,
      startLat: 22.3193,
      startLng: 114.1694,
      endLat: 34.0522,
      endLng: -118.2437,
      arcAlt: 0.3,
      color: colors[2],
    },
    {
      order: 13,
      startLat: 52.52,
      startLng: 13.405,
      endLat: 22.3193,
      endLng: 114.1694,
      arcAlt: 0.3,
      color: colors[0],
    },
    {
      order: 13,
      startLat: 11.986597,
      startLng: 8.571831,
      endLat: 35.6762,
      endLng: 139.6503,
      arcAlt: 0.3,
      color: colors[1],
    },
    {
      order: 13,
      startLat: -22.9068,
      startLng: -43.1729,
      endLat: -34.6037,
      endLng: -58.3816,
      arcAlt: 0.1,
      color: colors[2],
    },
    {
      order: 14,
      startLat: -33.936138,
      startLng: 18.436529,
      endLat: 21.395643,
      endLng: 39.883798,
      arcAlt: 0.3,
      color: colors[0],
    },
  ];

  const avatars = [
    {
      id: "ca",
      name: "Canada",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      Flag: CA,
      pos: "top-[4%] left-[46%]",
      floatDelay: 0,
    },
    {
      id: "gb",
      name: "UK",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      Flag: GB,
      pos: "top-[16%] right-[10%]",
      floatDelay: 0.4,
    },
    {
      id: "in",
      name: "India",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      Flag: IN,
      pos: "top-[25%] left-[8%]",
      floatDelay: 0.8,
    },
    {
      id: "sg",
      name: "Singapore",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
      Flag: SG,
      pos: "top-[46%] right-[3%]",
      floatDelay: 0.2,
    },
    {
      id: "us",
      name: "USA",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      Flag: US,
      pos: "bottom-[26%] left-[6%]",
      floatDelay: 0.6,
    },
    {
      id: "de",
      name: "Germany",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
      Flag: DE,
      pos: "bottom-[22%] right-[11%]",
      floatDelay: 1.0,
    },
    {
      id: "au",
      name: "Australia",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
      Flag: AU,
      pos: "bottom-[8%] left-[44%]",
      floatDelay: 1.2,
    },
  ];

  return (
    <section id="community" className="py-20 sm:py-28 lg:py-32 bg-gradient-to-b from-[#f8fafc] via-[#f0f7ff]/40 to-[#f8fafc] relative overflow-hidden border-t border-slate-200/60 select-none">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-indigo-100/35 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Heading, Details, WhatsApp CTA, Stats */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-5 flex flex-col items-start text-left"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/70 text-blue-600 text-xs sm:text-sm font-semibold mb-6 shadow-xs">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Global Community</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-4xl sm:text-5xl lg:text-[54px] xl:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] font-display mb-6">
              A Global Community{" "}
              <span className="text-[#2563eb] block">
                of Learners
              </span>
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg mb-8">
              Join a diverse community of students and professionals from around the world. Get updates, discuss ideas, share opportunities, and grow together.
            </p>

            {/* WhatsApp Community Button */}
            <a
              href="https://chat.whatsapp.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-[#00a859] hover:bg-[#00924d] text-white font-semibold text-base sm:text-lg shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group mb-10"
            >
              <WhatsAppIcon className="w-6 h-6 shrink-0" />
              <span>Join Our WhatsApp Community</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>

            {/* Stats Row with Vertical Dividers */}
            <div className="flex items-center gap-6 sm:gap-8 pt-4">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                  10K+
                </div>
                <div className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Learners Worldwide
                </div>
              </div>

              <div className="h-10 w-px bg-slate-200" />

              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                  50+
                </div>
                <div className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Countries
                </div>
              </div>

              <div className="h-10 w-px bg-slate-200" />

              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                  24/7
                </div>
                <div className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Discussions
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: 3D Globe with Floating Student Avatars & Country Flags */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-7 relative w-full h-[450px] sm:h-[550px] md:h-[620px] flex items-center justify-center"
          >
            {/* Playful Handwritten Annotation & Arrow */}
            <div className="absolute top-2 sm:top-6 right-6 sm:right-12 z-20 hidden sm:flex flex-col items-end pointer-events-none">
              <span className="text-blue-600 text-sm sm:text-base font-bold italic tracking-wide font-sans transform rotate-[-4deg]">
                Learners <br /> from around <br /> the world
              </span>
              <svg
                className="w-10 h-10 text-blue-500 transform -rotate-12 mt-1 mr-2"
                viewBox="0 0 50 50"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M 40 8 C 25 10, 10 20, 12 40" />
                <path d="M 6 32 L 12 40 L 20 34" />
              </svg>
            </div>

            {/* Dotted Orbit Rings in Background for Atmosphere */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[340px] sm:w-[460px] md:w-[540px] h-[340px] sm:h-[460px] md:h-[540px] rounded-full border border-blue-200/50 border-dashed animate-[spin_60s_linear_infinite]" />
              <div className="absolute w-[400px] sm:w-[540px] md:w-[620px] h-[400px] sm:h-[540px] md:h-[620px] rounded-full border border-indigo-200/40 border-dashed animate-[spin_90s_linear_infinite_reverse]" />
            </div>

            {/* 3D World Globe */}
            <div className="w-full h-full relative z-10 flex items-center justify-center">
              <World data={sampleArcs} globeConfig={globeConfig} />
            </div>

            {/* Floating Student Avatar Badges with Country Flags */}
            {avatars.map((av) => {
              const FlagComponent = av.Flag;
              return (
                <motion.div
                  key={av.id}
                  animate={{
                    y: [0, -7, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3 + av.floatDelay,
                    ease: "easeInOut",
                    delay: av.floatDelay,
                  }}
                  className={`absolute ${av.pos} z-20 pointer-events-auto`}
                >
                  <div className="relative group cursor-pointer">
                    <div className="w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-full p-0.5 bg-white shadow-xl shadow-blue-900/15 border-2 border-white ring-2 ring-blue-100/60 overflow-hidden hover:scale-110 transition-transform duration-200">
                      <img
                        src={av.image}
                        alt={av.name}
                        className="w-full h-full object-cover rounded-full pointer-events-none"
                      />
                    </div>

                    {/* Flag Badge on Corner */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-4 sm:w-5.5 sm:h-4.5 rounded-sm overflow-hidden border border-white shadow-md bg-white flex items-center justify-center">
                      <FlagComponent title={av.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
