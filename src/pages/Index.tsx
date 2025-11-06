import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/card";
import { Users, DollarSign, Package, Activity } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [userName, setUserName] = useState("User");
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalRevenue: 0,
    pharmacyItems: 0,
    totalInvoices: 0
  });
  const [admissionsData] = useState([
    { day: "Mon", value: 0 },
    { day: "Tue", value: 0 },
    { day: "Wed", value: 0 },
    { day: "Thu", value: 0 },
    { day: "Fri", value: 0 },
    { day: "Sat", value: 0 },
    { day: "Sun", value: 0 },
  ]);
  const [patientFlowData] = useState([
    { time: "00:00", value: 0 },
    { time: "04:00", value: 0 },
    { time: "08:00", value: 0 },
    { time: "12:00", value: 0 },
    { time: "16:00", value: 0 },
    { time: "20:00", value: 0 },
  ]);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();
        
        if (profile?.name) {
          setUserName(profile.name);
        }
      }
    };

    const fetchStats = async () => {
      const { count: patientsCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      const { data: invoices } = await supabase
        .from('invoices')
        .select('total_amount');
      
      const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;

      const { count: pharmacyCount } = await supabase
        .from('pharmacy_inventory')
        .select('*', { count: 'exact', head: true });

      const { count: invoicesCount } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalPatients: patientsCount || 0,
        totalRevenue: totalRevenue,
        pharmacyItems: pharmacyCount || 0,
        totalInvoices: invoicesCount || 0
      });
    };

    fetchUserData();
    fetchStats();

    const patientsChannel = supabase
      .channel('patients-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patients'
        },
        () => fetchStats()
      )
      .subscribe();

    const invoicesChannel = supabase
      .channel('invoices-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices'
        },
        () => fetchStats()
      )
      .subscribe();

    const pharmacyChannel = supabase
      .channel('pharmacy-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pharmacy_inventory'
        },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(patientsChannel);
      supabase.removeChannel(invoicesChannel);
      supabase.removeChannel(pharmacyChannel);
    };
  }, []);

  return (
    <MainLayout
      title="Dashboard"
      subtitle={`Welcome back, ${userName}! Here's what's happening today.`}
    >
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            icon={Users}
          />
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
          />
          <StatCard
            title="Pharmacy Items"
            value={stats.pharmacyItems}
            icon={Package}
          />
          <StatCard
            title="Total Invoices"
            value={stats.totalInvoices}
            icon={Activity}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card className="p-4 md:p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h3 className="text-base md:text-lg font-semibold text-foreground">Patient Admissions</h3>
                <p className="text-xs md:text-sm text-muted-foreground">Last 7 days</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200} className="md:h-[250px]">
              <BarChart data={admissionsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-4 md:p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h3 className="text-base md:text-lg font-semibold text-foreground">Patient Flow</h3>
                <p className="text-xs md:text-sm text-muted-foreground">Daily activity</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200} className="md:h-[250px]">
              <LineChart data={patientFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

      </div>
    </MainLayout>
  );
};

export default Index;
