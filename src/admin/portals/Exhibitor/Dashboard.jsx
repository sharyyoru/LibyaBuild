import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Download, MessageSquare, DollarSign, CheckCircle, Clock } from 'lucide-react'
import { supabase } from '../../utils/supabase'
import { useAuth } from '../../context/AuthContext'
import Card from '../../../components/Card'
import Badge from '../../../components/Badge'

const ExhibitorDashboard = () => {
  const { profile } = useAuth()
  const [exhibitor, setExhibitor] = useState(null)
  const [forms, setForms] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [profile])

  const loadDashboardData = async () => {
    if (!profile) return

    try {
      const [exhibitorResult, formsResult, invoicesResult] = await Promise.all([
        supabase.from('exhibitors').select('*').eq('user_id', profile.id).single(),
        supabase.from('exhibitor_forms').select('*').eq('exhibitor_id', exhibitor?.id),
        supabase.from('invoices').select('*').eq('exhibitor_id', exhibitor?.id)
      ])

      setExhibitor(exhibitorResult.data)
      setForms(formsResult.data || [])
      setInvoices(invoicesResult.data || [])
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  )

  const mandatoryForms = [
    { id: 1, name: 'Badge Request', path: '/exhibitor/forms/badges', icon: '👤' },
    { id: 2, name: 'Fascia Name Board', path: '/exhibitor/forms/name-boards', icon: '🏷️' },
    { id: 3, name: 'Basic Online Entry', path: '/exhibitor/forms/basic-entry', icon: '📝' }
  ]

  const optionalForms = [
    { id: 4, name: 'Furniture Booking', path: '/exhibitor/forms/furniture', icon: '🪑' },
    { id: 5, name: 'Electricity Request', path: '/exhibitor/forms/electricity', icon: '⚡' },
    { id: 6, name: 'Internet Request', path: '/exhibitor/forms/internet', icon: '📡' },
    { id: 7, name: 'Marketing Services', path: '/exhibitor/forms/marketing', icon: '📢' }
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {exhibitor?.company_name}</h1>
        <p className="text-gray-600">Stand: {exhibitor?.booth_number} | {exhibitor?.hall}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard
          icon={FileText}
          title="Forms Submitted"
          value={forms.filter(f => f.status === 'submitted').length}
          color="bg-blue-500"
        />
        <StatCard
          icon={CheckCircle}
          title="Forms Approved"
          value={forms.filter(f => f.status === 'approved').length}
          color="bg-green-500"
        />
        <StatCard
          icon={DollarSign}
          title="Outstanding"
          value={`${invoices.reduce((sum, inv) => sum + (inv.total_amount - inv.paid_amount), 0)} AED`}
          color="bg-yellow-500"
        />
        <StatCard
          icon={MessageSquare}
          title="New Messages"
          value={0}
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-red-500">*</span>
            Mandatory Forms
          </h2>
          <div className="space-y-3">
            {mandatoryForms.map(form => (
              <Link key={form.id} to={form.path}>
                <div className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{form.icon}</span>
                    <span className="font-semibold text-gray-900">{form.name}</span>
                  </div>
                  <Clock className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Optional Services</h2>
          <div className="space-y-3">
            {optionalForms.map(form => (
              <Link key={form.id} to={form.path}>
                <div className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{form.icon}</span>
                    <span className="font-semibold text-gray-900">{form.name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Invoices</h2>
          <div className="space-y-3">
            {invoices.slice(0, 3).map(invoice => (
              <div key={invoice.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{invoice.invoice_number}</p>
                  <p className="text-sm text-gray-600">{invoice.total_amount} AED</p>
                </div>
                <Badge variant={invoice.status === 'paid' ? 'success' : 'warning'}>
                  {invoice.status}
                </Badge>
              </div>
            ))}
          </div>
          <Link to="/exhibitor/invoices" className="block mt-4 text-center text-primary-600 font-semibold">
            View All Invoices →
          </Link>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h2>
          <div className="space-y-3">
            <Link to="/exhibitor/assets">
              <button className="w-full p-4 bg-primary-50 hover:bg-primary-100 rounded-lg text-left transition-colors">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-gray-900">Download Assets</span>
                </div>
              </button>
            </Link>
            <Link to="/exhibitor/chat">
              <button className="w-full p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-gray-900">B2B Chat</span>
                </div>
              </button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ExhibitorDashboard
