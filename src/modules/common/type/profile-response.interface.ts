export interface ProfileResponse {
  username: string
  bio: string | null
  image: string | null
  following: boolean
}

export interface ProfileResponseData {
  profile: ProfileResponse
}
