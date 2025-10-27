export interface User {
  id: string;
  email: string;
  created_at: string;
  profile?: any;
}

export interface IUserRepository {
  /**
   * Get all users with their profiles and business information
   */
  findAllWithProfiles(): Promise<User[]>;
}
