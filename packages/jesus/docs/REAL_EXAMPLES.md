# Real Examples of Site Creation

## Case Study: example.com

This document shows the EXACT commands executed to create a real site, including errors encountered and how they were solved.

---

## 📅 Project Timeline

### ❌ Attempt 1: Manual Structure (FAILED)

**Action**: Attempt to create subdomain structure manually via SSH

```bash
# What we tried to do:
ssh -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST}
mkdir -p domains/yourdomain.com/mysite/public_html
ln -s ../public_html/mysite domains/yourdomain.com/mysite/public_html

# Result: Error 403 Forbidden
curl -H "Host: mysite.yourdomain.com" http://YOUR_SERVER_IP/
# 403 Forbidden - Server doesn't recognize the domain
```

**Lesson**: Hostinger needs the site to be created from its web panel first.

---

### ❌ Attempt 2: DNS with CNAME + Proxy (FAILED)

**Action**: Create CNAME pointing to yourdomain.com with active proxy

```bash
# DNS created:
curl -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records" \
  -H "X-Auth-Email: ${CF_EMAIL}" \
  -H "X-Auth-Key: ${CF_API_KEY}" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "CNAME",
    "name": "mysite",
    "content": "yourdomain.com",
    "ttl": 1,
    "proxied": true
  }'

# DNS verification:
dig +short mysite.yourdomain.com
# 172.67.164.146
# 104.21.89.197

# Result: Error 522 Connection Timeout
curl http://mysite.yourdomain.com/
# error code: 522
```

**Problem**: CNAME with active proxy pointing to domain that also has proxy → loop/timeout

---

### ✅ Final Solution (WORKED)

#### Step 1: Create Site in Hostinger Panel

**Action**: Go to https://hpanel.hostinger.com/

1. Websites → Create Website
2. Domain: `mysite.yourdomain.com`
3. Select: "Empty Website"
4. Wait 1-2 minutes

**Verification**:
```bash
ssh -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST} "ls -la domains/"
# drwxr-xr-x 3 user group 4096 Jan  9 13:17 mysite.yourdomain.com
```

✅ **Result**: Directory `domains/mysite.yourdomain.com/` created automatically

---

#### Step 2: Delete CNAME and Create A Record

**Action**: Change from CNAME to direct A record

```bash
# 1. Delete existing CNAME
curl -X DELETE "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records/RECORD_ID" \
  -H "X-Auth-Email: ${CF_EMAIL}" \
  -H "X-Auth-Key: ${CF_API_KEY}"

# 2. Create A record without proxy
curl -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records" \
  -H "X-Auth-Email: ${CF_EMAIL}" \
  -H "X-Auth-Key: ${CF_API_KEY}" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "A",
    "name": "mysite",
    "content": "YOUR_SERVER_IP",
    "ttl": 1,
    "proxied": false
  }'
```

**Verification**:
```bash
dig +short mysite.yourdomain.com @8.8.8.8
# YOUR_SERVER_IP
```

✅ **Result**: DNS points directly to server

---

#### Step 3: Update Deploy Script

**Action**: Change path in `scripts/deploy.js`

```javascript
// ❌ BEFORE (incorrect - subdirectory)
const remoteDir = "domains/yourdomain.com/public_html/mysite/";

// ✅ AFTER (correct - full domain)
const remoteDir = "domains/mysite.yourdomain.com/public_html/";
```

---

#### Step 4: Build and Deploy

```bash
# 1. Build
node scripts/build.js
# ✨ Build complete!

# 2. Deploy
node scripts/deploy.js
# Transfer starting: 59 files
# ...
# ✅ Deployment complete!
```

**Server verification**:
```bash
ssh -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST} \
  "ls -la domains/mysite.yourdomain.com/public_html/"

# total 88
# drwxr-xr-x 17 user group  4096 Jan  9 11:26 .
# drwxr-xr-x  3 user group  4096 Jan  9 13:17 ..
# drwxr-xr-x  2 user group  4096 Jan  9 02:57 about
# drwxr-xr-x  2 user group  4096 Jan  9 02:56 ch1
# ...
# -rw-r--r--  1 user group 18973 Jan  9 11:27 index.html
```

✅ **Result**: All files deployed correctly

---

#### Step 5: Verify Access

```bash
# Direct server test
curl -I http://mysite.yourdomain.com/
# HTTP/1.1 200 OK
# Server: LiteSpeed
# Content-Type: text/html

# Content test
curl -s http://mysite.yourdomain.com/ | grep -o "<h1[^>]*>[^<]*</h1>" | head -1
# <h1 class="toc-title">The Content</h1>

# Test other version (if applicable)
curl -s http://mysite.yourdomain.com/other/ | grep -o "<h1[^>]*>[^<]*</h1>" | head -1
# <h1 class="toc-title">Other Content</h1>
```

✅ **Result**: Site working perfectly

---

## 🔍 Problem Analysis

### Problem 1: Error 403 Forbidden

**Symptoms**:
```bash
curl -H "Host: mysite.yourdomain.com" http://YOUR_SERVER_IP/
# 403 Forbidden
```

**Root Cause**:
- Hostinger uses a website management system
- Creating directories manually does NOT register the site in their system
- The web server (LiteSpeed) verifies against its database of configured sites

**Solution**:
- Create the site from Hostinger's web panel
- This internally configures: DNS, vhost, permissions, etc.

---

### Problem 2: Error 522 Connection Timeout

**Symptoms**:
```bash
curl http://mysite.yourdomain.com/
# error code: 522
```

**Root Cause**:
```
User → Cloudflare (proxy) → CNAME mysite → yourdomain.com → Cloudflare (proxy) → LOOP
```

**Solution**:
```
User → Cloudflare (DNS only) → A record → YOUR_SERVER_IP (direct server) ✅
```

---

### Problem 3: Files Don't Update

**Symptoms**:
```bash
# Deploy seems successful but changes aren't visible
node scripts/deploy.js
# ✅ Deployment complete!

curl http://mysite.yourdomain.com/
# (shows old version)
```

**Root Cause**:
- `remoteDir` pointing to incorrect location
- Files copied to `domains/yourdomain.com/public_html/mysite/`
- But server looks in `domains/mysite.yourdomain.com/public_html/`

**Solution**:
```javascript
// Verify remoteDir matches the site created in Hostinger
const remoteDir = "domains/mysite.yourdomain.com/public_html/";
```

---

## 📊 Comparison: What DOESN'T work vs What DOES work

| Aspect | ❌ DOESN'T Work | ✅ DOES Work |
|---------|----------------|--------------|
| **Site creation** | SSH manual: `mkdir domains/name.com/` | Hostinger Panel: "Create Website" |
| **DNS type** | CNAME → proxied domain | A → Direct IP |
| **Cloudflare Proxy** | `proxied: true` (initial) | `proxied: false` (development) |
| **Deploy path** | Subdirectory: `/mysite/` within another | Full domain: `domains/name.com/` |
| **Verification** | Assume it worked | Verify each step with curl/ssh |

---

## 🎯 Verification Commands

### Verify Site Exists in Hostinger
```bash
ssh -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST} "ls -la domains/ | grep mysite"
# drwxr-xr-x 3 user group 4096 Jan  9 13:17 mysite.yourdomain.com
```

### Verify DNS Resolves
```bash
dig +short mysite.yourdomain.com @8.8.8.8
# YOUR_SERVER_IP
```

### Verify Files Deployed
```bash
ssh -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST} \
  "find domains/mysite.yourdomain.com/public_html/ -name 'index.html'"
# domains/mysite.yourdomain.com/public_html/index.html
# domains/mysite.yourdomain.com/public_html/ch1/index.html
# ...
```

### Verify Site Accessible
```bash
curl -I http://mysite.yourdomain.com/
# HTTP/1.1 200 OK
```

---

## 💡 Lessons Learned

1. **Hostinger is a managed platform**: You can't just create files and expect them to work. You need to use their panel.

2. **Cloudflare proxy is powerful but complicated**: For development, always start with `proxied: false`.

3. **ALWAYS verify each step**: Don't assume something worked. Use curl, dig, ssh to confirm.

4. **Deploy path is CRITICAL**: Must match EXACTLY with the site created in Hostinger.

5. **DNS takes time**: Wait 2-5 minutes between creating DNS and verifying access.

---

## 📝 Checklist for Next Project

```bash
# 1. Create site in Hostinger panel
[ ] Websites → Create Website → sitename.yourdomain.com

# 2. Verify site created
[ ] ssh "ls -la domains/" | grep sitename

# 3. Create DNS in Cloudflare
[ ] A record, content: YOUR_SERVER_IP, proxied: false

# 4. Verify DNS propagates
[ ] dig +short sitename.yourdomain.com @8.8.8.8

# 5. Configure deploy
[ ] remoteDir = "domains/sitename.yourdomain.com/public_html/"

# 6. Build and deploy
[ ] node scripts/build.js
[ ] node scripts/deploy.js

# 7. Verify files
[ ] ssh "ls -la domains/sitename.yourdomain.com/public_html/"

# 8. Verify access
[ ] curl -I http://sitename.yourdomain.com/
```

---

**Total process time (with experience)**: 10-15 minutes
**Time without knowing what to do**: 2-3 hours (as happened to us)

---

Date: January 2026
Project: book-template
Status: ✅ Reference documentation
URL: Example site workflow
