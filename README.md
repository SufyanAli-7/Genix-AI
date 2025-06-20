# 🚀 AI SaaS Platform

<div align="center">
  <img src="public/logo.png" alt="AI SaaS Logo" width="200" height="200"/>
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.2.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Prisma](https://img.shields.io/badge/Prisma-6.8.2-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

  **The ultimate AI-powered platform for content creation**
  
  *Generate conversations, images, music, videos, and code with cutting-edge AI technology*
</div>

---

## ✨ Features

🤖 **AI Conversation** - Intelligent chatbot powered by OpenAI  
🎨 **Image Generation** - Create stunning visuals with AI  
🎵 **Music Generation** - Compose original music tracks  
🎬 **Video Generation** - Produce engaging video content  
💻 **Code Generation** - Generate clean, functional code  
🔐 **User Authentication** - Secure login with Clerk  
💳 **Subscription Management** - Stripe integration for payments  
📊 **Usage Tracking** - Monitor API limits and usage  
📱 **Responsive Design** - Optimized for all devices  
⚡ **Real-time Updates** - Instant content generation  

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **UI Library**: [React 19](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)

### Backend & Database
- **Database**: [PostgreSQL](https://www.postgresql.org/) via [Supabase](https://supabase.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Payments**: [Stripe](https://stripe.com/)

### AI & External Services
- **Fal AI**: Primary AI model integrations for image and video generation
- **Beatoven AI**: AI-powered music generation
- **ImageRouter**: Image processing and generation
- **GitHub API**: Code-related integrations

### Development Tools
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Linting**: [ESLint](https://eslint.org/)
- **Package Manager**: [npm](https://www.npmjs.com/)

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** database
- **Git**

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

# GitHub Token (for additional integrations)
GITHUB_TOKEN=ghp_xxxxx

# Image Router API
IMAGEROUTER_API_KEY=xxxxx

# Beatoven AI (Music Generation)
BEATOVEN_API_KEY=xxxxx

# Fal AI
FAL_KEY=xxxxx

# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.username:password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.username:password@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"

# Stripe Payment Processing
STRIPE_API_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-saas.git
   cd ai-saas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
ai-saas/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   ├── (landing)/         # Landing page
│   └── api/               # API routes
├── components/            # Reusable React components
│   └── ui/               # UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── prisma/               # Database schema and migrations
├── public/               # Static assets
└── scripts/              # Utility scripts
```

## 🎯 Usage

### For Users
1. **Sign Up/Login** - Create an account or login with existing credentials
2. **Choose AI Tool** - Select from conversation, image, music, video, or code generation
3. **Generate Content** - Input your prompts and let AI create amazing content
4. **Manage Subscription** - Upgrade to Pro for unlimited access

### For Developers
- All API routes are located in `app/api/`
- Database models are defined in `prisma/schema.prisma`
- UI components follow the shadcn/ui pattern
- State management is handled with Zustand

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run postinstall  # Generate Prisma client
```

## 🌟 Key Features Breakdown

### AI Conversation
- Powered by Fal AI models
- Context-aware responses
- Conversation history storage

### Image Generation
- ImageRouter API integration
- High-quality image output
- Various style options

### Music Generation
- Beatoven AI-composed original tracks
- Multiple genres supported
- Download functionality

### Video Generation
- AI-powered video creation
- Custom prompts support
- Various output formats

### Code Generation
- Multi-language support
- Clean, functional code output
- Syntax highlighting

## 💡 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- 📧 Email: msufyan.202105869@gcuf.edu.pk
- 📚 Documentation: [Coming Soon](https://docs.ai-saas.com)

## 🙏 Acknowledgments

- [Vercel](https://vercel.com) for hosting and deployment
- [Supabase](https://supabase.com) for PostgreSQL database hosting
- [Fal AI](https://fal.ai) for powerful AI model integrations
- [Beatoven AI](https://beatoven.ai) for music generation capabilities
- [ImageRouter](https://imagerouter.com) for image processing
- [Clerk](https://clerk.com) for authentication
- [Stripe](https://stripe.com) for payment processing

---

<div align="center">
  Made with ❤️ by Sufyan Ali
  
  ⭐ Star us on GitHub if you like this project!
</div>
