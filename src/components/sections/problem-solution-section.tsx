export function ProblemSolutionSection() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left: Problem */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🤔 The Problem Every Developer Faces
            </h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
              <div>$ docker logs my-app | tail -100</div>
              <div className="mt-2 space-y-1">
                <div>2024-01-15T10:30:45.123Z [INFO] Processing request...</div>
                <div>2024-01-15T10:30:45.124Z [DEBUG] Database connection...</div>
                <div>2024-01-15T10:30:45.125Z [WARN] Rate limit approaching...</div>
                <div>2024-01-15T10:30:45.126Z [ERROR] Payment validation failed...</div>
                <div className="text-gray-500">... 2,847 more lines of logs ...</div>
                <div className="text-red-400">2024-01-15T10:32:12.891Z [FATAL] OutOfMemoryError</div>
              </div>
            </div>
            <p className="mt-4 text-gray-600">
              <strong>What actually happened?</strong> 🤷‍♂️ Good luck finding the needle in this haystack.
            </p>
          </div>

          {/* Right: Solution */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              💡 The Solution: AI-Powered Log Intelligence
            </h2>
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
              <div className="text-sm text-blue-600 mb-2">🧠 AI Summary (Container: payment-service, 10:30-10:32)</div>
              <div className="border-b border-blue-200 mb-4"></div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <strong>📋 TL;DR:</strong> Payment processing degraded, then crashed with OOM error
                </div>
                
                <div>
                  <strong>🔍 Key Events:</strong>
                  <ul className="list-disc list-inside ml-2 mt-1 space-y-1 text-gray-700">
                    <li>Rate limiting triggered for user_12345</li>
                    <li>Payment validation failed (invalid card)</li>
                    <li>Memory exhaustion led to fatal crash</li>
                  </ul>
                </div>

                <div>
                  <strong>❓ Questions for Investigation:</strong>
                  <ul className="list-disc list-inside ml-2 mt-1 space-y-1 text-gray-700">
                    <li>Why did heap usage spike dramatically?</li>
                    <li>Should we implement circuit breaker?</li>
                  </ul>
                </div>
              </div>
            </div>
            <p className="mt-4 text-gray-600">
              <strong>Now you know exactly what happened in 10 seconds instead of 10 minutes.</strong> ⚡
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 