import { Query, Resolver } from '@nestjs/graphql';
import { User } from './types/user.type';

@Resolver(() => User)
export class UserResolver {
  @Query(() => User, { nullable: true })
  me(): User | null {
    // TODO: remplacer par auth context
    return { id: 'u_1', email: 'chef@apptit.io', name: 'Chef', role: 'CHEF' };
    // return null si non connecté
  }
}
