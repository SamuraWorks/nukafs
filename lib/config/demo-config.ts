/**
 * Demo Mode Configuration
 * Controls demo account creation, one-click login, and demo data visibility
 */

export const DEMO_MODE_ENABLED = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export const DEMO_ACCOUNTS = {
  student: {
    id: 'demo_student_001',
    email: 'demo.student@nukafs.org',
    password: 'DemoStudent123!',
    fullName: 'Demo Student',
    phone: '+232 76 000 001',
    role: 'student',
    university: 'Fourah Bay College (USL)',
    course: 'Computer Science',
    status: 'active',
  },
  executive: {
    id: 'demo_exec_001',
    email: 'demo.executive@nukafs.org',
    password: 'DemoExecutive123!',
    fullName: 'Demo Executive',
    phone: '+232 76 000 002',
    role: 'executive',
    title: 'Demo Executive Member',
    status: 'active',
  },
  administrator: {
    id: 'demo_admin_001',
    email: 'demo.admin@nukafs.org',
    password: 'DemoAdmin123!',
    fullName: 'Demo Administrator',
    phone: '+232 76 000 003',
    role: 'executive',
    title: 'Demo Administrator',
    status: 'active',
  },
  stakeholder: {
    id: 'demo_stakeholder_001',
    email: 'demo.stakeholder@nukafs.org',
    password: 'DemoStakeholder123!',
    fullName: 'Demo Stakeholder',
    phone: '+232 76 000 004',
    role: 'stakeholder',
    title: 'Demo Stakeholder Partner',
    status: 'active',
  },
  superAdmin: {
    id: 'demo_super_admin_001',
    email: 'demo.superadmin@nukafs.org',
    password: 'DemoSuperAdmin123!',
    fullName: 'Demo Super Admin',
    phone: '+232 76 000 005',
    role: 'super_admin',
    title: 'Demo Super Administrator',
    status: 'active',
  },
}

export const DEMO_BANNER_TEXT = 'Demo Mode – Sample Data for Presentation Only'
