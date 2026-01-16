import { Module } from "@nestjs/common";
import { AppService } from "./app.service";
import { InternalController } from "../presentation/internal/me.controller";
import { HealthController } from "./controllers/health.controller";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { auth } from "../better-auth/auth";
import { AuthRpcController } from "../presentation/rpc/auth.rpc.controller";
import { MeUseCase } from "./use-cases/me.use-case";
import { ValidateSessionUseCase } from "./use-cases/validate-session.usecases";
import { VALIDATE_SESSION_PORT } from "./ports/session.port";
import { SetActiveOrgUseCase } from "./use-cases/set-active-org.use-case";
import { SET_ACTIVE_ORG_PORT } from "./ports/organization.port";
import { ListOrgsUseCase } from "./use-cases/list-orgs.use-case";
import { LIST_ORGS_PORT } from "./ports/list-orgs.port";
import { GetActiveOrgUseCase } from "./use-cases/get-active-org.use-case";
import { GET_ACTIVE_ORG_PORT } from "./ports/get-active-org.port";
import { ListMembersUseCase } from "./use-cases/list-members.use-case";
import { LIST_MEMBERS_PORT } from "./ports/list-members.port";
import { InviteMemberUseCase } from "./use-cases/invite-member.use-case";
import { INVITE_MEMBER_PORT } from "./ports/invite-member.port";
import { AcceptInviteUseCase } from "./use-cases/accept-invite.use-case";
import { ACCEPT_INVITE_PORT } from "./ports/accept-invite.port";
import { RejectInviteUseCase } from "./use-cases/reject-invite.use-case";
import { REJECT_INVITE_PORT } from "./ports/reject-invite.port";
import { UpdateMemberRoleUseCase } from "./use-cases/update-member-role.use-case";
import { UPDATE_MEMBER_ROLE_PORT } from "./ports/update-member-role.port";
import { LeaveOrgUseCase } from "./use-cases/leave-org.use-case";
import { LEAVE_ORG_PORT } from "./ports/leave-org.port";

@Module({
  imports: [AuthModule.forRoot({ auth, disableBodyParser: true })],
  controllers: [HealthController, InternalController, AuthRpcController],
  providers: [
    AppService,
    MeUseCase,
    {
      provide: VALIDATE_SESSION_PORT,
      useClass: ValidateSessionUseCase,
    },
    {
      provide: SET_ACTIVE_ORG_PORT,
      useClass: SetActiveOrgUseCase,
    },
    {
      provide: LIST_ORGS_PORT,
      useClass: ListOrgsUseCase,
    },
    {
      provide: GET_ACTIVE_ORG_PORT,
      useClass: GetActiveOrgUseCase,
    },
    {
      provide: LIST_MEMBERS_PORT,
      useClass: ListMembersUseCase,
    },
    {
      provide: INVITE_MEMBER_PORT,
      useClass: InviteMemberUseCase,
    },
    {
      provide: ACCEPT_INVITE_PORT,
      useClass: AcceptInviteUseCase,
    },
    {
      provide: REJECT_INVITE_PORT,
      useClass: RejectInviteUseCase,
    },
    {
      provide: UPDATE_MEMBER_ROLE_PORT,
      useClass: UpdateMemberRoleUseCase,
    },
    {
      provide: LEAVE_ORG_PORT,
      useClass: LeaveOrgUseCase,
    },
  ],
})
export class AppModule {}
