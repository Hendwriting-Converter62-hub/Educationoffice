
export enum UserRole {
  ADMIN = 'ADMIN',
  UPAZILA = 'UPAZILA',
  SCHOOL = 'SCHOOL'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Added for security
  role: UserRole;
  designation?: string; // Professional title
  mobile?: string;      // Contact number
  division?: string;    // Administrative Division
  district?: string;    // Administrative District
  upazilaId?: string;
  schoolId?: string;
}

export interface School {
  id: string;
  name: string;
  ipemisCode: string; // Replaced EIIN
  upazilaId: string;
}

export interface Upazila {
  id: string;
  name: string;
}

export enum FieldType {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA', // Added for long comments
  NUMBER = 'NUMBER',
  DROPDOWN = 'DROPDOWN',
  MULTI_SELECT = 'MULTI_SELECT',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  TABLE = 'TABLE',
  FILE = 'FILE' // Added for attachments/images
}

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  options?: string[]; // For dropdowns and multi-select
  required: boolean;
  subFields?: FormField[]; // Used for TABLE type to define columns
  rowLabels?: string[];    // Used for TABLE type to define fixed rows (Matrix)
}

export interface Form {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  isActive: boolean;
  createdAt: string;
  deadline?: string;
  upazilaId?: string; // Optional: if empty, it's a global/admin form
}

export enum SubmissionStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  LOCKED = 'LOCKED'
}

export interface Submission {
  id: string;
  formId: string;
  schoolId: string;
  data: Record<string, any>;
  status: SubmissionStatus;
  submittedAt: string;
  updatedAt: string;
}
