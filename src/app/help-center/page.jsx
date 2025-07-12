import { Search, Book, MessageCircle, FileText, Users, Zap } from 'lucide-react';

export default function HelpCenter() {
  const helpCategories = [
    {
      icon: <Book className="w-6 h-6" />,
      title: "Getting Started",
      description: "Learn the basics of using StackIt",
      articles: [
        "How to ask your first question",
        "Understanding the voting system",
        "Creating a complete profile",
        "Community guidelines and rules"
      ]
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Asking Questions",
      description: "Best practices for getting great answers",
      articles: [
        "How to write a good question",
        "Adding code examples and screenshots",
        "Choosing the right tags",
        "Following up on answers"
      ]
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community",
      description: "Understanding our community features",
      articles: [
        "Reputation system explained",
        "Badges and achievements",
        "Moderation and reporting",
        "Building your network"
      ]
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Advanced Features",
      description: "Make the most of StackIt's tools",
      articles: [
        "Using advanced search",
        "Setting up notifications",
        "API integration guide",
        "Custom tag preferences"
      ]
    }
  ];

  const popularArticles = [
    "How to format code in questions and answers",
    "What makes a question too broad or unclear?",
    "How does the reputation system work?",
    "Guidelines for self-promotion",
    "How to create a minimal, reproducible example"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
            <p className="text-xl text-gray-600 mb-8">
              Find answers to common questions and learn how to make the most of StackIt
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search help articles..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Popular Articles */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Articles</h2>
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
            {popularArticles.map((article, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                <a href="#" className="flex items-center justify-between group">
                  <span className="text-gray-900 group-hover:text-green-600 transition-colors duration-200">
                    {article}
                  </span>
                  <FileText className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors duration-200" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Help Categories */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {helpCategories.map((category, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center mb-4">
                  <div className="text-green-600 mr-3">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                    <p className="text-gray-600 text-sm">{category.description}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {category.articles.map((article, articleIndex) => (
                    <li key={articleIndex}>
                      <a
                        href="#"
                        className="text-gray-700 hover:text-green-600 transition-colors duration-200 text-sm"
                      >
                        {article}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-16 bg-green-50 rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Still need help?</h3>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}