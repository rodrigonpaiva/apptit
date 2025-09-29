import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { HealthResolver } from './graphql/health.resolver';
import { UserResolver } from './graphql/user.resolver';
import { ProductResolver } from './graphql/product.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'apps/api/src/schema.gql'),
      sortSchema: true,
      playground: true,
      installSubscriptionHandlers: false
    }),
  ],
  providers: [HealthResolver, UserResolver, ProductResolver],
})
export class AppModule {}
