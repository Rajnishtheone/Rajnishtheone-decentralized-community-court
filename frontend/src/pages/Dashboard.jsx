import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Scale, 
  Users, 
  MessageSquare, 
  Plus, 
  ThumbsUp, 
  ThumbsDown, 
  Clock, 
  CheckCircle, 
  FileText,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [stats, setStats] = useState({
    totalCases: 0,
    activeCases: 0,
    votesGiven: 0,
    commentsPosted: 0,
    weeklyLimit: 1,
    casesThisWeek: 0,
  });

  // Fetch user dashboard data
  const { data: dashboardData, isLoading } = useQuery(
    'dashboard',
    async () => {
      const response = await api.get('/users/dashboard');
      return response.data;
    },
    {
      onSuccess: (data) => {
        setStats({
          totalCases: data.filedCases?.length || 0,
          activeCases: data.filedCases?.filter(c => c.status === 'Published for Voting').length || 0,
          votesGiven: data.totalVotes || 0,
          commentsPosted: data.commentActivity?.length || 0,
          weeklyLimit: 1,
          casesThisWeek: data.filedCases?.filter(c => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(c.createdAt) > weekAgo;
          }).length || 0,
        });
      }
    }
  );

  // Vote mutation
  const voteMutation = useMutation(
    async ({ caseId, vote }) => {
      const response = await api.post(`/votes/${caseId}`, { vote });
      return response.data;
    },
    {
      onSuccess: (data, variables) => {
        const voteType = variables.vote === 'yes' ? 'Yes' : 'No';
        toast.success(`${voteType} vote cast successfully!`);
        // Invalidate queries to refresh data
        queryClient.invalidateQueries('dashboard');
        queryClient.invalidateQueries('cases');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to cast vote');
      }
    }
  );

  // Handle vote click
  const handleVote = (caseId, vote) => {
    voteMutation.mutate({ caseId, vote });
  };

  // Check if user has already voted on a case
  const hasUserVoted = (caseItem) => {
    if (!user || !caseItem.votes) return false;
    return caseItem.votes.some(vote => 
      vote.votedBy && (vote.votedBy._id === user.id || vote.votedBy === user.id)
    );
  };

  // Get user's vote on a case
  const getUserVote = (caseItem) => {
    if (!user || !caseItem.votes) return null;
    const userVote = caseItem.votes.find(vote => 
      vote.votedBy && (vote.votedBy._id === user.id || vote.votedBy === user.id)
    );
    return userVote ? userVote.vote : null;
  };

  // Use real data from API instead of mock data
  const publishedCases = dashboardData?.publishedCases || [];
  const userFiledCases = dashboardData?.filedCases || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const getUserRoleDisplay = () => {
    if (user?.role === 'admin') return 'Admin';
    if (user?.role === 'judge') return 'Judge';
    return 'Community Member';
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Community Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Welcome back! Here's what's happening in your community.</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {getUserRoleDisplay()}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCases}</div>
              <p className="text-xs text-muted-foreground">Cases you've participated in</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCases}</div>
              <p className="text-xs text-muted-foreground">Currently ongoing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Votes Cast</CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.votesGiven}</div>
              <p className="text-xs text-muted-foreground">Community participation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.commentsPosted}</div>
              <p className="text-xs text-muted-foreground">Discussions contributed</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Cases */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="active" className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="active">Active Cases</TabsTrigger>
                  <TabsTrigger value="my-cases">My Cases</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved</TabsTrigger>
                </TabsList>
                <Link to="/create-case">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    New Case
                  </Button>
                </Link>
              </div>

              <TabsContent value="active" className="space-y-4">
                {publishedCases.map((case_) => (
                  <Card key={case_._id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{case_.title}</CardTitle>
                          <div className="mt-2 flex items-center space-x-2">
                            <Badge variant="outline">
                              {case_.category}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              Filed by {case_.filedBy?.username} • {new Date(case_.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                          Published for Voting
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                        {case_.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <ThumbsUp className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">{case_.yesVotes || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ThumbsDown className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium">{case_.noVotes || 0}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {case_.totalVotes || 0} total votes
                          </span>
                          {hasUserVoted(case_) && (
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs">
                              Voted: {getUserVote(case_) === 'yes' ? 'Yes' : 'No'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant={getUserVote(case_) === 'yes' ? 'default' : 'outline'}
                            onClick={() => handleVote(case_._id, 'yes')}
                            disabled={hasUserVoted(case_) || voteMutation.isLoading}
                            className={getUserVote(case_) === 'yes' ? 'bg-green-600 hover:bg-green-700' : ''}
                          >
                            {voteMutation.isLoading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <ThumbsUp className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            variant={getUserVote(case_) === 'no' ? 'default' : 'outline'}
                            onClick={() => handleVote(case_._id, 'no')}
                            disabled={hasUserVoted(case_) || voteMutation.isLoading}
                            className={getUserVote(case_) === 'no' ? 'bg-red-600 hover:bg-red-700' : ''}
                          >
                            {voteMutation.isLoading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <ThumbsDown className="h-4 w-4" />
                            )}
                          </Button>
                          <Link to={`/cases/${case_._id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {publishedCases.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No cases available for voting at the moment.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="my-cases">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Cases</CardTitle>
                    <CardDescription>Cases you've filed with the community</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userFiledCases.length > 0 ? (
                      <div className="space-y-4">
                        {userFiledCases.map((case_) => (
                          <div key={case_._id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium">{case_.title}</h4>
                              <p className="text-sm text-gray-500">{case_.category}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(case_.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="outline" 
                                className={
                                  case_.status === 'Pending Review' ? 'bg-yellow-100 text-yellow-800' :
                                  case_.status === 'Published for Voting' ? 'bg-green-100 text-green-800' :
                                  case_.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }
                              >
                                {case_.status}
                              </Badge>
                              <Link to={`/cases/${case_._id}`}>
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">You haven't filed any cases yet.</p>
                        <Link to="/create-case">
                          <Button className="mt-4">File Your First Case</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="resolved">
                <Card>
                  <CardHeader>
                    <CardTitle>Resolved Cases</CardTitle>
                    <CardDescription>Cases that have been completed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userFiledCases
                        .filter((c) => c.status === "Verdict Reached" || c.status === "Closed")
                        .map((case_) => (
                          <div key={case_._id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{case_.title}</h4>
                              <p className="text-sm text-gray-500">{case_.category}</p>
                              {case_.verdict && (
                                <p className="text-sm text-green-600">Verdict: {case_.verdict}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span className="text-sm text-green-600">Resolved</span>
                            </div>
                          </div>
                        ))}
                      
                      {userFiledCases.filter((c) => c.status === "Verdict Reached" || c.status === "Closed").length === 0 && (
                        <div className="text-center py-8">
                          <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No resolved cases yet.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Weekly Limit */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Weekly Case Limit</CardTitle>
                <CardDescription>You can file {stats.weeklyLimit} case per week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Cases filed this week</span>
                    <span>
                      {stats.casesThisWeek}/{stats.weeklyLimit}
                    </span>
                  </div>
                  <Progress value={(stats.casesThisWeek / stats.weeklyLimit) * 100} />
                  <p className="text-xs text-gray-500">
                    {stats.weeklyLimit - stats.casesThisWeek} cases remaining this week
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/create-case">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    File New Case
                  </Button>
                </Link>
                <Link to="/cases">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Browse Community
                  </Button>
                </Link>
                <Link to="/support">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Provide Feedback
                  </Button>
                </Link>
                {user?.role === 'member' && (
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Scale className="h-4 w-4 mr-2" />
                    Request Judge Role
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Community Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Total Members</span>
                  <span className="font-medium">
                    {dashboardData?.community?.totalUsers?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Active Cases</span>
                  <span className="font-medium">
                    {dashboardData?.filedCases?.filter(c => c.status === 'Published for Voting').length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Cases Resolved</span>
                  <span className="font-medium">
                    {dashboardData?.community?.approvedCases?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Success Rate</span>
                  <span className="font-medium text-green-600">
                    {dashboardData?.community?.totalCases > 0 
                      ? `${Math.round((dashboardData.community.approvedCases / dashboardData.community.totalCases) * 100)}%`
                      : '0%'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 