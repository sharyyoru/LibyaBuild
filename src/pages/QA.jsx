import { useState } from 'react'
import { MessageSquare, ThumbsUp, Send, BarChart3 } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { format } from 'date-fns'

const QA = () => {
  const [activeTab, setActiveTab] = useState('questions')
  const [question, setQuestion] = useState('')
  const [pollAnswer, setPollAnswer] = useState(null)

  const [questions, setQuestions] = useState([
    {
      id: 1,
      session: 'Future of Urban Development',
      question: 'How can we implement smart city solutions in developing regions?',
      author: 'Ahmed K.',
      likes: 24,
      timestamp: new Date('2026-01-07T10:30:00'),
      answered: true,
      answer: 'Great question! We need to focus on scalable, cost-effective solutions...'
    },
    {
      id: 2,
      session: 'Smart Construction Technology',
      question: 'What is the ROI timeline for IoT building systems?',
      author: 'Fatima M.',
      likes: 18,
      timestamp: new Date('2026-01-07T11:15:00'),
      answered: false
    }
  ])

  const [polls, setPolls] = useState([
    {
      id: 1,
      session: 'Sustainable Design Panel',
      question: 'Which renewable energy source is most viable for Libya?',
      options: [
        { id: 1, text: 'Solar Power', votes: 156 },
        { id: 2, text: 'Wind Energy', votes: 43 },
        { id: 3, text: 'Hybrid Systems', votes: 89 },
        { id: 4, text: 'Geothermal', votes: 12 }
      ],
      totalVotes: 300,
      active: true
    }
  ])

  const handleSubmitQuestion = (e) => {
    e.preventDefault()
    if (question.trim()) {
      setQuestions([
        {
          id: Date.now(),
          session: 'Current Session',
          question: question,
          author: 'You',
          likes: 0,
          timestamp: new Date(),
          answered: false
        },
        ...questions
      ])
      setQuestion('')
    }
  }

  const handleVote = (pollId, optionId) => {
    setPollAnswer(optionId)
  }

  return (
    <>
      <Header title="Live Q&A & Polls" />
      <div className="p-4 space-y-4">
        <Card className="p-4 bg-gradient-to-br from-primary-50 to-accent-50 border-0">
          <div className="flex items-center gap-3">
            <img src="/media/PNG/App Icons-06.png" alt="Q&A" className="w-12 h-12" />
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">Interactive Sessions</h3>
              <p className="text-sm text-gray-600">Ask questions & vote in real-time</p>
            </div>
          </div>
        </Card>

        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'questions'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Questions
          </button>
          <button
            onClick={() => setActiveTab('polls')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'polls'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Polls
          </button>
        </div>

        {activeTab === 'questions' && (
          <>
            <Card className="p-4">
              <h3 className="font-bold text-gray-900 mb-3">Ask a Question</h3>
              <form onSubmit={handleSubmitQuestion}>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type your question here..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
                <Button type="submit" fullWidth icon={Send}>
                  Submit Question
                </Button>
              </form>
            </Card>

            <div>
              <h3 className="font-bold text-gray-900 mb-3">Recent Questions</h3>
              <div className="space-y-3">
                {questions.map(q => (
                  <Card key={q.id} className="p-4">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge size="sm">{q.session}</Badge>
                          {q.answered && <Badge variant="success" size="sm">Answered</Badge>}
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">{q.question}</h4>
                        <p className="text-sm text-gray-600">
                          {q.author} • {format(q.timestamp, 'h:mm a')}
                        </p>
                      </div>
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 active:bg-gray-200 transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        {q.likes}
                      </button>
                    </div>
                    {q.answered && q.answer && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-xl">
                        <p className="text-sm text-gray-700">{q.answer}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'polls' && (
          <div className="space-y-3">
            {polls.map(poll => (
              <Card key={poll.id} className="p-4">
                <div className="flex items-start gap-2 mb-3">
                  <Badge size="sm">{poll.session}</Badge>
                  {poll.active && <Badge variant="success" size="sm">Live</Badge>}
                </div>
                <h3 className="font-bold text-gray-900 mb-4">{poll.question}</h3>
                
                <div className="space-y-3 mb-4">
                  {poll.options.map(option => {
                    const percentage = ((option.votes / poll.totalVotes) * 100).toFixed(0)
                    const isSelected = pollAnswer === option.id
                    
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleVote(poll.id, option.id)}
                        className={`w-full text-left p-3 rounded-xl transition-all ${
                          isSelected
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{option.text}</span>
                          <span className="text-sm font-bold">{percentage}%</span>
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              isSelected ? 'bg-white' : 'bg-primary-600'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>{poll.totalVotes} votes</span>
                  </div>
                  {pollAnswer && <Badge variant="success" size="sm">Voted</Badge>}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default QA
