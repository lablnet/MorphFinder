/**
 * Utilities for environment variable inspection.
 * Kept in lib/ so they can be unit-tested independently of React.
 */

/**
 * Regex that matches environment variable keys that are likely to hold
 * sensitive values (secrets, tokens, passwords, credentials, private keys, etc.).
 *
 * Pattern rationale:
 *  - secret / secrets
 *  - token / tokens / tokenize
 *  - key / keys / api_key / private_key / ssh_key / signing_key
 *  - password / passwd / pwd (as suffix: DB_PWD, APP_PWD)
 *  - pass (standalone or as a suffix: PASS, DATABASE_PASS)
 *  - auth / authorize / oauth / apiauth
 *  - credential / credentials
 *  - private / priv
 *  - cert / certificate / tls
 *  - signing / signature / sign_key
 *  - webhook / webhooksecret
 *  - seed (common in crypto wallets)
 *  - salt (cryptographic salts)
 *  - cipher / encrypt / decrypt
 *  - bearer
 *  - jwt / jwttoken
 *  - mnemonic (BIP-39 wallet seeds)
 *
 * The flag `i` makes it case-insensitive; word-boundary heuristics are
 * provided by the alternation structure itself (matches anywhere in the key).
 */
export const SENSITIVE_KEY_PATTERN =
  /secret|token|password|passwd|_pwd$|_pass$|\bpass\b|auth|oauth|credential|private|priv_|_key$|\bkey\b|api_?key|ssh_key|signing|signature|cert|tls|webhook|seed|salt|cipher|encrypt|decrypt|bearer|jwt|mnemonic/i;

/**
 * Returns `true` when the given environment variable key name suggests it
 * holds a sensitive / secret value that should be hidden by default.
 */
export function isSensitiveEnvKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERN.test(key);
}
