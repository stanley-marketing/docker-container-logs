// SPDX-License-Identifier: MIT
import { Button } from "../ui/button";

export function HeroSection() {
  return (
    <section className="py-16 md:py-24 lg:py-32 px-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Transform Log Chaos into Clarity
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
          AI-powered summaries for your Docker logs, log files, and remote logs in real-time.
        </p>
        
        {/* Live Demo Placeholder */}
        <div className="bg-gray-100 rounded-lg p-8 mb-8 max-w-2xl mx-auto">
          <p className="text-gray-500 text-sm mb-2">🎬 Live Demo Coming Soon</p>
          <div className="bg-white rounded p-4 text-left">
            <p className="text-xs text-gray-400 mb-2">Log lines transforming into summary...</p>
            <div className="animate-pulse space-y-2">
              <div className="h-2 bg-gray-200 rounded w-3/4"></div>
              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              <div className="h-2 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>

        <Button size="lg" className="text-lg px-8 py-4" asChild>
          <a href="#roles">Get Started in 2 Minutes</a>
        </Button>
      </div>
    </section>
  );
} 