export function SocialProofSection() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">
          Trusted by Development Teams
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">142K</div>
            <div className="text-gray-600">Lines/sec throughput</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">0.007ms</div>
            <div className="text-gray-600">Average latency per line</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">30x</div>
            <div className="text-gray-600">Faster incident response</div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <blockquote className="text-lg text-gray-600 mb-4">
            &quot;This tool saved us hours during our last incident. Instead of grep-ing through thousands of log lines, we got instant AI summaries that pointed us directly to the root cause.&quot;
          </blockquote>
          <div className="font-semibold text-gray-900">
            — DevOps Engineer, Tech Startup
          </div>
        </div>
      </div>
    </section>
  );
} 