import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import WalletCard from "../components/WalletCard";
import UploadPanel from "../components/UploadPanel";

const SEPOLIA_CHAIN_ID = "0xaa36a7";

function Upload() {
  const [account, setAccount] = useState("");
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [error, setError] = useState("");

  async function connectWallet() {
    try {
      setError("");

      if (!window.ethereum) {
        setError("MetaMask is not installed.");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      setAccount(accounts[0] || "");
      setIsCorrectNetwork(chainId === SEPOLIA_CHAIN_ID);
    } catch (err) {
      console.error(err);
      setError("Wallet connection was cancelled or failed.");
    }
  }

  async function switchToSepolia() {
    try {
      setError("");

      if (!window.ethereum) {
        setError("MetaMask is not installed.");
        return;
      }

      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });

      setIsCorrectNetwork(true);
    } catch (err) {
      console.error(err);
      setError("Could not switch to Sepolia. Please change it in MetaMask.");
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function initWallet() {
      try {
        if (!window.ethereum) return;

        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });

        if (!isMounted) return;

        setAccount(accounts.length > 0 ? accounts[0] : "");
        setIsCorrectNetwork(chainId === SEPOLIA_CHAIN_ID);
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError("Failed to check wallet connection.");
        }
      }
    }

    initWallet();

    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      setAccount(accounts.length > 0 ? accounts[0] : "");
    };

    const handleChainChanged = (chainId) => {
      setIsCorrectNetwork(chainId === SEPOLIA_CHAIN_ID);
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      isMounted = false;

      if (!window.ethereum?.removeListener) return;
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const isConnected = !!account;

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        <h1 style={styles.title}>Upload Book</h1>
        <p style={styles.subtitle}>
          Connect your wallet, upload your files, preview them, then mint your
          book NFT.
        </p>

        <WalletCard account={account} onConnect={connectWallet} />

        {isConnected && !isCorrectNetwork && (
          <div style={styles.noticeBox}>
            <p style={styles.noticeText}>Please switch MetaMask to Sepolia.</p>
            <button onClick={switchToSepolia}>Switch to Sepolia</button>
          </div>
        )}

        {error && <p style={styles.error}>{error}</p>}

        {isConnected && isCorrectNetwork && <UploadPanel />}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "var(--bg-main)",
  },
  container: {
    maxWidth: "760px",
    margin: "40px auto 0",
    padding: "36px 24px 48px",
    textAlign: "center",
  },
  title: {
    color: "var(--accent-gold-bright)",
    marginBottom: "8px",
    textShadow: "0 0 10px rgba(201, 163, 90, 0.08)",
  },
  subtitle: {
    color: "var(--text-secondary)",
    marginBottom: "24px",
  },
  noticeBox: {
    marginBottom: "20px",
    padding: "16px",
    borderRadius: "12px",
    background: "linear-gradient(145deg, #2b221d, #15110f)",
    border: "1px solid rgba(201, 163, 90, 0.22)",
    boxShadow:
      "0 0 18px rgba(201, 163, 90, 0.12), 0 0 12px rgba(122, 31, 31, 0.12)",
  },
  noticeText: {
    color: "var(--text-secondary)",
    marginTop: 0,
  },
  error: {
    color: "#d88b7d",
    marginTop: "16px",
  },
};

export default Upload;