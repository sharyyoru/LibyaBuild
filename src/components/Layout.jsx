import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'
import Header from './Header'

const Layout = () => {
  const location = useLocation()
  const showHeader = location.pathname !== '/'

  return (
    <div className="min-h-screen bg-gray-50">
      {showHeader && <Header />}
      <main className={showHeader ? 'pt-14 pb-nav' : 'pb-nav'}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

export default Layout
