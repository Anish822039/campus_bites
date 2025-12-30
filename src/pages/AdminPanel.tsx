import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Users, 
  UserCheck, 
  UserX,
  LogOut,
  RefreshCw,
  Loader2,
  ChefHat,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ManagerRequest {
  id: string;
  user_id: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: 'student' | 'manager' | 'management' | 'admin';
  profile?: {
    name: string;
    email: string;
  };
}

const AdminPanel: React.FC = () => {
  const { role, user } = useAuth();
  const navigate = useNavigate();
  const [managerRequests, setManagerRequests] = useState<ManagerRequest[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  const isAdmin = role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      navigate('/manager');
      return;
    }
    fetchManagerRequests();
    fetchAllUsers();
  }, [isAdmin, navigate]);

  const fetchManagerRequests = async () => {
    setRequestsLoading(true);
    const { data, error } = await supabase
      .from('manager_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching requests:', error);
    } else {
      setManagerRequests(data || []);
    }
    setRequestsLoading(false);
  };

  const fetchAllUsers = async () => {
    setUsersLoading(true);
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .order('role', { ascending: true });

    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
      setUsersLoading(false);
      return;
    }

    // Fetch profiles for each user
    const userIds = roles?.map(r => r.user_id) || [];
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, name, email')
      .in('user_id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }

    const usersWithProfiles = roles?.map(role => ({
      ...role,
      profile: profiles?.find(p => p.user_id === role.user_id)
    })) || [];

    setUserRoles(usersWithProfiles);
    setUsersLoading(false);
  };

  const handleApproveRequest = async (request: ManagerRequest) => {
    const { error: updateError } = await supabase
      .from('manager_requests')
      .update({ 
        status: 'approved', 
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id 
      })
      .eq('id', request.id);

    if (updateError) {
      toast.error('Failed to approve request');
      return;
    }

    const { error: roleError } = await supabase
      .from('user_roles')
      .update({ role: 'manager' })
      .eq('user_id', request.user_id);

    if (roleError) {
      toast.error('Failed to update user role');
      return;
    }

    toast.success(`${request.name} has been granted manager access`);
    fetchManagerRequests();
    fetchAllUsers();
  };

  const handleRejectRequest = async (request: ManagerRequest) => {
    const { error } = await supabase
      .from('manager_requests')
      .update({ 
        status: 'rejected', 
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id 
      })
      .eq('id', request.id);

    if (error) {
      toast.error('Failed to reject request');
      return;
    }

    toast.success(`Request from ${request.name} has been rejected`);
    fetchManagerRequests();
  };

  const handleChangeRole = async (userId: string, newRole: 'student' | 'manager' | 'management' | 'admin') => {
    if (userId === user?.id) {
      toast.error("You cannot change your own role");
      return;
    }

    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', userId);

    if (error) {
      toast.error('Failed to update role');
      return;
    }

    toast.success('User role updated successfully');
    fetchAllUsers();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'manager': return 'default';
      case 'management': return 'secondary';
      default: return 'outline';
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/manager">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive text-destructive-foreground">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Admin Panel</h1>
                <p className="text-xs text-muted-foreground">User Management & Access Control</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/manager">
              <Button variant="outline" size="sm" className="gap-2">
                <ChefHat className="h-4 w-4" />
                Manager Dashboard
              </Button>
            </Link>
            <Link to="/admin-login">
              <Button variant="ghost" size="sm" className="gap-2 text-destructive">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Pending Requests', count: managerRequests.length, icon: Users, color: 'text-warning' },
            { label: 'Total Users', count: userRoles.length, icon: Users, color: 'text-primary' },
            { label: 'Managers', count: userRoles.filter(u => u.role === 'manager').length, icon: UserCheck, color: 'text-success' },
            { label: 'Admins', count: userRoles.filter(u => u.role === 'admin').length, icon: Shield, color: 'text-destructive' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-card p-4 shadow-card">
              <div className="flex items-center justify-between">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className={`text-2xl font-bold ${stat.color}`}>{stat.count}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="requests" className="gap-2">
              <Users className="h-4 w-4" />
              Access Requests
              {managerRequests.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {managerRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <UserCheck className="h-4 w-4" />
              User Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <div className="rounded-xl bg-card p-6 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Pending Access Requests</h3>
                </div>
                <Button variant="outline" size="sm" onClick={fetchManagerRequests} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
              {requestsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : managerRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending access requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {managerRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium">{request.name}</p>
                        <p className="text-sm text-muted-foreground">{request.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Requested {format(new Date(request.created_at), 'MMM d, yyyy at hh:mm a')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-destructive hover:text-destructive"
                          onClick={() => handleRejectRequest(request)}
                        >
                          <UserX className="h-4 w-4" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="gap-1"
                          onClick={() => handleApproveRequest(request)}
                        >
                          <UserCheck className="h-4 w-4" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="rounded-xl bg-card p-6 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">All Users</h3>
                </div>
                <Button variant="outline" size="sm" onClick={fetchAllUsers} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
              {usersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-3">
                  {userRoles.map((userRole) => (
                    <div key={userRole.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{userRole.profile?.name || 'Unknown'}</p>
                          <Badge variant={getRoleBadgeVariant(userRole.role)}>
                            {userRole.role}
                          </Badge>
                          {userRole.user_id === user?.id && (
                            <Badge variant="outline" className="text-xs">You</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{userRole.profile?.email || 'No email'}</p>
                      </div>
                      {userRole.user_id !== user?.id && (
                        <div className="flex items-center gap-2">
                          <select
                            value={userRole.role}
                            onChange={(e) => handleChangeRole(userRole.user_id, e.target.value as any)}
                            className="rounded-md border bg-background px-3 py-1.5 text-sm"
                          >
                            <option value="student">Student</option>
                            <option value="manager">Manager</option>
                            <option value="management">Management</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;
