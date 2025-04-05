const ONE_MINUTE = 60_000;
const DEFAULT_THROTTLE_LIMIT = 20;

export const environmentConfig = () => ({
  server: {
    port: Number(process.env.PORT),
  },
  cognito: {
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    clientId: process.env.COGNITO_CLIENT_ID,
    issuer: process.env.COGNITO_ISSUER,
    endpoint: process.env.COGNITO_ENDPOINT,
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  s3: {
    bucketName: process.env.S3_BUCKET_NAME,
    region: process.env.S3_REGION,
    localEndpoint: process.env.S3_LOCAL_ENDPOINT,
  },
  frontend: {
    url: process.env.FRONTEND_URL,
  },
  recaptcha: {
    secretKey: process.env.RECAPTCHA_SECRET_KEY,
    verifyUrl: process.env.RECAPTCHA_VERIFY_URL,
  },
  rateLimiting: {
    ttl: Number(process.env.DEFAULT_THROTTLE_TTL) || ONE_MINUTE,
    limit: Number(process.env.DEFAULT_THROTTLE_LIMIT) || DEFAULT_THROTTLE_LIMIT,
  },
});
