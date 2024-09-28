import { SignupForm, LoginForm, EditProfileForm } from "./types.server";

interface SignupformError {
  email?: string;
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

interface LoginformError {
  email?: string;
  password?: string;
}

interface EditProfileFormErrors {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  newPassword?: string;
}

export const validateSignUpForm = async (user: SignupForm) => {
  const errors: SignupformError = {};
  const emailregex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  if (!user.email || !emailregex.test(user.email)) {
    errors.email = "Invalid email address.";
  }
  if (user.username.length < 3) {
    errors.username = "Username should be atleast 3 characters long";
  }
  if (user.password.length < 5) {
    errors.password = "Password should be atleast 5 characters long.";
  }
  if (user.firstName.length < 3) {
    errors.firstName = "First name should be atleast 3 characters long";
  }
  if (user.lastName.length < 3) {
    errors.lastName = "Last name should be atleast 3 characters long";
  }
  if (Object.keys(errors).length <= 0) {
    return false;
  }
  return errors;
};

export const validateLoginForm = async (user: LoginForm) => {
  const errors: LoginformError = {};
  const emailregex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  if (!user.email || !emailregex.test(user.email)) {
    errors.email = "Invalid email address.";
  }
  if (user.password.length < 5) {
    errors.password = "Password should be atleast 5 characters long.";
  }
  if (Object.keys(errors).length <= 0) {
    return false;
  }
  return errors;
};

export const validateEditProfileForm = async (user: EditProfileForm) => {
  const errors: EditProfileFormErrors = {};
  const emailregex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  if (!user.email || !emailregex.test(user.email)) {
    errors.email = "Invalid email address.";
  }
  if (!user.username || user.username.length < 3) {
    errors.username = "Username should be atleast 3 characters long";
  }
  if (!user.firstName || user.firstName.length < 3) {
    errors.firstName = "First name should be atleast 3 characters long";
  }
  if (!user.lastName || user.lastName.length < 3) {
    errors.lastName = "Last name should be atleast 3 characters long";
  }
  if (user.password.length < 5) {
    errors.password = "Password should be atleast 5 characters long.";
  }
  if (!user.newPassword || user.newPassword?.length < 5) {
    errors.newPassword = "Password should be atleast 5 characters long.";
  }
  if (Object.keys(errors).length <= 0) {
    return false;
  }
  return errors;
};
