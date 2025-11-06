import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Search, Filter, Eye, Edit } from "lucide-react";
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

const patientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female", "Other"], { required_error: "Please select a gender" }),
  contact: z.string().min(10, "Contact must be at least 10 characters").max(20),
  address: z.string().min(5, "Address must be at least 5 characters").max(500),
  medical_history: z.string().max(2000).optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

const Patients = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      dob: "",
      gender: undefined,
      contact: "",
      address: "",
      medical_history: "",
    },
  });

  const fetchPatients = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive",
      });
    } else {
      setPatients(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const onSubmit = async (data: PatientFormData) => {
    const { error } = await supabase.from("patients").insert([{
      name: data.name,
      dob: data.dob,
      gender: data.gender,
      contact: data.contact,
      address: data.address,
      medical_history: data.medical_history || null,
    }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add patient",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Patient added successfully",
      });
      setIsDialogOpen(false);
      form.reset();
      fetchPatients();
    }
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  return (
    <MainLayout
      title="Patient Management"
      subtitle="View, add, edit, and manage all patient information and records."
      action={
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add New Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
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
                        <Input placeholder="Enter patient name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="medical_history"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical History (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter medical history, allergies, previous conditions..." 
                          {...field} 
                          rows={4}
                        />
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
                    {form.formState.isSubmitting ? "Adding..." : "Add Patient"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">DOB (Age)</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Gender</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Registered</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                    Loading patients...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                    No patients found. Add your first patient to get started.
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-muted-foreground">#{patient.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{patient.name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {patient.dob} ({calculateAge(patient.dob)} yrs)
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{patient.gender}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{patient.contact}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(patient.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className="bg-success/10 text-success border-success/20">
                        Active
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </MainLayout>
  );
};

export default Patients;
