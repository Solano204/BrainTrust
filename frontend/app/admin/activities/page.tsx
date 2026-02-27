// ============================================================
// FILE: app/admin/role-activities/page.tsx
// Next.js App Router page — Role Activities
// ============================================================

import ActivityManager from '@/components/admin/AdminActivitymanager';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Role Activities | Admin',
  description: 'Manage permissions and activities assigned to roles',
};

export default function RoleActivitiesPage() {
  return <ActivityManager />;
}