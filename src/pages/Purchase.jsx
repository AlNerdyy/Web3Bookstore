import Navbar from "../components/Navbar";
import PurchasePanel from "../components/PurchasePanel";

function Purchase() {
  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        <h1 style={styles.title}>Purchase Books</h1>
        <p style={styles.subtitle}>
          Browse listed book NFTs and purchase them using Sepolia ETH.
        </p>

        <PurchasePanel />
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
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "36px 24px 48px",
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
};

export default Purchase;