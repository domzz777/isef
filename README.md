# Medical QR Safety Bracelet — Prototype

## Files
- `index.html`: dashboard, profile form, profile list and QR generator.
- `public.html`: public emergency profile reached by QR.
- `style.css`: responsive Arabic RTL styling.
- `app.js`: dashboard and local demo data.
- `public.js`: public profile renderer.

## Run
1. Extract the ZIP.
2. Open the folder in VS Code.
3. If you have the Live Server extension, right-click `index.html` and choose **Open with Live Server**.
4. Create a profile using fake data, open its QR preview, and test the public page on the same browser/device.

You can also use a local static server. A QR URL using `localhost` or `file://` will not work on another person's phone.

## Important limitations
This is a front-end prototype, not a production medical system:
- Data is stored in browser `localStorage`; it is not synchronized between devices.
- There is no real login, server, database, access control, encryption at rest, audit log, or account recovery.
- Private notes are hidden from the public page only by the UI. Anyone with browser access can inspect local storage.
- Do not enter real personal, health, insurance, or children's information.
- QR generation loads QRCode.js from a CDN, so internet access is required for that feature.
- Before real-world use, build a backend with authentication, HTTPS, random revocable QR tokens, strict access controls, data minimization, consent/guardian controls, backups, and security testing. Avoid exposing full medical history publicly.
- A QR bracelet is not a substitute for emergency services or verified medical records.
