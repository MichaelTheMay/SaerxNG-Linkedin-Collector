# 🔧 SearxNG Not Returning Results - Fix Guide

## Problem Identified

Your SearxNG instance is running on `http://localhost:8888` but **returning 0 results for all queries**.

### Test Results
```
✅ SearxNG is accessible (port 8888 is open)
❌ SearxNG returns 0 results for all searches
❌ No LinkedIn profiles can be found
```

---

## 🎯 Solutions (Try in Order)

### Solution 1: Check Search Engines Are Enabled

SearxNG might have no search engines enabled or all are disabled.

**Check settings.yml:**
```yaml
engines:
  - name: bing
    disabled: false    # Make sure this is false, not true
    
  - name: google
    disabled: false
    
  - name: duckduckgo
    disabled: false
```

**How to fix:**
1. Find your SearxNG settings file (usually `/etc/searxng/settings.yml` in Docker)
2. Edit it and ensure some engines have `disabled: false`
3. Restart SearxNG

**Docker restart:**
```bash
docker restart searxng
```

---

### Solution 2: Enable JSON Format

The script requires JSON output which might not be enabled.

**Add to settings.yml:**
```yaml
search:
  formats:
    - html
    - json    # This line must be present!
```

**Restart after changes:**
```bash
docker restart searxng
```

---

### Solution 3: Disable Rate Limiting

Rate limiting might be blocking queries.

**Edit settings.yml:**
```yaml
server:
  limiter: false    # Disable rate limiting
  secret_key: "your-secret-key-here"
```

**Restart:**
```bash
docker restart searxng
```

---

### Solution 4: Check Engine Configuration

Some engines might be configured but not working.

**Test in browser:**
1. Open `http://localhost:8888`
2. Type any search query (e.g., "test")
3. Do you see results?

**If NO results in browser:**
- SearxNG configuration issue
- Check Docker logs: `docker logs searxng`

**If YES results in browser but NO via API:**
- JSON format not enabled (see Solution 2)
- Check API URL format

---

### Solution 5: Use Public SearxNG Instance

If local SearxNG won't work, use a public instance temporarily.

**Public instances:**
- https://searx.be
- https://search.sapti.me
- https://searx.ninja

**Update script to use public instance:**
```powershell
.\ScriptQueries.ps1 -SearxURL "https://searx.be" -Keywords "Stanford Computer Science"
```

**Note:** Public instances may have rate limits!

---

### Solution 6: Reinstall/Reconfigure SearxNG

If nothing works, reinstall SearxNG.

**Docker reinstall:**
```bash
# Stop and remove old container
docker stop searxng
docker rm searxng

# Pull and run fresh instance
docker pull searxng/searxng
docker run -d \
  --name searxng \
  -p 8888:8080 \
  -v /your/path/searxng:/etc/searxng \
  -e BASE_URL=http://localhost:8888/ \
  searxng/searxng
```

**After install:**
1. Wait 30 seconds for startup
2. Check `http://localhost:8888` in browser
3. Edit settings.yml to enable JSON format
4. Restart: `docker restart searxng`

---

## 🧪 Testing Your Fix

After applying a solution, test with this command:

```powershell
# Test SearxNG is returning results
$query = [uri]::EscapeDataString("test search")
$url = "http://localhost:8888/search?q=$query&format=json"
$response = Invoke-WebRequest -Uri $url -UseBasicParsing
$json = $response.Content | ConvertFrom-Json
Write-Host "Results: $($json.results.Count)"
```

**Expected output:** `Results: 10` (or more)  
**Problem persists:** `Results: 0`

---

## 🎯 Test LinkedIn Specifically

Once basic search works, test LinkedIn:

```powershell
# Test LinkedIn search
$query = [uri]::EscapeDataString("Stanford Computer Science linkedin")
$url = "http://localhost:8888/search?q=$query&format=json"
$response = Invoke-WebRequest -Uri $url -UseBasicParsing
$json = $response.Content | ConvertFrom-Json

Write-Host "LinkedIn results: $($json.results.Count)"
$json.results | ForEach-Object {
    if ($_.url -like "*linkedin.com*") {
        Write-Host "  ✓ $($_.title)"
    }
}
```

---

## 🔍 Check SearxNG Logs

**View Docker logs:**
```bash
docker logs searxng
```

**Look for:**
- Engine initialization errors
- Configuration errors
- Network errors
- API request logs

---

## ⚙️ Minimal Working Configuration

Here's a minimal `settings.yml` that should work:

```yaml
use_default_settings: true

general:
  instance_name: "SearxNG"
  
server:
  secret_key: "changeme"
  limiter: false
  
search:
  formats:
    - html
    - json
    
engines:
  - name: bing
    disabled: false
    
  - name: duckduckgo  
    disabled: false
```

**Steps:**
1. Replace your settings.yml with above
2. Change `secret_key` to something unique
3. Restart: `docker restart searxng`
4. Test in browser: `http://localhost:8888`
5. Test API: See testing commands above

---

## 🚨 Common Errors

### "No search engines are enabled"
- **Cause:** All engines are disabled in settings.yml
- **Fix:** Enable at least one engine (see Solution 1)

### "Format 'json' is not supported"
- **Cause:** JSON format not enabled in settings.yml
- **Fix:** Add `json` to formats list (see Solution 2)

### "Too Many Requests"
- **Cause:** Rate limiting is blocking queries
- **Fix:** Disable limiter (see Solution 3)

### "Connection refused"
- **Cause:** SearxNG not running or wrong port
- **Fix:** Check Docker: `docker ps` and verify port 8888

---

## ✅ Verification Checklist

Once fixed, verify:

- [ ] SearxNG returns results in browser
- [ ] SearxNG JSON API works (test command above)
- [ ] LinkedIn results appear in searches
- [ ] Script finds profiles: `.\ScriptQueries.ps1 -Keywords "Stanford CS" -SkipTest`

---

## 🆘 Still Not Working?

### Option A: Use Different SearxNG Instance
```powershell
# Try public instance
.\ScriptQueries.ps1 -SearxURL "https://searx.be"
```

### Option B: Check Settings File Location

**Docker:**
```bash
# Find settings location
docker exec searxng ls -la /etc/searxng/
```

**Make changes:**
```bash
# Edit directly in container
docker exec -it searxng nano /etc/searxng/settings.yml

# Or edit on host if volume mounted
nano /your/path/to/settings.yml
```

### Option C: Fresh Start

1. Backup any important settings
2. Stop and remove container
3. Delete settings volume
4. Create fresh instance with minimal config (see above)
5. Test before adding complexity

---

## 📞 Next Steps

1. **Apply Solution 1 & 2 first** (most common issues)
2. **Test after each change**
3. **Check Docker logs** if still failing
4. **Try public instance** as temporary workaround
5. **Run script** once SearxNG is working:
   ```powershell
   .\ScriptQueries.ps1 -Keywords "Stanford Computer Science" -Verbose
   ```

---

**Created:** October 8, 2025  
**Issue:** SearxNG returning 0 results  
**Status:** Needs configuration fix  
**Priority:** 🔴 Critical (blocks all searches)

