export enum UserRole {
  ADMIN = 'admin',
  CANDIDATE = 'candidate',
}

export interface IUserRole {
  role: UserRole;
  permissions: string[];
}

export const USER_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: [
    'manage_users',
    'manage_tests',
    'view_results',
    'manage_questions',
    'manage_sessions',
  ],
  [UserRole.CANDIDATE]: [
    'take_test',
    'view_own_results',
  ],
}; 