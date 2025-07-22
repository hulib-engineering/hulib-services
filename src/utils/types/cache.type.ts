export enum CacheKey {
  AccessToken = 'auth:token:%s:access', // %s: hash
  EmailVerificationToken = 'auth:token:%s:email-verification', // %s: userId
  UserSocketClients = 'socket:%s:clients', // %s: userId
  UserOnlineStatus = 'socket:%s:online', // %s: userId
  SignInMagicLinkMailLastSentAt = 'auth:signin-magic-link-mail:%s:last-sent-at', // %s: userId
  EmailVerificationMailLastSentAt = 'auth:email-verification-mail:%s:last-sent-at', // %s: userId
  ResetPasswordMailLastSentAt = 'auth:reset-password-mail:%s:last-sent-at', // %s: userId
}

export type CacheParam = { key: keyof typeof CacheKey; args?: string[] };
