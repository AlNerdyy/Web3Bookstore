import { useState } from "react";
import { ethers } from "ethers";
import { getContractWithSigner } from "../utils/contract";

function SellPanel() {
  const [form, setForm] = useState({
    tokenId: "",
    price: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setResult("");

      const cleanedPrice = String(form.price).trim();

      if (!form.tokenId || !cleanedPrice || Number(cleanedPrice) <= 0) {
        throw new Error("Please enter a valid token ID and positive price.");
      }

      const contract = await getContractWithSigner();
      const priceInWei = ethers.parseEther(cleanedPrice);

      const tx = await contract.listBook(form.tokenId, priceInWei);
      const receipt = await tx.wait();

      setResult(`Book listed successfully. Tx Hash: ${receipt.hash}`);
      setForm({
        tokenId: "",
        price: "",
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to list book.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.panel}>
      <h2 style={styles.heading}>List Your Book</h2>
      <p style={styles.text}>
        Use the token ID of the NFT you minted in the Upload module.
      </p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.group}>
          <label>Token ID</label>
          <input
            type="number"
            name="tokenId"
            value={form.tokenId}
            onChange={handleChange}
            placeholder="Enter token ID"
            min="0"
            required
          />
        </div>

        <div style={styles.group}>
          <label>Price (ETH)</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="0.01"
            step="0.0001"
            min="0.0001"
            required
          />
        </div>

        <button type="submit" style={styles.button} disabled={submitting}>
          {submitting ? "Listing Book..." : "List Your Book"}
        </button>
      </form>

      {error && <p style={styles.error}>{error}</p>}
      {result && <p style={styles.success}>{result}</p>}
    </div>
  );
}

const styles = {
  panel: {
    marginTop: "24px",
    padding: "24px",
    borderRadius: "14px",
    background: "linear-gradient(145deg, #2b221d, #15110f)",
    border: "1px solid rgba(201, 163, 90, 0.22)",
    boxShadow:
      "0 0 18px rgba(201, 163, 90, 0.12), 0 0 12px rgba(122, 31, 31, 0.12)",
    textAlign: "left",
  },
  heading: {
    marginTop: 0,
    marginBottom: "8px",
    color: "var(--accent-gold-bright)",
  },
  text: {
    color: "var(--text-secondary)",
    marginBottom: "20px",
  },
  form: {
    display: "grid",
    gap: "16px",
  },
  group: {
    display: "grid",
    gap: "6px",
  },
  button: {
    marginTop: "10px",
  },
  error: {
    color: "#d88b7d",
    marginTop: "16px",
  },
  success: {
    color: "#bfae74",
    marginTop: "16px",
    wordBreak: "break-word",
  },
};

export default SellPanel;