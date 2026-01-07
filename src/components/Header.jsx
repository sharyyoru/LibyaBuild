import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, HelpCircle } from 'lucide-react'

const Header = ({ title, showBack = true, action }) => {
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 safe-top">
      <div className="h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
        </div>
        {action || (
          <Link to="/help">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <HelpCircle className="w-5 h-5 text-gray-700" />
            </button>
          </Link>
        )}
      </div>
    </header>
  )
}

export default Header
