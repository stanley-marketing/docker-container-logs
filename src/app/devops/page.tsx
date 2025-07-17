import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, Server, Kubernetes, Shield, BarChart3, GitBranch, Monitor } from "lucide-react"

export default function DevOpsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-green-600 hover:bg-green-700">For DevOps Engineers</Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            DevOps Learning Path
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            From container monitoring to enterprise Kubernetes deployments. 
            Build production-ready logging infrastructure with AI-powered insights.
          </p>
        </div>

        {/* Infrastructure Focus Areas */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-slate-800/50 border-green-600/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-400">
                <Server className="w-6 h-6" />
                <span>Container Infrastructure</span>
              </CardTitle>
              <CardDescription>Docker & container orchestration</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Multi-container monitoring</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Log aggregation patterns</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Resource optimization</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-green-600/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-400">
                <Kubernetes className="w-6 h-6" />
                <span>Kubernetes Deployment</span>
              </CardTitle>
              <CardDescription>Production K8s integration</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Helm charts included</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>High availability setup</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Auto-scaling configuration</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-green-600/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-400">
                <Monitor className="w-6 h-6" />
                <span>Observability Stack</span>
              </CardTitle>
              <CardDescription>Monitoring & alerting</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Prometheus metrics</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Grafana dashboards</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Alert manager rules</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Deployment Guides */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-center mb-8">Deployment Guides</h2>
          
          {/* Docker Compose Guide */}
          <Card className="bg-slate-800/50 border-slate-600">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-400">
                <Server className="w-6 h-6" />
                <span>Docker Compose Deployment</span>
              </CardTitle>
              <CardDescription>Production-ready multi-service setup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-900 rounded p-4 font-mono text-sm">
                <div className="text-gray-500"># docker-compose.yml</div>
                <div className="mt-2">
                  <span className="text-blue-400">version:</span> <span className="text-green-400">'3.8'</span><br/>
                  <span className="text-blue-400">services:</span><br/>
                  <span className="ml-2 text-blue-400">log-summariser:</span><br/>
                  <span className="ml-4 text-blue-400">image:</span> docker-log-summariser:latest<br/>
                  <span className="ml-4 text-blue-400">environment:</span><br/>
                  <span className="ml-6 text-blue-400">- GEMINI_API_KEY=</span><span className="text-yellow-400">${'{'}GEMINI_API_KEY{'}'}</span><br/>
                  <span className="ml-4 text-blue-400">volumes:</span><br/>
                  <span className="ml-6 text-blue-400">- /var/run/docker.sock:/var/run/docker.sock</span><br/>
                  <span className="ml-6 text-blue-400">- ./data:/app/data</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button className="bg-green-600 hover:bg-green-700">
                  Download Compose File
                </Button>
                <span className="text-gray-400 flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>5 min setup</span>
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Kubernetes Guide */}
          <Card className="bg-slate-800/50 border-slate-600">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-400">
                <Kubernetes className="w-6 h-6" />
                <span>Kubernetes Deployment</span>
              </CardTitle>
              <CardDescription>Enterprise-grade K8s manifests and Helm charts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-900 rounded p-4 font-mono text-sm">
                  <div className="text-gray-500"># Quick deploy with kubectl</div>
                  <div className="mt-2">
                    <span className="text-green-400">kubectl</span> create namespace log-summariser<br/>
                    <span className="text-green-400">kubectl</span> apply -f k8s/ -n log-summariser<br/>
                    <span className="text-green-400">kubectl</span> get pods -n log-summariser
                  </div>
                </div>
                <div className="bg-slate-900 rounded p-4 font-mono text-sm">
                  <div className="text-gray-500"># Or with Helm</div>
                  <div className="mt-2">
                    <span className="text-blue-400">helm</span> repo add log-summariser .<br/>
                    <span className="text-blue-400">helm</span> install my-logs log-summariser/chart<br/>
                    <span className="text-blue-400">helm</span> status my-logs
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button className="bg-green-600 hover:bg-green-700">
                  Download K8s Manifests
                </Button>
                <Button variant="outline" className="border-green-600 text-green-400 hover:bg-green-900">
                  Get Helm Chart
                </Button>
                <span className="text-gray-400 flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>15 min setup</span>
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Monitoring Integration */}
          <Card className="bg-slate-800/50 border-slate-600">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-400">
                <BarChart3 className="w-6 h-6" />
                <span>Monitoring & Observability</span>
              </CardTitle>
              <CardDescription>Complete observability stack integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-slate-900/50 rounded p-4">
                  <h4 className="font-semibold mb-2 text-green-400">Metrics</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Logs processed/sec</li>
                    <li>• Queue depth</li>
                    <li>• AI response time</li>
                    <li>• Error rates</li>
                  </ul>
                </div>
                <div className="bg-slate-900/50 rounded p-4">
                  <h4 className="font-semibold mb-2 text-green-400">Dashboards</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Performance overview</li>
                    <li>• Container health</li>
                    <li>• Resource utilization</li>
                    <li>• Alert status</li>
                  </ul>
                </div>
                <div className="bg-slate-900/50 rounded p-4">
                  <h4 className="font-semibold mb-2 text-green-400">Alerts</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• High error rates</li>
                    <li>• Queue overflow</li>
                    <li>• Service downtime</li>
                    <li>• Performance degradation</li>
                  </ul>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button className="bg-green-600 hover:bg-green-700">
                  Setup Monitoring
                </Button>
                <span className="text-gray-400 flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>30 min setup</span>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security & Compliance */}
        <div className="mt-16">
          <Card className="bg-slate-800/50 border-slate-600">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-400">
                <Shield className="w-6 h-6" />
                <span>Security & Compliance</span>
              </CardTitle>
              <CardDescription>Enterprise security best practices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-green-400">Security Features</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>API key encryption at rest</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>TLS/SSL for all communications</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>RBAC integration</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Audit logging</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-green-400">Compliance</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>SOC 2 Type II ready</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>GDPR compliant data handling</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Data retention policies</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Log sanitization options</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-16 text-center">
          <div className="flex justify-center space-x-4">
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-slate-800">
              ← Developer Path
            </Button>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-slate-800">
              ← Back to Home
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Manager Path →
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 