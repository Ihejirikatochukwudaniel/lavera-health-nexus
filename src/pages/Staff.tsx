import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Eye, Edit, Power } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const staffSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  staff_id: z.string().min(3, "Staff ID must be at least 3 characters").max(20),
  role: z.string().min(2, "Role is required").max(100),
  department: z.string().min(2, "Department is required").max(100),
  contact: z.string().min(10, "Contact must be at least 10 characters").max(20),
  email: z.string().email("Invalid email address").max(255),
  address: z.string().max(500).optional(),
  date_of_employment: z.string().optional(),
});

type StaffFormData = z.infer<typeof staffSchema>;

const Staff = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: "",
      staff_id: "",
      role: "",
      department: "",
      contact: "",
      email: "",
      address: "",
      date_of_employment: new Date().toISOString().split('T')[0],
    },
  });

  const checkAdminRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    setIsAdmin(!!data);
  };

  const fetchStaff = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code === 'PGRST301') {
        // No permission - user is not admin
        setStaff([]);
      } else {
        toast({
          title: "Error",
          description: "Failed to load staff",
          variant: "destructive",
        });
      }
    } else {
      setStaff(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAdminRole();
    fetchStaff();
  }, []);

  const onSubmit = async (data: StaffFormData) => {
    const { error } = await supabase.from("staff").insert([{
      name: data.name,
      staff_id: data.staff_id,
      role: data.role,
      department: data.department,
      contact: data.contact,
      email: data.email,
      address: data.address || null,
      date_of_employment: data.date_of_employment || new Date().toISOString().split('T')[0],
      status: 'active',
    }]);

    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add staff",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Staff added successfully",
      });
      setIsDialogOpen(false);
      form.reset();
      fetchStaff();
    }
  };
  return (
    <MainLayout
      title="Staff Management"
      subtitle="Manage staff profiles, roles, and contact information."
      action={
        isAdmin ? (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add New Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter staff name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="staff_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Staff ID</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., HS7321" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Cardiologist, Nurse, Administrator" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Cardiology, Emergency, Administration" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="staff@hospital.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter contact number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date_of_employment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Employment</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? "Adding..." : "Add Staff"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        ) : null
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Loading staff...
                  </td>
                </tr>
              ) : !isAdmin ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Access denied. Only administrators can view staff.
                  </td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No staff found. Add your first staff member to get started.
                  </td>
                </tr>
              ) : (
                staff.map((member) => (
                  <tr key={member.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback>{member.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">#{member.staff_id}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{member.department}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{member.email}</td>
                    <td className="px-6 py-4">
                      <Badge
                        className={
                          member.status === "active"
                            ? "bg-success/10 text-success border-success/20"
                            : member.status === "on-leave"
                            ? "bg-warning/10 text-warning border-warning/20"
                            : "bg-muted/10 text-muted-foreground border-muted/20"
                        }
                      >
                        {member.status === "active" ? "Active" : member.status === "on-leave" ? "On Leave" : "Inactive"}
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {staff.length > 0 && (
          <div className="p-6 border-t border-border">
            <p className="text-sm text-muted-foreground">Showing {staff.length} staff member{staff.length !== 1 ? 's' : ''}</p>
          </div>
        )}
      </Card>
    </MainLayout>
  );
};

export default Staff;
