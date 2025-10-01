# DataContract Catalog

A modern web application for managing data contracts and data products, built with React, TypeScript, Vite, ShadCN UI, and Tailwind CSS.

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # ShadCN UI components
│   ├── layout/         # Layout components
│   ├── domain/         # Domain-specific components
│   ├── contract/       # Contract-specific components
│   └── product/        # Product-specific components
├── stores/             # Zustand state management
│   ├── domain/         # Domain store
│   ├── contract/       # Contract store
│   └── product/        # Product store
├── pages/              # Page components
│   ├── domain/         # Domain pages
│   ├── contract/       # Contract pages
│   └── product/        # Product pages
├── types/              # TypeScript type definitions
├── lib/                # Utility functions
└── assets/             # Static assets
```

## Tech Stack

- **Vite** - Build tool and development server
- **React 19** - UI framework
- **TypeScript** - Type safety
- **ShadCN UI** - Component library
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **Zustand** - State management
- **Lucide React** - Icons

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Features

- ✅ Modern React 19 with TypeScript
- ✅ ShadCN UI components with dark/light theme support
- ✅ Tailwind CSS for styling
- ✅ React Router for navigation
- ✅ Zustand for state management
- ✅ ESLint with TypeScript rules
- ✅ Strict TypeScript configuration
- ✅ Path aliases (@/* imports)
- ✅ Organized folder structure