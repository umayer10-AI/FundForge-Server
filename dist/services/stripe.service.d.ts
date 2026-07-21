import Stripe from 'stripe';
export declare const CREDIT_PACKAGES: ({
    id: string;
    credits: number;
    price: number;
    name: string;
    popular?: undefined;
    save?: undefined;
} | {
    id: string;
    credits: number;
    price: number;
    name: string;
    popular: boolean;
    save?: undefined;
} | {
    id: string;
    credits: number;
    price: number;
    name: string;
    save: boolean;
    popular?: undefined;
})[];
export declare const CREDIT_CONVERSION: {
    PURCHASE_RATE: number;
    WITHDRAWAL_RATE: number;
    MIN_WITHDRAWAL_CREDITS: number;
};
export declare const stripeService: {
    createCheckoutSession(userId: string, email: string, packageId: string): Promise<Stripe.Response<Stripe.Checkout.Session>>;
    retrieveCheckoutSession(sessionId: string): Promise<Stripe.Response<Stripe.Checkout.Session>>;
    constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event;
};
//# sourceMappingURL=stripe.service.d.ts.map