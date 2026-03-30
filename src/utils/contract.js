import { ethers } from "ethers";

export const CONTRACT_ADDRESS = "0x6C252dc0004a4Bc0d03e17d942fa13b012Fa1555";

export const CONTRACT_ABI = [
  "function mintBook(address to, string memory tokenURI, uint256 price, string memory title) public returns (uint256)",
  "function listBook(uint256 tokenId, uint256 price) public",
  "function unlistBook(uint256 tokenId) public",
  "function buyBook(uint256 tokenId) public payable",
  "function getBook(uint256 tokenId) public view returns ((uint256 tokenId, address author, uint256 price, bool isListed, string title))",
  "function getAllListedBooks() public view returns ((uint256 tokenId, address author, uint256 price, bool isListed, string title)[])",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function totalMinted() public view returns (uint256)"
];

export function getProvider() {
  if (!window.ethereum) {
    throw new Error("MetaMask not found");
  }

  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = getProvider();
  return await provider.getSigner();
}

export function getContract() {
  const provider = getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

export async function getContractWithSigner() {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}