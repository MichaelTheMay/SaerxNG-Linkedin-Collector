# Shared Types and Utilities

This directory contains shared TypeScript types and utilities used by both the API server and React UI.

## Purpose

- **Type Safety**: Ensures consistent data structures across frontend and backend
- **Single Source of Truth**: Types defined once, used everywhere
- **Better IDE Support**: IntelliSense and autocomplete across the stack

## Files

- `types.ts` - Core TypeScript interfaces and types

## Usage

### In API Server (JavaScript with JSDoc)

```javascript
/**
 * @typedef {import('../shared/types').SearchParams} SearchParams
 * @typedef {import('../shared/types').SearchResponse} SearchResponse
 */

/** @type {SearchParams} */
const params = {
  keywords: ['test'],
  searxUrl: 'http://localhost:8888',
  // ...
};
```

### In React UI (TypeScript)

```typescript
import { SearchParams, SearchResult } from '../../shared/types';

const params: SearchParams = {
  keywords: ['test'],
  searxUrl: 'http://localhost:8888',
  // ...
};
```

## Benefits

1. **Compile-time Safety**: Catch type errors before runtime
2. **Refactoring Support**: Change types once, errors show everywhere it's used
3. **Documentation**: Types serve as inline documentation
4. **Consistency**: Same data structures across all components
