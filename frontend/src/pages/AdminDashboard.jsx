import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Shield, 
  ShieldOff, 
  Gavel,
  Trash2,
  Edit,
  Eye,
  Mail,
  Phone,
  Calendar,
  Building,
  Scale,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery(
    'admin-users',
    async () => {
      const response = await api.get('/users/all');
      return response.data;
    }
  );

  // Fetch pending judge requests
  const { data: judgeRequests, isLoading: requestsLoading } = useQuery(
    'judge-requests',
    async () => {
      const response = await api.get('/users/judge-requests/pending');
      return response.data;
    }
  );

  // Fetch system statistics
  const { data: stats, isLoading: statsLoading } = useQuery(
    'admin-stats',
    async () => {
      const response = await api.get('/analytics/community-stats');
      return response.data;
    }
  );

  // Update user role mutation
  const updateUserRole = useMutation(
    async ({ userId, newRole }) => {
      const response = await api.put(`/users/${userId}/role`, { role: newRole });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-users');
        toast.success('User role updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update user role');
      }
    }
  );

  // Review judge request mutation
  const reviewJudgeRequest = useMutation(
    async ({ userId, action, reason }) => {
      const response = await api.put(`/users/judge-requests/${userId}/review`, {
        action,
        reason
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('judge-requests');
        queryClient.invalidateQueries('admin-users');
        toast.success('Judge request reviewed successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to review request');
      }
    }
  );

  // Delete user mutation
  const deleteUser = useMutation(
    async (userId) => {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-users');
        toast.success('User deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  );

  const handleRoleUpdate = (userId, newRole) => {
    updateUserRole.mutate({ userId, newRole });
  };

  const handleJudgeRequest = (userId, action, reason = '') => {
    reviewJudgeRequest.mutate({ userId, action, reason });
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUser.mutate(userId);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'judge': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'member': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (usersLoading || statsLoading) {
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage users and system settings</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                <Shield className="h-4 w-4 mr-1" />
                Admin
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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.community?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users?.filter(u => u.role === 'admin').length || 0}
              </div>
              <p className="text-xs text-muted-foreground">System administrators</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Judges</CardTitle>
              <Gavel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users?.filter(u => u.role === 'judge').length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Case judges</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{judgeRequests?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Judge applications</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="requests">Judge Requests</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage user accounts and roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">User</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Role</th>
                        <th className="text-left py-3 px-4">Joined</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users?.map((userItem) => (
                        <tr key={userItem._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={userItem.profilePic || '/default-avatar.svg'} />
                                <AvatarFallback>{getInitials(userItem.name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{userItem.name}</div>
                                <div className="text-sm text-gray-500">@{userItem.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">{userItem.email}</td>
                          <td className="py-3 px-4">
                            <Badge className={getRoleBadgeColor(userItem.role)}>
                              {userItem.role}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {new Date(userItem.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              {/* Role Update Buttons */}
                              {userItem.role !== 'admin' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRoleUpdate(userItem._id, 'admin')}
                                  disabled={updateUserRole.isLoading}
                                >
                                  <Shield className="h-3 w-3 mr-1" />
                                  Make Admin
                                </Button>
                              )}
                              
                              {userItem.role !== 'judge' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRoleUpdate(userItem._id, 'judge')}
                                  disabled={updateUserRole.isLoading}
                                >
                                  <Gavel className="h-3 w-3 mr-1" />
                                  Make Judge
                                </Button>
                              )}
                              
                              {userItem.role !== 'member' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRoleUpdate(userItem._id, 'member')}
                                  disabled={updateUserRole.isLoading}
                                >
                                  <Users className="h-3 w-3 mr-1" />
                                  Make Member
                                </Button>
                              )}
                              
                              {/* Delete Button */}
                              {userItem._id !== user?._id && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteUser(userItem._id)}
                                  disabled={deleteUser.isLoading}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Judge Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Judge Requests</CardTitle>
                <CardDescription>Review applications for judge role</CardDescription>
              </CardHeader>
              <CardContent>
                {judgeRequests?.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No pending judge requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {judgeRequests?.map((request) => (
                      <Card key={request._id} className="border-l-4 border-yellow-400">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={request.profilePic || '/default-avatar.svg'} />
                                <AvatarFallback>{getInitials(request.name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{request.name}</div>
                                <div className="text-sm text-gray-500">{request.email}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                  <strong>Reason:</strong> {request.judgeRequestReason}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleJudgeRequest(request._id, 'approve')}
                                disabled={reviewJudgeRequest.isLoading}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleJudgeRequest(request._id, 'reject')}
                                disabled={reviewJudgeRequest.isLoading}
                              >
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Cases:</span>
                      <span className="font-medium">{stats?.community?.totalCases || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Votes:</span>
                      <span className="font-medium">{stats?.voting?.totalVotes || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Users:</span>
                      <span className="font-medium">{stats?.community?.totalUsers || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Role Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Admins:</span>
                      <span className="font-medium">{users?.filter(u => u.role === 'admin').length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Judges:</span>
                      <span className="font-medium">{users?.filter(u => u.role === 'judge').length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Members:</span>
                      <span className="font-medium">{users?.filter(u => u.role === 'member').length || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard; 