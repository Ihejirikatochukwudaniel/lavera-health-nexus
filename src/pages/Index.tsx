import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/card";
import { Users, Bed, Calendar, UserCheck } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const admissionsData = [
  { day: "Mon", value: 45 },
  { day: "Tue", value: 32 },
  { day: "Wed", value: 58 },
  { day: "Thu", value: 42 },
  { day: "Fri", value: 75 },
  { day: "Sat", value: 38 },
  { day: "Sun", value: 48 },
];

const patientFlowData = [
  { time: "00:00", value: 12 },
  { time: "04:00", value: 8 },
  { time: "08:00", value: 35 },
  { time: "12:00", value: 42 },
  { time: "16:00", value: 38 },
  { time: "20:00", value: 28 },
];

const upcomingAppointments = [
  { time: "10:00 AM", patient: "John Doe", doctor: "Dr. Smith", department: "Cardiology", status: "confirmed" },
  { time: "11:30 AM", patient: "Jane Smith", doctor: "Dr. Williams", department: "Pediatrics", status: "pending" },
  { time: "01:00 PM", patient: "Michael Ray", doctor: "Dr. Brown", department: "Neurology", status: "confirmed" },
  { time: "02:30 PM", patient: "Sarah Lee", doctor: "Dr. Chen", department: "Cardiology", status: "cancelled" },
];

const Index = () => {
  return (
    <MainLayout
      title="Dashboard"
      subtitle="Welcome back, Dr. Smith! Here's what's happening today."
    >
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Patients"
            value="1,204"
            icon={Users}
          />
          <StatCard
            title="Bed Occupancy"
            value="85%"
            icon={Bed}
          />
          <StatCard
            title="Appointments Today"
            value="62"
            icon={Calendar}
          />
          <StatCard
            title="Staff on Duty"
            value="128"
            icon={UserCheck}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Admissions per Day</h3>
                <p className="text-sm text-muted-foreground">Last 7 days</p>
              </div>
              <span className="text-sm text-success">+5.2%</span>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={admissionsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
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

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Patient Flow</h3>
                <p className="text-sm text-muted-foreground">Last 7 days</p>
              </div>
              <span className="text-sm text-destructive">-1.8%</span>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={patientFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
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
        </div>

        {/* Upcoming Appointments */}
        <Card className="p-6 bg-card border-border">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">Upcoming Appointments</h3>
            <p className="text-sm text-muted-foreground">Appointments scheduled for today.</p>
          </div>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[80px]">
                    <p className="text-sm font-semibold text-foreground">{appointment.time}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{appointment.patient}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.doctor} - {appointment.department}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    appointment.status === "confirmed"
                      ? "bg-success/10 text-success"
                      : appointment.status === "pending"
                      ? "bg-warning/10 text-warning"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Index;
