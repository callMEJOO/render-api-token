import express from "express";

const app = express();

app.get("/api/token", async (req, res) => {
  try {
    const EMAIL = process.env.LOGIN_EMAIL;
    const PASS  = process.env.LOGIN_PASSWORD;

    // ======================
    // REQUEST 1: LOGIN
    // ======================
    const loginRes = await fetch(
      "https://astra.app/auth/callback/credentials?",
      {
        method: "POST",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
          "Pragma": "no-cache",
          "Accept": "*/*",
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body:
          "email=" + encodeURIComponent(EMAIL) +
          "&password=" + encodeURIComponent(PASS) +
          "&callbackUrl=%2Fexplore"
      }
    );

    const loginStatus = loginRes.status;
    const loginHeaders = Object.fromEntries(loginRes.headers.entries());
    const loginBody = await loginRes.text();

    // ======================
    // REQUEST 2: SESSION
    // ======================
    const sessionRes = await fetch(
      "https://astra.app/api/session",
      {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
          "Pragma": "no-cache",
          "Accept": "*/*"
        }
      }
    );

    const sessionStatus = sessionRes.status;
    const sessionHeaders = Object.fromEntries(sessionRes.headers.entries());
    const sessionBody = await sessionRes.text();

    // ======================
    // PRINT EVERYTHING
    // ======================
    res.send(
      JSON.stringify(
        {
          login: {
            status: loginStatus,
            headers: loginHeaders,
            body: loginBody
          },
          session: {
            status: sessionStatus,
            headers: sessionHeaders,
            body: sessionBody
          }
        },
        null,
        2
      )
    );

  } catch (err) {
    res.send(
      JSON.stringify(
        { error: err.message },
        null,
        2
      )
    );
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Render API running on port " + PORT);
});
