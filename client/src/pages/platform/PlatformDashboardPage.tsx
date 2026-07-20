import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, Mail, Eye } from 'lucide-react';
import { platformApi } from '@/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getPublicPortfolioLabel, getPublicPortfolioUrl } from '@/lib/utils';

type DashboardData = Awaited<ReturnType<typeof platformApi.getDashboard>>;

export default function PlatformDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    platformApi.getDashboard().then(setData).catch(console.error);
  }, []);

  if (!data) {
    return <div className="text-subtle font-mono text-sm">Loading platform overview...</div>;
  }

  const stats = [
    { label: 'Total Users', value: data.totalUsers, icon: Users, to: '/platform/users' },
    { label: 'Portfolios', value: data.totalProfiles, icon: Briefcase, to: '/platform/portfolios' },
    { label: 'Published', value: data.publishedProfiles, icon: Eye, to: '/platform/portfolios' },
    { label: 'Unread Messages', value: data.unreadMessages, icon: Mail, to: '/platform/activity' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Platform Overview</h1>
        <p className="text-sm text-subtle">Monitor users, portfolios, and activity across the platform</p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.to}>
            <Card className="glass-card hover:border-brand-secondary/40 transition-colors h-full">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="h-5 w-5 text-brand-secondary" />
                <span className="text-2xl font-bold text-primary">{stat.value}</span>
              </div>
              <p className="text-sm text-subtle">{stat.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <h2 className="font-semibold text-primary mb-4">Recent Users</h2>
          <div className="space-y-3">
            {data.recentUsers.map((user) => (
              <div key={user.email} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-primary">{user.name}</p>
                  <p className="text-xs text-subtle">{user.email}</p>
                </div>
                <span className="text-xs text-subtle font-mono">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {data.recentUsers.length === 0 && <p className="text-sm text-subtle">No users yet.</p>}
          </div>
        </Card>

        <Card className="glass-card">
          <h2 className="font-semibold text-primary mb-4">Recent Portfolios</h2>
          <div className="space-y-3">
            {data.recentProfiles.map((profile) => (
              <div key={profile._id} className="flex items-center justify-between text-sm gap-3">
                <div>
                  <a
                    href={getPublicPortfolioUrl(profile.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-accent hover:underline"
                  >
                    {profile.displayName}
                  </a>
                  <p className="text-xs text-subtle font-mono">{getPublicPortfolioLabel(profile.slug)}</p>
                </div>
                {profile.isPublished ? (
                  <Badge variant="accent">Live</Badge>
                ) : (
                  <Badge variant="outline">Draft</Badge>
                )}
              </div>
            ))}
            {data.recentProfiles.length === 0 && <p className="text-sm text-subtle">No portfolios yet.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
