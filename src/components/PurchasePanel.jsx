import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getContract, getContractWithSigner } from "../utils/contract";

function getImageUrl(image) {
  if (!image) return "";
  if (image.startsWith("ipfs://")) {
    return `https://gateway.pinata.cloud/ipfs/${image.replace("ipfs://", "")}`;
  }
  return image;
}

function PurchasePanel() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyingTokenId, setBuyingTokenId] = useState(null);
  const [error, setError] = useState("");

  async function fetchListedBooks() {
    try {
      setLoading(true);
      setError("");

      const contract = getContract();
      const listedBooks = await contract.getAllListedBooks();

      const booksWithMetadata = await Promise.all(
        listedBooks.map(async (book) => {
          const tokenId = Number(book.tokenId);
          const tokenUri = await contract.tokenURI(tokenId);

          let metadata = null;

          try {
            const response = await fetch(tokenUri);
            metadata = await response.json();
          } catch {
            metadata = null;
          }

          return {
            tokenId,
            author: book.author,
            price: ethers.formatEther(book.price),
            isListed: book.isListed,
            title: book.title,
            tokenUri,
            metadata,
          };
        })
      );

      setBooks(booksWithMetadata);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load listed books.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBuy(book) {
    try {
      setBuyingTokenId(book.tokenId);
      setError("");

      const contract = await getContractWithSigner();

      const tx = await contract.buyBook(book.tokenId, {
        value: ethers.parseEther(book.price),
      });

      await tx.wait();
      await fetchListedBooks();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to buy book.");
    } finally {
      setBuyingTokenId(null);
    }
  }

  useEffect(() => {
    fetchListedBooks();
  }, []);

  return (
    <div style={styles.wrapper}>
      <div style={styles.headerRow}>
        <h2 style={styles.heading}>Available Books</h2>
        <button onClick={fetchListedBooks} style={styles.refreshButton}>
          Refresh
        </button>
      </div>

      {loading && <p style={styles.text}>Loading listed books...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {!loading && books.length === 0 && (
        <p style={styles.text}>No listed books available right now.</p>
      )}

      <div style={styles.grid}>
        {books.map((book) => (
          <div key={book.tokenId} style={styles.card}>
            {getImageUrl(book.metadata?.image) ? (
              <img
                src={getImageUrl(book.metadata?.image)}
                alt={book.title}
                style={styles.image}
              />
            ) : (
              <div style={styles.imagePlaceholder}>No Cover</div>
            )}

            <h3 style={styles.cardTitle}>
              {book.metadata?.name || book.title}
            </h3>

            <p style={styles.metaText}>
              <strong>Token ID:</strong> {book.tokenId}
            </p>
            <p style={styles.metaText}>
              <strong>Price:</strong> {book.price} ETH
            </p>
            <p style={styles.metaText}>
              <strong>Author:</strong> {book.author.slice(0, 6)}...
              {book.author.slice(-4)}
            </p>

            {book.metadata?.description && (
              <p style={styles.description}>{book.metadata.description}</p>
            )}

            <button
              onClick={() => handleBuy(book)}
              style={styles.buyButton}
              disabled={buyingTokenId === book.tokenId}
            >
              {buyingTokenId === book.tokenId ? "Buying..." : "Buy Book"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    marginTop: "24px",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  heading: {
    margin: 0,
    color: "var(--accent-gold-bright)",
  },
  refreshButton: {
    padding: "10px 14px",
  },
  text: {
    color: "var(--text-secondary)",
  },
  error: {
    color: "#d88b7d",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "linear-gradient(145deg, #2b221d, #15110f)",
    border: "1px solid rgba(201, 163, 90, 0.22)",
    boxShadow:
      "0 0 18px rgba(201, 163, 90, 0.12), 0 0 10px rgba(122, 31, 31, 0.12)",
    borderRadius: "14px",
    padding: "16px",
    color: "var(--text-primary)",
  },
  image: {
    width: "100%",
    height: "260px",
    objectFit: "cover",
    borderRadius: "10px",
    marginBottom: "12px",
    border: "1px solid rgba(201, 163, 90, 0.12)",
  },
  imagePlaceholder: {
    width: "100%",
    height: "260px",
    borderRadius: "10px",
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(180deg, #1b1512, #100d0b)",
    color: "#8f8168",
    border: "1px solid rgba(201, 163, 90, 0.12)",
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: "10px",
    color: "var(--accent-gold-bright)",
  },
  metaText: {
    margin: "6px 0",
    fontSize: "14px",
    color: "var(--text-secondary)",
  },
  description: {
    color: "var(--text-primary)",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  buyButton: {
    marginTop: "12px",
    width: "100%",
  },
};

export default PurchasePanel;