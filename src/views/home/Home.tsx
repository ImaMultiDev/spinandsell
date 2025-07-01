import {
  Categories,
  CTA,
  Featured,
  Hero,
  HowItWorks,
  Statistics,
} from "./components";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Statistics Section */}
      <Statistics />

      {/* Categories Section */}
      <Categories />

      {/* How it Works Section */}
      <HowItWorks />

      {/* Featured Products Section */}
      <Featured />

      {/* CTA Section */}
      <CTA />
    </div>
  );
}
