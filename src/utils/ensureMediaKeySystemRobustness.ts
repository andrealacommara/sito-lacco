// ========================== UTILITY: ensureMediaKeySystemRobustness ========================== //
// Wraps `navigator.requestMediaKeySystemAccess` to inject a default robustness level when missing,
// preventing the “robustness level” warning triggered by some third-party players (e.g. Spotify).
export function ensureMediaKeySystemRobustness() {
  if (typeof window === "undefined") return;

  const navigatorWithFlag = window.navigator as Navigator & {
    __mediaKeyPatched?: boolean;
  };

  if (
    navigatorWithFlag.__mediaKeyPatched ||
    typeof navigatorWithFlag.requestMediaKeySystemAccess !== "function"
  ) {
    return;
  }

  const original =
    navigatorWithFlag.requestMediaKeySystemAccess.bind(navigatorWithFlag);

  navigatorWithFlag.__mediaKeyPatched = true;

  navigatorWithFlag.requestMediaKeySystemAccess = (
    keySystem: string,
    configurations: MediaKeySystemConfiguration[],
  ) => {
    const patchCapabilities = (
      capabilities?: MediaKeySystemMediaCapability[],
    ): MediaKeySystemMediaCapability[] | undefined =>
      capabilities?.map((capability) => ({
        ...capability,
        robustness: capability.robustness ?? "SW_SECURE_DECODE",
      }));

    const patchedConfigs = Array.from(configurations).map((config) => ({
      ...config,
      videoCapabilities:
        patchCapabilities(config.videoCapabilities) ?? config.videoCapabilities,
      audioCapabilities:
        patchCapabilities(config.audioCapabilities) ?? config.audioCapabilities,
    }));

    return original(keySystem, patchedConfigs);
  };
}
