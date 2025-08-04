import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Calendar, Save } from "lucide-react";
import type { Employee } from "@shared/schema";

interface EmployeeScheduleFormProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

const scheduleSchema = z.object({
  monday: z.object({
    enabled: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
  }),
  tuesday: z.object({
    enabled: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
  }),
  wednesday: z.object({
    enabled: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
  }),
  thursday: z.object({
    enabled: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
  }),
  friday: z.object({
    enabled: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
  }),
  saturday: z.object({
    enabled: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
  }),
  sunday: z.object({
    enabled: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
  }),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

const defaultSchedule: ScheduleFormData = {
  monday: { enabled: true, startTime: "09:00", endTime: "17:00" },
  tuesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
  wednesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
  thursday: { enabled: true, startTime: "09:00", endTime: "17:00" },
  friday: { enabled: true, startTime: "09:00", endTime: "17:00" },
  saturday: { enabled: false, startTime: "09:00", endTime: "17:00" },
  sunday: { enabled: false, startTime: "09:00", endTime: "17:00" },
};

const daysOfWeek = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const;

export default function EmployeeScheduleForm({ isOpen, onClose, employee }: EmployeeScheduleFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, setValue, reset, formState } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: employee?.workSchedule || defaultSchedule,
  });

  // Reset form when employee changes
  useEffect(() => {
    if (employee?.workSchedule) {
      reset(employee.workSchedule);
    } else {
      reset(defaultSchedule);
    }
  }, [employee, reset]);

  const updateScheduleMutation = useMutation({
    mutationFn: async (scheduleData: ScheduleFormData) => {
      if (!employee) throw new Error("No employee selected");
      
      const response = await apiRequest("PATCH", `/api/employees/${employee.id}`, {
        workSchedule: scheduleData,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "Success",
        description: "Work schedule saved successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save schedule",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ScheduleFormData) => {
    // Validate that enabled days have proper start/end times
    const validatedData = { ...data };
    let hasError = false;
    
    Object.keys(validatedData).forEach(day => {
      const dayData = validatedData[day as keyof ScheduleFormData];
      if (dayData?.enabled) {
        // Ensure start time is before end time
        if (dayData.startTime >= dayData.endTime) {
          toast({
            title: "Invalid Schedule",
            description: `${day.charAt(0).toUpperCase() + day.slice(1)}: Start time must be before end time`,
            variant: "destructive",
          });
          hasError = true;
        }
      }
    });

    if (!hasError) {
      updateScheduleMutation.mutate(validatedData);
    }
  };

  const applyToAllDays = (dayData: { enabled: boolean; startTime: string; endTime: string }) => {
    daysOfWeek.forEach(({ key }) => {
      setValue(`${key}.enabled`, dayData.enabled);
      setValue(`${key}.startTime`, dayData.startTime);
      setValue(`${key}.endTime`, dayData.endTime);
    });
  };

  const setStandardSchedule = () => {
    applyToAllDays({ enabled: true, startTime: "09:00", endTime: "17:00" });
    // Disable weekends
    setValue("saturday.enabled", false);
    setValue("sunday.enabled", false);
  };

  const setFlexibleSchedule = () => {
    applyToAllDays({ enabled: true, startTime: "08:00", endTime: "16:00" });
    setValue("saturday.enabled", false);
    setValue("sunday.enabled", false);
  };

  const calculateWeeklyHours = (schedule: ScheduleFormData) => {
    let totalHours = 0;
    Object.values(schedule).forEach((day) => {
      if (day?.enabled && day.startTime && day.endTime) {
        const start = new Date(`2000-01-01T${day.startTime}:00`);
        const end = new Date(`2000-01-01T${day.endTime}:00`);
        const diffMs = end.getTime() - start.getTime();
        const hours = diffMs / (1000 * 60 * 60);
        if (hours > 0) totalHours += hours;
      }
    });
    return totalHours.toFixed(1);
  };

  const watchedValues = watch();
  const hasUnsavedChanges = formState.isDirty;

  if (!employee) return null;

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open && hasUnsavedChanges) {
          if (confirm("You have unsaved changes. Are you sure you want to close?")) {
            onClose();
          }
        } else {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Work Schedule - {employee.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Quick Schedule Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={setStandardSchedule}
                >
                  Standard (9-5, Mon-Fri)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={setFlexibleSchedule}
                >
                  Flexible (8-4, Mon-Fri)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => reset(defaultSchedule)}
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Daily Schedule Configuration */}
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {daysOfWeek.map(({ key, label }) => (
              <Card key={key}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={watchedValues[key]?.enabled || false}
                        onCheckedChange={(checked) => setValue(`${key}.enabled`, checked)}
                      />
                      <Label className="font-medium">{label}</Label>
                    </div>
                    
                    {watchedValues[key]?.enabled && (
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-gray-500" />
                          <Input
                            type="time"
                            className="w-20"
                            {...register(`${key}.startTime`)}
                          />
                        </div>
                        <span className="text-gray-500">to</span>
                        <Input
                          type="time"
                          className="w-20"
                          {...register(`${key}.endTime`)}
                        />
                      </div>
                    )}
                  </div>
                  
                  {!watchedValues[key]?.enabled && (
                    <p className="text-xs text-gray-500 mt-1">Day off</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Schedule Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Schedule Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">Working Days:</span>{" "}
                  {daysOfWeek.filter(({ key }) => watchedValues[key]?.enabled).length} days/week
                </p>
                <p>
                  <span className="font-medium">Days Off:</span>{" "}
                  {daysOfWeek
                    .filter(({ key }) => !watchedValues[key]?.enabled)
                    .map(({ label }) => label)
                    .join(", ") || "None"}
                </p>
                <p>
                  <span className="font-medium">Total Hours/Week:</span>{" "}
                  {calculateWeeklyHours(watchedValues)} hours
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {hasUnsavedChanges && (
                <span className="text-orange-600">● Unsaved changes</span>
              )}
            </div>
            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  if (hasUnsavedChanges && !confirm("You have unsaved changes. Are you sure you want to cancel?")) {
                    return;
                  }
                  onClose();
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateScheduleMutation.isPending || !hasUnsavedChanges}
                className="flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateScheduleMutation.isPending ? "Saving..." : "Save Schedule"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}