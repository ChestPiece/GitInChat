# GitInChat

GitInChat is an AI-powered GitHub assistant that lets you control your repositories through natural language. Connect your GitHub account, describe what you want to do in plain English, and GitInChat will execute the appropriate GitHub operations safely and efficiently.

## Features

- **Natural-language GitHub control**: Manage branches, pull requests, issues, and releases from one chat interface
- **Grounded code answers**: Get RAG-indexed, cited responses from your repositories for higher trust
- **Safe automation rails**: Guarded commands reduce risky operations and accidental pushes
- **End-to-end shipping**: Go from idea to PR in one workflow with auditable tool calls

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- GitHub account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/git-in-chat.git
cd git-in-chat
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Technology Stack

- **Framework**: Next.js 16
- **Styling**: Tailwind CSS
- **Animations**: GSAP (GreenSock Animation Platform)
- **Authentication**: Supabase Auth with GitHub OAuth
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: Vercel AI SDK
- **UI Components**: Radix UI, Lucide Icons

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Your application URL |
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |

## Deployment

The easiest way to deploy GitInChat is to use [Vercel](https://vercel.com) (created by the makers of Next.js).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Powered by [Supabase](https://supabase.com)
- Animations by [GSAP](https://greensock.com/gsap)
- Icons by [Lucide](https://lucide.dev)