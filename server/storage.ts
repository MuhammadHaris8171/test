import { type Employee, type InsertEmployee, type Device, type InsertDevice, type AttendanceRecord, type InsertAttendance, employees, devices, attendanceRecords } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface IStorage {
  // Employee methods
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | undefined>;
  deleteEmployee(id: string): Promise<boolean>;

  // Device methods
  getDevices(): Promise<Device[]>;
  getDevicesByEmployee(employeeId: string): Promise<Device[]>;
  getDevice(id: string): Promise<Device | undefined>;
  getDeviceByMac(macAddress: string): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDevice(id: string, updates: Partial<Device>): Promise<Device | undefined>;
  deleteDevice(id: string): Promise<boolean>;

  // Attendance methods
  getAttendanceRecords(date?: string): Promise<AttendanceRecord[]>;
  getAttendanceByEmployee(employeeId: string, startDate?: string, endDate?: string): Promise<AttendanceRecord[]>;
  createAttendanceRecord(record: InsertAttendance): Promise<AttendanceRecord>;
  updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord | undefined>;
  getTodayAttendance(): Promise<AttendanceRecord[]>;
}

export class DatabaseStorage implements IStorage {
  async initializeSampleData() {
    // Create sample employees
    const sampleEmployees = [
      { name: "John Smith", email: "john.smith@company.com", department: "Engineering" },
      { name: "Emily Martinez", email: "emily.martinez@company.com", department: "Marketing" },
      { name: "Michael Johnson", email: "michael.johnson@company.com", department: "Sales" },
      { name: "Sarah Chen", email: "sarah.chen@company.com", department: "Design" },
      { name: "David Wilson", email: "david.wilson@company.com", department: "Engineering" },
    ];

    // Check if employees already exist
    const existingEmployees = await db.select().from(employees).limit(1);
    if (existingEmployees.length > 0) return;

    // Insert sample employees
    const insertedEmployees = await db.insert(employees).values(
      sampleEmployees.map(emp => ({
        ...emp,
        isActive: true,
        workSchedule: {
          monday: { enabled: true, startTime: "09:00", endTime: "17:00" },
          tuesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
          wednesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
          thursday: { enabled: true, startTime: "09:00", endTime: "17:00" },
          friday: { enabled: true, startTime: "09:00", endTime: "17:00" },
          saturday: { enabled: false, startTime: "09:00", endTime: "17:00" },
          sunday: { enabled: false, startTime: "09:00", endTime: "17:00" }
        },
      }))
    ).returning();

    // Create sample devices and attendance
    const today = new Date().toISOString().split('T')[0];
    
    for (let index = 0; index < insertedEmployees.length; index++) {
      const employee = insertedEmployees[index];
      const deviceTypes = ["iPhone", "MacBook", "iPad"];
      const isConnected = Math.random() > 0.3;
      
      const [device] = await db.insert(devices).values({
        employeeId: employee.id,
        deviceName: `${deviceTypes[index % deviceTypes.length]} ${index + 1}`,
        macAddress: `00:1B:63:84:45:${(index + 10).toString(16).toUpperCase().padStart(2, '0')}`,
        isConnected,
        lastSeen: new Date(),
      }).returning();

      // Create attendance record
      await db.insert(attendanceRecords).values({
        employeeId: employee.id,
        deviceId: device.id,
        checkIn: isConnected ? new Date(Date.now() - Math.random() * 8 * 60 * 60 * 1000) : null,
        checkOut: isConnected && Math.random() > 0.7 ? new Date() : null,
        date: today,
        status: isConnected ? (Math.random() > 0.8 ? "late" : "present") : "absent",
      });
    }
  }

  // Employee methods
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees).orderBy(desc(employees.createdAt));
  }

  async getEmployee(id: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const employeeWithSchedule = {
      ...employee,
      workSchedule: employee.workSchedule || {
        monday: { enabled: true, startTime: "09:00", endTime: "17:00" },
        tuesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
        wednesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
        thursday: { enabled: true, startTime: "09:00", endTime: "17:00" },
        friday: { enabled: true, startTime: "09:00", endTime: "17:00" },
        saturday: { enabled: false, startTime: "09:00", endTime: "17:00" },
        sunday: { enabled: false, startTime: "09:00", endTime: "17:00" }
      }
    };
    const [newEmployee] = await db.insert(employees).values(employeeWithSchedule).returning();
    return newEmployee;
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | undefined> {
    const [updatedEmployee] = await db.update(employees).set(updates).where(eq(employees.id, id)).returning();
    return updatedEmployee;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    const result = await db.delete(employees).where(eq(employees.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Device methods
  async getDevices(): Promise<Device[]> {
    return await db.select().from(devices).orderBy(desc(devices.createdAt));
  }

  async getDevicesByEmployee(employeeId: string): Promise<Device[]> {
    return await db.select().from(devices).where(eq(devices.employeeId, employeeId));
  }

  async getDevice(id: string): Promise<Device | undefined> {
    const [device] = await db.select().from(devices).where(eq(devices.id, id));
    return device;
  }

  async getDeviceByMac(macAddress: string): Promise<Device | undefined> {
    const [device] = await db.select().from(devices).where(eq(devices.macAddress, macAddress));
    return device;
  }

  async createDevice(device: InsertDevice): Promise<Device> {
    const [newDevice] = await db.insert(devices).values(device).returning();
    return newDevice;
  }

  async updateDevice(id: string, updates: Partial<Device>): Promise<Device | undefined> {
    const [updatedDevice] = await db.update(devices).set(updates).where(eq(devices.id, id)).returning();
    return updatedDevice;
  }

  async deleteDevice(id: string): Promise<boolean> {
    const result = await db.delete(devices).where(eq(devices.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Attendance methods
  async getAttendanceRecords(date?: string): Promise<AttendanceRecord[]> {
    if (date) {
      return await db.select().from(attendanceRecords).where(eq(attendanceRecords.date, date)).orderBy(desc(attendanceRecords.createdAt));
    }
    return await db.select().from(attendanceRecords).orderBy(desc(attendanceRecords.createdAt));
  }

  async getAttendanceByEmployee(employeeId: string, startDate?: string, endDate?: string): Promise<AttendanceRecord[]> {
    let query = db.select().from(attendanceRecords).where(eq(attendanceRecords.employeeId, employeeId));
    
    if (startDate && endDate) {
      query = query.where(and(
        eq(attendanceRecords.employeeId, employeeId),
        gte(attendanceRecords.date, startDate),
        lte(attendanceRecords.date, endDate)
      ));
    }
    
    return await query.orderBy(desc(attendanceRecords.date));
  }

  async createAttendanceRecord(record: InsertAttendance): Promise<AttendanceRecord> {
    const [newRecord] = await db.insert(attendanceRecords).values(record).returning();
    return newRecord;
  }

  async updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord | undefined> {
    const [updatedRecord] = await db.update(attendanceRecords).set(updates).where(eq(attendanceRecords.id, id)).returning();
    return updatedRecord;
  }

  async getTodayAttendance(): Promise<AttendanceRecord[]> {
    const today = new Date().toISOString().split('T')[0];
    return await db.select().from(attendanceRecords).where(eq(attendanceRecords.date, today));
  }
}

export const storage = new DatabaseStorage();