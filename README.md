# Getting Started - NFT Campaign Platform

## Prerequisites

Before installing, ensure you have:
- **Node.js 20+** installed ([Download Node.js](https://nodejs.org/))
- **Yarn package manager** installed

### Installing Yarn

If you don't have Yarn installed, run:
```bash
npm install -g yarn
```

**Important:** This project uses **Yarn**, not npm. Using npm may cause dependency issues across different Node.js versions. Yarn provides a more stable and consistent installation experience.

---

## Available Scripts

In the project directory, you can run:

### `yarn install`
Install node dependencies in Development mode.

> **Tip:** On very slow networks, use `yarn install --network-timeout 600000 --concurrency 1` to avoid timeouts.

### `yarn start`
Runs the app in the development mode.  
Open [http://localhost:3624](http://localhost:3624) to view it in your browser.

The page will reload when you make changes.  
You may also see any lint errors in the console.

### `yarn test`
Launches the test runner in the interactive watch mode.  
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`
Builds the app for production to the `build` folder.  
It correctly bundles React in production mode and optimizes the best performance.

The build is minified and the filenames include the hashes.  
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

---

## Quick Setup

1. **Install Yarn** (if not already installed):
   ```bash
   npm install -g yarn
   ```

2. **Install dependencies**:
   ```bash
   yarn install
   ```
   If your connection is unstable or very slow, run:
   ```bash
   yarn install --network-timeout 100000 --concurrency 1
   ```

3. **Start the development server**:
   ```bash
   yarn start
   ```

4. **Access the application**:
   - Open browser: `http://localhost:3624`
   - Login with test credentials below

---

## Sample Login Credentials

**Email:** `mtngtest@chain.biz`  
**Password:** `testpassword`

---

## Troubleshooting

### "Command not found: yarn"
**Solution:** Install Yarn globally using `npm install -g yarn`

### Dependency installation fails with npm
**Solution:** Make sure you're using `yarn install`, not `npm install`. Different package managers may have compatibility issues.

### `yarn install` is very slow on poor networks
**Solution:** Increase the timeout and limit concurrency: `yarn install --network-timeout 600000 --concurrency 1`

### Port 3624 already in use
**Solution:** Stop other applications using port 3624 or modify the port in `package.json`

### Module not found errors
**Solution:** Delete `node_modules` folder and run `yarn install` again
