const AUTHORIZED_FINGERPRINT = process.env.OPS_FINGERPRINT

export function enforceLicense(runtimeFingerprint: string) {
  if (!AUTHORIZED_FINGERPRINT) {
    throw new Error("LICENSE_MISSING")
  }

  if (runtimeFingerprint !== AUTHORIZED_FINGERPRINT) {
    throw new Error("LICENSE_VIOLATION")
  }
}
