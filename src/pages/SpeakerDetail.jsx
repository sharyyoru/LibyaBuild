import { useParams, Link } from 'react-router-dom'
import { Briefcase, Heart, Linkedin, Twitter, Calendar, MapPin, Clock } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Badge from '../components/Badge'
import { speakers, sessions } from '../data/mockData'
import { useApp } from '../context/AppContext'
import { clsx } from 'clsx'
import { format } from 'date-fns'

const SpeakerDetail = () => {
  const { id } = useParams()
  const { isFavorite, toggleFavorite } = useApp()
  const speaker = speakers.find(s => s.id === parseInt(id))

  if (!speaker) return <div>Speaker not found</div>

  const speakerSessions = sessions.filter(s => s.speaker === speaker.id)

  return (
    <>
      <Header 
        title={speaker.name}
        action={
          <button
            onClick={() => toggleFavorite('speakers', speaker.id)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Heart
              className={clsx(
                'w-6 h-6',
                isFavorite('speakers', speaker.id)
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-400'
              )}
            />
          </button>
        }
      />
      <div className="p-4 space-y-4">
        <Card className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <img
              src={speaker.photo}
              alt={speaker.name}
              className="w-32 h-32 rounded-3xl object-cover mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{speaker.name}</h2>
            <p className="text-gray-600 mb-2">{speaker.title}</p>
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <Briefcase className="w-4 h-4" />
              <span>{speaker.company}</span>
            </div>
            <div className="flex gap-3">
              {speaker.social.linkedin && (
                <a
                  href={`https://${speaker.social.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {speaker.social.twitter && (
                <a
                  href={`https://twitter.com/${speaker.social.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
          <p className="text-gray-600 mb-4">{speaker.bio}</p>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {speaker.expertise.map(skill => (
                <Badge key={skill} variant="primary">{skill}</Badge>
              ))}
            </div>
          </div>
        </Card>

        <div>
          <h3 className="font-bold text-gray-900 mb-3">Sessions</h3>
          <div className="space-y-3">
            {speakerSessions.map(session => (
              <Card key={session.id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h4 className="font-bold text-gray-900 flex-1">{session.title}</h4>
                  <Badge variant={session.category === 'Workshop' ? 'warning' : 'default'} size="sm">
                    {session.category}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{session.description}</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary-600" />
                    <span>{format(new Date(session.date), 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary-600" />
                    <span>{session.time} • {session.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary-600" />
                    <span>{session.location}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default SpeakerDetail
