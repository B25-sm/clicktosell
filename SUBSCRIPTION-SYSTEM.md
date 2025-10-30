# Subscription System Implementation

This document outlines the complete subscription system implementation for the OLX-like classifieds application, similar to OLX's subscription model.

## Overview

The subscription system allows sellers to:
- **Basic Plan (Free)**: Post up to 10 listings and 10 ads per month
- **Premium Plan (₹999/month)**: Post unlimited listings and up to 10 ads per month
- **Unlimited Plan (₹1999/month)**: Post unlimited listings and unlimited ads per month

## Backend Implementation

### 1. Database Models

#### Subscription Model (`backend/models/Subscription.js`)
- Tracks user subscriptions, payment details, and usage
- Includes plan details, payment information, and usage tracking
- Methods for checking limits and incrementing usage

#### User Model Updates (`backend/models/User.js`)
- Added subscription fields to track current plan and usage
- Methods for checking listing and ad limits
- Usage tracking and increment methods

### 2. API Routes (`backend/routes/subscriptions.js`)

#### Available Endpoints:
- `GET /api/v1/subscriptions/plans` - Get available subscription plans
- `GET /api/v1/subscriptions/current` - Get user's current subscription status
- `POST /api/v1/subscriptions/purchase` - Purchase a subscription plan
- `POST /api/v1/subscriptions/verify` - Verify payment after purchase
- `GET /api/v1/subscriptions/history` - Get subscription history
- `POST /api/v1/subscriptions/cancel` - Cancel current subscription
- `GET /api/v1/subscriptions/usage` - Get current usage statistics
- `POST /api/v1/subscriptions/upgrade` - Upgrade subscription plan

### 3. Middleware (`backend/middleware/subscriptionLimits.js`)

#### Middleware Functions:
- `checkListingLimits` - Enforces listing creation limits
- `checkAdLimits` - Enforces ad posting limits
- `incrementListingUsage` - Increments usage after successful listing creation
- `incrementAdUsage` - Increments usage after successful ad posting
- `checkSubscriptionStatus` - Provides subscription info to requests

### 4. Integration with Existing Systems

#### Listing Creation (`backend/routes/listings.js`)
- Added subscription limit checks before allowing listing creation
- Automatic usage increment after successful listing creation

#### Payment Integration
- Integrated with existing Razorpay payment system
- Supports multiple payment methods (card, UPI, net banking, wallet)

## Frontend Implementation

### 1. React Components

#### Core Components:
- `SubscriptionPlans` - Displays available subscription plans
- `SubscriptionStatus` - Shows current subscription status and usage
- `PaymentModal` - Handles payment processing with Razorpay
- `SubscriptionManager` - Main subscription management interface
- `SubscriptionLimitWarning` - Shows when limits are reached

### 2. Context Management (`frontend-web/src/contexts/SubscriptionContext.tsx`)
- Centralized subscription state management
- Methods for checking limits and updating usage
- Automatic subscription data fetching

### 3. Pages
- `/subscription` - Main subscription management page
- Integrated into user menu for easy access

## Subscription Plans

### Basic Plan (Free)
- **Price**: ₹0/month
- **Listings**: 10 per month
- **Ads**: 10 per month
- **Features**: Basic support, standard listings

### Premium Plan (₹999/month)
- **Price**: ₹999/month
- **Listings**: Unlimited
- **Ads**: 10 per month
- **Features**: Priority support, advanced analytics, featured listings

### Unlimited Plan (₹1999/month)
- **Price**: ₹1999/month
- **Listings**: Unlimited
- **Ads**: Unlimited
- **Features**: 24/7 support, comprehensive analytics, all listings featured, API access, custom branding

## Usage Tracking

### Monthly Limits
- Limits reset monthly based on subscription start date
- Usage is tracked per user and per subscription period
- Real-time limit checking before allowing actions

### Limit Enforcement
- Frontend shows warnings when limits are reached
- Backend middleware prevents exceeding limits
- Clear upgrade prompts when limits are reached

## Payment Processing

### Razorpay Integration
- Secure payment processing
- Multiple payment methods supported
- Automatic payment verification
- Webhook support for payment status updates

### Payment Flow
1. User selects subscription plan
2. Payment order created with Razorpay
3. User completes payment
4. Payment verification
5. Subscription activated
6. User limits updated

## Security Features

### Authentication
- All subscription endpoints require authentication
- JWT token validation for all requests
- User-specific data access only

### Payment Security
- Razorpay's secure payment processing
- Payment signature verification
- No sensitive payment data stored locally

## Error Handling

### Backend
- Comprehensive error handling for all subscription operations
- Detailed error messages for different failure scenarios
- Graceful handling of payment failures

### Frontend
- User-friendly error messages
- Loading states for all async operations
- Retry mechanisms for failed requests

## Usage Examples

### Checking if User Can Create Listing
```typescript
const { checkListingLimit } = useSubscription();
const canCreate = checkListingLimit();
```

### Checking if User Can Post Ad
```typescript
const { checkAdLimit } = useSubscription();
const canPostAd = checkAdLimit();
```

### Incrementing Usage After Action
```typescript
const { incrementListingUsage } = useSubscription();
// After successful listing creation
incrementListingUsage();
```

## Environment Variables

### Required Environment Variables
```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Frontend Razorpay Key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_public_razorpay_key_id
```

## Database Schema

### Subscription Collection
```javascript
{
  user: ObjectId,
  plan: String, // 'basic', 'premium', 'unlimited'
  planDetails: {
    name: String,
    price: Number,
    currency: String,
    duration: Number,
    maxListings: Number,
    maxAds: Number,
    features: Array
  },
  status: String, // 'active', 'expired', 'cancelled', 'suspended', 'pending'
  payment: {
    amount: Number,
    currency: String,
    paymentMethod: String,
    paymentGateway: String,
    transactionId: String,
    gatewayOrderId: String,
    gatewayPaymentId: String,
    paidAt: Date
  },
  startDate: Date,
  endDate: Date,
  usage: {
    listingsCreated: Number,
    adsPosted: Number,
    lastResetDate: Date
  }
}
```

### User Collection Updates
```javascript
{
  // ... existing fields
  subscription: {
    currentPlan: String,
    subscriptionId: ObjectId,
    subscriptionStatus: String,
    subscriptionExpiresAt: Date,
    monthlyUsage: {
      listingsCreated: Number,
      adsPosted: Number,
      lastResetDate: Date
    }
  }
}
```

## Testing

### Backend Testing
- Unit tests for subscription models and methods
- Integration tests for API endpoints
- Payment flow testing with Razorpay test mode

### Frontend Testing
- Component testing for subscription UI
- Integration testing for payment flow
- User experience testing for limit enforcement

## Deployment Considerations

### Production Setup
1. Configure Razorpay production keys
2. Set up webhook endpoints for payment notifications
3. Configure database indexes for performance
4. Set up monitoring for subscription metrics

### Monitoring
- Track subscription conversion rates
- Monitor payment success/failure rates
- Monitor usage patterns and limits
- Set up alerts for system issues

## Future Enhancements

### Planned Features
- Annual subscription discounts
- Referral program for subscriptions
- Advanced analytics dashboard
- Subscription management for admins
- Automated billing and renewals
- Promotional codes and discounts

### Scalability Considerations
- Database sharding for large user bases
- Caching for subscription status checks
- Background jobs for usage resets
- API rate limiting for subscription endpoints

## Support and Maintenance

### Regular Tasks
- Monitor subscription metrics
- Handle payment failures and retries
- Update subscription plans and pricing
- Maintain payment gateway integrations

### Troubleshooting
- Check payment gateway status
- Verify subscription status in database
- Review usage tracking accuracy
- Monitor error logs for subscription issues

This subscription system provides a complete solution for monetizing the classifieds platform while maintaining a good user experience and ensuring proper limit enforcement.

