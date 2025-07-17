import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Home, Code, Server, Briefcase } from "lucide-react"

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-sm border-b border-slate-700">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-white">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">LS</span>
            </div>
            <span>Log Summariser</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <Link 
              href="/developer" 
              className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors"
            >
              <Code className="w-4 h-4" />
              <span>Developer</span>
            </Link>
            <Link 
              href="/devops" 
              className="flex items-center space-x-2 text-gray-300 hover:text-green-400 transition-colors"
            >
              <Server className="w-4 h-4" />
              <span>DevOps</span>
            </Link>
            <Link 
              href="/manager" 
              className="flex items-center space-x-2 text-gray-300 hover:text-purple-400 transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              <span>Manager</span>
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="outline" size="sm" className="border-slate-600 text-gray-300">
              Menu
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
} 