# SearxNG LinkedIn Collector - Architecture & Repository Strategy Proposal

## Current Directory Structure Analysis

### Current Issues
1. **Mixed concerns**: Backend (PowerShell/Node.js) and frontend (React) code are in the same repository
2. **Unclear separation**: API server files are in root directory alongside PowerShell scripts
3. **Scattered configuration**: Multiple package.json files (root and searx-ui)
4. **Mixed runtime environments**: PowerShell scripts, Node.js API server, and React app

## Proposed Directory Layout Optimization

### Option 1: Monorepo Structure (Recommended)
Keep everything in one repository but with better organization:

```
SearxQueries/
├── .github/
│   └── workflows/           # CI/CD pipelines
├── packages/
│   ├── api/                 # Node.js API Server
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── server.js
│   │   ├── package.json
│   │   └── README.md
│   ├── ui/                  # React Frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── utils/
│   │   │   └── App.tsx
│   │   ├── public/
│   │   ├── package.json
│   │   └── README.md
│   └── scripts/             # PowerShell Scripts
│       ├── modules/
│       │   └── SearxHelpers.psm1
│       ├── ScriptQueries.ps1
│       ├── ScriptQueriesParallel.ps1
│       └── README.md
├── shared/                  # Shared types/interfaces
│   └── types.ts
├── docs/                    # Documentation
│   ├── USAGE_GUIDE.md
│   ├── QUICK_REFERENCE.md
│   └── examples/
├── data/                    # Data directories
│   ├── cache/
│   ├── exports/
│   ├── logs/
│   └── reports/
├── config/                  # Configuration files
│   └── settings.yml.example
├── package.json             # Root package.json for workspace
├── pnpm-workspace.yaml      # or lerna.json for monorepo management
└── README.md
```

### Option 2: Separate Repositories
Split into multiple repositories:

#### Repository 1: `searxng-collector-core`
```
searxng-collector-core/
├── scripts/
│   ├── ScriptQueries.ps1
│   ├── ScriptQueriesParallel.ps1
│   └── SearxHelpers.psm1
├── config/
│   └── settings.yml.example
├── docs/
└── README.md
```

#### Repository 2: `searxng-collector-api`
```
searxng-collector-api/
├── src/
│   ├── routes/
│   ├── services/
│   └── server.js
├── package.json
├── Dockerfile
└── README.md
```

#### Repository 3: `searxng-collector-ui`
```
searxng-collector-ui/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── App.tsx
├── public/
├── package.json
├── Dockerfile
└── README.md
```

## Recommendation: Monorepo Approach

### Advantages of Monorepo:
1. **Atomic commits**: Changes across frontend/backend can be committed together
2. **Easier refactoring**: Shared types and interfaces can be updated in one place
3. **Simplified versioning**: One version number for the entire project
4. **Better developer experience**: Single clone, single IDE workspace
5. **Shared tooling**: ESLint, Prettier, TypeScript configs can be shared
6. **Simplified CI/CD**: One pipeline can handle all components

### Disadvantages of Separate Repos:
1. **Coordination overhead**: Need to manage versions across repos
2. **Complex deployment**: Multiple repos to track for releases
3. **Duplicated configuration**: Each repo needs its own CI/CD, linting, etc.
4. **Cross-repo PRs**: Features spanning multiple repos require multiple PRs

## Implementation Steps

### Phase 1: Reorganize Current Repository
```bash
# 1. Create new directory structure
mkdir -p packages/{api,ui,scripts}
mkdir -p shared docs data config

# 2. Move files to appropriate locations
# API files
mv api-server.js packages/api/src/server.js
mv package.json packages/api/

# UI files  
mv searx-ui/* packages/ui/

# Scripts
mv *.ps1 packages/scripts/
mv *.psm1 packages/scripts/modules/

# Documentation
mv *.md docs/
mv example-queries docs/examples/
```

### Phase 2: Setup Monorepo Tooling

#### Using pnpm workspaces (Recommended):
```json
// Root package.json
{
  "name": "searxng-linkedin-collector",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "pnpm run --parallel dev",
    "build": "pnpm run --recursive build",
    "test": "pnpm run --recursive test",
    "api:dev": "pnpm --filter @searxng/api dev",
    "ui:dev": "pnpm --filter @searxng/ui dev"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^5.0.0",
    "@typescript-eslint/parser": "^5.0.0",
    "eslint": "^8.0.0",
    "prettier": "^2.0.0",
    "typescript": "^5.0.0"
  }
}
```

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'shared'
```

### Phase 3: Update Import Paths
```typescript
// packages/ui/src/services/api.ts
import { SearchParams, SearchResult } from '@searxng/shared/types';

// packages/api/src/routes/search.js
const { SearchParams } = require('@searxng/shared/types');
```

### Phase 4: Create Shared Types
```typescript
// shared/types.ts
export interface SearchParams {
  keywords: string[];
  searxUrl: string;
  useCache: boolean;
  // ... other params
}

export interface SearchResult {
  title: string;
  url: string;
  keyword: string;
  engine: string;
}
```

### Phase 5: Setup Development Scripts
```json
// packages/api/package.json
{
  "name": "@searxng/api",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  }
}

// packages/ui/package.json
{
  "name": "@searxng/ui",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## Docker Support (Optional)

### Root docker-compose.yml
```yaml
version: '3.8'
services:
  api:
    build: ./packages/api
    ports:
      - "3001:3001"
    volumes:
      - ./data:/app/data
      - ./packages/scripts:/app/scripts
    
  ui:
    build: ./packages/ui
    ports:
      - "5173:5173"
    depends_on:
      - api
    environment:
      - VITE_API_URL=http://api:3001

  searxng:
    image: searxng/searxng:latest
    ports:
      - "8888:8080"
    volumes:
      - ./config/settings.yml:/etc/searxng/settings.yml
```

## Benefits of Proposed Structure

1. **Clear separation of concerns**: Each package has a single responsibility
2. **Better scalability**: Easy to add new packages (e.g., CLI tool, mobile app)
3. **Improved testing**: Each package can have its own test suite
4. **Easier onboarding**: New developers can understand the structure quickly
5. **Better build optimization**: Can build/deploy only changed packages
6. **Type safety**: Shared types ensure consistency across packages

## Migration Checklist

- [ ] Backup current repository
- [ ] Create new directory structure
- [ ] Move files to appropriate locations
- [ ] Update import paths in all files
- [ ] Setup monorepo tooling (pnpm/lerna/nx)
- [ ] Update CI/CD pipelines
- [ ] Test all functionality
- [ ] Update documentation
- [ ] Create migration guide for existing users

## Conclusion

**Recommendation**: Keep as a monorepo with better organization rather than splitting into separate repositories. The benefits of atomic commits, shared tooling, and simplified development workflow outweigh the minimal advantages of separate repositories for a project of this size and scope.

The proposed structure provides:
- Clear separation between PowerShell scripts, API server, and React UI
- Shared types and utilities
- Scalability for future additions
- Professional project organization
- Easy deployment options (Docker, traditional, or cloud)
