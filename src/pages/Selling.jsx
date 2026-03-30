import Navbar from "../components/Navbar";
import SellPanel from "../components/SellPanel";

function Selling() {
  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        <h1 style={styles.title}>Sell Book NFT</h1>
        <p style={styles.subtitle}>
          Enter the token ID of the minted book and set the selling price.
        </p>

        <SellPanel />
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

export default Selling;