# 🧠 mothrbox-backend

This is a **NestJS-based backend API** that integrates with [Mothrbox](#) — a secure, developer-friendly storage layer for Web3 and hybrid apps. It enables **client-side ECC encryption**, blazing-fast API access, and simplified secure storage for documents, blobs, metadata, AI models, and more.

## 🚀 Features

- ✅ Store encrypted or plain data using Mothrbox
- 🔐 Client-side ECC encryption (NIST P-256)
- 📂 Upload and retrieve files securely via REST API
- 🧾 Token-gated or role-gated content support
- 🧠 Easy integration for AI model or embedding storage
- ⚡ Built with NestJS, Axios, and environment-based configuration

---

<!-- ## 🏗️ Project Structure

```
src/ ├── mothrbox/ │ ├── mothrbox.service.ts # Handles communication with Mothrbox API │ └── mothrbox.module.ts # Encapsulates Mothrbox logic as a module ├── app.controller.ts # Sample controller to test upload/retrieve ├── app.module.ts # Root module ├── main.ts # Bootstrap file
``` -->

## 🛠️ Getting Started
### 1. Clone the repository

```bash
git clone https://github.com/georgegoldman/mothrbox-backend.git
cd mothrbox-backend
pnpm install
```
### 3. Set environment variables
Create a .env file in the root with the following:
```bash
MOTHRBOX_API_KEY=your_mothrbox_api_key
MOTHRBOX_BASE_URL=https://api.mothrbox.com
```
> You can generate your API key by signing up at [mothrbox.io](#)

#### 4. Run the server
```bash
npm run start:dev
```
API will be running at http://localhost:3000

## 📦 Example API Usage

Upload Encrypted File
POST /upload
```json
{
  "filename": "example.txt",
  "data": "Hello, Mothrbox!",
  "mode": "encrypted"
}
```
## Retrieve File
GET /retrieve/:fileId
Returns decrypted or plain file depending on storage mode.

## 🧪 Use Cases
- Secure AI model or vector embedding storage

- Encrypted document and file management

- Web3 dApp metadata storage

- Role-based content access

### 💬 Tech Stack
- [NestJS](https://nestjs.com/)
- [Mothrbox](https://mothrbox.com/)
- [Axios](https://github.com/axios/axios)
- [dotenv](https://github.com/motdotla/dotenv)

🤝 Contributing

Feel free to fork, improve, and PR!