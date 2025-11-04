import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Search, Filter, Eye, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const patients = [
  { id: "#789456", name: "John Doe", dob: "1985-05-15", gender: "Male", doctor: "Dr. Smith", lastVisit: "2023-10-26", status: "inpatient" },
  { id: "#123456", name: "Jane Smith", dob: "1992-08-22", gender: "Female", doctor: "Dr. Williams", lastVisit: "2023-11-01", status: "pending-test" },
  { id: "#987654", name: "Peter Jones", dob: "1978-01-30", gender: "Male", doctor: "Dr. Brown", lastVisit: "2023-09-15", status: "outpatient" },
  { id: "#456789", name: "Maria Garcia", dob: "2001-11-12", gender: "Female", doctor: "Dr. Smith", lastVisit: "2023-10-20", status: "urgent" },
  { id: "#654321", name: "Chen Wei", dob: "1995-03-25", gender: "Male", doctor: "Dr. Williams", lastVisit: "2023-11-05", status: "outpatient" },
];

const Patients = () => {
  return (
    <MainLayout
      title="Patient Management"
      subtitle="View, add, edit, and manage all patient information and records."
      action={
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add New Patient
        </Button>
      }
    >
      <Card className="bg-card border-border">
        {/* Search and Filters */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="search"
                placeholder="Search by patient name or ID"
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <Button variant="outline" className="border-border">
              <Filter className="w-4 h-4 mr-2" />
              Filter by Status
            </Button>
            <Button variant="outline" className="border-border">
              <Filter className="w-4 h-4 mr-2" />
              Filter by Doctor
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Patient ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Full Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">DOB</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Gender</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Assigned Doctor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Last Visit</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-muted-foreground">{patient.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{patient.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{patient.dob}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{patient.gender}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{patient.doctor}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{patient.lastVisit}</td>
                  <td className="px-6 py-4">
                    <Badge
                      className={
                        patient.status === "inpatient"
                          ? "bg-success/10 text-success border-success/20"
                          : patient.status === "pending-test"
                          ? "bg-warning/10 text-warning border-warning/20"
                          : patient.status === "urgent"
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : "bg-primary/10 text-primary border-primary/20"
                      }
                    >
                      {patient.status === "inpatient"
                        ? "Inpatient"
                        : patient.status === "pending-test"
                        ? "Pending Test"
                        : patient.status === "urgent"
                        ? "Urgent"
                        : "Outpatient"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </MainLayout>
  );
};

export default Patients;
