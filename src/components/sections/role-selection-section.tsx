// SPDX-License-Identifier: MIT
import Link from 'next/link'

export function RoleSelectionSection() {
  return (
    <section id="roles" className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Start Your Journey
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Developer Path */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">👨‍💻</div>
            <h3 className="text-xl font-semibold mb-2">Developer</h3>
            <p className="text-gray-600 mb-4">
              From 5-minute setup to advanced API integration
            </p>
            <Link 
              href="/developer" 
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Start Here
            </Link>
          </div>

          {/* DevOps Path */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold mb-2">DevOps Engineer</h3>
            <p className="text-gray-600 mb-4">
              Container monitoring to Kubernetes deployment
            </p>
            <Link 
              href="/devops" 
              className="inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Start Here
            </Link>
          </div>

          {/* Manager Path */}
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">👔</div>
            <h3 className="text-xl font-semibold mb-2">Manager</h3>
            <p className="text-gray-600 mb-4">
              ROI analysis and team adoption strategies
            </p>
            <Link 
              href="/manager" 
              className="inline-block bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition-colors"
            >
              Start Here
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
} 