// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Web3Bookstore is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    struct Book {
        uint256 tokenId;
        address author;
        uint256 price;
        bool isListed;
        string title;
    }

    mapping(uint256 => Book) public books;

    event BookMinted(
        uint256 indexed tokenId,
        address indexed author,
        string tokenURI,
        uint256 price,
        string title
    );

    event BookListed(uint256 indexed tokenId, uint256 price);
    event BookUnlisted(uint256 indexed tokenId);

    event BookPurchased(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );

    constructor() ERC721("Web3Bookstore", "WBOOK") Ownable(msg.sender) {}

    function mintBook(
        address to,
        string memory tokenURI,
        uint256 price,
        string memory title
    ) public returns (uint256) {
        require(bytes(tokenURI).length > 0, "Token URI required");
        require(price > 0, "Price must be > 0");

        uint256 tokenId = _nextTokenId;
        _nextTokenId++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        books[tokenId] = Book({
            tokenId: tokenId,
            author: msg.sender,
            price: price,
            isListed: false,
            title: title
        });

        emit BookMinted(tokenId, msg.sender, tokenURI, price, title);

        return tokenId;
    }

    function listBook(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(price > 0, "Invalid price");

        books[tokenId].price = price;
        books[tokenId].isListed = true;

        emit BookListed(tokenId, price);
    }

    function unlistBook(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(books[tokenId].isListed, "Not listed");

        books[tokenId].isListed = false;

        emit BookUnlisted(tokenId);
    }

    function buyBook(uint256 tokenId) public payable {
        Book storage book = books[tokenId];
        address seller = ownerOf(tokenId);

        require(book.isListed, "Not listed");
        require(msg.value >= book.price, "Insufficient payment");
        require(seller != msg.sender, "Cannot buy your own book");

        book.isListed = false;

        _transfer(seller, msg.sender, tokenId);
        payable(seller).transfer(book.price);

        if (msg.value > book.price) {
            payable(msg.sender).transfer(msg.value - book.price);
        }

        emit BookPurchased(tokenId, seller, msg.sender, book.price);
    }

    function getBook(uint256 tokenId) public view returns (Book memory) {
        require(_ownerOf(tokenId) != address(0), "Does not exist");
        return books[tokenId];
    }

    function getAllListedBooks() public view returns (Book[] memory) {
        uint256 total = _nextTokenId;
        uint256 count = 0;

        for (uint256 i = 0; i < total; i++) {
            if (books[i].isListed) {
                count++;
            }
        }

        Book[] memory listed = new Book[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < total; i++) {
            if (books[i].isListed) {
                listed[index] = books[i];
                index++;
            }
        }

        return listed;
    }

    function totalMinted() public view returns (uint256) {
        return _nextTokenId;
    }
}