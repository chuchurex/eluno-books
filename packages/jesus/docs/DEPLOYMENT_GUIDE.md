# Complete Guide: Site Creation and Deployment
## Cloudflare + Hostinger

This guide documents the correct process for creating and deploying static sites using Cloudflare and Hostinger accounts, based on real-world experience.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Correct Workflow](#correct-workflow)
3. [Common Problems and Solutions](#common-problems-and-solutions)
4. [Automation Scripts](#automation-scripts)
5. [Verification Checklist](#verification-checklist)

---

## 🔑 Prerequisites

### Required Credentials

Make sure you have these credentials in your `.env` file:

```bash
# HOSTINGER - SSH/RSYNC Deploy + API
UPLOAD_HOST=YOUR_SERVER_IP
UPLOAD_PORT=YOUR_SSH_PORT
UPLOAD_USER=YOUR_SSH_USER
UPLOAD_PASS=YOUR_PASSWORD
HOSTINGER_API_TOKEN=YOUR_HOSTINGER_TOKEN

# CLOUDFLARE - DNS and Cache
CF_API_KEY=YOUR_CF_API_KEY
CF_EMAIL=your-email@example.com
CF_ZONE_ID=YOUR_CF_ZONE_ID
```

### Required Tools

```bash
# macOS/Linux
brew install sshpass curl

# Verify installation
which sshpass
which curl
```

---

## ✅ Correct Workflow

### Step 1: Create Site in Hostinger (Web Panel)

**⚠️ CRITICAL**: Hostinger uses a "websites" system that must be created from the web panel first.

1. Access Hostinger panel: https://hpanel.hostinger.com/
2. Go to **Websites** → **Create Website**
3. Select the domain or subdomain (e.g., `mysite.yourdomain.com`)
4. Choose "Empty Website" or "Upload Files"
5. Wait for Hostinger to create the structure

**What Hostinger does internally**:
```
domains/
└── mysite.yourdomain.com/          ← Creates this directory
    ├── DO_NOT_UPLOAD_HERE          ← Control file
    └── public_html/                 ← Your files go here
        └── default.php              ← Initial placeholder
```

**❌ COMMON ERROR**: Attempting to create the structure manually via SSH doesn't work. Hostinger needs to internally configure the site in its management system.

---

### Step 2: Configure DNS in Cloudflare

**Correct order**: DNS → wait for propagation → then configure proxy.

#### Option A: A Record (Recommended for development)

```bash
# Create A record pointing directly to server
curl -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records" \
  -H "X-Auth-Email: ${CF_EMAIL}" \
  -H "X-Auth-Key: ${CF_API_KEY}" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "A",
    "name": "yoursubdomain",
    "content": "YOUR_SERVER_IP",
    "ttl": 1,
    "proxied": false
  }'
```

**Advantages**:
- ✅ Direct server access
- ✅ No initial SSL issues
- ✅ Easy debugging

#### Option B: CNAME Record with Proxy Disabled

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records" \
  -H "X-Auth-Email: ${CF_EMAIL}" \
  -H "X-Auth-Key: ${CF_API_KEY}" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "CNAME",
    "name": "yoursubdomain",
    "content": "yourdomain.com",
    "ttl": 1,
    "proxied": false
  }'
```

**⚠️ PROBLEM with CNAME + Active Proxy**: If you create a CNAME pointing to a domain that's already on Cloudflare with active proxy, it will cause error 522 (Connection Timeout).

---

### Step 3: Configure the Deploy Script

**Correct path**: Must point to the site directory created in Hostinger.

```javascript
// scripts/deploy.js
const remoteDir = "domains/EXACT-SITE-NAME/public_html/";

// ✅ CORRECT (full domain created in Hostinger)
const remoteDir = "domains/mysite.yourdomain.com/public_html/";

// ❌ INCORRECT (subdirectory within another domain)
const remoteDir = "domains/yourdomain.com/public_html/mysite/";
```

**❌ COMMON ERROR**: Using a subdirectory path when Hostinger created a full domain.

---

### Step 4: Build and Deploy

```bash
# 1. Build the site
node scripts/build.js

# 2. Verify dist/ has content
ls -la dist/

# 3. Deploy
node scripts/deploy.js

# 4. Verify on server
sshpass -p "${UPLOAD_PASS}" ssh -p ${UPLOAD_PORT} \
  ${UPLOAD_USER}@${UPLOAD_HOST} \
  "ls -la domains/mysite.yourdomain.com/public_html/"
```

---

### Step 5: Verify DNS and Access

```bash
# 1. Verify DNS
dig +short yoursubdomain.yourdomain.com

# Should return:
# YOUR_SERVER_IP  (if A record)
# or Cloudflare IPs (if proxy active)

# 2. Test direct access
curl -I http://yoursubdomain.yourdomain.com/

# Should return: HTTP/1.1 200 OK
```

---

## 🔥 Common Problems and Solutions

### Problem 1: Error 522 - Connection Timeout

**Symptom**:
```bash
curl http://mysite.yourdomain.com/
# error code: 522
```

**Cause**: Active Cloudflare proxy + CNAME pointing to proxied domain.

**Solution**:
```bash
# Option A: Disable proxy in Cloudflare
"proxied": false

# Option B: Change to direct A record
"type": "A",
"content": "YOUR_SERVER_IP"
```

---

### Problem 2: Error 403 - Forbidden

**Symptom**:
```bash
curl -H "Host: mysite.yourdomain.com" http://YOUR_SERVER_IP/
# 403 Forbidden
```

**Cause**: Server doesn't recognize the domain because site wasn't created in Hostinger.

**Solution**:
1. Go to Hostinger panel
2. Create the website manually
3. Wait 1-2 minutes for activation
4. Verify it exists: `domains/SITE-NAME/`

---

### Problem 3: Files Don't Load

**Symptom**:
```
HTML loads but CSS/JS return 404
```

**Cause**: Incorrect paths in build or files not deployed.

**Solution**:
```bash
# 1. Verify all files were copied
sshpass -p "${UPLOAD_PASS}" ssh -p ${UPLOAD_PORT} \
  ${UPLOAD_USER}@${UPLOAD_HOST} \
  "find domains/mysite.yourdomain.com/public_html/ -type f"

# 2. Verify permissions
sshpass -p "${UPLOAD_PASS}" ssh -p ${UPLOAD_PORT} \
  ${UPLOAD_USER}@${UPLOAD_HOST} \
  "chmod -R 755 domains/mysite.yourdomain.com/public_html/"
```

---

### Problem 4: DNS Doesn't Resolve (NXDOMAIN)

**Symptom**:
```bash
dig +short mysite.yourdomain.com
# (no response)

host mysite.yourdomain.com
# Host mysite.yourdomain.com not found: 3(NXDOMAIN)
```

**Cause**: DNS record wasn't created in Cloudflare.

**Solution**:
```bash
# Verify existing records
curl -X GET "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records" \
  -H "X-Auth-Email: ${CF_EMAIL}" \
  -H "X-Auth-Key: ${CF_API_KEY}" | python3 -m json.tool

# Create the record (see Step 2)
```

---

### Problem 5: Hostinger API - "Unauthenticated" Error

**Symptom**:
```json
{"message":"Unauthenticated.","correlation_id":"..."}
```

**Cause**: Invalid or expired API token.

**Solution**:
1. Go to https://hpanel.hostinger.com/
2. Account → API
3. Generate new token
4. Update `HOSTINGER_API_TOKEN` in `.env`

**Note**: The Hostinger API is useful for queries, but site creation must be done from the web panel.

---

## 🤖 Automation Scripts

### Script 1: Verify DNS

```bash
#!/bin/bash
# scripts/check-dns.sh

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
  echo "Usage: ./check-dns.sh mysite.yourdomain.com"
  exit 1
fi

echo "🔍 Verifying DNS for $DOMAIN"
echo ""

echo "📡 Google DNS (8.8.8.8):"
dig +short $DOMAIN @8.8.8.8

echo ""
echo "📡 Cloudflare DNS (1.1.1.1):"
dig +short $DOMAIN @1.1.1.1

echo ""
echo "🌐 Local DNS:"
dig +short $DOMAIN

echo ""
echo "✅ DNS Records in Cloudflare:"
source "$(dirname "$0")/../.env"
curl -s "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records?name=${DOMAIN}" \
  -H "X-Auth-Email: ${CF_EMAIL}" \
  -H "X-Auth-Key: ${CF_API_KEY}" | \
  python3 -c "import sys,json; data=json.load(sys.stdin); [print(f\"{r['type']} {r['name']} -> {r['content']} (proxied: {r['proxied']})\") for r in data['result']]"
```

### Script 2: Create DNS Automatically

```bash
#!/bin/bash
# scripts/create-dns.sh

SUBDOMAIN=$1
DOMAIN=${2:-yourdomain.com}

if [ -z "$SUBDOMAIN" ]; then
  echo "Usage: ./create-dns.sh mysite [yourdomain.com]"
  exit 1
fi

source "$(dirname "$0")/../.env"

echo "🌐 Creating DNS record for ${SUBDOMAIN}.${DOMAIN}..."

curl -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records" \
  -H "X-Auth-Email: ${CF_EMAIL}" \
  -H "X-Auth-Key: ${CF_API_KEY}" \
  -H "Content-Type: application/json" \
  --data "{
    \"type\": \"A\",
    \"name\": \"${SUBDOMAIN}\",
    \"content\": \"${UPLOAD_HOST}\",
    \"ttl\": 1,
    \"proxied\": false
  }" | python3 -m json.tool

echo ""
echo "✅ DNS created. Verifying..."
sleep 2
dig +short ${SUBDOMAIN}.${DOMAIN} @1.1.1.1
```

### Script 3: Verify Site on Server

```bash
#!/bin/bash
# scripts/verify-site.sh

SITE_NAME=$1

if [ -z "$SITE_NAME" ]; then
  echo "Usage: ./verify-site.sh mysite.yourdomain.com"
  exit 1
fi

source "$(dirname "$0")/../.env"

echo "🔍 Verifying site $SITE_NAME on Hostinger..."
echo ""

echo "📁 Directory structure:"
sshpass -p "${UPLOAD_PASS}" ssh -p ${UPLOAD_PORT} -o StrictHostKeyChecking=accept-new \
  ${UPLOAD_USER}@${UPLOAD_HOST} \
  "ls -la domains/${SITE_NAME}/"

echo ""
echo "📄 Files in public_html:"
sshpass -p "${UPLOAD_PASS}" ssh -p ${UPLOAD_PORT} -o StrictHostKeyChecking=accept-new \
  ${UPLOAD_USER}@${UPLOAD_HOST} \
  "ls -lah domains/${SITE_NAME}/public_html/ | head -20"

echo ""
echo "🌐 Verifying HTTP access:"
curl -I "http://${SITE_NAME}/" 2>&1 | head -15
```

---

## ✅ Verification Checklist

### Before Starting

- [ ] I have access to Hostinger panel
- [ ] I have Hostinger SSH credentials
- [ ] I have Cloudflare API token
- [ ] I have `sshpass` installed
- [ ] The `.env` file is configured

### Site Creation

- [ ] ✅ Create site in Hostinger panel first
- [ ] ✅ Verify `domains/SITE-NAME/public_html/` exists
- [ ] ✅ Create DNS record in Cloudflare
- [ ] ✅ Configure `remoteDir` in `scripts/deploy.js`
- [ ] ✅ Build the site locally
- [ ] ✅ Deploy to server
- [ ] ✅ Verify DNS resolves correctly
- [ ] ✅ Verify site accessible via HTTP

### After Deployment

- [ ] Site loads correctly (200 OK)
- [ ] CSS and JavaScript load without errors
- [ ] Images and fonts load correctly
- [ ] Internal links work
- [ ] Language versions work (if applicable)
- [ ] Browser language detection works (if applicable)

### Optional: Enable HTTPS

- [ ] Enable Cloudflare proxy (`proxied: true`)
- [ ] Wait for SSL certificate activation (5-10 minutes)
- [ ] Verify `https://` works
- [ ] Configure HTTP → HTTPS redirect in Cloudflare

---

## 📝 Optimal Operation Order

```
1. Hostinger Panel → Create website
   ⏱️  Wait 1-2 minutes
   ✅ Verify via SSH that directory exists

2. Cloudflare API → Create DNS record (type A, proxy OFF)
   ⏱️  Wait 2-5 minutes for DNS propagation
   ✅ Verify with `dig +short DOMAIN`

3. Local → Configure deploy.js with correct path
   ✅ Verify remoteDir points to domains/SITE-NAME/public_html/

4. Local → Build and Deploy
   ✅ node scripts/build.js
   ✅ node scripts/deploy.js
   ✅ Verify files on server via SSH

5. Verification → Test HTTP access
   ✅ curl -I http://DOMAIN/
   ✅ Open in browser

6. (Optional) Cloudflare → Enable proxy for HTTPS
   ⏱️  Wait 5-10 minutes for SSL certificate
   ✅ Verify https://DOMAIN/
```

---

## 🎯 Success Path Summary

### What WORKS ✅

1. **Create site in Hostinger FIRST** (web panel)
2. **A record DNS with proxy disabled** for development
3. **Correct deploy path**: `domains/SITE-NAME/public_html/`
4. **Wait for propagation** between each step
5. **Verify each step** before continuing

### What DOESN'T work ❌

1. ~~Creating directory structure manually via SSH~~
2. ~~CNAME with active proxy pointing to proxied domain~~
3. ~~Subdirectory within another domain without creating site~~
4. ~~Deploy before creating site in Hostinger~~
5. ~~Assuming DNS propagates instantly~~

---

## 🔗 Useful Links

- Hostinger Panel: https://hpanel.hostinger.com/
- Hostinger API Docs: https://developers.hostinger.com/
- Cloudflare Dashboard: https://dash.cloudflare.com/
- Cloudflare API Docs: https://developers.cloudflare.com/api/

---

## 📞 Quick Troubleshooting

```bash
# Site doesn't load → Verify DNS
dig +short DOMAIN @1.1.1.1

# DNS resolves but doesn't load → Verify site exists in Hostinger
ssh -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST} "ls -la domains/DOMAIN/"

# Files don't update → Force deploy
node scripts/deploy.js

# Error 522 → Disable Cloudflare proxy
proxied: false

# Error 403 → Create site in Hostinger panel
```

---

**Date**: January 2026
**Reference project**: book-template
**Author**: Documented from real deployment experience
