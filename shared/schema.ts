import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  department: text("department").notNull(),
  isActive: boolean("is_active").default(true),
  workSchedule: jsonb("work_schedule").$type<{
    monday?: { enabled: boolean; startTime: string; endTime: string };
    tuesday?: { enabled: boolean; startTime: string; endTime: string };
    wednesday?: { enabled: boolean; startTime: string; endTime: string };
    thursday?: { enabled: boolean; startTime: string; endTime: string };
    friday?: { enabled: boolean; startTime: string; endTime: string };
    saturday?: { enabled: boolean; startTime: string; endTime: string };
    sunday?: { enabled: boolean; startTime: string; endTime: string };
  }>().default({
    monday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    tuesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    wednesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    thursday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    friday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    saturday: { enabled: false, startTime: "09:00", endTime: "17:00" },
    sunday: { enabled: false, startTime: "09:00", endTime: "17:00" }
  }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const devices = pgTable("devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  deviceName: text("device_name").notNull(),
  macAddress: text("mac_address").notNull().unique(),
  isConnected: boolean("is_connected").default(false),
  lastSeen: timestamp("last_seen"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attendanceRecords = pgTable("attendance_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  deviceId: varchar("device_id").notNull().references(() => devices.id),
  checkIn: timestamp("check_in"),
  checkOut: timestamp("check_out"),
  date: text("date").notNull(), // Format: YYYY-MM-DD
  status: text("status").notNull(), // 'present', 'absent', 'late'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
});

// Work schedule types
export const workScheduleDaySchema = z.object({
  enabled: z.boolean(),
  startTime: z.string(),
  endTime: z.string(),
});

export const workScheduleSchema = z.object({
  monday: workScheduleDaySchema.optional(),
  tuesday: workScheduleDaySchema.optional(),
  wednesday: workScheduleDaySchema.optional(),
  thursday: workScheduleDaySchema.optional(),
  friday: workScheduleDaySchema.optional(),
  saturday: workScheduleDaySchema.optional(),
  sunday: workScheduleDaySchema.optional(),
});

export const insertDeviceSchema = createInsertSchema(devices).omit({
  id: true,
  isConnected: true,
  lastSeen: true,
  createdAt: true,
});

export const insertAttendanceSchema = createInsertSchema(attendanceRecords).omit({
  id: true,
  createdAt: true,
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Device = typeof devices.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
