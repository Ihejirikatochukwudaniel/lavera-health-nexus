import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Eye, Edit, Power } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const staffMembers = [
  { name: "Dr. Emily Carter", role: "Cardiologist", id: "#HS7321", department: "Cardiology", contact: "emily.carter@hospital.com", status: "active" },
  { name: "John Williams", role: "Registered Nurse", id: "#HS8543", department: "Emergency", contact: "john.williams@hospital.com", status: "active" },
  { name: "Maria Rodriguez", role: "Administrator", id: "#HS5512", department: "Administration", contact: "maria.r@hospital.com", status: "on-leave" },
  { name: "Dr. David Chen", role: "Pediatrician", id: "#HS6834", department: "Pediatrics", contact: "david.chen@hospital.com", status: "inactive" },
];

const Staff = () => {
  return (
    <MainLayout
      title="Staff Management"
      subtitle="Manage staff profiles, roles, and contact information."
      action={
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add New Staff
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
                placeholder="Search by name or ID..."
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <Button variant="outline" className="border-border">Role: All</Button>
            <Button variant="outline" className="border-border">Status: Active</Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Staff ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Department</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffMembers.map((staff, index) => (
                <tr key={index} className="border-b border-border hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{staff.name}</p>
                        <p className="text-sm text-muted-foreground">{staff.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{staff.id}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{staff.department}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{staff.contact}</td>
                  <td className="px-6 py-4">
                    <Badge
                      className={
                        staff.status === "active"
                          ? "bg-success/10 text-success border-success/20"
                          : staff.status === "on-leave"
                          ? "bg-warning/10 text-warning border-warning/20"
                          : "bg-muted/10 text-muted-foreground border-muted/20"
                      }
                    >
                      {staff.status === "active" ? "Active" : staff.status === "on-leave" ? "On Leave" : "Inactive"}
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
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Power className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-border">
          <p className="text-sm text-muted-foreground">Showing 1 to 4 of 32 results</p>
        </div>
      </Card>
    </MainLayout>
  );
};

export default Staff;
