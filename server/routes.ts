import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEmployeeSchema, insertDeviceSchema, insertAttendanceSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Employee routes
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.get("/api/employees/:id", async (req, res) => {
    try {
      const employee = await storage.getEmployee(req.params.id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employee" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validatedData);
      res.status(201).json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid employee data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  app.put("/api/employees/:id", async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.partial().parse(req.body);
      const employee = await storage.updateEmployee(req.params.id, validatedData);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid employee data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  app.patch("/api/employees/:id", async (req, res) => {
    try {
      const employee = await storage.updateEmployee(req.params.id, req.body);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteEmployee(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  // Device routes
  app.get("/api/devices", async (req, res) => {
    try {
      const devices = await storage.getDevices();
      res.json(devices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch devices" });
    }
  });

  app.get("/api/devices/employee/:employeeId", async (req, res) => {
    try {
      const devices = await storage.getDevicesByEmployee(req.params.employeeId);
      res.json(devices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employee devices" });
    }
  });

  app.post("/api/devices", async (req, res) => {
    try {
      const validatedData = insertDeviceSchema.parse(req.body);
      
      // Check if MAC address already exists
      const existingDevice = await storage.getDeviceByMac(validatedData.macAddress);
      if (existingDevice) {
        return res.status(400).json({ message: "Device with this MAC address already exists" });
      }
      
      const device = await storage.createDevice(validatedData);
      res.status(201).json(device);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid device data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create device" });
    }
  });

  app.put("/api/devices/:id", async (req, res) => {
    try {
      const device = await storage.updateDevice(req.params.id, req.body);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      res.json(device);
    } catch (error) {
      res.status(500).json({ message: "Failed to update device" });
    }
  });

  app.delete("/api/devices/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteDevice(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Device not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete device" });
    }
  });

  // Attendance routes
  app.get("/api/attendance", async (req, res) => {
    try {
      const { date, employeeId, startDate, endDate } = req.query;
      
      let records;
      if (employeeId) {
        records = await storage.getAttendanceByEmployee(
          employeeId as string,
          startDate as string,
          endDate as string
        );
      } else {
        records = await storage.getAttendanceRecords(date as string);
      }
      
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance records" });
    }
  });

  app.get("/api/attendance/today", async (req, res) => {
    try {
      const records = await storage.getTodayAttendance();
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's attendance" });
    }
  });

  app.post("/api/attendance", async (req, res) => {
    try {
      const validatedData = insertAttendanceSchema.parse(req.body);
      const record = await storage.createAttendanceRecord(validatedData);
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid attendance data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create attendance record" });
    }
  });

  app.put("/api/attendance/:id", async (req, res) => {
    try {
      const record = await storage.updateAttendanceRecord(req.params.id, req.body);
      if (!record) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ message: "Failed to update attendance record" });
    }
  });

  // Statistics endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      const todayAttendance = await storage.getTodayAttendance();
      
      const totalEmployees = employees.length;
      const present = todayAttendance.filter(r => r.status === 'present' || r.status === 'late').length;
      const absent = todayAttendance.filter(r => r.status === 'absent').length;
      const late = todayAttendance.filter(r => r.status === 'late').length;
      const attendanceRate = totalEmployees > 0 ? Math.round((present / totalEmployees) * 100) : 0;

      res.json({
        present,
        absent,
        late,
        attendanceRate,
        totalEmployees
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Device connectivity simulation
  app.post("/api/device-connectivity/simulate", async (req, res) => {
    try {
      const devices = await storage.getDevices();
      const today = new Date().toISOString().split('T')[0];
      
      // Simulate random connectivity changes
      for (const device of devices) {
        const shouldConnect = Math.random() > 0.3; // 70% chance to be connected
        
        if (shouldConnect !== device.isConnected) {
          await storage.updateDevice(device.id, {
            isConnected: shouldConnect,
            lastSeen: shouldConnect ? new Date() : device.lastSeen
          });
          
          // Update attendance record
          const attendanceRecords = await storage.getAttendanceByEmployee(device.employeeId, today, today);
          const todayRecord = attendanceRecords.find(r => r.date === today);
          
          if (todayRecord) {
            if (shouldConnect && !todayRecord.checkIn) {
              // Check in
              const now = new Date();
              const isLate = now.getHours() >= 10;
              await storage.updateAttendanceRecord(todayRecord.id, {
                checkIn: now,
                status: isLate ? 'late' : 'present'
              });
            } else if (!shouldConnect && todayRecord.checkIn && !todayRecord.checkOut) {
              // Check out
              await storage.updateAttendanceRecord(todayRecord.id, {
                checkOut: new Date()
              });
            }
          }
        }
      }
      
      res.json({ message: "Device connectivity simulated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to simulate device connectivity" });
    }
  });

  // Export attendance data
  app.get("/api/attendance/export", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const employees = await storage.getEmployees();
      const devices = await storage.getDevices();
      
      let records = await storage.getAttendanceRecords();
      
      if (startDate) {
        records = records.filter(r => r.date >= startDate);
      }
      if (endDate) {
        records = records.filter(r => r.date <= endDate);
      }
      
      const exportData = records.map(record => {
        const employee = employees.find(e => e.id === record.employeeId);
        const device = devices.find(d => d.id === record.deviceId);
        
        return {
          date: record.date,
          employeeName: employee?.name || 'Unknown',
          department: employee?.department || 'Unknown',
          deviceName: device?.deviceName || 'Unknown',
          checkIn: record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '--',
          checkOut: record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '--',
          status: record.status,
        };
      });
      
      res.json(exportData);
    } catch (error) {
      res.status(500).json({ message: "Failed to export attendance data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
