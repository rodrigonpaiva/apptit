import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { AuthModule } from "./auth/auth.module";
import { AuthResolver } from "./graphql/auth.resolver";
import { HealthResolver } from "./graphql/health.resolver";
import { OrgResolver } from "./graphql/org.resolver";
import { AuthGuard } from "./auth/auth.guard";
import { APP_GUARD } from "@nestjs/core";
import { DirectiveLocation, GraphQLDirective, GraphQLList, GraphQLString } from "graphql";
import { rolesDirectiveTransformer } from "./graphql/roles.directive";
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
        transformSchema: (schema) =>
          rolesDirectiveTransformer(schema, "roles"),
        buildSchemaOptions: {
          directives: [
            new GraphQLDirective({
              name: "roles",
              locations: [DirectiveLocation.FIELD_DEFINITION],
              args: {
                requires: {
                  type: new GraphQLList(GraphQLString),
                },
              },
            }),
          ],
        },
      }),
    }),
  ],
  providers: [
    AuthResolver,
    HealthResolver,
    OrgResolver,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
