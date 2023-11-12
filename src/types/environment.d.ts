export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL?: string;
      EXCHANGE_API_KEY?: string;
      EXPECTED_ACCOUNT_NUMBER?: string;
    }
  }
}
