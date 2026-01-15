import { defaultFieldResolver, type GraphQLSchema } from "graphql";
import { getDirective, MapperKind, mapSchema } from "@graphql-tools/utils";
import { ForbiddenException } from "@nestjs/common";
import type { GraphqlContext } from "../auth/auth.context";

export function rolesDirectiveTransformer(
  schema: GraphQLSchema,
  directiveName: string,
): GraphQLSchema {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const directive = getDirective(schema, fieldConfig, directiveName)?.[0];
      if (!directive) {
        return fieldConfig;
      }

      const { resolve = defaultFieldResolver } = fieldConfig;
      const requiredRoles = Array.isArray(directive.requires)
        ? (directive.requires as string[])
        : [];

      fieldConfig.resolve = async function (source, args, context, info) {
        const ctx = context as GraphqlContext | undefined;
        const role = ctx?.session?.role;
        if (!role || (requiredRoles.length > 0 && !requiredRoles.includes(role))) {
          throw new ForbiddenException("Forbidden");
        }
        return resolve(source, args, context, info);
      };

      return fieldConfig;
    },
  });
}
