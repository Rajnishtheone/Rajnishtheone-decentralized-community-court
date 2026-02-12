import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import api from '../lib/api';
import {
  Users,
  Shield,
  Gavel,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Mail,
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const [sceneClosed, setSceneClosed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('dcc_scene_overlay_closed');
    if (stored === 'true') {
      setSceneClosed(true);
    }
  }, []);

  const handleCloseScene = () => {
    setSceneClosed(true);
    localStorage.setItem('dcc_scene_overlay_closed', 'true');
  };

  // Fetch community stats
  const { data: stats, isLoading: statsLoading } = useQuery(
    'community-stats',
    async () => {
      const response = await api.get('/analytics/community-stats');
      return response.data;
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 30000,
    }
  );

  // Calculate derived stats
  const communityStats = {
    totalUsers: stats?.community?.totalUsers || 0,
    totalCases: stats?.community?.totalCases || 0,
    resolvedCases: stats?.community?.approvedCases || 0,
    successRate: stats?.community?.totalCases > 0 
      ? Math.round((stats.community.approvedCases / stats.community.totalCases) * 100) 
      : 0,
    satisfactionRate: 95, // This could be calculated from user feedback in the future
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-gray-900 dark:via-background dark:to-gray-900 theme-transition">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200">
              🚀 Decentralized Justice Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Community-Driven
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dispute Resolution
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Join a transparent, democratic platform where community members collaborate to resolve disputes fairly.
              Vote on cases, provide feedback, and help build a more just digital society.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/dashboard">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover-glow"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover-glow"
                  >
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
              <Link to="/about">
                <Button size="lg" variant="outline" className="hover-glow">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Community Scene */}
          <div className="community-scene" aria-hidden="true">
            <div className="scene-sun"></div>
            <div className="scene-cloud cloud-1"></div>
            <div className="scene-cloud cloud-2"></div>
            <div className="scene-hills"></div>

            <div className="scene-city">
              <div className="scene-building b1">
                <span className="scene-window" style={{ top: '18px', left: '12px' }}></span>
                <span className="scene-window" style={{ top: '18px', right: '12px' }}></span>
                <span className="scene-window" style={{ top: '42px', left: '12px' }}></span>
                <span className="scene-window" style={{ top: '42px', right: '12px' }}></span>
              </div>
              <div className="scene-building b2">
                <span className="scene-window" style={{ top: '20px', left: '12px' }}></span>
                <span className="scene-window" style={{ top: '20px', right: '12px' }}></span>
                <span className="scene-window" style={{ top: '46px', left: '12px' }}></span>
                <span className="scene-window" style={{ top: '46px', right: '12px' }}></span>
                <span className="scene-window" style={{ top: '72px', left: '12px' }}></span>
                <span className="scene-window" style={{ top: '72px', right: '12px' }}></span>
              </div>
              <div className="scene-building b3">
                <span className="scene-window" style={{ top: '18px', left: '12px' }}></span>
                <span className="scene-window" style={{ top: '18px', right: '12px' }}></span>
                <span className="scene-window" style={{ top: '42px', left: '12px' }}></span>
                <span className="scene-window" style={{ top: '42px', right: '12px' }}></span>
              </div>
              <div className="scene-building b4">
                <span className="scene-window" style={{ top: '20px', left: '12px' }}></span>
                <span className="scene-window" style={{ top: '20px', right: '12px' }}></span>
                <span className="scene-window" style={{ top: '46px', left: '12px' }}></span>
                <span className="scene-window" style={{ top: '46px', right: '12px' }}></span>
              </div>
            </div>

            <div className="scene-park"></div>
            <div className="scene-path"></div>

            <div className="scene-tree" style={{ left: '8%' }}>
              <div className="trunk"></div>
              <div className="crown"></div>
            </div>
            <div className="scene-tree" style={{ left: '78%' }}>
              <div className="trunk"></div>
              <div className="crown"></div>
            </div>

            <div className="scene-people">
              <div className="scene-person p1" style={{ left: '10%' }}>
                <div className="head"></div>
                <div className="body"></div>
              </div>
              <div className="scene-person p2" style={{ left: '35%', animationDelay: '1.5s' }}>
                <div className="head"></div>
                <div className="body"></div>
              </div>
              <div className="scene-person p3" style={{ left: '60%', animationDelay: '3s' }}>
                <div className="head"></div>
                <div className="body"></div>
              </div>
            </div>

            <div className="scene-dog" style={{ animationDelay: '2s' }}></div>

            {!sceneClosed && (
              <div className="scene-overlay">
                <div className="scene-overlay-card relative">
                  <button
                    onClick={handleCloseScene}
                    className="absolute top-2 right-2 p-1 rounded-full text-slate-500 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
                    aria-label="Close community message"
                  >
                    x
                  </button>
                  <p className="text-sm uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    A Peaceful Community
                  </p>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-1">
                    Resolve disputes with empathy, clarity, and community trust.
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                    Transparent discussions, fair voting, and respectful outcomes for everyone in your society.
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
                    {user ? (
                      <Link to="/create-case" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors hover-glow">
                        File a Community Case
                      </Link>
                    ) : (
                      <Link to="/register" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors hover-glow">
                        Join Your Community
                      </Link>
                    )}
                    <Link to="/about" className="px-4 py-2 rounded-md border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors hover-glow">
                      Learn the Process
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {statsLoading ? (
                  <div className="animate-pulse bg-blue-200 dark:bg-blue-800 h-8 w-16 rounded"></div>
                ) : (
                  communityStats.resolvedCases.toLocaleString()
                )}
              </div>
              <div className="text-muted-foreground">Cases Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {statsLoading ? (
                  <div className="animate-pulse bg-purple-200 dark:bg-purple-800 h-8 w-16 rounded"></div>
                ) : (
                  communityStats.totalUsers.toLocaleString()
                )}
              </div>
              <div className="text-muted-foreground">Community Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {statsLoading ? (
                  <div className="animate-pulse bg-green-200 dark:bg-green-800 h-8 w-16 rounded"></div>
                ) : (
                  `${communityStats.satisfactionRate}%`
                )}
              </div>
              <div className="text-muted-foreground">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">24/7</div>
              <div className="text-muted-foreground">Platform Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose DCC Court?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our platform offers a unique approach to dispute resolution that combines community wisdom with AI assistance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow hover-lift">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl mb-2">Community-Driven</CardTitle>
              <CardDescription>
                Every decision is made by the community through transparent voting and discussion.
              </CardDescription>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow hover-lift">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-xl mb-2">Secure & Transparent</CardTitle>
              <CardDescription>
                All cases and decisions are recorded on the blockchain for complete transparency.
              </CardDescription>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow hover-lift">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Gavel className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl mb-2">AI-Assisted</CardTitle>
              <CardDescription>
                Advanced AI provides insights and suggestions to help make informed decisions.
              </CardDescription>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow hover-lift">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-xl mb-2">Open Discussion</CardTitle>
              <CardDescription>
                Engage in meaningful discussions and provide feedback on cases.
              </CardDescription>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow hover-lift">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-xl mb-2">Real-time Updates</CardTitle>
              <CardDescription>
                Get instant notifications and updates on case progress and decisions.
              </CardDescription>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow hover-lift">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle className="text-xl mb-2">Fair & Just</CardTitle>
              <CardDescription>
                Our system ensures fair treatment and just outcomes for all parties involved.
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our simple 4-step process makes dispute resolution accessible to everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">File a Case</h3>
              <p className="text-muted-foreground">
                Submit your dispute with all relevant details and evidence.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Community Review</h3>
              <p className="text-muted-foreground">
                Community members review and discuss the case openly.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Vote & Decide</h3>
              <p className="text-muted-foreground">
                Members vote on the outcome with AI assistance.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-foreground">4</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Get Resolution</h3>
              <p className="text-muted-foreground">
                Receive a fair and transparent resolution to your dispute.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Join Our Community
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Be part of a growing community dedicated to fair and transparent justice.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6">
                Why Join DCC Court?
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground">Make a Difference</h4>
                    <p className="text-muted-foreground">Help resolve disputes and contribute to a fairer society.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground">Learn & Grow</h4>
                    <p className="text-muted-foreground">Gain insights into dispute resolution and community governance.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground">Earn Recognition</h4>
                    <p className="text-muted-foreground">Build reputation and earn rewards for your contributions.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-foreground">Connect</h4>
                    <p className="text-muted-foreground">Connect with like-minded individuals who care about justice.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-lg hover-lift">
              <h3 className="text-2xl font-bold text-foreground mb-6">Community Stats</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Active Members</span>
                  <span className="text-2xl font-bold text-foreground">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-16 rounded"></div>
                    ) : (
                      communityStats.totalUsers.toLocaleString()
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cases Resolved</span>
                  <span className="text-2xl font-bold text-foreground">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-16 rounded"></div>
                    ) : (
                      communityStats.resolvedCases.toLocaleString()
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Success Rate</span>
                  <span className="text-2xl font-bold text-foreground">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-16 rounded"></div>
                    ) : (
                      `${communityStats.successRate}%`
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Average Resolution Time</span>
                  <span className="text-2xl font-bold text-foreground">2.3 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Have questions or need support? We're here to help you get started.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Email Support</h3>
              <p className="text-muted-foreground mb-4">
                Get help via email with detailed responses.
              </p>
              <a href="mailto:support@dcccourt.com" className="text-primary hover:underline">
                support@dcccourt.com
              </a>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Live Chat</h3>
              <p className="text-muted-foreground mb-4">
                Chat with our support team in real-time.
              </p>
              <Link to="/support" className="text-primary hover:underline">
                Start Chat
              </Link>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Community Forum</h3>
              <p className="text-muted-foreground mb-4">
                Connect with other community members.
              </p>
              <a href="#" className="text-primary hover:underline">
                Join Forum
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 
