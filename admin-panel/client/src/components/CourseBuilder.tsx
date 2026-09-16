import React, { useState, useRef } from "react";
import {
  ArrowLeft,
  X,
  ImagePlus,
  Check,
  ChevronDown,
  Trash2,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface CourseBuilderData {
  // Step 1: Basic Information
  title: string;
  subtitle: string;
  description: string;
  language: string;
  category: string;
  level: string;
  thumbnail: File | null;
  thumbnailPreview: string | null;

  // Step 2: Pricing & Access
  courseType: "Paid" | "Free";
  price: string;
  discountPrice: string;
  currency: string;
  accessType: "Lifetime Access" | "Fixed Duration" | "Subscription";
  enrollmentLimit: string;
  courseVisibility: "Public" | "Private" | "Unlisted";
}

interface CourseBuilderProps {
  onClose: () => void;
  onSaveDraft?: (data: CourseBuilderData) => void;
  onContinue?: (data: CourseBuilderData) => void;
  initialData?: Partial<CourseBuilderData>;
  initialStep?: number;
}

const CATEGORIES = [
  "Web Development",
  "Data Structures & Algorithms",
  "System Design",
  "Artificial Intelligence & ML",
  "Cloud & DevOps",
  "Mobile Development",
  "Cybersecurity",
  "Database & Backend",
];

const LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"];

const LANGUAGES = [
  "English",
  "Hindi",
  "Spanish",
  "French",
  "German",
  "Mandarin",
  "Japanese",
];

const CURRENCIES = ["INR ₹", "USD $", "EUR €", "GBP £"];

function BuilderDropdown({
  value,
  onChange,
  options,
  placeholder = "Select",
  error,
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  error?: boolean;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutside);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]);

  const displayLabel = value || placeholder;
  const isSelected = !!value;

  return (
    <div ref={dropdownRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3 text-left text-xs sm:text-[13px] font-medium transition-all duration-150 select-none shadow-xs cursor-pointer",
          isOpen
            ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs"
            : error
            ? "border-rose-400 bg-rose-50/20"
            : "border-slate-200 hover:border-slate-300 text-slate-900"
        )}
      >
        <span
          className={cn(
            "truncate",
            isSelected ? "text-slate-800 font-semibold" : "text-slate-400"
          )}
        >
          {displayLabel}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2",
            isOpen && "rotate-180 text-indigo-600"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="space-y-0.5">
            {options.map((opt) => {
              const active = opt === value;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs sm:text-[13px] font-medium transition-colors cursor-pointer",
                    active
                      ? "bg-indigo-50 font-bold text-indigo-700"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <span className="truncate">{opt}</span>
                  {active && (
                    <Check className="h-4 w-4 shrink-0 text-indigo-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CourseBuilder({
  onClose,
  onSaveDraft,
  onContinue,
  initialData,
  initialStep = 1,
}: CourseBuilderProps) {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [formData, setFormData] = useState<CourseBuilderData>({
    title: initialData?.title || "",
    subtitle: initialData?.subtitle || "",
    description: initialData?.description || "",
    language: initialData?.language || "English",
    category: initialData?.category || "",
    level: initialData?.level || "",
    thumbnail: initialData?.thumbnail || null,
    thumbnailPreview: initialData?.thumbnailPreview || null,

    courseType: initialData?.courseType || "Paid",
    price: initialData?.price || "18,999",
    discountPrice: initialData?.discountPrice || "14,999",
    currency: initialData?.currency || "INR ₹",
    accessType: initialData?.accessType || "Lifetime Access",
    enrollmentLimit: initialData?.enrollmentLimit || "Unlimited",
    courseVisibility: initialData?.courseVisibility || "Public",
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should not exceed 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        thumbnail: file,
        thumbnailPreview: reader.result as string,
      }));
      setErrors((prev) => ({ ...prev, thumbnail: false }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const removeThumbnail = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData((prev) => ({
      ...prev,
      thumbnail: null,
      thumbnailPreview: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, boolean> = {};
    if (!formData.title.trim()) newErrors.title = true;
    if (!formData.description.trim()) newErrors.description = true;
    if (!formData.category) newErrors.category = true;
    if (!formData.level) newErrors.level = true;
    if (!formData.language) newErrors.language = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, boolean> = {};
    if (formData.courseType === "Paid" && !formData.price.trim()) {
      newErrors.price = true;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    if (onSaveDraft) {
      await onSaveDraft(formData);
    }
    setIsSaving(false);
  };

  const handleContinue = () => {
    if (currentStep === 1) {
      const isValid = validateStep1();
      if (!isValid) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const isValid = validateStep2();
      if (!isValid) return;
      if (onContinue) {
        onContinue(formData);
      } else {
        setCurrentStep(3);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const steps = [
    { number: 1, label: "Basic Information" },
    { number: 2, label: "Pricing & Access" },
    { number: 3, label: "Course Curriculum" },
    { number: 4, label: "Additional Details" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-16">
      {/* Top Navigation Header */}
      <div className="mx-auto max-w-[1100px] px-6 pt-6 pb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to courses
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition cursor-pointer"
          title="Close course builder"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Course Builder Header */}
      <div className="mx-auto max-w-[1100px] px-6 mt-3">
        <p className="text-[11px] font-bold tracking-[0.14em] text-indigo-600 uppercase">
          COURSE BUILDER
        </p>
        <h1 className="font-display text-2xl sm:text-[32px] font-extrabold text-slate-900 tracking-tight mt-1">
          {currentStep === 1
            ? "Basic Information"
            : currentStep === 2
            ? "Pricing & Access"
            : currentStep === 3
            ? "Course Curriculum"
            : "Additional Details"}
        </h1>
        <p className="text-xs sm:text-[13px] text-slate-500 mt-1">
          {currentStep === 1
            ? "Add the core information about your course."
            : currentStep === 2
            ? "Configure pricing and course accessibility."
            : currentStep === 3
            ? "Structure your modules, lessons, and content."
            : "Add requirements, targeted learners, and course tags."}
        </p>
      </div>

      {/* Stepper Progress Bar with Connector Lines */}
      <div className="mx-auto max-w-[1100px] px-6 mt-8">
        <div className="grid grid-cols-4 gap-2 sm:gap-4 relative">
          {steps.map((step, index) => {
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;

            return (
              <div
                key={step.number}
                className="flex flex-col items-start select-none relative"
              >
                <div className="flex items-center w-full">
                  <div
                    onClick={() => {
                      if (step.number < currentStep) {
                        setCurrentStep(step.number);
                      }
                    }}
                    className={cn(
                      "flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs font-bold transition-all z-10 shrink-0",
                      isCompleted
                        ? "bg-emerald-500 text-white cursor-pointer"
                        : isActive
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/25"
                        : "text-slate-400 font-semibold"
                    )}
                  >
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.number}
                  </div>

                  {/* Connecting Line to next step */}
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-[2px] mx-2 transition-colors",
                        isCompleted
                          ? "bg-emerald-500"
                          : "bg-slate-200"
                      )}
                    />
                  )}
                </div>

                <span
                  className={cn(
                    "mt-2 text-[11px] sm:text-xs tracking-tight",
                    isActive
                      ? "font-bold text-slate-900"
                      : isCompleted
                      ? "font-medium text-slate-600"
                      : "font-medium text-slate-400"
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Form Card */}
      <div className="mx-auto max-w-[1100px] px-6 mt-7">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleContinue();
            }}
          >
            {/* STEP 1: Basic Information */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 animate-in fade-in-50 duration-200">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Course Title */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800">
                      Course Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, title: e.target.value }));
                        if (errors.title) setErrors((prev) => ({ ...prev, title: false }));
                      }}
                      placeholder="e.g. Data Structures & Algorithms"
                      className={cn(
                        "mt-2 w-full rounded-xl border bg-white px-4 py-3 text-xs sm:text-[13px] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-xs",
                        errors.title
                          ? "border-rose-400 bg-rose-50/20"
                          : "border-slate-200 hover:border-slate-300"
                      )}
                    />
                    {errors.title && (
                      <p className="mt-1 text-[11px] font-semibold text-rose-500">
                        Course title is required.
                      </p>
                    )}
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800">
                      Short Description <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }));
                        if (errors.description)
                          setErrors((prev) => ({ ...prev, description: false }));
                      }}
                      placeholder="What will learners achieve by the end of this course?"
                      className={cn(
                        "mt-2 w-full rounded-xl border bg-white px-4 py-3 text-xs sm:text-[13px] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition shadow-xs",
                        errors.description
                          ? "border-rose-400 bg-rose-50/20"
                          : "border-slate-200 hover:border-slate-300"
                      )}
                    />
                    {errors.description && (
                      <p className="mt-1 text-[11px] font-semibold text-rose-500">
                        Short description is required.
                      </p>
                    )}
                  </div>

                  {/* Course Language */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2">
                      Course Language <span className="text-rose-500">*</span>
                    </label>
                    <BuilderDropdown
                      value={formData.language}
                      onChange={(val) => {
                        setFormData((prev) => ({ ...prev, language: val }));
                        if (errors.language)
                          setErrors((prev) => ({ ...prev, language: false }));
                      }}
                      options={LANGUAGES}
                      placeholder="Select language"
                      error={errors.language}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Course Subtitle */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800">
                      Course Subtitle
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          subtitle: e.target.value,
                        }))
                      }
                      placeholder="A practical path from fundamentals to interviews"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-[13px] font-medium placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-xs"
                    />
                  </div>

                  {/* Side-by-side Dropdowns: Category & Level */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2">
                        Course Category <span className="text-rose-500">*</span>
                      </label>
                      <BuilderDropdown
                        value={formData.category}
                        onChange={(val) => {
                          setFormData((prev) => ({ ...prev, category: val }));
                          if (errors.category)
                            setErrors((prev) => ({ ...prev, category: false }));
                        }}
                        options={CATEGORIES}
                        placeholder="Select category"
                        error={errors.category}
                      />
                      {errors.category && (
                        <p className="mt-1 text-[11px] font-semibold text-rose-500">
                          Category required.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2">
                        Course Level <span className="text-rose-500">*</span>
                      </label>
                      <BuilderDropdown
                        value={formData.level}
                        onChange={(val) => {
                          setFormData((prev) => ({ ...prev, level: val }));
                          if (errors.level)
                            setErrors((prev) => ({ ...prev, level: false }));
                        }}
                        options={LEVELS}
                        placeholder="Select level"
                        error={errors.level}
                      />
                      {errors.level && (
                        <p className="mt-1 text-[11px] font-semibold text-rose-500">
                          Level required.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Course Thumbnail */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs sm:text-[13px] font-bold text-slate-800">
                        Course Thumbnail <span className="text-rose-500">*</span>
                        <span className="ml-2 font-normal text-[11px] text-slate-400">
                          PNG, JPG or WEBP · Max 5 MB
                        </span>
                      </label>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                    />

                    {formData.thumbnailPreview ? (
                      <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-3 flex items-center gap-4">
                        <img
                          src={formData.thumbnailPreview}
                          alt="Course Thumbnail Preview"
                          className="h-20 w-32 object-cover rounded-xl border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {formData.thumbnail?.name || "course-thumbnail.png"}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {formData.thumbnail
                              ? `${(formData.thumbnail.size / (1024 * 1024)).toFixed(
                                  2
                                )} MB`
                              : "Thumbnail uploaded"}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                            >
                              Replace file
                            </button>
                            <button
                              type="button"
                              onClick={removeThumbnail}
                              className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-7 px-4 text-center cursor-pointer transition-all duration-150 select-none",
                          isDragging
                            ? "border-indigo-500 bg-indigo-50/50"
                            : "border-indigo-200/80 bg-indigo-50/15 hover:bg-indigo-50/35 hover:border-indigo-300"
                        )}
                      >
                        <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100/60 text-indigo-600">
                          <ImagePlus className="h-5 w-5" />
                        </div>
                        <p className="text-xs sm:text-[13px] font-semibold text-slate-700">
                          Drag and drop or{" "}
                          <span className="font-bold text-indigo-600 hover:underline">
                            browse files
                          </span>
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          Recommended 1280 × 720 px
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Pricing & Access */}
            {currentStep === 2 && (
              <div className="space-y-7 animate-in fade-in-50 duration-200">
                {/* Row 1: Course Type (Left) & Price, Discount Price, Currency (Right) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start">
                  {/* Left Column: Course Type Cards */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2">
                      Course Type
                    </label>
                    <div className="grid grid-cols-2 gap-3.5">
                      {/* Free Card */}
                      <div
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            courseType: "Free",
                          }))
                        }
                        className={cn(
                          "rounded-2xl p-4 transition-all duration-150 cursor-pointer select-none",
                          formData.courseType === "Free"
                            ? "border-2 border-indigo-400/90 bg-indigo-50/20 shadow-xs"
                            : "border border-slate-200 bg-white hover:border-slate-300"
                        )}
                      >
                        <p
                          className={cn(
                            "text-xs sm:text-[13px] font-bold",
                            formData.courseType === "Free"
                              ? "text-indigo-700"
                              : "text-slate-800"
                          )}
                        >
                          Free
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400 leading-tight">
                          Open access for every learner
                        </p>
                      </div>

                      {/* Paid Card */}
                      <div
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            courseType: "Paid",
                          }))
                        }
                        className={cn(
                          "rounded-2xl p-4 transition-all duration-150 cursor-pointer select-none",
                          formData.courseType === "Paid"
                            ? "border-2 border-indigo-400/90 bg-indigo-50/20 shadow-xs"
                            : "border border-slate-200 bg-white hover:border-slate-300"
                        )}
                      >
                        <p
                          className={cn(
                            "text-xs sm:text-[13px] font-bold",
                            formData.courseType === "Paid"
                              ? "text-indigo-700"
                              : "text-slate-800"
                          )}
                        >
                          Paid
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400 leading-tight">
                          Charge for course access
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Price *, Discount Price, Currency */}
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Price */}
                      <div>
                        <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2">
                          Price <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          disabled={formData.courseType === "Free"}
                          value={
                            formData.courseType === "Free"
                              ? "0"
                              : formData.price
                          }
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              price: e.target.value,
                            }));
                            if (errors.price)
                              setErrors((prev) => ({ ...prev, price: false }));
                          }}
                          placeholder="18,999"
                          className={cn(
                            "w-full rounded-xl border bg-white px-3.5 py-3 text-xs sm:text-[13px] font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-xs",
                            errors.price
                              ? "border-rose-400 bg-rose-50/20"
                              : "border-slate-200 hover:border-slate-300",
                            formData.courseType === "Free" &&
                              "bg-slate-50 text-slate-400 cursor-not-allowed"
                          )}
                        />
                      </div>

                      {/* Discount Price */}
                      <div>
                        <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2">
                          Discount Price
                        </label>
                        <input
                          type="text"
                          disabled={formData.courseType === "Free"}
                          value={
                            formData.courseType === "Free"
                              ? ""
                              : formData.discountPrice
                          }
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              discountPrice: e.target.value,
                            }))
                          }
                          placeholder="14,999"
                          className={cn(
                            "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-xs sm:text-[13px] font-medium placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-xs",
                            formData.courseType === "Free" &&
                              "bg-slate-50 text-slate-400 cursor-not-allowed"
                          )}
                        />
                      </div>

                      {/* Currency */}
                      <div>
                        <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2">
                          Currency
                        </label>
                        <BuilderDropdown
                          value={formData.currency}
                          onChange={(val) =>
                            setFormData((prev) => ({
                              ...prev,
                              currency: val,
                            }))
                          }
                          options={CURRENCIES}
                          placeholder="INR ₹"
                        />
                      </div>
                    </div>
                    {errors.price && (
                      <p className="mt-1 text-[11px] font-semibold text-rose-500">
                        Price is required for paid courses.
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 2: Access Type (Left) & Enrollment Limit (Right) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start">
                  {/* Left Column: Access Type Button Group */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2">
                      Access Type
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {(
                        [
                          "Lifetime Access",
                          "Fixed Duration",
                          "Subscription",
                        ] as const
                      ).map((type) => {
                        const isSelected = formData.accessType === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                accessType: type,
                              }))
                            }
                            className={cn(
                              "rounded-xl px-4 py-2.5 text-xs sm:text-[13px] font-medium transition-all duration-150 cursor-pointer select-none",
                              isSelected
                                ? "border-2 border-indigo-400/90 bg-indigo-50/20 font-bold text-indigo-700 shadow-xs"
                                : "border border-slate-200 bg-white hover:border-slate-300 text-slate-600"
                            )}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Enrollment Limit */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2">
                      Enrollment Limit{" "}
                      <span className="font-normal text-[11px] text-slate-400 ml-1">
                        Optional
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.enrollmentLimit}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          enrollmentLimit: e.target.value,
                        }))
                      }
                      placeholder="Unlimited"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs sm:text-[13px] font-medium placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-xs"
                    />
                  </div>
                </div>

                {/* Row 3: Course Visibility */}
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-slate-800 mb-2">
                    Course Visibility
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {(["Public", "Private", "Unlisted"] as const).map(
                      (vis) => {
                        const isSelected = formData.courseVisibility === vis;
                        return (
                          <button
                            key={vis}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                courseVisibility: vis,
                              }))
                            }
                            className={cn(
                              "rounded-xl px-5 py-2.5 text-xs sm:text-[13px] font-medium transition-all duration-150 cursor-pointer select-none",
                              isSelected
                                ? "border-2 border-indigo-400/90 bg-indigo-50/20 font-bold text-indigo-700 shadow-xs"
                                : "border border-slate-200 bg-white hover:border-slate-300 text-slate-600"
                            )}
                          >
                            {vis}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Card Footer Actions */}
            <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Left group */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <FileText className="h-4 w-4 text-slate-500" />
                  {isSaving ? "Saving..." : "Save draft"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-xs"
                >
                  Cancel
                </button>
              </div>

              {/* Right group */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={cn(
                    "rounded-xl border px-4 py-2.5 text-xs sm:text-[13px] font-semibold transition cursor-pointer",
                    currentStep === 1
                      ? "border-slate-200 bg-slate-50/60 text-slate-400 cursor-not-allowed"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-xs"
                  )}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-xs sm:text-[13px] font-bold text-white shadow-sm shadow-indigo-500/20 transition cursor-pointer"
                >
                  Continue →
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
