# Deploying cwops-app (Flask)

cwops-app used to be a static site. It is now a Flask app that **serves the
practice SPA from `public/`** and adds the advisor login + certificate admin.
This is the same shape as the other webapps-prod Flask apps.

## What changed vs. the old static deploy
- The SPA moved to `public/` (index.html, app.js, styles.css, data/, audio/, docs/).
- There is a Python backend now: venv + gunicorn + systemd + nginx.
- **Do not** just `git pull` into the old static docroot — follow the one-time
  setup below first.

## One-time server setup (webapps-prod, /var/www/cwops-app)

```bash
# 1. venv
python3 -m venv /home/kenny/venvs/cwops-app
/home/kenny/venvs/cwops-app/bin/pip install -r requirements.txt

# 2. config — copy and fill in. NEVER commit .env.
cp .env.example .env
#   SECRET_KEY=<random>             (python -c "import secrets;print(secrets.token_hex(32))")
#   BASE_URL=https://cwops.morsecodepractice.com
#   CWOPS_COOKIE_SECURE=1
#   GMAIL_USER=den4ve@gmail.com
#   GMAIL_APP_PASSWORD=<google app password, no spaces>
#   CWOPS_SAFE_MODE=1              (keep 1 until you've tested invite + cert email,
#                                   then set 0 so students actually receive mail)

# 3. database + admin
/home/kenny/venvs/cwops-app/bin/python -m scripts.init_db
/home/kenny/venvs/cwops-app/bin/python -m scripts.seed_admin   # prints an activation link
#   Open the printed link (or the email) to set the admin password.
```

### systemd unit  `/etc/systemd/system/cwops-app.service`
```ini
[Unit]
Description=cwops-app (Flask)
After=network.target

[Service]
User=kenny
Group=kenny
WorkingDirectory=/var/www/cwops-app
EnvironmentFile=/var/www/cwops-app/.env
ExecStart=/home/kenny/venvs/cwops-app/bin/gunicorn -w 3 -b unix:/run/cwops-app.sock wsgi:app
UMask=0007
Restart=always

[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl enable --now cwops-app
```
The socket ends up `kenny:kenny` mode 660; `www-data` is already in the `kenny`
group, so nginx can read it.

### nginx — serve `public/` statically, proxy everything else to Flask
```nginx
location / {
    root /var/www/cwops-app/public;
    try_files $uri $uri/ @app;          # static asset if it exists, else the app
}
location @app {
    proxy_pass http://unix:/run/cwops-app.sock;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```
So `/`, `/app.js`, `/audio/...` are served fast from disk; `/login`, `/admin`,
`/certs`, `/activate/...` hit the Flask app. TLS terminates at Cloudflare as
with the other apps.

## Routine deploys
```bash
ssh webapps-prod
cd /var/www/cwops-app && ./deploy.sh
```

## Going live with email
`CWOPS_SAFE_MODE=1` redirects every outbound message to `SAFE_MODE_TO` so you
can test the invite and certificate emails against your own inbox. When they
look right, set `CWOPS_SAFE_MODE=0` and restart.
