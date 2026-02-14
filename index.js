import os
import re
import requests

# =========================
# ENV VARIABLES (من Render)
# =========================
EMAIL = os.getenv("LOGIN_EMAIL")
PASSWORD = os.getenv("LOGIN_PASSWORD")

if not EMAIL or not PASSWORD:
    print("ENV not set")
    exit(1)

# =========================
# HEADERS (زي الأصلية)
# =========================
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
    "Pragma": "no-cache",
    "Accept": "*/*"
}

# =========================
# REQUEST 1: LOGIN
# =========================
login_url = "https://mysite.app/auth/callback/credentials"
login_data = {
    "email": EMAIL,
    "password": PASSWORD,
    "callbackUrl": "/explore"
}

login_headers = HEADERS.copy()
login_headers["Content-Type"] = "application/x-www-form-urlencoded"

login_response = requests.post(
    login_url,
    headers=login_headers,
    data=login_data,
    allow_redirects=True
)

print("LOGIN STATUS:", login_response.status_code)

# =========================
# REQUEST 2: SESSION
# =========================
session_url = "https://mysite.app/api/session"

session_headers = HEADERS.copy()
session_headers["Content-Type"] = "application/x-www-form-urlencoded"

session_response = requests.get(
    session_url,
    headers=session_headers
)

source = session_response.text
print("SESSION STATUS:", session_response.status_code)

# =========================
# PARSE appToken (زي أداتك)
# =========================
match = re.search(r'appToken":"([^"]+)",', source)

if not match:
    print("TOKEN NOT FOUND")
    print("RAW RESPONSE:")
    print(source)
    exit(1)

app_token = match.group(1)

# =========================
# FINAL OUTPUT
# =========================
print(f'{{"appToken":"{app_token}","status":"ok"}}')
