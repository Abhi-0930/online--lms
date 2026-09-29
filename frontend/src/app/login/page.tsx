"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-white" />}>
      <AuthForm initialMode="login" />
    </Suspense>
  );
}
