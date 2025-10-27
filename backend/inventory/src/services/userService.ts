import { IUserRepository } from '../repositories/IUserRepository';

export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async getUsers() {
    const users = await this.userRepository.findAllWithProfiles();
    return { users };
  }
}
