import 'dotenv/config';

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Thiếu biến môi trường: ${key}`);
  return value;
};

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd: process.env.NODE_ENV === 'production',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresInDays: 30,
  shippingFee: Number(process.env.SHIPPING_FEE ?? 0),
  bank: {
    name: process.env.BANK_NAME ?? '',
    accountNumber: process.env.BANK_ACCOUNT_NUMBER ?? '',
    accountName: process.env.BANK_ACCOUNT_NAME ?? '',
  },
  shop: {
    email: process.env.SHOP_EMAIL ?? '',
    phone: process.env.SHOP_PHONE ?? '',
    address: process.env.SHOP_ADDRESS ?? '',
    instagram: process.env.SHOP_INSTAGRAM ?? '',
  },
};
