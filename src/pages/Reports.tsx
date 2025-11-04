import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const admissionsData = [
  { month: "Jan", value: 450 },
  { month: "Feb", value: 380 },
  { month: "Mar", value: 520 },
  { month: "Apr", value: 490 },
  { month: "May", value: 610 },
  { month: "Jun", value: 580 },
];

const departmentData = [
  { name: "Cardiology", value: 145 },
  { name: "Emergency", value: 198 },
  { name: "Pediatrics", value: 132 },
  { name: "Neurology", value: 167 },
  { name: "Surgery", value: 189 },
];

const Reports = () => {
  return (
    <MainLayout
      title="Reports & Analytics"
      subtitle="View key metrics and generate detailed reports."
      action={
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg border border-border">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground">Oct 5, 2024 - Oct 30, 2024</span>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-card border-border">
            <p className="text-sm text-muted-foreground mb-2">Patient Admissions</p>
            <h3 className="text-3xl font-bold text-foreground mb-2">1,204</h3>
            <div className="flex items-center gap-1 text-sm text-success">
              <TrendingUp className="w-4 h-4" />
              <span>+5.2%</span>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <p className="text-sm text-muted-foreground mb-2">Average Length of Stay</p>
            <h3 className="text-3xl font-bold text-foreground mb-2">6.2 Days</h3>
            <div className="flex items-center gap-1 text-sm text-destructive">
              <TrendingDown className="w-4 h-4" />
              <span>-0.3%</span>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <p className="text-sm text-muted-foreground mb-2">Bed Occupancy Rate</p>
            <h3 className="text-3xl font-bold text-foreground mb-2">89%</h3>
            <div className="flex items-center gap-1 text-sm text-success">
              <TrendingUp className="w-4 h-4" />
              <span>+1.5%</span>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <p className="text-sm text-muted-foreground mb-2">Revenue Generated</p>
            <h3 className="text-3xl font-bold text-foreground mb-2">$1.2M</h3>
            <div className="flex items-center gap-1 text-sm text-success">
              <TrendingUp className="w-4 h-4" />
              <span>+8.1%</span>
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
              <h3 className="text-lg font-semibold text-foreground">Appointments by Department</h3>
              <p className="text-sm text-muted-foreground">Comparison of appointment counts across departments.</p>
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
