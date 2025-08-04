import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BulkEmployeeImportProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BulkEmployeeImport({ isOpen, onClose }: BulkEmployeeImportProps) {
  const [csvData, setCsvData] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const bulkImportMutation = useMutation({
    mutationFn: async (employees: any[]) => {
      const results = [];
      for (const employee of employees) {
        try {
          const response = await apiRequest("POST", "/api/employees", employee);
          results.push(await response.json());
        } catch (error) {
          throw new Error(`Failed to import ${employee.name}: ${error}`);
        }
      }
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Import Successful",
        description: `Successfully imported ${results.length} employees`,
      });
      setCsvData("");
      setErrors([]);
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import employees",
        variant: "destructive",
      });
    },
  });

  const parseCSV = (csv: string) => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) {
      throw new Error("CSV must have at least a header row and one data row");
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['name', 'email', 'department'];
    
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }

    const employees = [];
    const validationErrors = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length !== headers.length) {
        validationErrors.push(`Row ${i + 1}: Incorrect number of columns`);
        continue;
      }

      const employee: any = {};
      headers.forEach((header, index) => {
        employee[header] = values[index];
      });

      // Basic validation
      if (!employee.name || !employee.email || !employee.department) {
        validationErrors.push(`Row ${i + 1}: Missing required fields`);
        continue;
      }

      if (!employee.email.includes('@')) {
        validationErrors.push(`Row ${i + 1}: Invalid email format`);
        continue;
      }

      employees.push({
        name: employee.name,
        email: employee.email,
        department: employee.department,
      });
    }

    if (validationErrors.length > 0) {
      throw new Error(`Validation errors:\n${validationErrors.join('\n')}`);
    }

    return employees;
  };

  const handleImport = () => {
    try {
      setErrors([]);
      const employees = parseCSV(csvData);
      bulkImportMutation.mutate(employees);
    } catch (error: any) {
      const errorLines = error.message.split('\n');
      setErrors(errorLines);
    }
  };

  const sampleCSV = `name,email,department
John Doe,john.doe@company.com,Engineering
Jane Smith,jane.smith@company.com,Marketing
Bob Johnson,bob.johnson@company.com,Sales`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Bulk Import Employees
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="csvData">CSV Data</Label>
            <Textarea
              id="csvData"
              placeholder="Paste CSV data here..."
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Required columns: name, email, department
            </p>
          </div>

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="whitespace-pre-line">{errors.join('\n')}</div>
              </AlertDescription>
            </Alert>
          )}

          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center mb-2">
              <FileText className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Sample CSV Format</span>
            </div>
            <pre className="text-xs text-gray-600 dark:text-gray-300 font-mono">
              {sampleCSV}
            </pre>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={bulkImportMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={bulkImportMutation.isPending || !csvData.trim()}
            >
              {bulkImportMutation.isPending ? "Importing..." : "Import Employees"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}