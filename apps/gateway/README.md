# Gateway Auth Flow

This gateway uses NestJS GraphQL (Apollo) to provide a single entry point for
clients, then validates user sessions via the Auth microservice over Redis RPC.

## Flow

1) GraphQL request hits `/graphql`.
2) `AuthContextService` extracts `cookie` and `authorization` headers.
3) Gateway calls `AUTH_VALIDATE_SESSION` on Auth service.
4) On success, `session` is attached to the GraphQL context.
5) Resolvers can use `ctx.session` for authorization decisions.

## Notes

- All cross-service auth goes through RPC patterns in `@apptit/contracts`.
- Keep HTTP in Auth minimal; GraphQL is the client-facing gateway.

## Example queries

```graphql
query Health {
  health
}
```

```graphql
query Me {
  me {
    userId
    tenantId
    role
  }
}
```

```graphql
query Organizations {
  organizations {
    id
    name
    slug
    logo
  }
}
```

```graphql
query ActiveOrganization {
  activeOrganization {
    id
    name
    slug
    logo
  }
}
```

```graphql
query OrganizationMembers {
  organizationMembers(input: { organizationId: "org-id" }) {
    total
    members {
      id
      userId
      role
    }
  }
}
```

```graphql
mutation SetActiveOrg {
  setActiveOrganization(input: { organizationId: "org-id" }) {
    activeOrganizationId
  }
}
```

```graphql
mutation InviteMember {
  inviteMember(
    input: { email: "user@example.com", role: ["member"], organizationId: "org-id" }
  ) {
    invitationId
  }
}
```

```graphql
mutation AcceptInvite {
  acceptInvite(invitationId: "invitation-id") {
    status
  }
}
```

```graphql
mutation RejectInvite {
  rejectInvite(invitationId: "invitation-id") {
    status
  }
}
```

```graphql
mutation UpdateMemberRole {
  updateMemberRole(input: { memberId: "member-id", role: ["admin"], organizationId: "org-id" }) {
    memberId
  }
}
```

```graphql
mutation LeaveOrganization {
  leaveOrganization(organizationId: "org-id") {
    left
  }
}
```
