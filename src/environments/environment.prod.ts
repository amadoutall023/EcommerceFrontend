const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;

export const environment = {
    production: true,
    apiUrl: env?.['NG_APP_API_URL'] || 'https://ecommercebackend-h1hz.onrender.com/api'
};
