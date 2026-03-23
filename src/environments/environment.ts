const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;

export const environment = {
    production: false,
    apiUrl: env?.['NG_APP_API_URL'] || 'http://localhost:8000/api'
};
