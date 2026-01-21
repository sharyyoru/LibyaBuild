import { useState } from 'react'
import { AlertCircle, TrendingUp } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Badge from '../components/Badge'
import { newsItems } from '../data/mockData'
import { format } from 'date-fns'
import { clsx } from 'clsx'
import { useLanguage } from '../context/LanguageContext'
import { useTranslation } from '../i18n/translations'

const News = () => {
  const { language } = useLanguage()
  const { t } = useTranslation(language)
  const [filter, setFilter] = useState('all')

  // Filter out Sponsorship category
  const categories = ['all', ...new Set(newsItems.map(n => n.category).filter(cat => cat.toLowerCase() !== 'sponsorship'))]

  const filtered = newsItems.filter(news =>
    filter === 'all' || news.category === filter
  )

  // Removed priority colors for cleaner design
  const priorityColors = {
    high: '',
    medium: '',
    low: ''
  }

  return (
    <>
      <Header title={t('newsUpdates')} showBack={false} />
      <div className="p-4 space-y-4">
        <Card className="p-4 bg-gradient-to-br from-primary-50 to-accent-50 border-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">{t('stayUpdated')}</h3>
              <p className="text-sm text-gray-600">{t('realtimeAnnouncements')}</p>
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
              {cat === 'all' ? t('allUpdates') : (t(cat.toLowerCase()) || cat)}
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
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-bold text-gray-900 flex-1">
                  {language === 'ar' && news.title_ar ? news.title_ar : news.title}
                </h3>
                {news.priority === 'high' && (
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {language === 'ar' && news.summary_ar ? news.summary_ar : news.summary}
              </p>
              <p className="text-sm text-gray-600 mb-3">
                {language === 'ar' && news.content_ar ? news.content_ar : news.content}
              </p>
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
