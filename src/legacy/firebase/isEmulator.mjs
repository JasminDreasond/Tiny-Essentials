// @ts-nocheck

/**
 * Checks if the Firebase Functions are running in the emulator environment.
 * This function relies on the environment variable `FUNCTIONS_EMULATOR` to determine
 * whether the Firebase Functions are being executed locally in an emulator or in production.
 *
 * @returns {boolean} `true` if the Firebase Functions are running in the emulator, `false` otherwise.
 */
export default function isEmulator() {
  return process.env.FUNCTIONS_EMULATOR;
}
