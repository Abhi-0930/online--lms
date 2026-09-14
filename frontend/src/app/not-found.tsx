import Link from "next/link";
import { CircleHelp } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="card-surface mx-auto max-w-lg p-10 text-center">
        <CircleHelp className="mx-auto h-12 w-12 text-[#3157e8]" />
        <h1 className="mt-4 font-display text-2xl font-bold text-[#17223d] dark:text-white">
          Page Not Found
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#7c87a4]">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex button-primary"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
