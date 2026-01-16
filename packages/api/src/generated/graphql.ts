import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type ActiveOrgResultType = {
  readonly __typename?: 'ActiveOrgResultType';
  readonly activeOrganizationId: Maybe<Scalars['String']['output']>;
};

export type BillingGetInput = {
  readonly invoiceId: Scalars['String']['input'];
  readonly tenantId: InputMaybe<Scalars['String']['input']>;
};

export type BillingListInput = {
  readonly limit: InputMaybe<Scalars['Float']['input']>;
  readonly offset: InputMaybe<Scalars['Float']['input']>;
  readonly tenantId: InputMaybe<Scalars['String']['input']>;
};

export type InvitationResultType = {
  readonly __typename?: 'InvitationResultType';
  readonly invitationId: Scalars['String']['output'];
};

export type InviteMemberInput = {
  readonly email: Scalars['String']['input'];
  readonly organizationId: InputMaybe<Scalars['String']['input']>;
  readonly role: ReadonlyArray<Scalars['String']['input']>;
};

export type InvoiceConnectionType = {
  readonly __typename?: 'InvoiceConnectionType';
  readonly invoices: ReadonlyArray<InvoiceSummaryType>;
  readonly total: Maybe<Scalars['Float']['output']>;
};

export type InvoiceSummaryType = {
  readonly __typename?: 'InvoiceSummaryType';
  readonly amount: Scalars['Float']['output'];
  readonly currency: Scalars['String']['output'];
  readonly dueAt: Maybe<Scalars['String']['output']>;
  readonly id: Scalars['String']['output'];
  readonly issuedAt: Scalars['String']['output'];
  readonly number: Scalars['String']['output'];
  readonly status: Scalars['String']['output'];
};

export type LeaveOrgResultType = {
  readonly __typename?: 'LeaveOrgResultType';
  readonly left: Scalars['Boolean']['output'];
};

export type MemberConnectionType = {
  readonly __typename?: 'MemberConnectionType';
  readonly members: ReadonlyArray<MemberType>;
  readonly total: Maybe<Scalars['Float']['output']>;
};

export type MemberType = {
  readonly __typename?: 'MemberType';
  readonly id: Scalars['String']['output'];
  readonly role: Scalars['String']['output'];
  readonly userId: Scalars['String']['output'];
};

export type MemberUpdateResultType = {
  readonly __typename?: 'MemberUpdateResultType';
  readonly memberId: Scalars['String']['output'];
};

export type Mutation = {
  readonly __typename?: 'Mutation';
  readonly acceptInvite: MutationStatusType;
  readonly inviteMember: InvitationResultType;
  readonly leaveOrganization: LeaveOrgResultType;
  readonly rejectInvite: MutationStatusType;
  readonly setActiveOrganization: ActiveOrgResultType;
  readonly updateMemberRole: MemberUpdateResultType;
};


export type MutationAcceptInviteArgs = {
  invitationId: Scalars['String']['input'];
};


export type MutationInviteMemberArgs = {
  input: InviteMemberInput;
};


export type MutationLeaveOrganizationArgs = {
  organizationId: Scalars['String']['input'];
};


export type MutationRejectInviteArgs = {
  invitationId: Scalars['String']['input'];
};


export type MutationSetActiveOrganizationArgs = {
  input: SetActiveOrgInput;
};


export type MutationUpdateMemberRoleArgs = {
  input: UpdateMemberRoleInput;
};

export type MutationStatusType = {
  readonly __typename?: 'MutationStatusType';
  readonly status: Scalars['String']['output'];
};

export type OrderConnectionType = {
  readonly __typename?: 'OrderConnectionType';
  readonly orders: ReadonlyArray<OrderSummaryType>;
  readonly total: Maybe<Scalars['Float']['output']>;
};

export type OrderGetInput = {
  readonly orderId: Scalars['String']['input'];
  readonly tenantId: InputMaybe<Scalars['String']['input']>;
};

export type OrderSummaryType = {
  readonly __typename?: 'OrderSummaryType';
  readonly createdAt: Scalars['String']['output'];
  readonly currency: Scalars['String']['output'];
  readonly id: Scalars['String']['output'];
  readonly number: Scalars['String']['output'];
  readonly status: Scalars['String']['output'];
  readonly total: Scalars['Float']['output'];
};

export type OrdersListInput = {
  readonly limit: InputMaybe<Scalars['Float']['input']>;
  readonly offset: InputMaybe<Scalars['Float']['input']>;
  readonly tenantId: InputMaybe<Scalars['String']['input']>;
};

export type OrgLookupInput = {
  readonly organizationId: InputMaybe<Scalars['String']['input']>;
  readonly organizationSlug: InputMaybe<Scalars['String']['input']>;
};

export type OrganizationSummaryType = {
  readonly __typename?: 'OrganizationSummaryType';
  readonly id: Scalars['String']['output'];
  readonly logo: Maybe<Scalars['String']['output']>;
  readonly name: Scalars['String']['output'];
  readonly slug: Scalars['String']['output'];
};

export type Query = {
  readonly __typename?: 'Query';
  readonly activeOrganization: Maybe<OrganizationSummaryType>;
  readonly health: Scalars['Boolean']['output'];
  readonly invoice: Maybe<InvoiceSummaryType>;
  readonly invoices: InvoiceConnectionType;
  readonly me: Maybe<SessionContextType>;
  readonly order: Maybe<OrderSummaryType>;
  readonly orders: OrderConnectionType;
  readonly organizationMembers: MemberConnectionType;
  readonly organizations: ReadonlyArray<OrganizationSummaryType>;
};


export type QueryInvoiceArgs = {
  input: BillingGetInput;
};


export type QueryInvoicesArgs = {
  input: InputMaybe<BillingListInput>;
};


export type QueryOrderArgs = {
  input: OrderGetInput;
};


export type QueryOrdersArgs = {
  input: InputMaybe<OrdersListInput>;
};


export type QueryOrganizationMembersArgs = {
  input: InputMaybe<OrgLookupInput>;
};

export type SessionContextType = {
  readonly __typename?: 'SessionContextType';
  readonly role: Scalars['String']['output'];
  readonly tenantId: Scalars['String']['output'];
  readonly userId: Scalars['String']['output'];
};

export type SetActiveOrgInput = {
  readonly organizationId: InputMaybe<Scalars['String']['input']>;
  readonly organizationSlug: InputMaybe<Scalars['String']['input']>;
};

export type UpdateMemberRoleInput = {
  readonly memberId: Scalars['String']['input'];
  readonly organizationId: InputMaybe<Scalars['String']['input']>;
  readonly role: ReadonlyArray<Scalars['String']['input']>;
};

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { readonly __typename?: 'Query', readonly me: { readonly __typename?: 'SessionContextType', readonly userId: string, readonly tenantId: string, readonly role: string } | null };


export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"tenantId"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;