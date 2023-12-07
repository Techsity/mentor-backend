interface AppConfig {
  aws: {
    region: string;
    accessKey: string;
    secretAccessKey: string;
    emailSender: string;
    sesBucket: string;
  };
}

export default (): AppConfig => ({
  aws: {
    region: process.env.AWS_REGION,
    accessKey: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    emailSender: process.env.EMAIL_SENDER,
    sesBucket: process.env.S3_BUCKET,
  },
});
