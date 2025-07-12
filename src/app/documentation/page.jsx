import { Code, Book, Zap, Shield, Database, Globe } from 'lucide-react';

export default function Documentation() {
  const docSections = [
    {
      icon: <Book className="w-6 h-6" />,
      title: "Getting Started",
      description: "Quick start guide and basic concepts",
      links: [
        { title: "Introduction to StackIt", href: "#intro" },
        { title: "Creating Your Account", href: "#account" },
        { title: "First Steps", href: "#first-steps" },
        { title: "Community Guidelines", href: "#guidelines" }
      ]
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "API Reference",
      description: "Complete API documentation and examples",
      links: [
        { title: "Authentication", href: "#auth" },
        { title: "Questions API", href: "#questions-api" },
        { title: "Users API", href: "#users-api" },
        { title: "Rate Limiting", href: "#rate-limits" }
      ]
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Advanced Features",
      description: "Power user features and customization",
      links: [
        { title: "Search Operators", href: "#search" },
        { title: "Tag Management", href: "#tags" },
        { title: "Notifications", href: "#notifications" },
        { title: "Integrations", href: "#integrations" }
      ]
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Security",
      description: "Security best practices and policies",
      links: [
        { title: "Account Security", href: "#account-security" },
        { title: "Privacy Settings", href: "#privacy" },
        { title: "Data Protection", href: "#data-protection" },
        { title: "Reporting Issues", href: "#reporting" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Documentation</h1>
            <p className="text-xl text-gray-600 mb-8">
              Comprehensive guides and API documentation for developers
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <a href="#api" className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200 group">
            <div className="flex items-center mb-3">
              <Code className="w-8 h-8 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-200">
                API Documentation
              </h3>
            </div>
            <p className="text-gray-600">
              Complete REST API reference with examples and SDKs
            </p>
          </a>

          <a href="#guides" className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200 group">
            <div className="flex items-center mb-3">
              <Book className="w-8 h-8 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-200">
                Developer Guides
              </h3>
            </div>
            <p className="text-gray-600">
              Step-by-step tutorials and best practices
            </p>
          </a>

          <a href="#examples" className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200 group">
            <div className="flex items-center mb-3">
              <Globe className="w-8 h-8 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-200">
                Code Examples
              </h3>
            </div>
            <p className="text-gray-600">
              Ready-to-use code snippets and integrations
            </p>
          </a>
        </div>

        {/* Documentation Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {docSections.map((section, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="text-green-600 mr-3">
                  {section.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                  <p className="text-gray-600 text-sm">{section.description}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-gray-700 hover:text-green-600 transition-colors duration-200 text-sm flex items-center"
                    >
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3"></span>
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* API Quick Start */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">API Quick Start</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication</h3>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                <div className="text-gray-600 mb-2">// Get your API key from settings</div>
                <div className="text-blue-600">const</div> <span className="text-gray-900">apiKey</span> = <span className="text-green-600">'your-api-key'</span>;
                <br /><br />
                <div className="text-gray-600 mb-2">// Make authenticated requests</div>
                <div className="text-blue-600">fetch</div>(<span className="text-green-600">'https://api.stackit.com/v1/questions'</span>, {'{'}
                <br />  <span className="text-gray-900">headers:</span> {'{'}
                <br />    <span className="text-green-600">'Authorization'</span>: <span className="text-green-600">`Bearer ${'{'}apiKey{'}'}`</span>
                <br />  {'}'}
                <br />{'}'});
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Example Response</h3>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                <div className="text-gray-900">{'{'}</div>
                <div className="ml-4">
                  <span className="text-green-600">"questions"</span>: [
                  <div className="ml-4">
                    {'{'}<br />
                    <span className="ml-4 text-green-600">"id"</span>: <span className="text-blue-600">12345</span>,<br />
                    <span className="ml-4 text-green-600">"title"</span>: <span className="text-green-600">"How to center a div?"</span>,<br />
                    <span className="ml-4 text-green-600">"author"</span>: <span className="text-green-600">"john_doe"</span>,<br />
                    <span className="ml-4 text-green-600">"votes"</span>: <span className="text-blue-600">42</span><br />
                    {'}'}
                  </div>
                  ]
                </div>
                <div className="text-gray-900">{'}'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}