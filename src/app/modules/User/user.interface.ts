export interface IUserData {
  name: string;
  email: string;
  password: string;
  profile: IProfile;
}

export interface IProfile {
  userId: string;
  bio: string;
  age: number;
}
