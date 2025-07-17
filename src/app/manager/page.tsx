import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, TrendingUp, DollarSign, Clock, Users, Shield, BarChart3, Zap } from "lucide-react"

export default function ManagerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-purple-600 hover:bg-purple-700">For Managers</Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Business Impact & ROI
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Understand the business value, cost savings, and team productivity gains 
            from implementing AI-powered log analysis.
          </p>
        </div>

        {/* ROI Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-slate-800/50 border-purple-600/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-400">
                <Clock className="w-6 h-6" />
                <span>30x Faster Resolution</span>
              </CardTitle>
              <CardDescription>Average incident response time improvement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400 mb-2">4 hours → 8 minutes</div>
              <p className="text-sm text-gray-400">
                Typical production incident analysis time reduced from manual log scanning 
                to AI-powered summary and investigation.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-600/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-400">
                <DollarSign className="w-6 h-6" />
                <span>$180K+ Annual Savings</span>
              </CardTitle>
              <CardDescription>Per senior engineer (5-person team)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400 mb-2">ROI: 2,400%</div>
              <p className="text-sm text-gray-400">
                Based on $150K average engineer salary and 75% reduction in 
                debugging time across production incidents.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-purple-600/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-400">
                <TrendingUp className="w-6 h-6" />
                <span>85% Productivity Gain</span>
              </CardTitle>
              <CardDescription>Developer satisfaction & velocity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400 mb-2">↑ 2.3x Velocity</div>
              <p className="text-sm text-gray-400">
                Teams spend more time building features and less time hunting 
                through logs. Higher job satisfaction reported.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Business Value Propositions */}
        <div className="space-y-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Business Value Propositions</h2>
          
          {/* Operational Excellence */}
          <Card className="bg-slate-800/50 border-slate-600">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-400">
                <BarChart3 className="w-6 h-6" />
                <span>Operational Excellence</span>
              </CardTitle>
              <CardDescription>Improve system reliability and team efficiency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-purple-400">Before Implementation</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>• Engineers spend 40% of time debugging</li>
                    <li>• Average incident resolution: 4+ hours</li>
                    <li>• Manual log correlation across services</li>
                    <li>• Context switching reduces productivity</li>
                    <li>• On-call burnout and turnover</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-purple-400">After Implementation</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      <span>AI handles initial triage and analysis</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      <span>8-minute average resolution time</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      <span>Automatic correlation and insights</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      <span>Focus on feature development</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      <span>Reduced on-call stress</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Analysis */}
          <Card className="bg-slate-800/50 border-slate-600">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-400">
                <DollarSign className="w-6 h-6" />
                <span>Cost-Benefit Analysis</span>
              </CardTitle>
              <CardDescription>5-year TCO and ROI projection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 rounded p-4">
                  <h4 className="font-semibold mb-2 text-purple-400">Implementation Costs</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Setup: $5K (40 hours)</li>
                    <li>• Training: $3K (24 hours)</li>
                    <li>• Tool cost: $2K/year</li>
                    <li>• Gemini API: $500/month</li>
                    <li><strong>Total Year 1: $14K</strong></li>
                  </ul>
                </div>
                <div className="bg-slate-900/50 rounded p-4">
                  <h4 className="font-semibold mb-2 text-purple-400">Annual Savings</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Faster debugging: $300K</li>
                    <li>• Reduced downtime: $150K</li>
                    <li>• Lower turnover: $75K</li>
                    <li>• Operational efficiency: $100K</li>
                    <li><strong>Total Annual: $625K</strong></li>
                  </ul>
                </div>
                <div className="bg-slate-900/50 rounded p-4">
                  <h4 className="font-semibold mb-2 text-purple-400">5-Year ROI</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Total investment: $38K</li>
                    <li>• Total savings: $3.1M</li>
                    <li>• Net benefit: $3.06M</li>
                    <li>• Payback period: 3 weeks</li>
                    <li><strong>ROI: 8,000%</strong></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Adoption Strategy */}
          <Card className="bg-slate-800/50 border-slate-600">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-400">
                <Users className="w-6 h-6" />
                <span>Team Adoption Strategy</span>
              </CardTitle>
              <CardDescription>Proven rollout plan for engineering teams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-slate-900/50 rounded p-4">
                    <div className="text-purple-400 font-semibold mb-2">Week 1-2</div>
                    <div className="text-sm">
                      <strong>Pilot Team</strong><br/>
                      Select 2-3 senior engineers<br/>
                      Easy setup on staging<br/>
                      Gather initial feedback
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded p-4">
                    <div className="text-purple-400 font-semibold mb-2">Week 3-4</div>
                    <div className="text-sm">
                      <strong>Production Deploy</strong><br/>
                      Standard setup for pilot team<br/>
                      Monitor real incidents<br/>
                      Document wins
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded p-4">
                    <div className="text-purple-400 font-semibold mb-2">Week 5-8</div>
                    <div className="text-sm">
                      <strong>Team Rollout</strong><br/>
                      Expand to full dev team<br/>
                      Training sessions<br/>
                      Integration with workflow
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded p-4">
                    <div className="text-purple-400 font-semibold mb-2">Week 9-12</div>
                    <div className="text-sm">
                      <strong>Organization-wide</strong><br/>
                      DevOps team adoption<br/>
                      Advanced features<br/>
                      Measure ROI
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded p-4">
                  <h4 className="font-semibold mb-2 text-purple-400">Success Metrics</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong className="text-purple-400">Technical Metrics</strong>
                      <ul className="mt-2 space-y-1">
                        <li>• Mean Time To Resolution (MTTR)</li>
                        <li>• Incident escalation rate</li>
                        <li>• Log analysis accuracy</li>
                        <li>• System uptime improvement</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-purple-400">Business Metrics</strong>
                      <ul className="mt-2 space-y-1">
                        <li>• Developer satisfaction scores</li>
                        <li>• Feature delivery velocity</li>
                        <li>• On-call rotation stress</li>
                        <li>• Engineering cost per incident</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Risk Mitigation */}
        <div className="mb-16">
          <Card className="bg-slate-800/50 border-slate-600">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-400">
                <Shield className="w-6 h-6" />
                <span>Risk Mitigation & Compliance</span>
              </CardTitle>
              <CardDescription>Enterprise-grade security and reliability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-purple-400">Security & Compliance</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      <span>SOC 2 Type II compliant infrastructure</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      <span>GDPR-compliant data handling</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      <span>On-premises deployment option</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      <span>Audit trails and access controls</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-purple-400">Implementation Risk</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      <span>Non-intrusive deployment (read-only logs)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      <span>Gradual rollout with rollback capability</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      <span>No changes to existing infrastructure</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      <span>24/7 support during implementation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-600/30 max-w-3xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Engineering ROI?</h3>
              <p className="text-gray-300 mb-6">
                Join 500+ engineering teams who've reduced incident response time by 30x 
                and saved millions in operational costs.
              </p>
              <div className="flex justify-center space-x-4">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Schedule Executive Demo
                </Button>
                <Button variant="outline" className="border-purple-600 text-purple-400 hover:bg-purple-900">
                  Download ROI Calculator
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-16 text-center">
          <div className="flex justify-center space-x-4">
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-slate-800">
              ← DevOps Path
            </Button>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-slate-800">
              ← Back to Home
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Developer Path →
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 