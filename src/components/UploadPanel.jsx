import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { pinata } from "../utils/pinata";
import { getContractWithSigner } from "../utils/contract";

function UploadPanel() {
  const [form, setForm] = useState({
    title: "",
    author: "",
    price: "",
    description: "",
    file: null,
    cover: null,
  });

  const [coverPreview, setCoverPreview] = useState("");
  const [filePreview, setFilePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleFileChange(e) {
    const { name, files } = e.target;
    const selectedFile = files?.[0] || null;

    setForm((prev) => ({
      ...prev,
      [name]: selectedFile,
    }));
  }

  useEffect(() => {
    if (!form.cover) {
      setCoverPreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(form.cover);
    setCoverPreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [form.cover]);

  useEffect(() => {
    if (!form.file) {
      setFilePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(form.file);
    setFilePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [form.file]);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setResult(null);

      if (!form.file) {
        throw new Error("Please upload a PDF file.");
      }

      const cleanedPrice = String(form.price).trim();

      if (!cleanedPrice || Number(cleanedPrice) <= 0) {
        throw new Error("Enter a valid positive ETH price, like 0.01");
      }

      const gateway =
        import.meta.env.VITE_GATEWAY_URL || "gateway.pinata.cloud";

      const bookUpload = await pinata.upload.public.file(form.file);

      let coverUpload = null;
      if (form.cover) {
        coverUpload = await pinata.upload.public.file(form.cover);
      }

      const metadata = {
        name: form.title,
        description: form.description,
        image: coverUpload
          ? `https://${gateway}/ipfs/${coverUpload.cid}`
          : "",
        animation_url: `https://${gateway}/ipfs/${bookUpload.cid}`,
        attributes: [
          { trait_type: "Author", value: form.author },
          { trait_type: "Price", value: `${form.price} ETH` },
          { trait_type: "Format", value: "PDF" },
        ],
      };

      const metadataUpload = await pinata.upload.public
        .json(metadata)
        .name(`${form.title}-metadata.json`);

      const tokenUri = `https://${gateway}/ipfs/${metadataUpload.cid}`;

      const contract = await getContractWithSigner();
      const signer = await contract.runner.getAddress();
      const priceInWei = ethers.parseEther(cleanedPrice);

      const tx = await contract.mintBook(
        signer,
        tokenUri,
        priceInWei,
        form.title
      );

      const receipt = await tx.wait();

      setResult({
        bookCid: bookUpload.cid,
        coverCid: coverUpload?.cid || null,
        metadataCid: metadataUpload.cid,
        tokenUri,
        txHash: receipt.hash,
      });

      setForm({
        title: "",
        author: "",
        price: "",
        description: "",
        file: null,
        cover: null,
      });
      setCoverPreview("");
      setFilePreview("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Upload and mint failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.panel}>
      <h2 style={styles.heading}>Upload Book</h2>
      <p style={styles.text}>
        Upload your book file, preview it, then mint the NFT.
      </p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.group}>
          <label>Book Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div style={styles.group}>
          <label>Author</label>
          <input
            type="text"
            name="author"
            value={form.author}
            onChange={handleChange}
            required
          />
        </div>

        <div style={styles.group}>
          <label>Price (ETH)</label>
          <input
            type="number"
            step="0.0001"
            min="0.0001"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="0.01"
            required
          />
        </div>

        <div style={styles.group}>
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="4"
            required
          />
        </div>

        <div style={styles.group}>
          <label>Book File (PDF)</label>
          <input
            type="file"
            name="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            required
          />

          {form.file && (
            <div style={styles.previewBox}>
              <p style={styles.previewText}>
                <strong>Selected file:</strong> {form.file.name}
              </p>
              <p style={styles.previewText}>
                <strong>Size:</strong>{" "}
                {(form.file.size / 1024 / 1024).toFixed(2)} MB
              </p>

              {filePreview && (
                <a
                  href={filePreview}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.previewLink}
                >
                  Open PDF Preview
                </a>
              )}
            </div>
          )}
        </div>

        <div style={styles.group}>
          <label>Cover Image</label>
          <input
            type="file"
            name="cover"
            accept="image/*"
            onChange={handleFileChange}
          />

          {coverPreview && (
            <div style={styles.coverPreviewWrapper}>
              <img
                src={coverPreview}
                alt="Cover preview"
                style={styles.coverPreview}
              />
            </div>
          )}
        </div>

        <button type="submit" style={styles.button} disabled={submitting}>
          {submitting ? "Uploading & Minting..." : "Upload & Mint NFT"}
        </button>
      </form>

      {error && <p style={styles.error}>{error}</p>}

      {result && (
        <div style={styles.resultBox}>
          <h3 style={{ marginTop: 0 }}>Success</h3>
          <p><strong>Book CID:</strong> {result.bookCid}</p>
          {result.coverCid && <p><strong>Cover CID:</strong> {result.coverCid}</p>}
          <p><strong>Metadata CID:</strong> {result.metadataCid}</p>
          <p><strong>Token URI:</strong> {result.tokenUri}</p>
          <p><strong>Transaction Hash:</strong> {result.txHash}</p>
        </div>
      )}
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
    gap: "8px",
    textAlign: "left",
  },
  previewBox: {
    marginTop: "8px",
    padding: "12px",
    borderRadius: "10px",
    background: "linear-gradient(180deg, #1b1512, #100d0b)",
    border: "1px solid rgba(201, 163, 90, 0.14)",
  },
  previewText: {
    margin: "4px 0",
    color: "var(--text-secondary)",
    fontSize: "14px",
  },
  previewLink: {
    display: "inline-block",
    marginTop: "8px",
    color: "var(--accent-gold-bright)",
    textDecoration: "none",
    fontWeight: 700,
  },
  coverPreviewWrapper: {
    marginTop: "10px",
    padding: "12px",
    borderRadius: "10px",
    background: "linear-gradient(180deg, #1b1512, #100d0b)",
    border: "1px solid rgba(201, 163, 90, 0.14)",
  },
  coverPreview: {
    width: "100%",
    maxWidth: "260px",
    display: "block",
    borderRadius: "10px",
    border: "1px solid rgba(201, 163, 90, 0.14)",
  },
  button: {
    marginTop: "10px",
  },
  error: {
    color: "#d88b7d",
    marginTop: "16px",
  },
  resultBox: {
    marginTop: "20px",
    padding: "16px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(201, 163, 90, 0.2)",
    wordBreak: "break-word",
    textAlign: "left",
  },
};

export default UploadPanel;