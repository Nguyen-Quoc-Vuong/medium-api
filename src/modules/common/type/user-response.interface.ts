export interface UserResponse {
  email: string;
  username: string;
  bio?: string | null;
  image?: string | null;
  token: string;
}

export interface UserResponseData {
  user: UserResponse;
}
