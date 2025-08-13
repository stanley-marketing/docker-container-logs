// SPDX-License-Identifier: MIT
export default function DeveloperPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            For Developers
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Developer Learning Path
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Master Docker log analysis from basic debugging to advanced production monitoring. 
            Choose your experience level and dive in.
          </p>
        </div>

        {/* Learning Path Levels */}
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Easy Level */}
          <details className="group bg-slate-800/50 border border-green-600/30 rounded-lg">
            <summary className="cursor-pointer p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-green-400">Easy Level</h3>
                  <p className="text-gray-400">Perfect for beginners • 5-10 minutes setup</p>
                </div>
                <div className="ml-auto bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Start Here
                </div>
              </div>
            </summary>
            <div className="px-6 pb-6 space-y-6">
              <p className="text-gray-300">
                Get started with basic Docker log monitoring. Perfect if you're new to container logging 
                or want a quick win.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                  <h4 className="font-semibold text-green-400 mb-2 flex items-center space-x-2">
                    <span>⚡</span>
                    <span>Quick Start</span>
                  </h4>
                  <p className="text-gray-400 text-sm mb-3">One command to get running</p>
                  <div className="bg-slate-900 rounded p-3 font-mono text-sm">
                    <div className="text-gray-500"># Monitor all containers</div>
                    <div><span className="text-green-400">npx</span> docker-log-summariser --all</div>
                  </div>
                </div>

                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                  <h4 className="font-semibold text-green-400 mb-2 flex items-center space-x-2">
                    <span>🚀</span>
                    <span>Instant Results</span>
                  </h4>
                  <p className="text-gray-400 text-sm mb-3">See AI summaries immediately</p>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center space-x-2">
                      <span className="text-green-400">✓</span>
                      <span>TL;DR summaries</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-green-400">✓</span>
                      <span>Error detection</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-green-400">✓</span>
                      <span>Key events timeline</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded font-semibold transition-colors">
                  Try Easy Setup
                </button>
                <span className="text-gray-400 flex items-center space-x-1 text-sm">
                  <span>⏱️</span>
                  <span>5 min setup</span>
                </span>
              </div>
            </div>
          </details>

          {/* Standard Level */}
          <details className="group bg-slate-800/50 border border-blue-600/30 rounded-lg">
            <summary className="cursor-pointer p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">⚙️</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-blue-400">Standard Level</h3>
                  <p className="text-gray-400">Production-ready setup • 15-30 minutes</p>
                </div>
                <div className="ml-auto bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Recommended
                </div>
              </div>
            </summary>
            <div className="px-6 pb-6 space-y-6">
              <p className="text-gray-300">
                Set up proper configuration, API integration, and persistent storage. 
                Ideal for development and staging environments.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-400 mb-2 flex items-center space-x-2">
                    <span>📝</span>
                    <span>Configuration</span>
                  </h4>
                  <p className="text-gray-400 text-sm mb-3">Custom settings and filters</p>
                  <div className="bg-slate-900 rounded p-3 font-mono text-sm">
                    <div className="text-gray-500"># With custom config</div>
                    <div><span className="text-blue-400">docker-log-summariser</span></div>
                    <div><span className="text-gray-400">  --label</span> app=myservice</div>
                    <div><span className="text-gray-400">  --api</span> --port 8080</div>
                  </div>
                </div>

                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-400 mb-2 flex items-center space-x-2">
                    <span>🔗</span>
                    <span>API Integration</span>
                  </h4>
                  <p className="text-gray-400 text-sm mb-3">REST API for automation</p>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center space-x-2">
                      <span className="text-blue-400">✓</span>
                      <span>REST endpoints</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-blue-400">✓</span>
                      <span>Webhook integration</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-blue-400">✓</span>
                      <span>Custom queries</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-blue-400">What You'll Learn:</h4>
                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-400">✓</span>
                    <span>Container label filtering</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-400">✓</span>
                    <span>API endpoint setup</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-400">✓</span>
                    <span>Database configuration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-400">✓</span>
                    <span>Performance tuning</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-semibold transition-colors">
                  Start Standard Setup
                </button>
                <span className="text-gray-400 flex items-center space-x-1 text-sm">
                  <span>⏱️</span>
                  <span>15-30 min setup</span>
                </span>
              </div>
            </div>
          </details>

          {/* Advanced Level */}
          <details className="group bg-slate-800/50 border border-purple-600/30 rounded-lg">
            <summary className="cursor-pointer p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">🚀</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-purple-400">Advanced Level</h3>
                  <p className="text-gray-400">Enterprise production • 1-2 hours setup</p>
                </div>
                <div className="ml-auto bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Expert
                </div>
              </div>
            </summary>
            <div className="px-6 pb-6 space-y-6">
              <p className="text-gray-300">
                Full production deployment with monitoring, alerting, and enterprise integrations. 
                For teams running critical services.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-400 mb-2 flex items-center space-x-2">
                    <span>☸️</span>
                    <span>Production Deploy</span>
                  </h4>
                  <p className="text-gray-400 text-sm mb-3">Docker Compose & Kubernetes</p>
                  <div className="bg-slate-900 rounded p-3 font-mono text-sm">
                    <div className="text-gray-500"># Docker Compose</div>
                    <div><span className="text-purple-400">docker-compose</span> up -d</div>
                    <div className="text-gray-500"># Or Kubernetes</div>
                    <div><span className="text-purple-400">kubectl</span> apply -f k8s/</div>
                  </div>
                </div>

                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-400 mb-2 flex items-center space-x-2">
                    <span>📊</span>
                    <span>Enterprise Features</span>
                  </h4>
                  <p className="text-gray-400 text-sm mb-3">Monitoring & alerting</p>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center space-x-2">
                      <span className="text-purple-400">✓</span>
                      <span>Prometheus metrics</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-purple-400">✓</span>
                      <span>Grafana dashboards</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-purple-400">✓</span>
                      <span>Alert manager</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-purple-400">Enterprise Capabilities:</h4>
                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-purple-400">✓</span>
                    <span>High availability setup</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-purple-400">✓</span>
                    <span>Multi-cluster support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-purple-400">✓</span>
                    <span>Custom AI model integration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-purple-400">✓</span>
                    <span>SSO & RBAC integration</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded font-semibold transition-colors">
                  Enterprise Setup Guide
                </button>
                <span className="text-gray-400 flex items-center space-x-1 text-sm">
                  <span>⏱️</span>
                  <span>1-2 hour setup</span>
                </span>
              </div>
            </div>
          </details>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">
            Need help choosing? Start with Easy and work your way up.
          </p>
          <div className="flex justify-center space-x-4">
            <a href="/" className="border border-gray-600 text-gray-300 hover:bg-slate-800 px-6 py-2 rounded transition-colors">
              ← Back to Home
            </a>
            <a href="/devops" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors">
              View DevOps Path →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 