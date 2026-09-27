"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FolderGit2,
  ExternalLink,
  Github,
  Star,
  Sparkles,
  ArrowRight,
  Code2
} from "lucide-react";
import { STUDENT_PROJECTS, StudentProject } from "./landingData";

export function StudentProjects() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "AI & Full Stack", "Backend & Cloud", "Frontend & WebSockets", "Full Stack"];

  const filteredProjects =
    activeCategory === "All"
      ? STUDENT_PROJECTS
      : STUDENT_PROJECTS.filter((p) => p.category === activeCategory);

  return (
    <section id="projects" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Built by Students</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Production Software Shipped to Real Users
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Forget toy todo-apps. Our students architect and deploy high-concurrency microservices, AI pipelines, and distributed platforms that win interviews.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="group rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              {/* Image Preview Container with Badges */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold shadow-xs">
                  {project.category}
                </div>

                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                  <span className="text-xs font-mono font-bold bg-blue-600/90 px-2.5 py-1 rounded-lg">
                    ⚡ {project.metrics}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{project.stars} stars</span>
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Tech Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {project.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Student Author and Actions Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={project.student.avatar}
                      alt={project.student.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{project.student.name}</p>
                      <p className="text-[11px] text-slate-500">{project.student.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="View GitHub"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      <span>Live Demo</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
