# Plan: feat: Add POST /reading-sessions/:id/end with call-ended emit

Issue: #404
Branch: feat/404-add-reading-session-end-endpoint

## Sub-tasks

| # | Sub-task | Done condition |
| --- | -------- | -------------- |
| 1 | Add `emitToUser` on SocketService (uses `.emit`, same as reaction) + `@SubscribeMessage('call-ended')` relay on SocketGateway | FE emit reaches peer; service can push `call-ended` from HTTP handlers |
| 2 | Add `endSession(id, userId)` on ReadingSessionsService — participant AuthZ, idempotent finish, notify once, emit `call-ended` to peer | Unit tests cover non-participant, first finish, already-finished no-op |
| 3 | Add `POST /reading-sessions/:id/end` controller (JWT + reader/humanBook roles, 204) | Endpoint wired like `attend` |
| 4 | Wire SocketModule into ReadingSessionsModule | Service injects SocketService |

## Decisions / risks

- Recording stop stays FE-driven; `/end` does not accept Agora stop payload yet.
- Do not enforce `endedAt` / tooEarlyToEnd — either side may hang up early.
- Prefer `.emit('call-ended')` over `SocketService.sendTo` (which uses `send` + JSON envelope the meeting FE does not parse).
- Paired with FE hulib#831.
