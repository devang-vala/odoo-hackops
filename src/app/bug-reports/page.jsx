import { Bug, AlertTriangle, CheckCircle, Clock, Search, Filter } from 'lucide-react';

export default function BugReports() {
  const bugCategories = [
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      title: "Critical",
      count: 3,
      color: "text-red-600 bg-red-100"
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      title: "High",
      count: 12,
      color: "text-orange-600 bg-orange-100"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Medium",
      count: 28,
      color: "text-yellow-600 bg-yellow-100"
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      title: "Low",
      count: 45,
      color: "text-green-600 bg-green-100"
    }
  ];

  const recentBugs = [
    {
      id: "BUG-2025-001",
      title: "Search results not displaying correctly on mobile",
      status: "In Progress",
      priority: "High",
      reporter: "john_doe",
      date: "2025-01-10",
      description: "Search functionality returns incorrect results when accessed from mobile devices..."
    },
    {
      id: "BUG-2025-002",
      title: "Vote buttons not responding after page refresh",
      status: "Open",
      priority: "Medium",
      reporter: "jane_smith",
      date: "2025-01-09",
      description: "After refreshing a question page, the upvote and downvote buttons become unresponsive..."
    },
    {
      id: "BUG-2025-003",
      title: "Code syntax highlighting broken for Python",
      status: "Resolved",
      priority: "Low",
      reporter: "dev_user",
      date: "2025-01-08",
      description: "Python code blocks are not being highlighted correctly in question and answer posts..."
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Bug Reports</h1>
            <p className="text-xl text-gray-600 mb-8">
              Help us improve StackIt by reporting bugs and tracking their resolution
            </p>
            <div className="flex justify-center space-x-4">
              <button className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200">
                Report a Bug
              </button>
              <button className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200">
                View All Reports
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Bug Categories */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {bugCategories.map((category, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:shadow-md transition-shadow duration-200">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${category.color}`}>
                {category.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{category.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{category.count}</p>
              <p className="text-sm text-gray-500">open issues</p>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search bug reports..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Bug Reports */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Bug Reports</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentBugs.map((bug, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Bug className="w-5 h-5 text-gray-400" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 hover:text-green-600 cursor-pointer">
                        {bug.title}
                      </h3>
                      <p className="text-sm text-gray-500">#{bug.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(bug.status)}`}>
                      {bug.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(bug.priority)}`}>
                      {bug.priority}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 mb-3 line-clamp-2">{bug.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>Reported by <span className="font-medium">{bug.reporter}</span></span>
                    <span>{bug.date}</span>
                  </div>
                  <button className="text-green-600 hover:text-green-700 font-medium">
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How to Report */}
        <div className="mt-12 bg-green-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Report a Bug</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Describe the Issue</h3>
              <p className="text-gray-600 text-sm">
                Provide a clear and detailed description of the bug you encountered
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Steps to Reproduce</h3>
              <p className="text-gray-600 text-sm">
                List the exact steps that led to the bug so we can reproduce it
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Include Details</h3>
              <p className="text-gray-600 text-sm">
                Add screenshots, browser info, and any error messages you saw
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}