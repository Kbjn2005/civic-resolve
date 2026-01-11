
export enum UserRole {
  CITIZEN = 'citizen',
  OFFICIAL = 'official'
}

export enum OfficialType {
  AUTHORITY = 'Authority',
  WATER = 'Water',
  ROADS = 'Roads',
  ELECTRICITY = 'Electricity',
  SANITATION = 'Sanitation'
}

export enum ComplaintStatus {
  SUBMITTED = 'Submitted',
  CLASSIFIED = 'Department Assigned',
  ACCEPTED = 'Accepted & Teams Allocated',
  EN_ROUTE = 'Teams Sent to Location',
  ONGOING = 'Process Ongoing',
  RESOLVED = 'Resolved'
}

export enum TaskStatus {
  ASSIGNED = 'Assigned',
  STARTED = 'Started',
  BLOCKED = 'Blocked',
  COMPLETED = 'Completed'
}

export interface CitizenProfile {
  fullName: string;
  dob: string;
  mobile: string;
  address: string;
  district: string;
  aadhar: string;
}

export interface User {
  id: string; // This will be the mobile number for citizens
  role: UserRole;
  officialType?: OfficialType;
  profile?: CitizenProfile;
}

export interface Complaint {
  id: string; // Unique Complaint ID (e.g., CMP-1712345678)
  citizenId: string; // Links to user.id (mobile)
  citizenName: string;
  citizenMobile: string;
  title: string;
  description: string;
  location: string;
  status: ComplaintStatus;
  createdAt: number;
  updatedAt: number;
  department?: OfficialType;
  aiSummary?: string;
  history: { status: ComplaintStatus; timestamp: number }[];
  media?: {
    images: string[];
    audio?: string;
  };
}

export interface Task {
  id: string;
  complaintId: string;
  department: OfficialType;
  status: TaskStatus;
  slaDeadline: number;
  blockReason?: string;
}

export interface Escalation {
  id: string;
  taskId: string;
  complaintId: string;
  reason: string;
  resolved: boolean;
  createdAt: number;
}
