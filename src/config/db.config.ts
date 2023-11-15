interface DBConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  name: string;
}

export default (): DBConfig => ({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  name: process.env.DB_NAME,
});
