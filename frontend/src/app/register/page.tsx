"use client";

import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-white" />}>
      <AuthForm initialMode="register" />
    </Suspense>
  );
}
