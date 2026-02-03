import { createHash } from "crypto";

// NOTE: crypto module is Node.js specific. 
// If this runs in browser, we need Web Crypto API or a polyfill.
// Assuming this effectively runs in a Node/Server context (Next.js API / Vercel Function) 
// or a build script context.

export function computeSystemFingerprint(input: {
  domain: string
  supabaseUrl: string
  salt: string
}) {
  return createHash("sha256")
    .update(`${input.domain}|${input.supabaseUrl}|${input.salt}`)
    .digest("hex")
}
