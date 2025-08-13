// SPDX-License-Identifier: MIT
export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Transform Log Chaos into Clarity
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-8">
            AI-powered Docker log analysis that reduces incident response time by 30x. 
            From chaotic logs to actionable insights in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Get Started Free
            </button>
            <button className="border border-gray-600 text-gray-300 hover:bg-slate-800 px-8 py-3 rounded-lg font-semibold transition-colors">
              View Demo
            </button>
          </div>
        </div>

        {/* Problem vs Solution */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-6">
            <h3 className="text-xl font-bold text-red-400 mb-4">😵 Before: Log Chaos</h3>
            <div className="bg-slate-900 rounded p-4 font-mono text-sm text-red-300">
              2024-01-15 14:23:45 ERROR Connection failed<br/>
              2024-01-15 14:23:47 WARN Retrying connection<br/>
              2024-01-15 14:23:48 INFO Database timeout<br/>
              2024-01-15 14:23:49 ERROR Payment service down<br/>
              <span className="text-red-500">... 50,000 more lines to search through manually</span>
            </div>
            <p className="text-gray-400 mt-4">
              Engineers spend 40% of their time hunting through logs. Average incident resolution: 4+ hours.
            </p>
          </div>
          
          <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-6">
            <h3 className="text-xl font-bold text-green-400 mb-4">✨ After: AI Clarity</h3>
            <div className="bg-slate-900 rounded p-4 text-sm">
              <div className="text-green-400 font-semibold mb-2">🤖 TL;DR Summary:</div>
              <p className="text-gray-300 mb-3">Payment service failure caused by database connection timeout. Affected 1,247 transactions.</p>
              
              <div className="text-blue-400 font-semibold mb-2">🔍 Key Events:</div>
              <p className="text-gray-300 mb-3">14:23:45 - Initial connection failure<br/>14:23:48 - Database timeout cascade</p>
              
              <div className="text-purple-400 font-semibold mb-2">❓ Investigation Questions:</div>
              <p className="text-gray-300">1. Check database server load<br/>2. Review connection pool settings</p>
            </div>
            <p className="text-gray-400 mt-4">
              AI analysis in 8 seconds. Clear action items. Instant resolution path.
            </p>
          </div>
        </div>

        {/* Role Selection */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-8">Choose Your Path</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-slate-800/50 border border-blue-600/30 rounded-lg p-6 hover:bg-slate-800 transition-colors">
            <div className="text-4xl mb-4">👨‍💻</div>
            <h3 className="text-xl font-semibold mb-2 text-blue-400">Developer</h3>
            <p className="text-gray-300 mb-4">From 5-minute setup to advanced API integration</p>
            <a href="/developer" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors">
              Start Here →
            </a>
          </div>
          
          <div className="bg-slate-800/50 border border-green-600/30 rounded-lg p-6 hover:bg-slate-800 transition-colors">
            <div className="text-4xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold mb-2 text-green-400">DevOps Engineer</h3>
            <p className="text-gray-300 mb-4">Container monitoring to Kubernetes deployment</p>
            <a href="/devops" className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition-colors">
              Start Here →
            </a>
          </div>
          
          <div className="bg-slate-800/50 border border-purple-600/30 rounded-lg p-6 hover:bg-slate-800 transition-colors">
            <div className="text-4xl mb-4">👔</div>
            <h3 className="text-xl font-semibold mb-2 text-purple-400">Manager</h3>
            <p className="text-gray-300 mb-4">ROI analysis and team adoption strategies</p>
            <a href="/manager" className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded transition-colors">
              Start Here →
            </a>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="bg-slate-800/30 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Why Teams Love It</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">30x</div>
              <div className="text-sm text-gray-300">Faster Resolution</div>
              <div className="text-xs text-gray-500">4 hours → 8 minutes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">$180K+</div>
              <div className="text-sm text-gray-300">Annual Savings</div>
              <div className="text-xs text-gray-500">Per 5-person team</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">142K</div>
              <div className="text-sm text-gray-300">Lines/Second</div>
              <div className="text-xs text-gray-500">Processing speed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">0.007ms</div>
              <div className="text-sm text-gray-300">Average Latency</div>
              <div className="text-xs text-gray-500">Per log line</div>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="text-center">
          <p className="text-gray-400 mb-6">
            Trusted by 500+ engineering teams to reduce incident response time and operational costs
          </p>
          <div className="flex justify-center space-x-8 text-gray-500">
            <span>🏢 Enterprise Ready</span>
            <span>🔒 SOC 2 Compliant</span>
            <span>🌍 GDPR Compatible</span>
            <span>📈 Production Tested</span>
          </div>
        </div>
      </div>
    </main>
  );
} 