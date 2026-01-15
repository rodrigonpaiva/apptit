import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { AuthModule } from "./auth/auth.module";
import { AuthResolver } from "./graphql/auth.resolver";
import { HealthResolver } from "./graphql/health.resolver";
import { OrgResolver } from "./graphql/org.resolver";
import { AuthContextService } from "./auth/auth.context";

@Module({
  imports: [
    AuthModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [AuthModule],
      inject: [AuthContextService],
      useFactory: (authContext: AuthContextService) => ({
        autoSchemaFile: true,
        context: async ({ req }) => authContext.create(req?.headers ?? {}),
      }),
    }),
  ],
  providers: [AuthResolver, HealthResolver, OrgResolver],
})
export class AppModule {}
