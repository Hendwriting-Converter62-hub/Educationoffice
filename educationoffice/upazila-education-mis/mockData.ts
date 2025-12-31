
import { UserRole, User, School, Upazila, Form, FieldType } from './types';

export const mockUpazilas: Upazila[] = [
  { id: 'upz-1', name: 'সাভার উপজেলা' },
  { id: 'upz-2', name: 'গাজীপুর সদর' },
  { id: 'upz-3', name: 'বান্দরবান সদর' }
];

export const mockSchools: School[] = [
  { id: 'sch-1', name: 'সাভার মডেল সরকারি প্রাথমিক বিদ্যালয়', ipemisCode: '91104020101', upazilaId: 'upz-1' },
  { id: 'sch-2', name: 'বিরুলিয়া সরকারি প্রাথমিক বিদ্যালয়', ipemisCode: '91104020102', upazilaId: 'upz-1' },
  { id: 'sch-3', name: 'গাজীপুর সরকারি প্রাথমিক বিদ্যালয়', ipemisCode: '91105010101', upazilaId: 'upz-2' }
];

export const mockUsers: User[] = [
  { 
    id: 'u-admin-1', 
    name: 'প্রধান এডমিন', 
    email: 'bandarban62@gmail.com', 
    password: 'Admin12@#',
    role: UserRole.ADMIN,
    designation: 'সিস্টেম এডমিনিস্ট্রেটর',
    mobile: '01700000000'
  },
  { 
    id: 'u-1', 
    name: 'ডেমো এডমিন', 
    email: 'admin@edu.gov.bd', 
    password: '123',
    role: UserRole.ADMIN,
    designation: 'সিস্টেম এডমিনিস্ট্রেটর'
  },
  { 
    id: 'u-2', 
    name: 'মোঃ হাফিজুর রহমান', 
    email: 'savar@edu.gov.bd', 
    password: '123',
    role: UserRole.UPAZILA, 
    upazilaId: 'upz-1',
    designation: 'উপজেলা প্রাথমিক শিক্ষা অফিসার',
    division: 'ঢাকা',
    district: 'ঢাকা',
    mobile: '01711223344'
  },
  { 
    id: 'u-3', 
    name: 'মোসাম্মাৎ রহিমা খাতুন', 
    email: 'school1@edu.gov.bd', 
    password: '123',
    role: UserRole.SCHOOL, 
    upazilaId: 'upz-1', 
    schoolId: 'sch-1',
    designation: 'প্রধান শিক্ষক',
    mobile: '01911556677'
  }
];

export const mockForms: Form[] = [
  {
    id: 'f-1',
    title: 'শিক্ষক ও শিক্ষার্থী পরিসংখ্যান - ২০২৪',
    description: '২০২৪ সালের বর্তমান শিক্ষক ও শিক্ষার্থীর সংখ্যা প্রদান করুন।',
    isActive: true,
    createdAt: '2024-01-01',
    deadline: '2024-12-31',
    fields: [
      { id: 'fd-1', label: 'মোট ছাত্র সংখ্যা', type: FieldType.NUMBER, required: true },
      { id: 'fd-2', label: 'মোট ছাত্রী সংখ্যা', type: FieldType.NUMBER, required: true },
      { id: 'fd-3', label: 'মোট শিক্ষক সংখ্যা', type: FieldType.NUMBER, required: true },
      { id: 'fd-4', label: 'ভবনের অবস্থা', type: FieldType.DROPDOWN, options: ['ভালো', 'জরাজীর্ণ', 'পরিত্যক্ত'], required: true }
    ]
  },
  {
    id: 'f-2',
    title: 'জরুরি অবকাঠামো জরিপ',
    description: 'বিদ্যালয়ের অবকাঠামো উন্নয়ন প্রয়োজন কিনা তা জানান।',
    isActive: true,
    createdAt: '2024-02-15',
    fields: [
      { id: 'fd-5', label: 'নতুন ভবনের প্রয়োজন আছে?', type: FieldType.BOOLEAN, required: true },
      { id: 'fd-6', label: 'মন্তব্য', type: FieldType.TEXT, required: false }
    ]
  }
];
