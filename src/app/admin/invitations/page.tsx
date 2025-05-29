'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Mail, 
  Calendar, 
  User, 
  Search, 
  RefreshCw, 
  Send, 
  X, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  Copy,
  ExternalLink
} from 'lucide-react'
import { 
  getAllInvitations, 
  getInvitationStats, 
  cancelInvitation, 
  resendInvitation 
} from '@/lib/supabase/invitation-queries'
import type { InvitationWithAssessment, InvitationStats } from '@/types'

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<InvitationWithAssessment[]>([])
  const [stats, setStats] = useState<InvitationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [invitationsData, statsData] = await Promise.all([
        getAllInvitations(),
        getInvitationStats()
      ])
      
      setInvitations(invitationsData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading invitations data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredInvitations = invitations.filter(invitation => {
    const matchesSearch = 
      invitation.invited_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invitation.invitation_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invitation.assessment.title.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || invitation.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'accepted':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>
      case 'expired':
        return <Badge variant="outline" className="text-gray-600 border-gray-600"><AlertCircle className="h-3 w-3 mr-1" />Expired</Badge>
      case 'cancelled':
        return <Badge variant="outline" className="text-red-600 border-red-600"><X className="h-3 w-3 mr-1" />Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleCancelInvitation = async (invitationId: number) => {
    setActionLoading(invitationId)
    try {
      const success = await cancelInvitation(invitationId)
      if (success) {
        await loadData() // Refresh data
      }
    } catch (error) {
      console.error('Error cancelling invitation:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleResendInvitation = async (invitationId: number) => {
    setActionLoading(invitationId)
    try {
      const newInvitation = await resendInvitation(invitationId)
      if (newInvitation) {
        await loadData() // Refresh data
      }
    } catch (error) {
      console.error('Error resending invitation:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const copyInvitationLink = async (token: string) => {
    const url = `${window.location.origin}/assessment/invite/${token}`
    try {
      await navigator.clipboard.writeText(url)
      setCopySuccess(token)
      setTimeout(() => setCopySuccess(null), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessment Invitations</h1>
          <p className="text-gray-600">Manage and track assessment invitations</p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total Sent</p>
                  <p className="text-2xl font-bold">{stats.total_sent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Accepted</p>
                  <p className="text-2xl font-bold">{stats.total_accepted}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Pending</p>
                  <p className="text-2xl font-bold">{stats.total_pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-sm font-medium">Acceptance Rate</p>
                  <p className="text-2xl font-bold">{stats.acceptance_rate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by email, name, or assessment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button 
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
              >
                Pending
              </Button>
              <Button 
                variant={statusFilter === 'accepted' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('accepted')}
              >
                Accepted
              </Button>
              <Button 
                variant={statusFilter === 'expired' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('expired')}
              >
                Expired
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invitations Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Invitations ({filteredInvitations.length})
          </CardTitle>
          <CardDescription>
            All assessment invitations and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredInvitations.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invitations found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Start by sending your first assessment invitation'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invitee</TableHead>
                    <TableHead>Assessment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{invitation.invited_email}</p>
                          {invitation.invitation_name && (
                            <p className="text-sm text-gray-500">{invitation.invitation_name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{invitation.assessment.title}</p>
                          {invitation.assessment.description && (
                            <p className="text-sm text-gray-500 truncate max-w-48">
                              {invitation.assessment.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(invitation.status)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {formatDate(invitation.invited_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {formatDate(invitation.expires_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {invitation.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyInvitationLink(invitation.invitation_token)}
                                title="Copy invitation link"
                                className={copySuccess === invitation.invitation_token ? "bg-green-50 border-green-200" : ""}
                              >
                                {copySuccess === invitation.invitation_token ? (
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResendInvitation(invitation.id)}
                                disabled={actionLoading === invitation.id}
                                title="Resend invitation"
                              >
                                <Send className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelInvitation(invitation.id)}
                                disabled={actionLoading === invitation.id}
                                title="Cancel invitation"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          {invitation.status === 'accepted' && invitation.attempt_id && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`/admin/attempts/${invitation.attempt_id}`, '_blank')}
                              title="View attempt"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 