# CP Shirt Order Management System

**Shirt Order Management System for SMOCP (Student Major Organization - College of Computing KKU)**

A comprehensive Next.js web application designed to manage shirt orders and delivery tracking for the Computer Programming Student Organization. The system provides real-time order status updates, pickup scheduling, and administrative tools for efficient order management.

## Overview

The CP Shirt Order system streamlines the process of managing student organization merchandise orders. It provides a digital solution for tracking orders from placement to delivery, with features designed specifically for student organization needs including batch processing, pickup coordination, and automated status updates.

## Features

### Core Features
- **Order Management**: Create, view, and update shirt orders
- **Status Tracking**: Monitor order status (pending, picked_up, shipping, shipped)
- **Pickup Scheduling**: Set and manage pickup dates (datapickup)
- **Real-time Sync**: Multi-device data synchronization
- **Export Functionality**: Generate Excel reports of orders
- **Responsive Design**: Mobile-friendly interface
- **Auto Backup**: Automatic data backup every 30 seconds

### Administrative Features
- Order status bulk updates
- Pickup date management
- Excel export for reporting
- Order analytics and insights
- Student information management
- Inventory tracking

### Student Features
- Personal order dashboard
- Order status checking
- Pickup notification system
- Order history viewing
- Mobile-responsive interface

## Technology Stack

- **Frontend**: Next.js 14, React 18
- **Styling**: Tailwind CSS, CSS Modules
- **Font**: Geist (optimized by Next.js)
- **Database**: In-memory storage (Vercel compatible)
- **File Storage**: /tmp directory for Vercel deployment
- **Export**: Excel/CSV generation
- **Deployment**: Vercel Platform
- **State Management**: React hooks and context
- **Build Tool**: Next.js built-in bundling

## Prerequisites

### System Requirements
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (or yarn/pnpm)
- **Git**: Latest version
- **Browser**: Chrome, Firefox, Safari, or Edge (modern versions)

### Development Environment
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: At least 1GB free space
- **Network**: Internet connection for dependencies

## Installation Guide

### Windows Installation

1. **Install Node.js and Git**
   ```cmd
   # Download and install Node.js from https://nodejs.org/
   # Download and install Git from https://git-scm.com/
   
   # Verify installations
   node --version
   npm --version
   git --version
   ```

2. **Clone Repository**
   ```cmd
   git clone https://github.com/jrKitt/cp-shirt-order.git
   cd cp-shirt-order
   ```

3. **Install Dependencies**
   ```cmd
   npm install
   ```

4. **Start Development Server**
   ```cmd
   npm run dev
   ```

5. **Access Application**
   Open your browser and navigate to `http://localhost:3000`

### macOS Installation

1. **Install Prerequisites using Homebrew**
   ```bash
   # Install Homebrew if not already installed
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Install Node.js and Git
   brew install node git
   
   # Verify installations
   node --version
   npm --version
   git --version
   ```

2. **Clone and Setup Project**
   ```bash
   git clone https://github.com/jrKitt/cp-shirt-order.git
   cd cp-shirt-order
   
   # Install dependencies
   npm install
   
   # Start development server
   npm run dev
   ```

3. **Alternative: Manual Installation**
   ```bash
   # Download Node.js from https://nodejs.org/
   # Download Git from https://git-scm.com/
   # Follow the same clone and setup steps
   ```

### Linux Installation

#### Ubuntu/Debian Setup

1. **Update System and Install Node.js**
   ```bash
   # Update package index
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js using NodeSource repository
   curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
   sudo apt-get install -y nodejs git
   
   # Verify installations
   node --version
   npm --version
   git --version
   ```

2. **Clone and Setup Project**
   ```bash
   git clone https://github.com/jrKitt/cp-shirt-order.git
   cd cp-shirt-order
   
   # Install dependencies
   npm install
   
   # Start development server
   npm run dev
   ```

#### CentOS/RHEL/Fedora Setup

1. **Install Node.js and Git**
   ```bash
   # For CentOS/RHEL
   curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
   sudo yum install -y nodejs git
   
   # For Fedora
   curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
   sudo dnf install -y nodejs git
   
   # Verify installations
   node --version
   npm --version
   git --version
   ```

2. **Clone and Setup Project**
   ```bash
   git clone https://github.com/jrKitt/cp-shirt-order.git
   cd cp-shirt-order
   
   # Install dependencies and start
   npm install
   npm run dev
   ```

#### Arch Linux Setup

1. **Install via Pacman**
   ```bash
   # Update system and install packages
   sudo pacman -Syu
   sudo pacman -S nodejs npm git
   
   # Verify installations
   node --version
   npm --version
   git --version
   ```

2. **Setup Project**
   ```bash
   git clone https://github.com/jrKitt/cp-shirt-order.git
   cd cp-shirt-order
   npm install
   npm run dev
   ```

## Project Structure

```
cp-shirt-order/
├── app/                        # Next.js App Router
│   ├── components/            # Reusable React components
│   ├── (dashboard)/          # Dashboard route group
│   ├── api/                  # API routes
│   ├── globals.css           # Global styles
│   ├── layout.js             # Root layout component
│   └── page.js               # Home page component
├── public/                    # Static assets
│   ├── images/               # Image files
│   ├── icons/                # Icon files
│   └── favicon.ico           # Favicon
├── lib/                      # Utility libraries
│   ├── utils.js              # Helper functions
│   ├── data.js               # Data management
│   └── export.js             # Excel export functionality
├── styles/                   # Additional stylesheets
├── components/               # Legacy components (if any)
├── hooks/                    # Custom React hooks
├── types/                    # TypeScript type definitions
├── config/                   # Configuration files
├── .env.local.example        # Environment variables template
├── .gitignore               # Git ignore rules
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── package.json             # Dependencies and scripts
└── README.md                # Project documentation
```

## Configuration

### Environment Variables

1. **Create Environment File**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Configure Variables**
   ```env
   # Application Configuration
   NEXT_PUBLIC_APP_NAME=CP Shirt Order System
   NEXT_PUBLIC_APP_VERSION=1.0.0
   
   # Organization Details
   NEXT_PUBLIC_ORG_NAME=SMOCP
   NEXT_PUBLIC_ORG_FULL_NAME=Student Major Organization - Computer Programming
   
   # System Configuration
   BACKUP_INTERVAL=30000        # Auto backup every 30 seconds
   MAX_ORDERS_PER_USER=10      # Maximum orders per student
   
   # Development Settings
   NODE_ENV=development
   NEXT_PUBLIC_DEV_MODE=true
   
   # Export Configuration
   EXPORT_FORMAT=xlsx
   EXPORT_FILENAME=shirt_orders
   
   # Notification Settings
   ENABLE_NOTIFICATIONS=true
   EMAIL_NOTIFICATIONS=false    # Set to true when email service is configured
   ```

### Next.js Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  // Vercel deployment optimization
  env: {
    STORAGE_PATH: process.env.NODE_ENV === 'production' ? '/tmp' : './data',
  },
  // Enable static exports if needed
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
}

module.exports = nextConfig
```

### Tailwind Configuration

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          50: '#f8fafc',
          500: '#64748b',
          600: '#475569',
        }
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
    },
  },
  plugins: [],
}
```

## Available Scripts

### Development Scripts
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Utility Scripts
```bash
# Clean build artifacts
npm run clean

# Export current orders
npm run export

# Backup data
npm run backup

# Reset development data
npm run reset-data
```

## Development Workflow

### Setting Up Development Environment

1. **Code Editor Setup**
   ```bash
   # VS Code extensions (recommended)
   code --install-extension bradlc.vscode-tailwindcss
   code --install-extension esbenp.prettier-vscode
   code --install-extension ms-vscode.vscode-eslint
   ```

2. **Development Tools**
   ```bash
   # Install additional development tools
   npm install -g @next/codemod
   npm install -g prettier
   ```

### Code Structure Guidelines

1. **Component Structure**
   ```javascript
   // components/OrderCard.js
   import { useState } from 'react'
   import { cn } from '@/lib/utils'
   
   export default function OrderCard({ order, onStatusChange }) {
     const [isLoading, setIsLoading] = useState(false)
   
     const handleStatusUpdate = async (newStatus) => {
       setIsLoading(true)
       try {
         await onStatusChange(order.id, newStatus)
       } catch (error) {
         console.error('Status update failed:', error)
       } finally {
         setIsLoading(false)
       }
     }
   
     return (
       <div className={cn("p-4 border rounded-lg", {
         "opacity-50": isLoading
       })}>
         {/* Component content */}
       </div>
     )
   }
   ```

2. **API Route Structure**
   ```javascript
   // app/api/orders/route.js
   import { NextResponse } from 'next/server'
   import { getOrders, createOrder } from '@/lib/data'
   
   export async function GET() {
     try {
       const orders = await getOrders()
       return NextResponse.json({ orders })
     } catch (error) {
       return NextResponse.json(
         { error: 'Failed to fetch orders' },
         { status: 500 }
       )
     }
   }
   
   export async function POST(request) {
     try {
       const body = await request.json()
       const newOrder = await createOrder(body)
       return NextResponse.json({ order: newOrder }, { status: 201 })
     } catch (error) {
       return NextResponse.json(
         { error: 'Failed to create order' },
         { status: 400 }
       )
     }
   }
   ```

### Data Management

1. **Order Status Flow**
   ```javascript
   // lib/constants.js
   export const ORDER_STATUSES = {
     PENDING: 'pending',
     PICKED_UP: 'picked_up',
     SHIPPING: 'shipping',
     SHIPPED: 'shipped'
   }
   
   export const STATUS_TRANSITIONS = {
     [ORDER_STATUSES.PENDING]: [ORDER_STATUSES.PICKED_UP, ORDER_STATUSES.SHIPPING],
     [ORDER_STATUSES.PICKED_UP]: [ORDER_STATUSES.SHIPPING],
     [ORDER_STATUSES.SHIPPING]: [ORDER_STATUSES.SHIPPED],
     [ORDER_STATUSES.SHIPPED]: [] // Final status
   }
   ```

2. **Data Validation**
   ```javascript
   // lib/validation.js
   export const validateOrder = (order) => {
     const errors = []
   
     if (!order.studentId || order.studentId.trim() === '') {
       errors.push('Student ID is required')
     }
   
     if (!order.shirtSize || !['XS', 'S', 'M', 'L', 'XL', 'XXL'].includes(order.shirtSize)) {
       errors.push('Valid shirt size is required')
     }
   
     if (!order.quantity || order.quantity < 1 || order.quantity > 10) {
       errors.push('Quantity must be between 1 and 10')
     }
   
     return {
       isValid: errors.length === 0,
       errors
     }
   }
   ```

### Testing

1. **Component Testing**
   ```bash
   # Install testing dependencies
   npm install --save-dev @testing-library/react @testing-library/jest-dom jest
   ```

2. **Test Examples**
   ```javascript
   // __tests__/components/OrderCard.test.js
   import { render, screen, fireEvent } from '@testing-library/react'
   import OrderCard from '@/components/OrderCard'
   
   const mockOrder = {
     id: '1',
     studentId: 'STU001',
     shirtSize: 'M',
     quantity: 2,
     status: 'pending'
   }
   
   test('renders order information correctly', () => {
     render(<OrderCard order={mockOrder} onStatusChange={() => {}} />)
     
     expect(screen.getByText('STU001')).toBeInTheDocument()
     expect(screen.getByText('Size: M')).toBeInTheDocument()
     expect(screen.getByText('Qty: 2')).toBeInTheDocument()
   })
   ```

### Contributing Guidelines

1. **Fork and Clone**
   ```bash
   # Fork the repository on GitHub
   git clone https://github.com/YOUR_USERNAME/cp-shirt-order.git
   cd cp-shirt-order
   git remote add upstream https://github.com/jrKitt/cp-shirt-order.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/order-notifications
   ```

3. **Development Process**
   - Follow existing code style and patterns
   - Add tests for new features
   - Update documentation as needed
   - Ensure responsive design works on mobile

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add order status notifications"
   git push origin feature/order-notifications
   ```

5. **Submit Pull Request**
   - Create PR with clear description
   - Include screenshots for UI changes
   - Reference any related issues

## Deployment

### Local Production Build

```bash
# Build the application
npm run build

# Test production build locally
npm start
```

### Vercel Deployment (Recommended)

1. **Automatic Deployment**
   ```bash
   # Push code to GitHub
   git add .
   git commit -m "deploy: update application"
   git push origin main
   
   # Vercel will automatically deploy on push
   ```

2. **Manual Deployment via Vercel CLI**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel --prod
   ```

3. **Environment Variables on Vercel**
   - Go to Vercel Dashboard
   - Select your project
   - Navigate to Settings > Environment Variables
   - Add production environment variables

### Alternative Deployment Options

#### Netlify
```bash
# Build command: npm run build
# Publish directory: .next
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=.next
```

#### Traditional Server Deployment
```bash
# Build the application
npm run build

# Copy files to server
rsync -avz .next/ user@server:/path/to/application/

# Install PM2 for process management
npm install -g pm2

# Start application
pm2 start npm --name "cp-shirt-order" -- start
```

### Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   # Dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   # Copy package files
   COPY package*.json ./
   RUN npm ci --only=production
   
   # Copy application code
   COPY . .
   
   # Build application
   RUN npm run build
   
   # Expose port
   EXPOSE 3000
   
   # Start application
   CMD ["npm", "start"]
   ```

2. **Build and Run Docker Container**
   ```bash
   # Build Docker image
   docker build -t cp-shirt-order .
   
   # Run container
   docker run -p 3000:3000 cp-shirt-order
   ```

## Data Management

### Order Data Structure

```javascript
// Order object structure
const order = {
  id: 'unique-order-id',
  studentId: 'STU001',
  studentName: 'John Doe',
  email: 'john.doe@university.edu',
  shirtSize: 'M',           // XS, S, M, L, XL, XXL
  quantity: 2,
  totalAmount: 600,         // In Thai Baht
  status: 'pending',        // pending, picked_up, shipping, shipped
  datapickup: '2024-12-25', // Scheduled pickup date
  orderDate: '2024-12-01T10:30:00Z',
  notes: 'Special delivery instructions',
  paymentStatus: 'paid',    // pending, paid, refunded
  trackingNumber: null,     // For shipped orders
  createdAt: '2024-12-01T10:30:00Z',
  updatedAt: '2024-12-01T10:30:00Z'
}
```

### Export Functionality

```javascript
// lib/export.js
import * as XLSX from 'xlsx'

export const exportToExcel = (orders) => {
  const worksheet = XLSX.utils.json_to_sheet(orders.map(order => ({
    'Order ID': order.id,
    'Student ID': order.studentId,
    'Student Name': order.studentName,
    'Email': order.email,
    'Shirt Size': order.shirtSize,
    'Quantity': order.quantity,
    'Total Amount': order.totalAmount,
    'Status': order.status,
    'Pickup Date': order.datapickup,
    'Order Date': new Date(order.orderDate).toLocaleDateString(),
    'Notes': order.notes
  })))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders')
  
  const fileName = `shirt_orders_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(workbook, fileName)
}
```

### Backup System

```javascript
// lib/backup.js
export const createBackup = () => {
  const data = {
    orders: getOrders(),
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  }

  if (typeof window !== 'undefined') {
    // Client-side backup
    localStorage.setItem('cp_shirt_backup', JSON.stringify(data))
  } else {
    // Server-side backup (for Vercel, uses /tmp)
    const fs = require('fs')
    const path = process.env.STORAGE_PATH || './data'
    
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true })
    }
    
    fs.writeFileSync(
      `${path}/backup_${Date.now()}.json`,
      JSON.stringify(data, null, 2)
    )
  }
}

// Auto backup every 30 seconds
setInterval(createBackup, 30000)
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find and kill process on port 3000
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9
   
   # Or use different port
   npm run dev -- -p 3001
   ```

2. **Node.js Version Issues**
   ```bash
   # Check current Node.js version
   node --version
   
   # Install Node Version Manager
   # Windows: download from https://github.com/coreybutler/nvm-windows
   # macOS/Linux: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   
   # Install and use Node.js 18
   nvm install 18
   nvm use 18
   ```

3. **Dependency Installation Issues**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   
   # Use yarn as alternative
   npm install -g yarn
   yarn install
   ```

4. **Build Failures**
   ```bash
   # Check for TypeScript errors
   npm run type-check
   
   # Fix linting issues
   npm run lint:fix
   
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

5. **Vercel Deployment Issues**
   ```bash
   # Check build logs in Vercel dashboard
   # Ensure all environment variables are set
   # Verify Node.js version compatibility
   
   # Test build locally
   npm run build
   npm start
   ```

### Debug Mode

1. **Enable Debug Logging**
   ```javascript
   // lib/debug.js
   export const debug = {
     enabled: process.env.NODE_ENV === 'development',
     log: (...args) => {
       if (debug.enabled) {
         console.log('[DEBUG]', ...args)
       }
     },
     error: (...args) => {
       if (debug.enabled) {
         console.error('[ERROR]', ...args)
       }
     }
   }
   ```

2. **Performance Monitoring**
   ```javascript
   // lib/performance.js
   export const measurePerformance = (name, fn) => {
     const start = performance.now()
     const result = fn()
     const end = performance.now()
     console.log(`${name} took ${end - start} milliseconds`)
     return result
   }
   ```

## Security Considerations

### Data Protection
- Input validation for all user data
- XSS protection through React's built-in escaping
- CSRF protection for state-changing operations
- Secure handling of student information
- Regular data backups

### Access Control
- Role-based access (admin vs student views)
- Session management for administrative functions
- Rate limiting for API endpoints
- Audit logging for sensitive operations

## Performance Optimization

### Next.js Optimizations
- Static generation for public pages
- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Tree shaking for unused code removal

### Database Optimization
- Efficient data structures for in-memory storage
- Pagination for large order lists
- Caching for frequently accessed data
- Optimized export operations

## Future Enhancements

### Planned Features

1. **Authentication System**
   - Student login with university credentials
   - Admin dashboard with role-based access
   - OAuth integration

2. **Payment Integration**
   - Online payment processing
   - Payment status tracking
   - Refund management

3. **Notification System**
   - Email notifications for status changes
   - SMS alerts for pickup reminders
   - Push notifications for mobile users

4. **Advanced Reporting**
   - Sales analytics dashboard
   - Inventory management reports
   - Financial summaries

5. **Mobile Application**
   - React Native mobile app
   - QR code scanning for pickup
   - Offline capability

### Technical Roadmap

- **Phase 1**: Enhanced UI/UX improvements
- **Phase 2**: Authentication and user management
- **Phase 3**: Payment system integration
- **Phase 4**: Mobile app development
- **Phase 5**: Advanced analytics and reporting

## Support and Documentation

### Getting Help
- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Use GitHub Discussions for questions
- **Wiki**: Check project wiki for detailed guides
- **Contact**: Reach out to SMOCP organization

### Contributing
- Follow the contributing guidelines
- Submit feature requests through GitHub
- Join development discussions
- Help with documentation improvements

## License

This project is developed for the Student Major Organization - Computer Programming (SMOCP). Please check with the organization for usage rights and licensing terms.

## Acknowledgments

- Built for SMOCP (Student Major Organization - College of Computinh)
- Thanks to all student contributors and testers
- Special thanks to the organization leadership for requirements and feedback
- Powered by Next.js and Vercel Platform

---

**Note**: This system handles student personal information and financial data. Ensure compliance with educational institution policies and local data protection regulations when deploying in production environments. Regular backups and security updates are strongly recommended.
