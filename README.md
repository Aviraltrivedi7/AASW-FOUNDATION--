# 🌟 AASW Foundation Website

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
</p>

<p align="center">
  <b>Aapka Apna Social Welfare Foundation</b><br>
  Empowering women through digital education, eco-friendly entrepreneurship, and sustainable growth opportunities.
</p>

---

## 🚀 Features

- ✨ Modern, responsive design with dark theme
- 🎨 Premium UI with Tailwind CSS & Material Design
- 📱 Mobile-first approach with touch support
- 🔐 Secure admin dashboard with JWT authentication
- 💳 Razorpay payment integration for memberships
- 📧 Contact form with email notifications
- 🎯 Membership management system
- ⚡ High-performance with Node.js clustering
- 🛡️ Security hardened with Helmet.js & rate limiting
- 🌐 Bilingual support (English/Hindi)
- 🎭 Font Awesome icons & Material Symbols

---

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Gmail account** (for SMTP email)
- **Razorpay account** (for payment processing)
- **InsForge account** (optional, for backend services)

---

## 🔧 Installation

### 1. Clone the repository
```bash
git clone https://github.com/Aviraltrivedi7/AASW-FOUNDATION-.git
cd AASW-FOUNDATION-
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` file with your credentials:
- Set `JWT_SECRET` (generate using: `openssl rand -hex 64`)
- Add Razorpay test/live keys
- Configure SMTP settings for Gmail
- Set InsForge credentials (if using)

### 4. Start the server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode** (with clustering):
```bash
npm start
```

The website will be available at **http://localhost:3000**

---

## 📁 Project Structure

```
aasw-foundation/
├── aasw-pro/              # Frontend static files
│   ├── css/               # Stylesheets (Tailwind compiled)
│   ├── js/                # JavaScript files
│   │   ├── main.js        # Main functionality & i18n
│   │   └── nav-mobile.js  # Mobile navigation
│   ├── images/            # Images and assets
│   ├── admin/             # Admin pages
│   │   ├── login.html     # Admin login
│   │   └── dashboard.html # Admin dashboard
│   ├── index.html         # Homepage
│   ├── team.html          # Team page
│   ├── membership.html    # Membership page
│   ├── governance.html    # Governance page
│   └── *.html             # Other pages
├── src/
│   ├── app.js             # Express app configuration
│   ├── config/            # Configuration files
│   │   └── insforge.js    # InsForge SDK setup
│   ├── controllers/       # Route controllers
│   │   ├── contact.controller.js
│   │   ├── membership.controller.js
│   │   └── health.controller.js
│   ├── middlewares/       # Custom middlewares
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── validation.middleware.js
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   │   └── certificate.service.js
│   └── utils/             # Utility functions
│       ├── email.js       # Email service
│       ├── sms.js         # SMS service
│       └── lang.js        # i18n utilities
├── tools/                 # Build and optimization tools
│   ├── build-tailwind.js  # Tailwind CSS compiler
│   ├── minify_script.js   # JS minification
│   └── optimize_images.js # Image optimization
├── server.js              # Server entry point (with clustering)
├── package.json           # Dependencies
├── .env                   # Environment variables (DO NOT COMMIT)
├── .env.example           # Environment template
└── README.md              # This file
```

---

## 🔐 Security Features

- ✅ **Helmet.js** for HTTP headers security
- ✅ **Rate limiting** on API endpoints (100 req/15min)
- ✅ **CORS protection** with whitelist
- ✅ **JWT authentication** for admin panel
- ✅ **Input validation** with Joi
- ✅ **Honeypot spam protection** in forms
- ✅ **Cookie security** with httpOnly flags
- ✅ **Gzip compression** for performance
- ✅ **Static asset caching** (1 year)

---

## 🚀 Production Deployment

### 1. Update environment variables
```bash
NODE_ENV=production
JWT_SECRET=<generate-secure-64-char-hex>
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXX
RAZORPAY_KEY_SECRET=<your-live-secret>
ALLOWED_ORIGINS=https://aaswfoundation.org,https://www.aaswfoundation.org
```

### 2. Build optimizations
- ✅ Gzip compression enabled
- ✅ Static asset caching (1 year)
- ✅ Minified CSS/JS
- ✅ Image optimization

### 3. Run with PM2 (recommended)
```bash
npm install -g pm2
pm2 start server.js --name aasw-foundation -i max
pm2 save
pm2 startup
```

### 4. Nginx reverse proxy (optional)
```nginx
server {
    listen 80;
    server_name aaswfoundation.org www.aaswfoundation.org;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🐛 Bug Fixes Applied

✅ **Fixed incomplete HTML button tag** in contact form  
✅ **Fixed incomplete JavaScript string** in form handler  
✅ **Added Font Awesome library** for icons across all pages  
✅ **Added Tailwind CDN** to admin login page  
✅ **Fixed mobile menu toggle ID** across all HTML pages  
✅ **Removed duplicate navigation code** in dashboard  
✅ **Created .env.example** for proper configuration reference  
✅ **All pages now error-free** and fully functional  

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Backend runtime environment |
| **Express.js** | Web server framework |
| **Tailwind CSS** | Utility-first CSS framework |
| **Font Awesome** | Icon library |
| **Material Symbols** | Google Material icons |
| **Razorpay** | Payment gateway integration |
| **Nodemailer** | Email service |
| **JWT** | Authentication tokens |
| **Helmet.js** | Security middleware |
| **Compression** | Gzip compression |
| **InsForge SDK** | Backend-as-a-Service |

---

## 📦 Available Scripts

```bash
# Development mode (auto-reload on file changes)
npm run dev

# Production mode (with clustering for high traffic)
npm start

# Build Tailwind CSS
node tools/build-tailwind.js

# Minify JavaScript
node tools/minify_script.js

# Optimize images
node tools/optimize_images.js
```

---

## 🌐 API Endpoints

### Public Endpoints
- `GET /` - Homepage
- `GET /api/v1/health` - Health check
- `POST /api/v1/contact` - Contact form submission
- `POST /api/v1/membership` - Membership registration

### Admin Endpoints (Protected)
- `POST /admin/login` - Admin login
- `GET /admin/dashboard` - Admin dashboard
- `POST /admin/logout` - Admin logout

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/YourFeature`
3. Commit your changes: `git commit -m 'Add: YourFeature'`
4. Push to the branch: `git push origin feature/YourFeature`
5. Open a Pull Request

---

## 📄 License

© 2026 AASW Foundation. All rights reserved.

---

## 📞 Support

For support, contact us:
- 📧 Email: **aaswfoundation06@gmail.com**
- 📱 Phone: **+91 9984156418** | **+91 7007276735**
- 🏢 Address: **Ward No 2, Ambedkar Nagar, Rura, Kanpur Dehat, UP 209303**

---

## 👨‍💻 Author

**Aviral Trivedi**
- GitHub: [@Aviraltrivedi7](https://github.com/Aviraltrivedi7)

---

<p align="center">
  <b>Built with ❤️ for women empowerment in India</b>
</p>
