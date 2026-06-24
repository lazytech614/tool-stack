import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Hero />
      <Features />
    </main>
  );
}