export interface ProjectType {
  id: string;
  title: string;
  description: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SignupForm {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserForm {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface EditProfileForm {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  password: string;
  newPassword?: string;
}

export interface CreateProjectForm {
  userId: string;
  title: string;
  description?: string;
}
