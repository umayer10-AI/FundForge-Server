import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || '',
  betterAuth: {
    secret: process.env.BETTER_AUTH_SECRET || '',
    url: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  },
  grok: {
    apiKey: process.env.GROK_API_KEY || '',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || '',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
  },
  adminEmail: process.env.ADMIN_EMAIL || 'admin@fundforge.ai',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};

export const validateConfig = () => {
  const required = [
    'mongodbUri',
    'betterAuth.secret',
    'grok.apiKey',
    'cloudinary.cloudName',
    'cloudinary.apiKey',
    'cloudinary.apiSecret',
    'stripe.secretKey',
    'google.clientId',
    'google.clientSecret',
  ];
  const missing = required.filter((key) => {
    const parts = key.split('.');
    let obj: any = config;
    for (const part of parts) {
      if (!obj[part]) return true;
      obj = obj[part];
    }
    return !obj;
  });
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
};
