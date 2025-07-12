import { Heart, Github, Twitter, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">
                STACK<span className="text-green-500">IT</span>
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              A community-driven platform for developers to ask questions, share knowledge, and grow together.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-green-500 transition-colors duration-200"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-green-500 transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-green-500 transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-green-500 transition-colors duration-200"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Support</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-500 transition-colors duration-200 text-sm"
                >
                  <a href="/help-center">Help Center</a>
                </a>
              </li>
              <li>
                <a
                  href="/documentation"
                  className="text-gray-600 hover:text-green-500 transition-colors duration-200 text-sm"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-gray-600 hover:text-green-500 transition-colors duration-200 text-sm"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="/bug-reports"
                  className="text-gray-600 hover:text-green-500 transition-colors duration-200 text-sm"
                >
                  Bug Reports
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <span>© 2025 StackIt. Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>for developers</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <a
                href="#"
                className="hover:text-green-500 transition-colors duration-200"
              >
                Status
              </a>
              <a
                href="#"
                className="hover:text-green-500 transition-colors duration-200"
              >
                Changelog
              </a>
              <a
                href="#"
                className="hover:text-green-500 transition-colors duration-200"
              >
                Security
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}