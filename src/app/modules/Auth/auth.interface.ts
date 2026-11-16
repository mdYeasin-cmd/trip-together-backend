export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface IChangePassword {
  oldPassword: string;
  newPassword: string;
}

export interface IResetPassword {
  token: string;
  newPassword: string;
}
