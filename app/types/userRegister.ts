export type UserRegister = {
  id: string;
  nickname: string;
  name: string;
  passwordHash: string;
};

export type NewUserRegister = {
  id: string;
  nickname: string;
  name: string;
  passwordHash: string;
  createdAt: string;
  lastLoginAt: string;
  loginHistory: string;
};
