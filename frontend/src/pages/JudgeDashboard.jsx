import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { socket } from '../lib/socket';
import { getProfilePicUrl } from '../utils/media';
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
  Scale,
  FileText,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const statusStyles = {
  'Pending Review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Under Review': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Published for Voting': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Verdict Reached': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'Closed': 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100',
  'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

const JudgeDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCase, setSelectedCase] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const aiRef = useRef(null);
  const [aiCaseId, setAiCaseId] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery(
    'judge-dashboard',
    async () => {
      const response = await api.get('/cases/judge/dashboard');
      return response.data;
    }
  );

  const { data: allCasesData, isLoading: allCasesLoading } = useQuery(
    'all-cases',
    async () => {
      const response = await api.get('/cases?limit=200');
      return response.data;
    }
  );

  const allCases = useMemo(() => allCasesData?.cases || [], [allCasesData]);

  const caseGroups = useMemo(() => {
    const cases = allCases || [];
    return {
      all: cases,
      pending: cases.filter((c) => c.status === 'Pending Review'),
      under: cases.filter((c) => c.status === 'Under Review'),
      published: cases.filter((c) => c.status === 'Published for Voting'),
      verdict: cases.filter((c) => c.status === 'Verdict Reached'),
      closed: cases.filter((c) => c.status === 'Closed'),
      rejected: cases.filter((c) => c.status === 'Rejected')
    };
  }, [allCases]);

  const caseTabs = useMemo(() => (
    [
      { key: 'all', label: 'All Cases', count: caseGroups.all.length, empty: 'No cases available yet.' },
      { key: 'pending', label: 'Pending Review', count: caseGroups.pending.length, empty: 'No pending cases right now.' },
      { key: 'under', label: 'Under Review', count: caseGroups.under.length, empty: 'No cases under review right now.' },
      { key: 'published', label: 'Published', count: caseGroups.published.length, empty: 'No published cases right now.' },
      { key: 'verdict', label: 'Verdict Reached', count: caseGroups.verdict.length, empty: 'No verdicts reached yet.' },
      { key: 'closed', label: 'Closed', count: caseGroups.closed.length, empty: 'No closed cases yet.' },
      { key: 'rejected', label: 'Rejected', count: caseGroups.rejected.length, empty: 'No rejected cases.' }
    ]
  ), [caseGroups]);

  const selectedAiCase = allCases.find((c) => c._id === aiCaseId);

  const deleteCaseMutation = useMutation(
    async (caseId) => {
      const response = await api.delete(`/cases/${caseId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Case deleted successfully');
        queryClient.invalidateQueries('all-cases');
        queryClient.invalidateQueries('judge-dashboard');
        queryClient.invalidateQueries('dashboard');
        queryClient.invalidateQueries('cases');
        setShowActionModal(false);
        setSelectedCase(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete case');
      }
    }
  );

  const updateStatusMutation = useMutation(
    async ({ caseId, status }) => {
      const response = await api.put(`/cases/${caseId}/status`, { status });
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Case status updated successfully');
        queryClient.invalidateQueries('all-cases');
        queryClient.invalidateQueries('judge-dashboard');
        queryClient.invalidateQueries('dashboard');
        queryClient.invalidateQueries('cases');
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

  const handleAiCaseSelect = (caseId) => {
    setAiCaseId(caseId);
    setAiMessages([]);
    setAiInput('');
    setAiError('');
    if (caseId) {
      requestAiSummary(caseId);
      setTimeout(() => aiRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
    }
  };

  const handleRandomCase = () => {
    if (!allCases.length) return;
    const random = allCases[Math.floor(Math.random() * allCases.length)];
    handleAiCaseSelect(random._id);
  };

  const requestAiSummary = async (caseId = aiCaseId) => {
    if (!caseId) return;
    setAiLoading(true);
    setAiError('');
    try {
      const response = await api.post(`/cases/${caseId}/ai-chat`, { messages: [] });
      setAiMessages([{ role: 'assistant', content: response.data.reply }]);
    } catch (error) {
      setAiError(error.response?.data?.message || 'Failed to get AI response');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiSend = async () => {
    if (!aiInput.trim() || !aiCaseId) return;
    const nextMessages = [...aiMessages, { role: 'user', content: aiInput.trim() }];
    setAiMessages(nextMessages);
    setAiInput('');
    setAiLoading(true);
    setAiError('');
    try {
      const response = await api.post(`/cases/${aiCaseId}/ai-chat`, { messages: nextMessages });
      setAiMessages([...nextMessages, { role: 'assistant', content: response.data.reply }]);
    } catch (error) {
      setAiError(error.response?.data?.message || 'Failed to get AI response');
    } finally {
      setAiLoading(false);
    }
  };

  const handleClearChat = () => {
    setAiMessages([]);
    setAiInput('');
    setAiError('');
  };

  const handleNewChat = () => {
    setAiMessages([]);
    setAiInput('');
    setAiError('');
    setAiCaseId('');
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

  const getVoteCounts = (caseItem) => {
    const yesVotes = caseItem.yesVotes ?? caseItem.votes?.filter(v => v.vote === 'yes').length ?? 0;
    const noVotes = caseItem.noVotes ?? caseItem.votes?.filter(v => v.vote === 'no').length ?? 0;
    const totalVotes = caseItem.totalVotes ?? caseItem.votes?.length ?? yesVotes + noVotes;
    return { yesVotes, noVotes, totalVotes };
  };

  const renderCaseList = (cases = [], emptyMessage) => {
    if (!cases.length) {
      return (
        <Card>
          <CardContent className="text-center py-10">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{emptyMessage}</p>
          </CardContent>
        </Card>
      );
    }

    return cases.map((caseItem) => {
      const { yesVotes, noVotes, totalVotes } = getVoteCounts(caseItem);
      const showReviewActions = ['Pending Review', 'Under Review'].includes(caseItem.status);
      const commentCount = caseItem.comments?.length || 0;

      return (
        <Card key={caseItem._id} className="hover:shadow-md transition-shadow hover-lift">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1 min-w-[220px]">
                <CardTitle className="text-lg">{caseItem.title}</CardTitle>
                <CardDescription className="mt-2">
                  Filed by {caseItem.filedBy?.username || 'Unknown'} - {new Date(caseItem.createdAt).toLocaleDateString()}
                </CardDescription>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{caseItem.category}</Badge>
                  <Badge variant="outline">{caseItem.priority}</Badge>
                  <span>{caseItem.status}</span>
                  {caseItem.evidence && <span>Evidence attached</span>}
                </div>
              </div>
              <Badge className={statusStyles[caseItem.status] || 'bg-slate-100 text-slate-800'}>
                {caseItem.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
              {caseItem.description}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{yesVotes}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ThumbsDown className="h-4 w-4 text-red-600" />
                  <span className="font-medium">{noVotes}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">{commentCount}</span>
                </div>
                <span className="text-xs text-muted-foreground">{totalVotes} total votes</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {showReviewActions && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleAction(caseItem, 'publish')}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Publish
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleAction(caseItem, 'reject')}>
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
                <Button size="sm" variant="outline" onClick={() => handleAiCaseSelect(caseItem._id)}>
                  <Scale className="h-4 w-4 mr-1" />
                  AI Assist
                </Button>
                <Link to={`/cases/${caseItem._id}`}>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </Link>
                <Button size="sm" variant="outline" onClick={() => handleAction(caseItem, 'delete')}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    });
  };

  useEffect(() => {
    const handleUpdate = () => {
      queryClient.invalidateQueries('all-cases');
      queryClient.invalidateQueries('judge-dashboard');
      queryClient.invalidateQueries('cases');
    };
    socket.on('case_updated', handleUpdate);
    return () => {
      socket.off('case_updated', handleUpdate);
    };
  }, [queryClient]);

  if (dashboardLoading || allCasesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Judge Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage cases, review evidence, and guide verdicts.</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <Gavel className="h-4 w-4 mr-1" />
                Judge
              </Badge>
              <Avatar>
                <AvatarImage
                  src={getProfilePicUrl(user?.profilePic)}
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

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-8">
          <div>
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList className="flex flex-wrap">
                {caseTabs.map((tab) => (
                  <TabsTrigger key={tab.key} value={tab.key}>
                    <span className="mr-2">{tab.label}</span>
                    <Badge variant="outline" className="text-xs">
                      {tab.count}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>

              {caseTabs.map((tab) => (
                <TabsContent key={tab.key} value={tab.key} className="space-y-4">
                  {renderCaseList(caseGroups[tab.key], tab.empty)}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div ref={aiRef} className="space-y-6">
            <Card className="shadow-lg hover-lift">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                <CardTitle className="flex items-center space-x-2">
                  <Scale className="h-5 w-5 text-primary" />
                  <span>Judge AI Desk</span>
                </CardTitle>
                <CardDescription>
                  Summarize cases, ask for verdict guidance, and check for missing information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="form-label">Select case for analysis</label>
                  <select
                    className="form-input"
                    value={aiCaseId}
                    onChange={(e) => handleAiCaseSelect(e.target.value)}
                  >
                    <option value="">Choose a case...</option>
                    {allCases.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title} - {c.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={handleRandomCase} disabled={!allCases.length}>
                    Random Case
                  </Button>
                  <Button
                    onClick={() => requestAiSummary()}
                    disabled={!aiCaseId || aiLoading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {aiLoading ? 'Analyzing...' : 'Analyze Case'}
                  </Button>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40 p-4">
                  {selectedAiCase ? (
                    <>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Case Snapshot</div>
                      <div className="mt-2 text-sm font-semibold text-foreground">{selectedAiCase.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {selectedAiCase.category} - {selectedAiCase.priority} - {selectedAiCase.status}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                        <div>Votes: {getVoteCounts(selectedAiCase).totalVotes}</div>
                        <div>Comments: {selectedAiCase.comments?.length || 0}</div>
                        <div>Filed by: {selectedAiCase.filedBy?.username || 'Unknown'}</div>
                        <div>Evidence: {selectedAiCase.evidence ? 'Attached' : 'None'}</div>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Pick a case to auto-generate a summary and verdict recommendation.
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3 max-h-[360px] overflow-y-auto">
                  {aiMessages.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                      The AI will provide a summary, recommendation, and risks once a case is selected.
                    </div>
                  )}
                  {aiMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl p-3 text-sm whitespace-pre-line ${
                        msg.role === 'assistant'
                          ? 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                          : 'bg-blue-600 text-white ml-auto'
                      }`}
                    >
                      {msg.content}
                    </div>
                  ))}
                </div>

                {aiError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5" />
                    <span>{aiError}</span>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ask the AI about this case..."
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    disabled={!aiCaseId || aiLoading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAiSend();
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={handleClearChat} disabled={aiLoading}>
                      Clear Chat
                    </Button>
                    <Button variant="outline" onClick={handleNewChat} disabled={aiLoading}>
                      New Chat
                    </Button>
                    <Button onClick={handleAiSend} disabled={!aiInput.trim() || !aiCaseId || aiLoading}>
                      Send
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

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
                <Button variant="outline" onClick={() => setShowActionModal(false)}>
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
