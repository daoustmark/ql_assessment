import { Types } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  CANDIDATE = 'candidate',
}

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserCreate {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface IUserUpdate {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
  role?: UserRole;
}

export interface ILoginResponse {
  token: string;
  user: IUser;
} 