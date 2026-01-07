import { useState } from 'react'
import { AlertCircle, TrendingUp } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Badge from '../components/Badge'
import { newsItems } from '../data/mockData'
import { format } from 'date-fns'
import { clsx } from 'clsx'

const News = () => {
  const [filter, setFilter] = useState('all')

  const categories = ['all', ...new Set(newsItems.map(n => n.category))]

  const filtered = newsItems.filter(news =>
    filter === 'all' || news.category === filter
  )

  const priorityColors = {
    high: 'border-l-4 border-l-red-500',
    medium: 'border-l-4 border-l-yellow-500',
    low: 'border-l-4 border-l-blue-500'
  }

  return (
    <>
      <Header title="News & Updates" showBack={false} />
      <div className="p-4 space-y-4">
        <Card className="p-4 bg-gradient-to-br from-primary-50 to-accent-50 border-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">Stay Updated</h3>
              <p className="text-sm text-gray-600">Real-time event announcements</p>
            </div>
          </div>
        </Card>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={clsx(
                'px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors',
                filter === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 active:bg-gray-200'
              )}
            >
              {cat === 'all' ? 'All Updates' : cat}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map(news => (
            <Card key={news.id} className={clsx('p-4', priorityColors[news.priority])}>
              {news.image && (
                <img
                  src={news.image}
                  alt=""
                  className="w-full h-40 object-cover rounded-xl mb-4"
                />
              )}
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-gray-900 flex-1">{news.title}</h3>
                {news.priority === 'high' && (
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}
              </div>
              <Badge variant="primary" size="sm" className="mb-2">{news.category}</Badge>
              <p className="text-sm text-gray-600 mb-3">{news.summary}</p>
              <p className="text-gray-700 mb-3">{news.content}</p>
              <span className="text-xs text-gray-500">
                {format(new Date(news.date), 'MMMM d, yyyy • h:mm a')}
              </span>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}

export default News
