import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { AuthModule } from "./auth/auth.module";
import { OrdersModule } from "./orders/orders.module";
import { BillingModule } from "./billing/billing.module";
import { AuthResolver } from "./graphql/auth.resolver";
import { HealthResolver } from "./graphql/health.resolver";
import { OrgResolver } from "./graphql/org.resolver";
import { OrdersResolver } from "./graphql/orders.resolver";
import { BillingResolver } from "./graphql/billing.resolver";
import { AuthGuard } from "./auth/auth.guard";
import { APP_GUARD } from "@nestjs/core";
import { DirectiveLocation, GraphQLDirective, GraphQLList, GraphQLString } from "graphql";
import { rolesDirectiveTransformer } from "./graphql/roles.directive";
import { RequestIdMiddleware } from "./auth/request-id.middleware";
import { TenantGuard } from "./auth/tenant.guard";
import { AuthContextService } from "./auth/auth.context";

@Module({
  imports: [
    AuthModule,
    OrdersModule,
    BillingModule,
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
    OrdersResolver,
    BillingResolver,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    TenantGuard,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes("*");
  }
}
