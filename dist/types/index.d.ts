export type UserRole = 'supporter' | 'creator' | 'admin';
export type UserStatus = 'active' | 'blocked' | 'suspended';
export type CampaignStatus = 'pending' | 'approved' | 'rejected' | 'suspended' | 'completed';
export type ContributionStatus = 'pending' | 'approved' | 'rejected';
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';
export type NotificationType = 'success' | 'info' | 'warning' | 'error' | 'campaign' | 'contribution' | 'payment' | 'withdrawal' | 'report' | 'system';
export interface IUser {
    _id: string;
    name: string;
    email: string;
    password?: string;
    photo?: string;
    role: UserRole;
    credits: number;
    provider: 'email' | 'google';
    emailVerified: boolean;
    isBlocked: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface ICampaign {
    _id: string;
    title: string;
    story: string;
    category: string;
    goal: number;
    minimumContribution: number;
    deadline: Date;
    reward?: string;
    image?: string;
    creatorId: string;
    creatorName: string;
    creatorEmail: string;
    raisedAmount: number;
    totalSupporters: number;
    status: CampaignStatus;
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IContribution {
    _id: string;
    campaignId: string;
    campaignTitle: string;
    supporterId: string;
    supporterName: string;
    supporterEmail: string;
    creatorId: string;
    creatorEmail: string;
    amount: number;
    message?: string;
    status: ContributionStatus;
    createdAt: Date;
    updatedAt: Date;
}
export interface IWithdrawal {
    _id: string;
    creatorId: string;
    creatorEmail: string;
    credits: number;
    amount: number;
    paymentMethod: string;
    accountNumber: string;
    remarks?: string;
    status: WithdrawalStatus;
    rejectionReason?: string;
    requestedAt: Date;
    approvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface IPayment {
    _id: string;
    userId: string;
    email: string;
    packageName: string;
    credits: number;
    price: number;
    currency: string;
    paymentIntentId: string;
    checkoutSessionId: string;
    status: PaymentStatus;
    paymentMethod: string;
    createdAt: Date;
}
export interface INotification {
    _id: string;
    title: string;
    message: string;
    type: NotificationType;
    icon: string;
    toEmail: string;
    fromEmail: string;
    actionRoute?: string;
    isRead: boolean;
    createdAt: Date;
}
export interface IReport {
    _id: string;
    campaignId: string;
    campaignTitle: string;
    reportedBy: string;
    reporterEmail: string;
    reason: string;
    description?: string;
    status: ReportStatus;
    createdAt: Date;
    updatedAt: Date;
}
export interface ICreditTransaction {
    _id: string;
    userId: string;
    email: string;
    type: 'purchase' | 'contribution' | 'refund' | 'withdrawal' | 'adjustment';
    credits: number;
    balanceBefore: number;
    balanceAfter: number;
    referenceId: string;
    description: string;
    createdAt: Date;
}
export interface IWishlist {
    _id: string;
    userId: string;
    campaignId: string;
    createdAt: Date;
}
//# sourceMappingURL=index.d.ts.map