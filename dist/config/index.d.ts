export declare const config: {
    port: number;
    nodeEnv: string;
    mongodbUri: string;
    betterAuth: {
        secret: string;
        url: string;
    };
    grok: {
        apiKey: string;
    };
    cloudinary: {
        cloudName: string;
        apiKey: string;
        apiSecret: string;
        uploadPreset: string;
    };
    google: {
        clientId: string;
        clientSecret: string;
    };
    stripe: {
        secretKey: string;
        publishableKey: string;
        webhookSecret: string;
    };
    sendgrid: {
        apiKey: string;
    };
    adminEmail: string;
    frontendUrl: string;
};
export declare const validateConfig: () => void;
//# sourceMappingURL=index.d.ts.map