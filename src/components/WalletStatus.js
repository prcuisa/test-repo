import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from './PageHeader';
import MetaMaskLogo from '../assets/img/metamask-logo.png';
import { CopyIcon } from '../assets/icons';

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Truncate a wallet address: 0x1234...5678
 */
const truncateAddress = (address) =>
  address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

// ─── component ──────────────────────────────────────────────────────────────

const WalletStatus = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnected, setIsConnected]     = useState(false);
  const [isLoading, setIsLoading]         = useState(false);
  const [error, setError]                 = useState('');
  const [copied, setCopied]               = useState(false);

  // ── detect if already connected on mount ──────────────────────────────────
  useEffect(() => {
    const checkConnection = async () => {
      if (!window.ethereum) return;

      try {
        // eth_accounts does NOT prompt – returns [] if not yet connected
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
        }
      } catch {
        // silently ignore – user simply not connected yet
      }
    };

    checkConnection();
  }, []);

  // ── listen for MetaMask account changes (switch / disconnect) ─────────────
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // user disconnected from MetaMask side
        setWalletAddress(null);
        setIsConnected(false);
      } else {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    return () => window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
  }, []);

  // ── connect ───────────────────────────────────────────────────────────────
  const connectWallet = useCallback(async () => {
    setError('');

    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install it to continue.');
      return;
    }

    setIsLoading(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletAddress(accounts[0]);
      setIsConnected(true);
    } catch (err) {
      // code 4001 → user rejected the request
      if (err.code === 4001) {
        setError('Connection rejected. Please approve the MetaMask request to connect.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── disconnect ────────────────────────────────────────────────────────────
  // MetaMask does not expose a programmatic disconnect – the standard pattern
  // is to clear local state, which removes the "connected" UI.
  const disconnectWallet = useCallback(() => {
    setWalletAddress(null);
    setIsConnected(false);
    setError('');
  }, []);

  // ── copy address to clipboard ─────────────────────────────────────────────
  const copyAddress = useCallback(() => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [walletAddress]);

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <main className="main">
      <PageHeader
        tabs={false}
        currentTab="Wallet Status"
        title="Wallet Status"
        description="View and manage your MetaMask wallet connection."
      />

      <div className="nft-content">
        <div className="container">

          <div style={styles.card}>

            {/* ── Status indicator ── */}
            <div style={styles.statusRow}>
              <span style={styles.label}>Connection Status</span>
              <span style={isConnected ? styles.badgeConnected : styles.badgeDisconnected}>
                {isConnected ? '● Connected' : '○ Not Connected'}
              </span>
            </div>

            {/* ── Wallet address (visible when connected) ── */}
            {isConnected && walletAddress && (
              <div style={styles.addressRow}>
                <span style={styles.label}>Wallet Address</span>
                <div style={styles.addressBox}>
                  <span style={styles.addressText} title={walletAddress}>
                    {truncateAddress(walletAddress)}
                  </span>
                  <button
                    style={styles.copyBtn}
                    onClick={copyAddress}
                    title="Copy full address"
                    aria-label="Copy wallet address"
                  >
                    <CopyIcon width={16} height={16} />
                    <span style={styles.copyLabel}>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── Error message ── */}
            {error && (
              <div style={styles.errorBox} role="alert">
                {error}
              </div>
            )}

            {/* ── Action buttons ── */}
            <div style={styles.actionRow}>
              {!isConnected ? (
                <button
                  style={{ ...styles.btnBase, ...styles.btnConnect }}
                  onClick={connectWallet}
                  disabled={isLoading}
                >
                  <img src={MetaMaskLogo} alt="MetaMask" style={styles.metamaskIcon} />
                  {isLoading ? 'Connecting…' : 'Connect with MetaMask'}
                </button>
              ) : (
                <button
                  style={{ ...styles.btnBase, ...styles.btnDisconnect }}
                  onClick={disconnectWallet}
                >
                  Disconnect Wallet
                </button>
              )}
            </div>

            {/* ── No MetaMask hint ── */}
            {!window.ethereum && (
              <p style={styles.hint}>
                MetaMask is not detected.{' '}
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noreferrer"
                  style={styles.hintLink}
                >
                  Install MetaMask
                </a>{' '}
                to connect your wallet.
              </p>
            )}

          </div>
        </div>
      </div>
    </main>
  );
};

// ─── inline styles ───────────────────────────────────────────────────────────
// Using inline styles so the component is self-contained and needs zero extra
// SCSS – it still inherits the project's existing global classes (container,
// nft-content, main) for layout consistency.

const styles = {
  card: {
    background: '#fff',
    border: '1px solid #e4e7eb',
    borderRadius: '12px',
    padding: '36px 40px',
    maxWidth: '520px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#05506d',
    fontFamily: 'Arial, sans-serif',
  },
  badgeConnected: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    background: '#d1fae5',
    color: '#065f46',
  },
  badgeDisconnected: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    background: '#fee2e2',
    color: '#991b1b',
  },
  addressBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#f5f6f8',
    borderRadius: '8px',
    padding: '8px 14px',
  },
  addressText: {
    fontFamily: 'monospace',
    fontSize: '15px',
    fontWeight: '600',
    color: '#1c86ab',
    letterSpacing: '0.5px',
  },
  copyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#1c86ab',
    padding: '2px 4px',
    borderRadius: '4px',
    transition: 'opacity 0.2s',
  },
  copyLabel: {
    fontSize: '12px',
    fontWeight: '500',
  },
  errorBox: {
    background: '#fff1f2',
    border: '1px solid #fecdd3',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '13px',
    color: '#be123c',
    lineHeight: '1.5',
  },
  actionRow: {
    display: 'flex',
    gap: '12px',
  },
  btnBase: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '11px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    transition: 'opacity 0.2s, transform 0.1s',
    fontFamily: 'Arial, sans-serif',
  },
  btnConnect: {
    background: 'linear-gradient(135deg, #38d8ec, #1c86ab)',
    color: '#fff',
  },
  btnDisconnect: {
    background: '#f5f6f8',
    color: '#be123c',
    border: '1px solid #fecdd3',
  },
  metamaskIcon: {
    width: '22px',
    height: '22px',
    objectFit: 'contain',
  },
  hint: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '-8px',
    lineHeight: '1.5',
  },
  hintLink: {
    color: '#1c86ab',
    fontWeight: '600',
  },
};

export default WalletStatus;
