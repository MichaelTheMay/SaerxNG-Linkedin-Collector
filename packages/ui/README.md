# SearxNG LinkedIn Collector - React UI

A modern web interface for collecting LinkedIn profiles using SearxNG's privacy-focused metasearch engine.

## 🚀 Quick Start

### Option 1: Easy Launch (Recommended)
```bash
# Windows PowerShell
.\Start-ReactUI.ps1

# Windows Batch
Start-ReactUI.bat

# Linux/macOS
npm run dev
```

### Option 2: Manual Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

## 📋 Prerequisites

- **Node.js** 14 or higher
- **npm** 6 or higher
- **SearxNG** instance running (default: http://localhost:8888)
- Modern web browser

## ✨ Features

### 🔍 Search Functionality
- Direct integration with SearxNG API
- LinkedIn profile discovery and collection
- Real-time search progress
- Configurable search parameters

### 📊 Results Management
- View search results in a clean interface
- Export results to CSV or JSON
- Clickable profile links
- Keyword and engine tracking

### ⚙️ Configuration
- SearxNG URL configuration
- Search delay and timeout settings
- Parallel execution options
- Cache and verbose logging

### 💾 Local Storage
- Keywords persist between sessions
- Settings are saved locally
- No server-side storage required

## 🏗️ Architecture

```
┌─────────────────┐
│   React UI      │ ← Direct HTTP calls to SearxNG
│ (Port 5173)     │
└────────┬────────┘
         │
         │ JSON API calls
         ↓
┌─────────────────┐
│    SearxNG      │
│ (Port 8888)     │
└─────────────────┘
```

## 🔧 Configuration

### SearxNG Setup
Ensure your SearxNG instance:
- Is running and accessible
- Has JSON output enabled
- Allows cross-origin requests (CORS)
- Can access search engines (DuckDuckGo, Bing, Google)

### Default Settings
- **SearxNG URL**: `http://localhost:8888`
- **Search Engines**: DuckDuckGo, Bing, Google
- **Delay**: 2 seconds between requests
- **Timeout**: 30 seconds per request

## 🎯 Usage

1. **Start the UI**: Run the launcher script or `npm run dev`
2. **Configure**: Set your SearxNG URL if different from default
3. **Test Connection**: Click "Test Connection" to verify SearxNG is accessible
4. **Add Keywords**: Add search terms (e.g., "Stanford Computer Science")
5. **Run Search**: Click "Run Search" and wait for results
6. **Export Results**: Download results as CSV or JSON files

## 🐛 Troubleshooting

### Connection Issues
- **"Connection test failed"**: Ensure SearxNG is running at the configured URL
- **CORS errors**: Configure SearxNG to allow cross-origin requests
- **Network errors**: Check firewall and network connectivity

### Search Issues
- **No results**: Verify SearxNG can access search engines
- **Empty results**: LinkedIn profiles may not be indexed by your search engines
- **Slow searches**: Increase delay between requests

### Development Issues
- **Port conflicts**: Port 5173 may be in use by another application
- **Module errors**: Run `npm install` to install dependencies
- **Build errors**: Ensure Node.js version is 14+

## 🛠️ Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Project Structure
```
searx-ui/
├── src/
│   ├── api.ts          # SearxNG API client
│   ├── App.tsx         # Main application
│   ├── main.tsx        # React entry point
│   ├── QueryBuilder.tsx # Query builder component
│   ├── WizardRunner.tsx # Wizard component
│   └── style.css       # Global styles
├── public/             # Static assets
├── Start-ReactUI.bat   # Windows launcher
├── Start-ReactUI.ps1   # PowerShell launcher
└── package.json        # Dependencies and scripts
```

## 📝 API Reference

### Search Parameters
```typescript
interface SearchParams {
  keywords: string[];        // Search terms
  searxUrl: string;          // SearxNG base URL
  useCache: boolean;         // Enable caching
  openResults: boolean;      // Auto-open results
  verbose: boolean;          // Verbose logging
  parallel: boolean;         // Parallel execution
  throttleLimit: number;     // Max parallel requests
  delay: number;             // Delay between requests
  maxRetries: number;        // Retry attempts
}
```

### Result Format
```typescript
interface SearchResult {
  title: string;      // Profile title
  url: string;        // Clean LinkedIn URL
  keyword: string;    // Search keyword used
  engine: string;     // Search engine source
}
```

## 🔒 Security

- No data is sent to external servers
- All searches go through your SearxNG instance
- Keywords and settings stored locally in browser
- Direct browser-to-SearxNG communication

## 📄 License

MIT License - see main project LICENSE file.

## 🤝 Contributing

See main project CONTRIBUTING.md for guidelines.