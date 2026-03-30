import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const links = [
    { label: "Upload", path: "/upload" },
    { label: "Selling", path: "/selling" },
    { label: "Purchase", path: "/purchase" },
    { label: "My Library", path: "/library" },
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>Ledger & Lore</div>

      <div style={styles.links}>
        {links.map((link) => {
          const isActive = location.pathname === link.path;

          return (
            <Link
              key={link.path}
              to={link.path}
              style={{
                ...styles.linkButton,
                ...(isActive ? styles.active : {}),
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 32px",
    borderBottom: "1px solid rgba(201, 163, 90, 0.22)",
    background: "linear-gradient(180deg, #241c18, #15110f)",
    boxShadow: "0 4px 20px rgba(201, 163, 90, 0.12)",
  },
  logo: {
    fontWeight: 700,
    fontSize: "20px",
    letterSpacing: "0.8px",
    color: "var(--accent-gold-bright)",
    textShadow: "0 0 10px rgba(201, 163, 90, 0.18)",
  },
  links: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  linkButton: {
    textDecoration: "none",
    background: "linear-gradient(180deg, #241b17, #16110f)",
    border: "1px solid rgba(201, 163, 90, 0.16)",
    color: "var(--text-secondary)",
    padding: "9px 15px",
    borderRadius: "10px",
    transition: "all 0.2s ease",
    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.15)",
  },
  active: {
    border: "1px solid rgba(201, 163, 90, 0.45)",
    color: "var(--accent-gold-bright)",
    boxShadow:
      "0 0 14px rgba(201, 163, 90, 0.18), inset 0 0 10px rgba(201, 163, 90, 0.06)",
  },
};

export default Navbar;