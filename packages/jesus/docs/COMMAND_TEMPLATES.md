# Command Templates - Copy & Paste

Ready-to-copy commands. Just replace `SITE_NAME` with the real name.

---

## 🚀 Create New Site (Complete Process)

### Environment Variables
```bash
# Replace with your site name
export SITE_NAME="mysite.yourdomain.com"
export SUBDOMAIN="mysite"

# Load credentials
source .env
```

---

## Step 1: Create Site in Hostinger

⚠️ **MANUAL - Go to web panel**: https://hpanel.hostinger.com/

1. Websites → Create Website
2. Domain: `${SITE_NAME}`
3. Select: "Empty Website"
4. Wait: 1-2 minutes

---

## Step 2: Verify Site Created

```bash
# Verify site exists on server
sshpass -p "${UPLOAD_PASS}" ssh -p ${UPLOAD_PORT} -o StrictHostKeyChecking=accept-new \
  ${UPLOAD_USER}@${UPLOAD_HOST} \
  "ls -la domains/${SITE_NAME}/"

# Should show:
# drwxr-xr-x 3 ...
# -rw-r--r-- 1 ... DO_NOT_UPLOAD_HERE
# drwxr-xr-x 2 ... public_html
```

---

## Step 3: Create DNS in Cloudflare

```bash
# Create A record pointing to server
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
```

---

## Step 4: Verify DNS

```bash
# Wait 2-5 minutes, then verify
dig +short ${SITE_NAME} @8.8.8.8
# Should return: YOUR_SERVER_IP

dig +short ${SITE_NAME} @1.1.1.1
# Should return: YOUR_SERVER_IP

# Verify in Cloudflare
curl -s "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records?name=${SITE_NAME}" \
  -H "X-Auth-Email: ${CF_EMAIL}" \
  -H "X-Auth-Key: ${CF_API_KEY}" | \
  python3 -c "import sys,json; data=json.load(sys.stdin); [print(f\"{r['type']} {r['name']} -> {r['content']} (proxied: {r['proxied']})\") for r in data['result']]"
```

---

## Step 5: Configure Deploy

```bash
# Edit scripts/deploy.js
# Change line with remoteDir:
const remoteDir = "domains/${SITE_NAME}/public_html/";
```

**Or using sed**:
```bash
# Backup first
cp scripts/deploy.js scripts/deploy.js.backup

# Replace path
sed -i '' 's|domains/.*public_html/|domains/'${SITE_NAME}'/public_html/|' scripts/deploy.js

# Verify change
grep remoteDir scripts/deploy.js
```

---

## Step 6: Build and Deploy

```bash
# Build
node scripts/build.js

# Verify dist/ generated
ls -lah dist/

# Deploy
node scripts/deploy.js

# Should show:
# ✅ Deployment complete!
```

---

## Step 7: Verify Deployment

```bash
# Verify files on server
sshpass -p "${UPLOAD_PASS}" ssh -p ${UPLOAD_PORT} -o StrictHostKeyChecking=accept-new \
  ${UPLOAD_USER}@${UPLOAD_HOST} \
  "ls -lah domains/${SITE_NAME}/public_html/ | head -20"

# Should show:
# index.html, css/, ch1/, etc.
```

---

## Step 8: Verify Web Access

```bash
# Test HTTP
curl -I http://${SITE_NAME}/

# Should return:
# HTTP/1.1 200 OK

# Test content
curl -s http://${SITE_NAME}/ | head -50

# Test other version (if exists)
curl -s http://${SITE_NAME}/other/ | head -30
```

---

## 🛠️ Troubleshooting Commands

### DNS doesn't resolve
```bash
# See all DNS records
curl -s "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records" \
  -H "X-Auth-Email: ${CF_EMAIL}" \
  -H "X-Auth-Key: ${CF_API_KEY}" | \
  python3 -m json.tool | grep -A 5 "${SUBDOMAIN}"

# Verify with multiple DNS servers
echo "Google DNS:"; dig +short ${SITE_NAME} @8.8.8.8
echo "Cloudflare DNS:"; dig +short ${SITE_NAME} @1.1.1.1
echo "Local DNS:"; dig +short ${SITE_NAME}
```

### Error 403 Forbidden
```bash
# Verify site exists in Hostinger
sshpass -p "${UPLOAD_PASS}" ssh -p ${UPLOAD_PORT} -o StrictHostKeyChecking=accept-new \
  ${UPLOAD_USER}@${UPLOAD_HOST} \
  "ls -la domains/ | grep ${SUBDOMAIN}"

# If doesn't exist: Create in Hostinger web panel
```

### Error 522 Timeout
```bash
# See current DNS configuration
curl -s "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records?name=${SITE_NAME}" \
  -H "X-Auth-Email: ${CF_EMAIL}" \
  -H "X-Auth-Key: ${CF_API_KEY}" | \
  python3 -c "import sys,json; r=json.load(sys.stdin)['result'][0]; print(f\"Type: {r['type']}, Content: {r['content']}, Proxied: {r['proxied']}\")"

# If CNAME or proxied=true: Change to A record with proxied=false
```

### Files don't update
```bash
# Verify path in deploy.js
grep remoteDir scripts/deploy.js

# Should show:
# const remoteDir = "domains/${SITE_NAME}/public_html/";

# Force redeploy
rm -rf dist/
node scripts/build.js
node scripts/deploy.js
```

### Incorrect permissions
```bash
# Fix permissions on server
sshpass -p "${UPLOAD_PASS}" ssh -p ${UPLOAD_PORT} -o StrictHostKeyChecking=accept-new \
  ${UPLOAD_USER}@${UPLOAD_HOST} \
  "chmod -R 755 domains/${SITE_NAME}/public_html/"
```

---

## 🔄 Update Existing Site

```bash
# 1. Make changes in i18n/ or templates/
# 2. Build
node scripts/build.js

# 3. Deploy
node scripts/deploy.js

# 4. Verify changes
curl -I http://${SITE_NAME}/?v=$(date +%s)

# 5. Purge Cloudflare cache (if proxy active)
curl -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
  -H "X-Auth-Email: ${CF_EMAIL}" \
  -H "X-Auth-Key: ${CF_API_KEY}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

---

## 🗑️ Delete Site

```bash
# 1. Delete DNS from Cloudflare
# First get record ID
DNS_RECORD_ID=$(curl -s "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records?name=${SITE_NAME}" \
  -H "X-Auth-Email: ${CF_EMAIL}" \
  -H "X-Auth-Key: ${CF_API_KEY}" | \
  python3 -c "import sys,json; print(json.load(sys.stdin)['result'][0]['id'])")

# Delete the record
curl -X DELETE "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records/${DNS_RECORD_ID}" \
  -H "X-Auth-Email: ${CF_EMAIL}" \
  -H "X-Auth-Key: ${CF_API_KEY}"

# 2. Delete files from server
sshpass -p "${UPLOAD_PASS}" ssh -p ${UPLOAD_PORT} -o StrictHostKeyChecking=accept-new \
  ${UPLOAD_USER}@${UPLOAD_HOST} \
  "rm -rf domains/${SITE_NAME}/public_html/*"

# 3. Delete site in Hostinger web panel (manual)
```

---

## 📋 Copy-Paste Checklist

```bash
# Variables
export SITE_NAME="mysite.yourdomain.com"
export SUBDOMAIN="mysite"
source .env

# ✅ 1. Create site in Hostinger (MANUAL)
# https://hpanel.hostinger.com/

# ✅ 2. Verify site
sshpass -p "${UPLOAD_PASS}" ssh -p ${UPLOAD_PORT} -o StrictHostKeyChecking=accept-new ${UPLOAD_USER}@${UPLOAD_HOST} "ls -la domains/${SITE_NAME}/"

# ✅ 3. Create DNS
curl -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records" -H "X-Auth-Email: ${CF_EMAIL}" -H "X-Auth-Key: ${CF_API_KEY}" -H "Content-Type: application/json" --data "{\"type\":\"A\",\"name\":\"${SUBDOMAIN}\",\"content\":\"${UPLOAD_HOST}\",\"ttl\":1,\"proxied\":false}"

# ✅ 4. Verify DNS (wait 2-5 min)
dig +short ${SITE_NAME} @8.8.8.8

# ✅ 5. Configure deploy
sed -i '' 's|domains/.*public_html/|domains/'${SITE_NAME}'/public_html/|' scripts/deploy.js

# ✅ 6. Build and Deploy
node scripts/build.js && node scripts/deploy.js

# ✅ 7. Verify files
sshpass -p "${UPLOAD_PASS}" ssh -p ${UPLOAD_PORT} -o StrictHostKeyChecking=accept-new ${UPLOAD_USER}@${UPLOAD_HOST} "ls -lah domains/${SITE_NAME}/public_html/"

# ✅ 8. Verify access
curl -I http://${SITE_NAME}/
```

---

## 🎯 One-Liner for Testing

```bash
# Complete site test
export SITE_NAME="mysite.yourdomain.com" && \
echo "DNS:" && dig +short ${SITE_NAME} && \
echo -e "\nHTTP:" && curl -I http://${SITE_NAME}/ 2>&1 | head -5 && \
echo -e "\nFiles:" && sshpass -p "${UPLOAD_PASS}" ssh -p ${UPLOAD_PORT} -o StrictHostKeyChecking=accept-new ${UPLOAD_USER}@${UPLOAD_HOST} "ls domains/${SITE_NAME}/public_html/ | wc -l" && \
echo "✅ Complete test"
```

---

## 📚 Shortcuts with Scripts

```bash
# Use helper scripts created
./scripts/check-dns.sh ${SITE_NAME}
./scripts/verify-site.sh ${SITE_NAME}
./scripts/create-dns.sh ${SUBDOMAIN}
```

---

Date: January 2026
Usage: Copy commands and replace ${SITE_NAME} with actual name
