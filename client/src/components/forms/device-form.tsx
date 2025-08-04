import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertDeviceSchema, type InsertDevice, type Employee } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DeviceFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeviceForm({ isOpen, onClose }: DeviceFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const form = useForm<InsertDevice>({
    resolver: zodResolver(insertDeviceSchema),
    defaultValues: {
      employeeId: "",
      deviceName: "",
      macAddress: "",
    },
  });

  const createDeviceMutation = useMutation({
    mutationFn: async (data: InsertDevice) => {
      const response = await apiRequest("POST", "/api/devices", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({
        title: "Success",
        description: "Device registered successfully",
      });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to register device",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertDevice) => {
    createDeviceMutation.mutate(data);
  };

  const formatMacAddress = (value: string) => {
    // Remove all non-hex characters
    const hex = value.replace(/[^a-fA-F0-9]/g, '');
    // Add colons every 2 characters
    const formatted = hex.match(/.{1,2}/g)?.join(':').toUpperCase() || '';
    return formatted.substring(0, 17); // Limit to MAC address length
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register New Device</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an employee..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} - {employee.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deviceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John's iPhone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="macAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MAC Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="XX:XX:XX:XX:XX:XX"
                      className="font-mono"
                      {...field}
                      onChange={(e) => {
                        const formatted = formatMacAddress(e.target.value);
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <p className="text-xs text-gray-500 mt-1">
                    Device MAC address for identification
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createDeviceMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createDeviceMutation.isPending}
              >
                {createDeviceMutation.isPending ? "Registering..." : "Register Device"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
