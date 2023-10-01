export interface User {
  id: string;
  email: string;
  password: string;
  roleId: number;
  name: string;
  role: Roles;
}

export interface Roles {
  id: number;
  label: string;
}

export type RegisterType = Pick<User, "email" | "name" | "password" | "role">;

export interface Token {
  token: string;
  expires: Date | string;
}

export interface Tokens {
  token: Token;
}
