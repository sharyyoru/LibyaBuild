import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Heart } from 'lucide-react'
import Header from '../components/Header'
import SearchBar from '../components/SearchBar'
import Card from '../components/Card'
import Badge from '../components/Badge'
import { speakers } from '../data/mockData'
import { useApp } from '../context/AppContext'
import { clsx } from 'clsx'

const Speakers = () => {
  const [search, setSearch] = useState('')
  const { isFavorite, toggleFavorite } = useApp()

  const filtered = speakers.filter(speaker =>
    speaker.name.toLowerCase().includes(search.toLowerCase()) ||
    speaker.company.toLowerCase().includes(search.toLowerCase()) ||
    speaker.expertise.some(e => e.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <>
      <Header title="Speakers" showBack={false} />
      <div className="p-4 space-y-4">
        <SearchBar 
          value={search} 
          onChange={setSearch}
          placeholder="Search speakers..." 
        />

        <div className="space-y-3">
          {filtered.map(speaker => (
            <Card key={speaker.id}>
              <Link to={`/speakers/${speaker.id}`} className="block p-4">
                <div className="flex gap-4">
                  <img
                    src={speaker.photo}
                    alt={speaker.name}
                    className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{speaker.name}</h3>
                        <p className="text-sm text-gray-600">{speaker.title}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          toggleFavorite('speakers', speaker.id)
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                      >
                        <Heart
                          className={clsx(
                            'w-5 h-5',
                            isFavorite('speakers', speaker.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-gray-400'
                          )}
                        />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{speaker.company}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {speaker.expertise.slice(0, 3).map(skill => (
                        <Badge key={skill} size="sm">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}

export default Speakers
