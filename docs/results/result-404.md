Result: feat: Add POST /reading-sessions/:id/end with call-ended emit

What changed
docs/plans/plan-404.md: plan for issue #404
src/socket/socket.service.ts: added emitToUser (Socket.IO .emit for FE listeners)
src/socket/socket.gateway.ts: relay SubscribeMessage('call-ended') to recipient
src/reading-sessions/reading-sessions.service.ts: endSession (participant AuthZ, idempotent finish, notify once, emit call-ended to peer)
src/reading-sessions/reading-sessions.controller.ts: POST :id/end (JWT + reader/humanBook, 204)
src/reading-sessions/reading-sessions.module.ts: import SocketModule
src/reading-sessions/reading-sessions.service.spec.ts: endSession unit tests + socketService mock

What was done

Added an idempotent POST /api/v1/reading-sessions/:id/end so liber or huber can finish a live session at any time. First transition to finished notifies and emits call-ended to the peer; repeats are no-ops. FE can also emit call-ended as a fallback; the gateway relays it.

Notes / follow-up
- Recording stop stays FE-driven (no Agora stop body on /end yet).
- No endedAt / tooEarlyToEnd gate (early hang-up allowed).
- Paired with FE hulib#831.
- Gates/tests not run in this pass — confirm with npm test for reading-sessions.service.spec before PR.
