import { prisma } from "~/utils/prisma.server";
import type { SignupForm, EditProfileForm } from "./types.server";
import bcrypt from "bcryptjs";

export const createUser = async (user: SignupForm) => {
  try {
    const saltRounds = Number(process.env.PW_HASH) || 10;

    let hashedPassword;
    try {
      const salt = await bcrypt.genSalt(saltRounds);
      hashedPassword = await bcrypt.hash(user.password, salt);
    } catch (bcryptError) {
      console.error("Error in bcrypt operations:", bcryptError);
      throw new Error("Failed to hash password");
    }
    const usernameExists = await prisma.user.findUnique({
      where: { username: user.username },
    });
    if (usernameExists) {
      console.log("Username already exists");
      throw new Error("Username already exists.");
    }

    const emailExists = await prisma.user.findUnique({
      where: { email: user.email },
    });
    if (emailExists) {
      console.log("Email already exists");
      throw new Error("Email already exists.");
    }

    const newUser = await prisma.user.create({
      data: {
        username: user.username,
        email: user.email,
        password: hashedPassword,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...sanitizedUserInfo } = newUser;
    return sanitizedUserInfo;
  } catch (error) {
    console.error("Error in createUser:", error);
    throw error;
  }
};

export const editProfileDetails = async (
  userId: string,
  user: EditProfileForm
) => {
  try {
    const userExists = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    console.log(userExists);

    if (!userExists) {
      throw new Error("User does not exists");
    }
    const passwordMatch = await bcrypt.compare(
      user.password,
      userExists.password
    );
    console.log(passwordMatch);

    if (!passwordMatch) {
      return { error: "Incorrect Password" };
    }
    const saltRounds = Number(process.env.PW_HASH) || 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const newPasswordHashed = user.newPassword
      ? await bcrypt.hash(user.newPassword, salt)
      : undefined;
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        username: user.username || userExists.username,
        email: user.email || userExists.email,
        firstName: user.firstName || userExists.firstName,
        lastName: user.lastName || userExists.lastName,
        password: newPasswordHashed || userExists.password,
        updatedAt: new Date(),
      },
    });
    return { user: updatedUser };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
