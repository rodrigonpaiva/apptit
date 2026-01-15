import { Query, Resolver } from "@nestjs/graphql";
import { Public } from "../auth/public.decorator";

@Resolver()
export class HealthResolver {
  @Public()
  @Query(() => Boolean)
  health(): boolean {
    return true;
  }
}
