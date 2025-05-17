import { useState, useEffect } from "react";

export default function useWalletProviders() {
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    const { ethereum } = window;
    if (!ethereum) {
      setProviders([]);
      return;
    }

    const injected = Array.isArray(ethereum.providers)
      ? ethereum.providers
      : [ethereum];

    // Filter for EVM providers only
    const evmProviders = injected.filter(
      (provider) =>
        typeof provider.request === "function" &&
        !provider.isPhantom &&
        !provider.isSolflare &&
        !provider.isSollet &&
        !provider.isSolana
    );

    setProviders(evmProviders);
  }, []);

  return providers;
}
