import { Query, Resolver } from "@nestjs/graphql";

@Resolver()
export class HealthResolver {
  @Query(() => Boolean)
  health(): boolean {
    return true;
  }
}
