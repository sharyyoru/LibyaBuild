import { useState } from 'react'
import { GraduationCap, Users, Clock, Calendar, MapPin } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { sessions, speakers } from '../data/mockData'
import { useApp } from '../context/AppContext'
import { format } from 'date-fns'

const Workshops = () => {
  const { addTicket } = useApp()
  const [selectedWorkshop, setSelectedWorkshop] = useState(null)

  const workshops = sessions.filter(s => s.category === 'Workshop')

  const handleBooking = (workshop) => {
    addTicket({
      name: workshop.title,
      description: `Workshop on ${format(new Date(workshop.date), 'MMM d')}`,
      price: workshop.price,
      currency: 'AED',
      duration: workshop.duration,
      type: 'workshop'
    })
    setSelectedWorkshop(null)
    alert('Workshop booked successfully!')
  }

  return (
    <>
      <Header title="Workshops" />
      <div className="p-4 space-y-4">
        <Card className="p-4 bg-gradient-to-br from-primary-50 to-accent-50 border-0">
          <div className="flex items-center gap-3">
            <img src="/media/PNG/App Icons-13.png" alt="Workshops" className="w-12 h-12" />
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">Certified Workshops</h3>
              <p className="text-sm text-gray-600">Hands-on technical training</p>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          {workshops.map(workshop => {
            const speaker = speakers.find(s => s.id === workshop.speaker)
            const spotsLeft = workshop.capacity - workshop.registered

            return (
              <Card key={workshop.id} className="p-4 border-2 border-gray-100">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-bold text-gray-900 flex-1">{workshop.title}</h3>
                  <Badge variant={spotsLeft < 5 ? 'danger' : 'success'} size="sm">
                    {spotsLeft} spots left
                  </Badge>
                </div>

                <p className="text-sm text-gray-600 mb-4">{workshop.description}</p>

                {speaker && (
                  <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-xl">
                    <img src={speaker.photo} alt={speaker.name} className="w-10 h-10 rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{speaker.name}</p>
                      <p className="text-xs text-gray-600 truncate">{speaker.title}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary-600" />
                    <span>{format(new Date(workshop.date), 'MMM d')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary-600" />
                    <span>{workshop.time}</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <MapPin className="w-4 h-4 text-primary-600" />
                    <span>{workshop.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary-600" />
                    <span>{workshop.capacity} capacity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary-600" />
                    <span>{workshop.duration}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-2xl font-bold text-primary-600">{workshop.price}</span>
                    <span className="text-gray-600 ml-1">AED</span>
                  </div>
                  <Button
                    onClick={() => handleBooking(workshop)}
                    disabled={spotsLeft === 0}
                  >
                    {spotsLeft === 0 ? 'Sold Out' : 'Book Now'}
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default Workshops
