import { PrismaClient } from "@prisma/client";
import { Tokens, User } from "../types";
import jwt, { Secret } from "jsonwebtoken";
import bcryptjs from "bcrypt";
import { Request, Response } from "express";
import { Role } from "../../prisma/generated/client";
import { ApiErrorHandler } from "../../../shared/utils";
const prisma = new PrismaClient();

const generateAuthToken = async (user: Partial<User>): Promise<Tokens> => {
  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET_KEY as Secret,
    {
      expiresIn: `${process.env.JWT_EXPIRE_IN}m`,
    }
  );

  return {
    token: {
      token,
      expires: new Date(
        Date.now() + parseInt(process.env.JWT_EXPIRE_IN!) * 90000
      ).toISOString(),
    },
  };
};
async function hashPassword(password: string) {
  const saltRounds = 10;
  const hashedPassword = await bcryptjs.hash(password, saltRounds);
  return hashedPassword;
}

const register = async (req: Request, res: Response) => {
  const user: User = req.body;

  const existingUser = await prisma.user.findMany({
    where: {
      email: {
        equals: user.email,
      },
    },
  });

  if (existingUser.length > 0) {
    throw new Error("User already exists");
  }

  const hashedPassword = bcryptjs.hashSync(user.password, 10);

  const newUser = await prisma.user.create({
    data: {
      name: user.name,
      email: user.email,
      password: hashedPassword,
      ...(user.roleId && { roleId: user.roleId }),
    },
  });

  const token = await generateAuthToken(newUser);

  res.status(201).json({
    newUser: newUser,
    token,
  });
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findFirst({
    where: { email: email.toLocaleLowerCase() },
  });
  if (!user) {
    throw new ApiErrorHandler({ message: "Invalid credentials!!", code: 401 });
  }
  const isPasswordValid = await bcryptjs.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiErrorHandler({ message: "Invalid credentials!", code: 401 });
  }

  const token = await generateAuthToken(user);
  return res.status(200).json({
    user,
    token,
  });
};

const logout = async (req: Request, res: Response) => {
  return res.status(200).json({
    message: "Logged out successfully!",
  });
};

export default {
  login,
  register,
  logout,
};
