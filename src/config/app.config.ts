interface AppConfig {
  ses: {
    region: string;
    accessKey: string;
    secretAccessKey: string;
    sender: string;
  };
}

export default (): AppConfig => ({
  ses: {
    region: process.env.EMAIL_REGION,
    accessKey: process.env.EMAIL_ACCESS_KEY_ID,
    secretAccessKey: process.env.EMAIL_SECRET_ACCESS_KEY,
    sender: process.env.EMAIL_SENDER,
  },
});
