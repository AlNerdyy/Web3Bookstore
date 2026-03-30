import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getContract, getSigner } from "../utils/contract";

function getImageUrl(image) {
  if (!image) return "";
  if (image.startsWith("ipfs://")) {
    return `https://gateway.pinata.cloud/ipfs/${image.replace("ipfs://", "")}`;
  }
  return image;
}

function LibraryPanel() {
  const [books, setBooks] = useState([]);
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchMyLibrary() {
    try {
      setLoading(true);
      setError("");
      setBooks([]);

      const signer = await getSigner();
      const walletAddress = await signer.getAddress();
      setAccount(walletAddress);

      const contract = getContract();
      const totalMinted = await contract.totalMinted();

      const ownedBooks = [];

      for (let i = 0; i < Number(totalMinted); i++) {
        try {
          const owner = await contract.ownerOf(i);

          if (owner.toLowerCase() === walletAddress.toLowerCase()) {
            const book = await contract.getBook(i);
            const tokenUri = await contract.tokenURI(i);

            let metadata = null;

            try {
              const response = await fetch(tokenUri);
              metadata = await response.json();
            } catch {
              metadata = null;
            }

            ownedBooks.push({
              tokenId: Number(book.tokenId),
              author: book.author,
              price: ethers.formatEther(book.price),
              isListed: book.isListed,
              title: book.title,
              tokenUri,
              metadata,
            });
          }
        } catch {
          // skip
        }
      }

      setBooks(ownedBooks);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load your library.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMyLibrary();
  }, []);

  return (
    <div style={styles.wrapper}>
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.heading}>My Library</h2>
          {account && (
            <p style={styles.walletText}>
              Wallet: {account.slice(0, 6)}...{account.slice(-4)}
            </p>
          )}
        </div>

        <button onClick={fetchMyLibrary} style={styles.refreshButton}>
          Refresh
        </button>
      </div>

      {loading && <p style={styles.text}>Loading your books...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {!loading && books.length === 0 && (
        <p style={styles.text}>No books found in this wallet yet.</p>
      )}

      <div style={styles.grid}>
        {books.map((book) => (
          <div key={book.tokenId} style={styles.card}>
            {getImageUrl(book.metadata?.image) ? (
              <img
                src={getImageUrl(book.metadata?.image)}
                alt={book.metadata?.name || book.title}
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
              <strong>Listed:</strong> {book.isListed ? "Yes" : "No"}
            </p>

            {book.metadata?.attributes?.length > 0 &&
              book.metadata.attributes.map((attr, index) => (
                <p key={index} style={styles.metaText}>
                  <strong>{attr.trait_type}:</strong> {attr.value}
                </p>
              ))}

            {book.metadata?.description && (
              <p style={styles.description}>{book.metadata.description}</p>
            )}

            {book.metadata?.animation_url && (
              <a
                href={book.metadata.animation_url}
                target="_blank"
                rel="noreferrer"
                style={styles.link}
              >
                Open Book File
              </a>
            )}
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
    alignItems: "flex-start",
    marginBottom: "20px",
    gap: "16px",
  },
  heading: {
    margin: 0,
    color: "var(--accent-gold-bright)",
  },
  walletText: {
    margin: "6px 0 0",
    color: "var(--text-secondary)",
    fontSize: "14px",
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
  link: {
    display: "inline-block",
    marginTop: "12px",
    color: "var(--accent-gold-bright)",
    textDecoration: "none",
    fontWeight: 700,
  },
};

export default LibraryPanel;