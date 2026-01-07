import { useState } from 'react'
import { Search, Bot, ChevronRight, HelpCircle } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Badge from '../components/Badge'
import { faqs, faqCategories, quickActions } from '../data/faqData'

const HelpDesk = () => {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedFaq, setExpandedFaq] = useState(null)

  const searchFaqs = (query) => {
    const lowerQuery = query.toLowerCase()
    return faqs.filter(faq =>
      faq.question.toLowerCase().includes(lowerQuery) ||
      faq.answer.toLowerCase().includes(lowerQuery) ||
      faq.keywords.some(k => k.includes(lowerQuery))
    )
  }

  const filtered = search
    ? searchFaqs(search)
    : selectedCategory === 'all'
    ? faqs
    : faqs.filter(f => f.category === selectedCategory)

  const handleQuickAction = (action) => {
    const faq = faqs.find(f => f.id === action.faqId)
    if (faq) {
      setExpandedFaq(faq.id)
      setSelectedCategory(action.category)
      setSearch('')
    }
  }

  return (
    <>
      <Header title="Help & Support" />
      <div className="p-4 space-y-4">
        <Card className="p-4 bg-gradient-to-br from-primary-50 to-accent-50 border-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">AI Help Desk</h3>
              <p className="text-sm text-gray-600">Ask me anything about the event</p>
            </div>
          </div>
        </Card>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search help topics..."
            className="w-full pl-10 pr-4 py-3 bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {!search && (
          <>
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map(action => (
                  <Card
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900">{action.text}</p>
                    <ChevronRight className="w-4 h-4 text-gray-400 mt-1" />
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                }`}
              >
                All Topics
              </button>
              {faqCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </>
        )}

        <div>
          <h3 className="font-bold text-gray-900 mb-3">
            {search ? `Results for "${search}"` : 'Frequently Asked Questions'}
            <span className="text-gray-500 font-normal ml-2">({filtered.length})</span>
          </h3>

          {filtered.length === 0 ? (
            <Card className="p-8 text-center">
              <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No results found</p>
              <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {filtered.map(faq => {
                const category = faqCategories.find(c => c.id === faq.category)
                const isExpanded = expandedFaq === faq.id

                return (
                  <Card
                    key={faq.id}
                    onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <HelpCircle className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 flex-1">
                            {faq.question}
                          </h4>
                          <ChevronRight
                            className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        </div>
                        {category && (
                          <Badge variant="default" size="sm" className="mb-2">
                            {category.name}
                          </Badge>
                        )}
                        {isExpanded && (
                          <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                            {faq.answer}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        <Card className="p-4 bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-2">Still need help?</h4>
          <p className="text-sm text-gray-600 mb-3">
            Our support team is available during event hours
          </p>
          <a
            href="mailto:support@libyabuild.ly"
            className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold text-sm"
          >
            Contact Support
          </a>
        </Card>
      </div>
    </>
  )
}

export default HelpDesk
