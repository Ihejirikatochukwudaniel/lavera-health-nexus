import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, FileText, TrendingUp, Download } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Reports = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalRevenue: 0,
    pharmacyItems: 0,
    activeDispensing: 0
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const admissionsData = [
    { month: "Jan", value: 0 },
    { month: "Feb", value: 0 },
    { month: "Mar", value: 0 },
    { month: "Apr", value: 0 },
    { month: "May", value: 0 },
    { month: "Jun", value: 0 },
  ];

  const departmentData = [
    { name: "Pharmacy", value: stats.pharmacyItems },
    { name: "Patients", value: stats.totalPatients },
    { name: "Invoices", value: stats.activeDispensing },
  ];

  useEffect(() => {
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
        activeDispensing: invoicesCount || 0
      });
    };

    fetchStats();
  }, []);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Fetch all data for the report
      const [patientsRes, invoicesRes, pharmacyRes] = await Promise.all([
        supabase.from('patients').select('*'),
        supabase.from('invoices').select('*'),
        supabase.from('pharmacy_inventory').select('*')
      ]);

      // Create report content
      const reportData = {
        generatedAt: new Date().toISOString(),
        summary: {
          totalPatients: patientsRes.data?.length || 0,
          totalRevenue: stats.totalRevenue,
          pharmacyItems: pharmacyRes.data?.length || 0,
          totalInvoices: invoicesRes.data?.length || 0
        },
        patients: patientsRes.data || [],
        invoices: invoicesRes.data || [],
        pharmacy: pharmacyRes.data || []
      };

      // Convert to JSON and download
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hospital-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Report Generated",
        description: "Your report has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <MainLayout
      title="Reports & Analytics"
      subtitle="View key metrics and generate detailed reports."
      action={
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg border border-border">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={handleGenerateReport}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <FileText className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-card border-border">
            <p className="text-sm text-muted-foreground mb-2">Total Patients</p>
            <h3 className="text-3xl font-bold text-foreground mb-2">{stats.totalPatients}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>Live data</span>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <p className="text-sm text-muted-foreground mb-2">Total Revenue</p>
            <h3 className="text-3xl font-bold text-foreground mb-2">${stats.totalRevenue.toLocaleString()}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>Live data</span>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <p className="text-sm text-muted-foreground mb-2">Pharmacy Items</p>
            <h3 className="text-3xl font-bold text-foreground mb-2">{stats.pharmacyItems}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>Live data</span>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <p className="text-sm text-muted-foreground mb-2">Total Invoices</p>
            <h3 className="text-3xl font-bold text-foreground mb-2">{stats.activeDispensing}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>Live data</span>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-card border-border">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground">Patient Admissions Over Time</h3>
              <p className="text-sm text-muted-foreground">Monthly admissions for the current year.</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={admissionsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
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

          <Card className="p-6 bg-card border-border">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground">Activity by Department</h3>
              <p className="text-sm text-muted-foreground">Comparison of activity across departments.</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Reports;
