# Wallet MVP - Multi-Currency Digital Wallet

A production-ready multi-currency digital wallet with stablecoins (USDC, USDT), Ripple (XRP), and demo Visa prepaid card functionality. 

## Features

- **🔐 Secure Authentication** - JWT-based auth with HttpOnly cookies
- **💰 Multi-Currency Support** - ETH, XRP, USDC, USDT
- **🏦 Stablecoin Integration** - Circle API for USDC, gateway API for USDT
- **⚡ Ripple (XRP) Support** - Native XRP transactions on testnet
- **💳 Demo Visa Cards** - Prepaid card issuing and management
- **🌐 Cross-Border Transfers** - Simulated international payments
- **🔒 Enterprise Security** - AES-256-GCM encryption, rate limiting, CSRF protection
- **📱 Responsive UI** - Clean, modern interface built with Tailwind CSS

## Architecture

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Database**: Vercel Postgres (Neon) with Prisma ORM
- **Authentication**: JWT with HttpOnly cookies
- **Blockchain**: ethers.js (Ethereum), xrpl.js (Ripple)
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (edge-optimized)

## Quick Start

### Local Development

1. **Clone and setup**
   ```bash
   git clone <your-repo>
   cd wallet-mvp
   cp .env.example .env
   npm install
   ```

2. **Database setup**
   - Create a Vercel Postgres (Neon) database
   - Add the connection URL to `.env`
   ```bash
   npm run db:push
   ```

3. **Environment configuration**
   Edit `.env` with your values:
   ```bash
   JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars_long
   KEY_ENC_SECRET=your_encryption_key_32_chars_minimum
   USE_SIMULATION=true
   DATABASE_URL="your_postgres_connection_url"
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Visit http://localhost:3000

### Deployment on Vercel

1. **Import to Vercel**
   - Connect your GitHub repository
   - Vercel will auto-detect Next.js

2. **Add Environment Variables**
   ```
   JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars_long
   KEY_ENC_SECRET=your_encryption_key_32_chars_minimum
   USE_SIMULATION=true
   ```
   
   Vercel Postgres variables are auto-injected.

3. **Deploy**
   - Push to main branch
   - Vercel will build and deploy automatically

## Provider Configuration

### Simulation Mode (Default)
Set `USE_SIMULATION=true` to use built-in simulators for all external services. Perfect for development and testing.

### Real Provider Integration

To enable real providers, set `USE_SIMULATION=false` and configure:

#### Circle (USDC)
```bash
CIRCLE_API_KEY=your_circle_api_key
CIRCLE_BASE=https://api-sandbox.circle.com  # or production URL
```

#### USDT Gateway
```bash
USDT_API_KEY=your_usdt_api_key
USDT_API_BASE=your_usdt_provider_base_url
```

#### Giftbit (Cards)
```bash
GIFTBIT_API_KEY=your_giftbit_api_key
GIFTBIT_API_BASE=your_giftbit_api_base_url
```

## Usage Guide

### First Time Setup
1. Register a new account at `/register`
2. Login at `/login`
3. Click "Initialize Wallet" to generate blockchain addresses
4. View your masked addresses for security

### Managing Assets
- **View Balances**: Switch between Stablecoins and Native tokens tabs
- **Send Transfers**: Use the Send Assets panel with USDC/USDT/XRP tabs
- **Transaction History**: All transfers are logged and displayed

### Demo Features
- **Cross-Border**: Simulate international transfers between users
- **Visa Cards**: Issue demo prepaid cards with simulated balances
- **Real-time Updates**: Balances and transactions update automatically

## Security Features

- **🔐 Private Key Protection**: Never exposed to client, encrypted server-side
- **🛡️ Rate Limiting**: 60 requests/minute per IP
- **🔒 Input Validation**: Zod schemas for all API endpoints
- **🚫 CSRF Protection**: SameSite cookies and anti-CSRF tokens
- **⚡ JWT Security**: HttpOnly cookies, 7-day expiration
- **🎯 CORS**: Strict same-origin policy

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Wallet Management
- `POST /api/wallet/init` - Initialize wallet (idempotent)
- `GET /api/wallet/balances` - Get ETH/XRP balances

### Stablecoins
- `POST /api/usdc/wallets/init` - Initialize USDC wallet
- `GET /api/usdc/balance` - Get USDC balance
- `POST /api/usdc/send` - Send USDC
- `POST /api/usdt/wallets/init` - Initialize USDT wallet  
- `GET /api/usdt/balance` - Get USDT balance
- `POST /api/usdt/send` - Send USDT

### XRP
- `POST /api/xrp/send` - Send XRP transaction

### Cards
- `POST /api/card/issue` - Issue demo prepaid card
- `GET /api/card/me` - Get user's cards

### Transfers
- `GET /api/transfers` - Get transaction history

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript compiler
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
```

## Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Wallet initialization
- [ ] Balance fetching (simulated data)
- [ ] USDC/USDT/XRP sending (simulated)
- [ ] Transaction history display
- [ ] Card issuing (simulated)
- [ ] Logout functionality

### XRP Testnet Testing
For real XRP testing:
1. Get testnet XRP from https://xrpl.org/xrp-testnet-faucet.html
2. Set `USE_SIMULATION=false`
3. Fund your generated XRP address

## Production Considerations

### Security Hardening
- [ ] Implement rate limiting per user
- [ ] Add request signing/verification
- [ ] Set up monitoring and alerting
- [ ] Enable audit logging
- [ ] Implement withdrawal limits

### Scalability
- [ ] Database connection pooling
- [ ] Redis for session storage
- [ ] Background job processing
- [ ] API response caching

### Compliance
- [ ] KYC/AML integration
- [ ] Transaction monitoring
- [ ] Regulatory reporting
- [ ] PCI DSS for real cards

## Architecture Decisions

### Provider Pattern
All external services (Circle, USDT, Giftbit) implement a common interface with simulation and real implementations. This allows:
- Seamless development without external dependencies
- Easy provider switching
- Consistent error handling
- Better testing capabilities

### Security Model
- Private keys never leave the server
- All sensitive data encrypted with AES-256-GCM
- JWT tokens in HttpOnly cookies prevent XSS
- Rate limiting prevents abuse
- Input validation prevents injection attacks

### Database Design
- Users and accounts are separate entities
- All transfers are logged for audit trails
- Encrypted sensitive data storage
- Optimized for read-heavy workloads

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or issues:
1. Check the GitHub Issues
2. Review this README
3. Check the code comments for implementation details
