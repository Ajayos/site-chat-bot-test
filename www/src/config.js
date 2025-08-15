let appConfig = null;

export async function loadConfig() {
  if (!appConfig) {
    const res = await fetch(`${window.location.href}/config.json`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    appConfig = await res.json();
  }
  return appConfig;
}
