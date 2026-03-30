function WalletCard({ account, onConnect }) {
  return (
    <div style={styles.card}>
      <h3 style={{ margin: 0 }}>Wallet Connection</h3>

      {!account ? (
        <button onClick={onConnect} style={styles.button}>
          Connect MetaMask
        </button>
      ) : (
        <p style={styles.address}>
          Account: {account.slice(0, 6)}...{account.slice(-4)}
        </p>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: "linear-gradient(145deg, #3a2a1d, #211710)",
    padding: "22px",
    borderRadius: "14px",
    textAlign: "center",
    color: "var(--text-primary)",
    marginBottom: "22px",
    border: "1px solid rgba(201, 163, 90, 0.28)",
    boxShadow:
      "0 0 20px rgba(201, 163, 90, 0.12), 0 0 16px rgba(122, 31, 31, 0.14)",
  },
  button: {
    marginTop: "12px",
    minWidth: "220px",
  },
  address: {
    marginTop: "12px",
    fontSize: "14px",
    color: "var(--text-secondary)",
  },
};

export default WalletCard;