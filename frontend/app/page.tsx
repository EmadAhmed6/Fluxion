import { Suspense } from "react";
import HomeContent from "./HomeContent";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bgPrimary" />}>
      <HomeContent />
    </Suspense>
  );
}

