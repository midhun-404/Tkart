# 🚀 TrendKart — Professional E-Commerce Ecosystem

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://trendkart.pages.dev)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-blue?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
[![Firebase](https://img.shields.io/badge/Cloud-Firebase-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com)

TrendKart is a high-performance, full-stack e-commerce platform designed with a modern **Monorepo Architecture**. It features a stunning, responsive user interface, a robust administrative engine, and seamless integration with industry-standard payment and storage services.

---

## 💎 Core Features

### 🛍️ Customer Experience
- **Dynamic Catalog:** Real-time product browsing with advanced filtering and sorting.
- **Smart Cart System:** Persistent shopping cart with real-time price calculations.
- **Secure Checkout:** Integrated **Razorpay** payment gateway for seamless transactions.
- **Wishlist & Reviews:** Built-in community engagement features.
- **Deal of the Day:** Automated countdown timer for exclusive limited-time offers.

### 🛡️ Administrative Engine
- **Full Inventory Control:** Effortless management of products, categories, and brands.
- **Live Analytics:** Visualized sales data and user metrics using **Recharts**.
- **User Management:** Granular control over user roles and access permissions.
- **Design Studio:** Manage Hero sliders and homepage content directly from the dashboard.

### 🏗️ Technical Architecture
- **Monorepo Design:** Clean separation of concerns between Frontend, Backend, and Edge Workers.
- **Cloud-Native:** Leverages **Cloudflare Pages**, **Render**, and **Firebase** for global scale.
- **Security First:** Robust authentication and authorization using **Firebase Auth** and custom middleware.

---

## 📁 Project Structure

This project follows a professional Monorepo pattern for maximum maintainability:

```text
trendkart/
├── 📂 apps/
│   ├── 📂 web/       # React + Vite (Frontend Application)
│   ├── 📂 api/       # Express.js (RESTful API Service)
│   └── 📂 worker/    # Cloudflare Edge Worker (Background Logic)
├── 📂 infrastructure/
│   ├── 📂 firebase/   # Security Rules & Cloud Functions
│   └── 📂 platforms/  # Deployment Configs (Render, Wrangler)
├── 📂 scripts/        # Automation & Deployment Tools
└── 📂 docs/           # Technical Documentation & Setup Guides
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, TailwindCSS, Lucide Icons, Recharts |
| **Backend** | Node.js, Express.js |
| **Database** | Firebase Firestore |
| **Auth** | Firebase Authentication |
| **Storage** | Cloudinary (Images), Firebase Storage |
| **Payments** | Razorpay |
| **Hosting** | Cloudflare Pages (Web), Render (API) |

---

## 🚀 Quick Setup

### Prerequisites
- Node.js (v20+)
- Firebase Account
- Cloudinary & Razorpay Credentials

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/midhun-404/Tkart.git
   cd Tkart
   ```

2. **Backend Setup:**
   ```bash
   cd apps/api
   npm install
   cp .env.example .env # Add your credentials
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd apps/web
   npm install
   npm run dev
   ```

---

## 🚢 Deployment

Automated deployment scripts are provided in the `scripts/` directory:
- **Frontend:** Managed via Cloudflare Pages.
- **API:** Hosted on Render.com.

For full-stack deployment, run:
```powershell
./scripts/deploy-full-stack.ps1
```

---

## 👨‍💻 Author

**Midhun (midhun-404)**
- GitHub: [@midhun-404](https://github.com/midhun-404)
- Live Project: [trendkart.pages.dev](https://trendkart.pages.dev)

---

*This project is built with passion for scale and performance.*
