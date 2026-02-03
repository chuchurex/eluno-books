# Quick Reference: Creating Sites on Hostinger + Cloudflare

## ⚡ Process in 5 Steps

### 1️⃣ Create Site in Hostinger (WEB PANEL)
```
1. https://hpanel.hostinger.com/
2. Websites → Create Website
3. Enter: sitename.yourdomain.com
4. Select "Empty Website"
5. ⏱️  Wait 1-2 minutes
```

### 2️⃣ Create DNS in Cloudflare (API)
```bash
source .env

curl -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records" \
  -H "X-Auth-Email: ${CF_EMAIL}" \
  -H "X-Auth-Key: ${CF_API_KEY}" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "A",
    "name": "sitename",
    "content": "YOUR_SERVER_IP",
    "ttl": 1,
    "proxied": false
  }'
```
⏱️  Wait 2-5 minutes for propagation

### 3️⃣ Configure Deploy
```javascript
// scripts/deploy.js
const remoteDir = "domains/sitename.yourdomain.com/public_html/";
```

### 4️⃣ Build and Deploy
```bash
node scripts/build.js
node scripts/deploy.js
```

### 5️⃣ Verify
```bash
dig +short sitename.yourdomain.com
# Should return: YOUR_SERVER_IP

curl -I http://sitename.yourdomain.com/
# Should return: HTTP/1.1 200 OK
```

---

## 🔧 Useful Scripts

```bash
# Full DNS verification
./scripts/check-dns.sh sitename.yourdomain.com

# Create DNS automatically
./scripts/create-dns.sh sitename

# Verify site on server
./scripts/verify-site.sh sitename.yourdomain.com
```

---

## ❌ Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| **522 Timeout** | CNAME with active proxy | Use A record with `proxied: false` |
| **403 Forbidden** | Site doesn't exist in Hostinger | Create in web panel first |
| **NXDOMAIN** | DNS not created | Create record in Cloudflare |
| **Files don't update** | Deploy to wrong path | Verify `remoteDir` in deploy.js |

---

## ✅ Quick Checklist

- [ ] Site created in **Hostinger panel**
- [ ] DNS created in **Cloudflare** (type A, proxy OFF)
- [ ] `remoteDir` correct in **deploy.js**
- [ ] Build executed (**node scripts/build.js**)
- [ ] Deploy executed (**node scripts/deploy.js**)
- [ ] DNS resolves (**dig +short**)
- [ ] Site accessible (**curl -I**)

---

## 📖 Complete Documentation

For details, advanced troubleshooting and problem explanation:
👉 **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

---

## 🔗 Credentials

Required `.env` file:
```bash
UPLOAD_HOST=YOUR_SERVER_IP
UPLOAD_PORT=YOUR_SSH_PORT
UPLOAD_USER=YOUR_SSH_USER
UPLOAD_PASS=YOUR_PASSWORD
HOSTINGER_API_TOKEN=YOUR_HOSTINGER_TOKEN
CF_API_KEY=YOUR_CF_API_KEY
CF_EMAIL=your-email@example.com
CF_ZONE_ID=YOUR_CF_ZONE_ID
```
