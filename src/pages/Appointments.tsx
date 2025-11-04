import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const upcomingToday = [
  { time: "10:00 AM", patient: "Leo Evans", doctor: "Dr. Chen - Cardiology", status: "confirmed" },
  { time: "11:30 AM", patient: "Jane Doe", doctor: "Dr. Patel - Pediatrics", status: "pending" },
  { time: "01:00 PM", patient: "Michael Ray", doctor: "Dr. Sharma - Neurology", status: "confirmed" },
  { time: "02:30 PM", patient: "Sarah Lee", doctor: "Dr. Chen - Cardiology", status: "cancelled" },
];

const Appointments = () => {
  return (
    <MainLayout
      title="Appointments"
      action={
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">October 2024</h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 1;
              const isToday = day === 6;
              const hasAppointment = [2, 6].includes(day);
              
              return (
                <div
                  key={i}
                  className={`aspect-square p-2 rounded-lg border transition-colors ${
                    day < 0 || day > 30
                      ? "border-transparent text-muted-foreground/30"
                      : isToday
                      ? "border-primary bg-primary/10 text-foreground font-semibold"
                      : "border-border hover:border-primary/50 text-foreground"
                  }`}
                >
                  <div className="text-sm">{day > 0 && day <= 30 ? day : ""}</div>
                  {hasAppointment && (
                    <div className="mt-1 space-y-1">
                      <div className="h-1 w-full bg-primary rounded"></div>
                      {day === 6 && <div className="h-1 w-full bg-warning rounded"></div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Upcoming Today */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-semibold text-foreground mb-6">Upcoming Today</h2>
          <div className="space-y-4">
            {upcomingToday.map((appointment, index) => (
              <div key={index} className="p-4 rounded-lg bg-secondary border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-foreground">{appointment.time}</span>
                  <Badge
                    className={
                      appointment.status === "confirmed"
                        ? "bg-success/10 text-success border-success/20"
                        : appointment.status === "pending"
                        ? "bg-warning/10 text-warning border-warning/20"
                        : "bg-destructive/10 text-destructive border-destructive/20"
                    }
                  >
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </Badge>
                </div>
                <p className="font-medium text-foreground">{appointment.patient}</p>
                <p className="text-sm text-muted-foreground">{appointment.doctor}</p>
              </div>
            ))}
            <p className="text-sm text-center text-muted-foreground pt-4">End of schedule for today.</p>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Appointments;
