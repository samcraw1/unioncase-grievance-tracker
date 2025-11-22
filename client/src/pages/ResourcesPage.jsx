import { FileText, Download, ExternalLink, Mic, BookOpen, Clock } from 'lucide-react';

const ResourcesPage = () => {
  // USPS Handbooks data
  const handbooks = [
    {
      id: 1,
      title: 'M-41: City Delivery Carriers Duties and Responsibilities',
      description: 'Official handbook covering all duties, responsibilities, and procedures for city letter carriers. Includes delivery standards, vehicle operations, safety requirements, and daily operational procedures.',
      date: 'June 2019',
      filename: 'M-41-City-Delivery-Carriers-Duties-and-Responsibilities-June-2019-2.pdf',
      size: 'Large File'
    },
    {
      id: 2,
      title: 'M-39: Management of Delivery Services',
      description: 'Management handbook covering supervision of delivery operations, route inspections, carrier duties, and operational standards. Essential reference for management violations and route-related grievances.',
      date: 'June 2019',
      filename: 'M-39-Management-of-Delivery-Services-June-2019.pdf',
      size: 'Large File'
    },
    {
      id: 3,
      title: 'ELM: Employee and Labor Relations Manual',
      description: 'Complete guide to employee rights, discipline procedures, grievance processes, and labor relations. The definitive resource for just cause, investigative interviews, and all disciplinary matters.',
      date: 'March 2022 (Issue 52)',
      filename: 'ELM-52-March-2022.pdf',
      size: 'Large File'
    },
    {
      id: 4,
      title: '2023-2026 NALC-USPS National Agreement',
      description: 'The complete collective bargaining agreement between NALC and USPS. Contains all contract articles, including Article 8 (Hours of Work), Article 16 (Discipline), and all other provisions governing working conditions and rights.',
      date: '2023-2026',
      filename: '2023-2026-National-Agreement.pdf',
      size: 'Large File'
    }
  ];

  // NALC Resources data
  const nalcResources = [
    {
      id: 1,
      title: 'Fight Like Hell Podcast',
      description: 'Official NALC podcast covering workplace issues, contract enforcement, member stories, and union updates. Essential listening for staying informed on carrier rights and union news.',
      url: 'https://youarethecurrentresident.podbean.com',
      icon: Mic,
      buttonText: 'Listen Now'
    },
    {
      id: 2,
      title: 'NALC Contract Administration',
      description: 'Official NALC resources for contract interpretation, past practice memos, and arbitration decisions.',
      url: 'https://www.nalc.org/workplace-issues/contract-administration',
      icon: FileText,
      buttonText: 'Visit NALC.org'
    },
    {
      id: 3,
      title: 'Letter Carrier Resource Center',
      description: 'Comprehensive collection of workplace resources, forms, and guides from NALC.',
      url: 'https://www.nalc.org/workplace-issues/resources',
      icon: BookOpen,
      buttonText: 'Visit NALC.org'
    }
  ];

  // Quick Reference Guides (placeholders)
  const quickGuides = [
    {
      id: 1,
      title: 'Quick Reference: Contract Articles',
      description: 'Fast lookup guide for the most commonly referenced contract articles in grievances.',
      comingSoon: true
    },
    {
      id: 2,
      title: 'Grievance Filing Checklist',
      description: 'Step-by-step checklist to ensure you file complete, properly documented grievances.',
      comingSoon: true
    },
    {
      id: 3,
      title: 'Grievance Process Timeline',
      description: 'Visual timeline showing management response deadlines at each step of the grievance process.',
      comingSoon: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Page Header */}
      <div className="bg-primary text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-2">Resources & Handbooks</h1>
          <p className="text-blue-100">
            Access USPS handbooks, NALC resources, and quick reference guides
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar Placeholder */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search handbooks..."
            className="input-field w-full"
            disabled
          />
          <p className="text-xs text-gray-500 mt-2">Search functionality coming soon</p>
        </div>

        {/* Section 1: USPS Handbooks */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <FileText className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">USPS Handbooks</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {handbooks.map((handbook) => (
              <div key={handbook.id} className="card hover:shadow-lg transition-shadow">
                {/* Card Header */}
                <div className="flex items-start mb-4">
                  <FileText className="h-8 w-8 text-primary mr-3 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {handbook.title}
                    </h3>
                    <p className="text-xs text-gray-500">{handbook.date}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {handbook.description}
                </p>

                {/* File Size */}
                <p className="text-xs text-gray-500 mb-4">{handbook.size}</p>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <a
                    href={`/handbooks/${handbook.filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 btn-primary text-center py-2 px-3 text-sm"
                  >
                    View PDF
                  </a>
                  <a
                    href={`/handbooks/${handbook.filename}`}
                    download
                    className="flex items-center justify-center px-3 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors text-sm"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: NALC Resources */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <ExternalLink className="h-6 w-6 text-red-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">NALC Resources</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nalcResources.map((resource) => {
              const IconComponent = resource.icon;
              return (
                <div key={resource.id} className="card hover:shadow-lg transition-shadow">
                  {/* Card Header */}
                  <div className="flex items-start mb-4">
                    <IconComponent className="h-8 w-8 text-red-600 mr-3 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {resource.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    {resource.description}
                  </p>

                  {/* Action Button */}
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full text-center flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#CC0000', borderColor: '#CC0000' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#AA0000'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#CC0000'}
                  >
                    {resource.buttonText}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 3: Quick Reference Guides */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Clock className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Quick Reference Guides</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickGuides.map((guide) => (
              <div key={guide.id} className="card hover:shadow-lg transition-shadow opacity-75">
                {/* Card Header */}
                <div className="flex items-start mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400 mr-3 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {guide.title}
                    </h3>
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-warning bg-yellow-100 rounded">
                      Coming Soon
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  {guide.description}
                </p>

                {/* Disabled Button */}
                <button
                  disabled
                  className="w-full py-2 px-4 border border-gray-300 rounded-md text-gray-400 cursor-not-allowed bg-gray-100"
                >
                  Coming Soon
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ResourcesPage;
