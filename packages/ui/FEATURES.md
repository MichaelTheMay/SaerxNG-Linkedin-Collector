# React UI Features

## 🎯 Search Execution

The React UI now includes full search execution capabilities:

### Real Backend Integration
- **Live API Connection**: Connects to Node.js backend server (`api-server.js`)
- **Real-time Search**: Executes actual PowerShell scripts (ScriptQueries.ps1 / ScriptQueriesParallel.ps1)
- **Progress Tracking**: Monitor search progress in real-time
- **Result Display**: View LinkedIn profile results directly in the UI

### How to Use
1. Start the API server: `node api-server.js` (port 3001)
2. Start the React UI: `cd searx-ui && npm run dev` (port 5174)
3. Configure SearxNG URL and work directory
4. Add keywords or use the Query Builder
5. Click "Run Search" to execute

## 🔧 Advanced Query Builder

Build complex Boolean search queries with AND/OR operators:

### Features
- **Multiple Groups**: Create separate keyword groups
- **AND/OR Operators**: Choose logic for each group
- **Cartesian Product**: Automatically generates all combinations
- **Live Preview**: See generated queries in real-time
- **Copy to Clipboard**: Export all queries at once

### Example Usage
**Group 1 (AND)**:  
- Stanford
- Computer Science

**Group 2 (OR)**:
- PhD
- Professor
- Researcher

**Generated Queries**:
1. Stanford AND "Computer Science" OR PhD
2. Stanford AND "Computer Science" OR Professor
3. Stanford AND "Computer Science" OR Researcher

### How to Access
1. Click the green "Query Builder" button in the keyword list panel
2. Add keywords to different groups
3. Choose AND/OR operators
4. Click "Generate Queries"
5. Queries are automatically added to your keyword list

## 🎨 UI Improvements

### Snackbar Notifications
- Success/error/info messages
- Auto-dismiss after 6 seconds
- Non-intrusive (bottom-right corner)

### Real Connection Testing
- Tests actual SearxNG connection
- Verifies backend API availability
- Reports detailed error messages

### Enhanced Console Output
- Color-coded messages
- Timestamp for each entry
- Real-time updates during search
- Displays PowerShell script output

## 📡 API Endpoints

The backend API (`api-server.js`) provides:

### `/api/test-connection`
- **POST**: Test SearxNG connection
- **Body**: `{ searxUrl: string }`
- **Response**: `{ success: boolean, message?: string, error?: string }`

### `/api/search`
- **POST**: Execute search with PowerShell backend
- **Body**: SearchParams (keywords, config options)
- **Response**: `{ success: boolean, results?: SearchResult[], output?: string, error?: string }`

### `/api/reports`
- **GET**: Get list of recent HTML reports
- **Response**: `{ reports: Array<{ name, path, modified, size }> }`

### `/api/reports/:filename`
- **GET**: Get specific report HTML content
- **Response**: HTML string

### `/api/keywords`
- **GET**: Load saved keywords from file
- **POST**: Save keywords to file

## 🚀 Running the Full Stack

### 1. Start SearxNG (Required)
```bash
# Your SearxNG instance must be running
# Default: http://localhost:8888
```

### 2. Start API Server (Backend)
```bash
# From project root
node api-server.js
# Runs on port 3001
```

### 3. Start React UI (Frontend)
```bash
cd searx-ui
npm run dev
# Runs on port 5174 (or 5173)
```

### 4. Run Search
1. Open http://localhost:5174
2. Test connection to SearxNG
3. Add keywords or use Query Builder
4. Click "Run Search"
5. View results in Results tab

## 📋 Configuration Options

All PowerShell script options are available in the UI:

- **SearxNG URL**: Custom SearxNG instance
- **Work Directory**: Where to save results
- **Use Cache**: Enable 24-hour result caching
- **Parallel Execution**: Run multiple searches simultaneously
- **Throttle Limit**: Max concurrent threads (1-10)
- **Delay**: Seconds between requests (1-10)
- **Max Retries**: Retry failed requests (1-5)
- **Export Format**: CSV, JSON, TXT, HTML, or ALL
- **Verbose Output**: Detailed console logging

## 🔍 Query Builder Advanced Examples

### Example 1: University + Role Combinations
```
Group 1 (AND): Stanford, MIT, Harvard
Group 2 (AND): Computer Science
Group 3 (OR): Professor, PhD, Researcher

Generates 9 queries (3 × 1 × 3 = 9)
```

### Example 2: Location + Skills
```
Group 1 (AND): San Francisco, New York
Group 2 (OR): Python, JavaScript, React
Group 3 (AND): Senior Developer

Generates 6 queries (2 × 3 × 1 = 6)
```

### Example 3: Company + Department
```
Group 1 (OR): Google, Meta, Amazon, Apple
Group 2 (AND): Machine Learning Engineer

Generates 4 queries (4 × 1 = 4)
```

## 💡 Tips & Best Practices

1. **Start Small**: Test with a few keywords before running large batches
2. **Use Query Builder**: For complex Boolean logic combinations
3. **Monitor Console**: Watch real-time progress and debug issues
4. **Check Connection First**: Always test SearxNG connection before searching
5. **Enable Caching**: Avoid re-scraping the same queries
6. **Parallel Mode**: 3-5 threads is optimal for most systems
7. **Delay Settings**: Use 2-3 seconds to avoid rate limiting

## 🐛 Troubleshooting

### "Failed to connect to SearxNG"
- Ensure SearxNG is running on correct port
- Check firewall settings
- Verify SearxNG URL in configuration

### "Backend API not responding"
- Start the API server: `node api-server.js`
- Check port 3001 is not in use
- Look for errors in API server console

### "Search failed"
- Check PowerShell scripts exist in project root
- Verify Work Directory path is correct
- Check console output for detailed errors
- Ensure sufficient disk space for results

### Query Builder not generating queries
- Ensure all groups have at least one keyword
- Check that groups aren't empty
- Try refreshing the page

## 📚 Architecture

```
┌─────────────────┐
│   React UI      │  Port 5174
│  (Frontend)     │
└────────┬────────┘
         │ HTTP
         ├────────────────────────┐
         │                        │
         ▼                        ▼
┌────────────────┐       ┌────────────────┐
│   API Server   │       │    SearxNG     │
│   (Node.js)    │◄──────┤   Instance     │
│   Port 3001    │       │   Port 8888    │
└────────┬───────┘       └────────────────┘
         │
         ├──────────────┐
         ▼              ▼
┌─────────────┐  ┌──────────────┐
│ ScriptQuer..│  │ PowerShell   │
│   .ps1      │  │   Scripts    │
└─────────────┘  └──────────────┘
         │
         ▼
┌─────────────────┐
│  File System    │
│ (Results/Logs)  │
└─────────────────┘
```

## 🎉 What's New

- ✅ Real backend search execution
- ✅ Advanced query builder with AND/OR logic
- ✅ API integration with PowerShell scripts
- ✅ Real-time progress tracking
- ✅ Snackbar notifications
- ✅ Live connection testing
- ✅ Result viewing in UI
- ✅ Comprehensive error handling

