export interface IUser {
  name: string;
  email: string;
  phone?: string;
  password: string;
  avatar?: string;
  address?: string;
}

export interface IVerifyEmail {
  email: string;
  oneTimeCode: number;
}

export interface ILogin {
  email: string;
  password: string;
}

export interface IAuthResetPassword {
  newPassword: string;
  confirmPassword: string;
}

export interface IChangePassword {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
