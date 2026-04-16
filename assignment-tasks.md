**Component Development**
- Create `src/components/WalletStatus.js` component
- Check wallet connection status using existing wallet context/hooks (check `src/context/AppContext.js`)
- Display wallet connection status:
  - Connected: Show truncated wallet address (0x1234...5678) and "Connected" badge
  - Not Connected: Show "Not Connected" badge
- Use `useState` and `useEffect` hooks for state management

**Integration**
- Add route `/dashboard/wallet-status` in `src/routes/routes.js`

**Verification**
- Component renders correctly at `/dashboard/wallet-status` route
- Wallet address displays in truncated format when connected
- Connection status badge displays correctly (shows "Connected" when connected, "Not Connected" when not)
- MetaMask connect wallet function works correctly:
  - Clicking connect button triggers MetaMask connection prompt
  - Successfully connects to MetaMask wallet when user approves
  - Updates wallet status and address display after successful connection
  - Handles connection rejection gracefully (shows "Not Connected" status)
  - Disconnect functionality works correctly when wallet is connected

**Submission**
- Create a Pull Request (PR) to the GitHub repository
- After creating your pull request, submit the PR link for review
- Ensure all changes are committed and pushed to your branch before creating the PR