export function FeaturesOverviewSection() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          🚀 Why Developers Love This Tool
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl mb-4">⏰</div>
            <h3 className="text-xl font-semibold mb-2">30x Faster Incident Response</h3>
            <p className="text-gray-600">
              Get instant context on what&apos;s happening across all your containers
            </p>
          </div>

          <div className="text-center">
            <div className="text-3xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Insights</h3>
            <p className="text-gray-600">
              Spots patterns and anomalies you&apos;d miss, asks the right questions
            </p>
          </div>

          <div className="text-center">
            <div className="text-3xl mb-4">🔌</div>
            <h3 className="text-xl font-semibold mb-2">Multiple Log Sources</h3>
            <p className="text-gray-600">
              Docker containers, local files, remote URLs - all in one place
            </p>
          </div>

          <div className="text-center">
            <div className="text-3xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">Interactive Q&A</h3>
            <p className="text-gray-600">
              Ask follow-up questions about any incident or log chunk
            </p>
          </div>

          <div className="text-center">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Built for Production</h3>
            <p className="text-gray-600">
              142K+ lines/sec throughput, sub-millisecond latency
            </p>
          </div>

          <div className="text-center">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Security & Monitoring</h3>
            <p className="text-gray-600">
              Secret redaction, JWT auth, Prometheus metrics ready
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 