import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Gavel, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Trash2,
  Edit,
  AlertTriangle,
  Users,
  FileText,
  Scale,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const JudgeDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCase, setSelectedCase] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');

  // Fetch judge dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery(
    'judge-dashboard',
    async () => {
      const response = await api.get('/cases/judge/dashboard');
      return response.data;
    }
  );

  // Fetch pending cases
  const { data: pendingCases, isLoading: pendingLoading } = useQuery(
    'pending-cases',
    async () => {
      const response = await api.get('/cases/verifications/pending');
      return response.data;
    }
  );

  // Delete case mutation
  const deleteCaseMutation = useMutation(
    async (caseId) => {
      const response = await api.delete(`/cases/${caseId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Case deleted successfully');
        queryClient.invalidateQueries('pending-cases');
        queryClient.invalidateQueries('judge-dashboard');
        queryClient.invalidateQueries('dashboard'); // Invalidate community dashboard
        queryClient.invalidateQueries('cases'); // Invalidate cases list
        setShowActionModal(false);
        setSelectedCase(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete case');
      }
    }
  );

  // Update case status mutation
  const updateStatusMutation = useMutation(
    async ({ caseId, status }) => {
      const response = await api.put(`/cases/${caseId}/status`, { status });
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Case status updated successfully');
        queryClient.invalidateQueries('pending-cases');
        queryClient.invalidateQueries('judge-dashboard');
        queryClient.invalidateQueries('dashboard'); // Invalidate community dashboard
        queryClient.invalidateQueries('cases'); // Invalidate cases list
        setShowActionModal(false);
        setSelectedCase(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update case status');
      }
    }
  );

  const handleAction = (caseItem, type) => {
    setSelectedCase(caseItem);
    setActionType(type);
    setShowActionModal(true);
  };

  const handleConfirmAction = () => {
    if (!selectedCase) return;

    if (actionType === 'delete') {
      deleteCaseMutation.mutate(selectedCase._id);
    } else if (actionType === 'publish') {
      updateStatusMutation.mutate({ 
        caseId: selectedCase._id, 
        status: 'Published for Voting' 
      });
    } else if (actionType === 'reject') {
      updateStatusMutation.mutate({ 
        caseId: selectedCase._id, 
        status: 'Rejected' 
      });
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (dashboardLoading || pendingLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Judge Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage and review community cases</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <Gavel className="h-4 w-4 mr-1" />
                Judge
              </Badge>
              <Avatar>
                <AvatarImage 
                  src={user?.profilePic ? 
                    (user.profilePic.startsWith('http') ? user.profilePic : 
                     user.profilePic.startsWith('/uploads/') ? `http://localhost:5000${user.profilePic}` :
                     `http://localhost:5000/uploads/${user.profilePic}`) : 
                    '/default-avatar.svg'} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-avatar.svg';
                  }}
                />
                <AvatarFallback>{getInitials(user?.name || user?.username)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats?.pendingCases || 0}</div>
              <p className="text-xs text-muted-foreground">Cases awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under Review</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats?.underReviewCases || 0}</div>
              <p className="text-xs text-muted-foreground">Currently being reviewed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats?.publishedCases || 0}</div>
              <p className="text-xs text-muted-foreground">Open for voting</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats?.resolvedCases || 0}</div>
              <p className="text-xs text-muted-foreground">Cases with verdicts</p>
            </CardContent>
          </Card>
        </div>

        {/* Cases Management */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending Review</TabsTrigger>
            <TabsTrigger value="recent">Recent Cases</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingCases?.cases?.map((caseItem) => (
              <Card key={caseItem._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{caseItem.title}</CardTitle>
                      <CardDescription className="mt-2">
                        Filed by {caseItem.filedBy?.username} • {new Date(caseItem.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      Pending Review
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {caseItem.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{caseItem.category}</Badge>
                      <Badge variant="outline">{caseItem.priority}</Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(caseItem, 'publish')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Publish
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(caseItem, 'reject')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(caseItem, 'delete')}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                      <Link to={`/cases/${caseItem._id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {(!pendingCases?.cases || pendingCases.cases.length === 0) && (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No pending cases to review.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            {dashboardData?.recentCases?.map((caseItem) => (
              <Card key={caseItem._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{caseItem.title}</CardTitle>
                      <CardDescription className="mt-2">
                        Filed by {caseItem.filedBy?.username} • {new Date(caseItem.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={
                        caseItem.status === 'Pending Review' ? 'bg-yellow-100 text-yellow-800' :
                        caseItem.status === 'Under Review' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }
                    >
                      {caseItem.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {caseItem.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{caseItem.category}</Badge>
                    </div>
                    <Link to={`/cases/${caseItem._id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}

            {(!dashboardData?.recentCases || dashboardData.recentCases.length === 0) && (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent cases found.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Action Confirmation Modal */}
      {showActionModal && selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                {actionType === 'delete' && <Trash2 className="h-6 w-6 text-red-600 mr-3" />}
                {actionType === 'publish' && <CheckCircle className="h-6 w-6 text-green-600 mr-3" />}
                {actionType === 'reject' && <XCircle className="h-6 w-6 text-red-600 mr-3" />}
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Confirm {actionType === 'delete' ? 'Deletion' : actionType === 'publish' ? 'Publication' : 'Rejection'}
                </h2>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to {actionType} the case "{selectedCase.title}"?
                {actionType === 'delete' && ' This action cannot be undone.'}
              </p>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowActionModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant={actionType === 'delete' ? 'destructive' : 'default'}
                  onClick={handleConfirmAction}
                  disabled={deleteCaseMutation.isLoading || updateStatusMutation.isLoading}
                >
                  {deleteCaseMutation.isLoading || updateStatusMutation.isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    `Confirm ${actionType === 'delete' ? 'Delete' : actionType === 'publish' ? 'Publish' : 'Reject'}`
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JudgeDashboard;
