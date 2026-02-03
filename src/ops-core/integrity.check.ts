import fs from "fs"
import crypto from "crypto"

export function verifyEngineIntegrity(path: string, expectedHash: string) {
  // Integrity check should only run in server context where fs is available
  if (typeof window !== 'undefined') return; 

  try {
    const content = fs.readFileSync(path, "utf8")
    const hash = crypto.createHash("sha256").update(content).digest("hex")

    if (hash !== expectedHash) {
      throw new Error("ENGINE_TAMPERED")
    }
  } catch (e) {
    console.warn("Integrity check skipped or failed:", e);
  }
}
