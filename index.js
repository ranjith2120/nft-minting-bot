const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const fetch = require("node-fetch");
require("dotenv").config();

// Configuration from environment variables
const CONFIG = {
  // Blockchain Configuration
  RPC_URL: process.env.RPC_URL,
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,

  // Pinata Configuration
  PINATA_API_KEY: process.env.PINATA_API_KEY,
  PINATA_SECRET_API_KEY: process.env.PINATA_SECRET_API_KEY,
  PINATA_GATEWAY: process.env.PINATA_GATEWAY,

  // Bot Configuration
  MINT_INTERVAL: parseInt(process.env.MINT_INTERVAL) || 60000, // 1 minute in milliseconds
  LISTING_PRICE: process.env.LISTING_PRICE || "0.000001", // Listing price in ETH
  NFT_PRICE: process.env.NFT_PRICE || "0.01", // Price for each NFT in ETH

  // File Paths
  IMAGES_FOLDER: process.env.IMAGES_FOLDER || "./nfts",
  NFT_DETAILS_FILE: process.env.NFT_DETAILS_FILE || "./nftdetails.json",
  MINTED_DATA_FILE: process.env.MINTED_DATA_FILE || "./mintedNFTs.json",
};

// Smart Contract ABI (only the functions we need)
const CONTRACT_ABI = [
  "function createToken(string memory tokenURI, uint256 price) public payable returns (uint256)",
  "function getListingPrice() public view returns (uint256)",
  "event MarketItemCreated(uint256 indexed tokenId, address seller, address owner, uint256 price, bool sold)",
];

class NFTMintingBot {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
    this.wallet = new ethers.Wallet(CONFIG.PRIVATE_KEY, this.provider);
    this.contract = new ethers.Contract(
      CONFIG.CONTRACT_ADDRESS,
      CONTRACT_ABI,
      this.wallet
    );
    this.nftDetails = this.loadNFTDetails();
    this.mintedData = this.loadMintedData();
    this.currentIndex = 0;
    this.isRunning = false;
  }

  // Load NFT details from JSON file
  loadNFTDetails() {
    try {
      const data = fs.readFileSync(CONFIG.NFT_DETAILS_FILE, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error loading NFT details:", error);
      return [];
    }
  }

  // Load previously minted NFTs data
  loadMintedData() {
    try {
      const data = fs.readFileSync(CONFIG.MINTED_DATA_FILE, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.log("No previous minted data found, starting fresh");
      return [];
    }
  }

  // Save minted NFT data
  saveMintedData() {
    try {
      fs.writeFileSync(
        CONFIG.MINTED_DATA_FILE,
        JSON.stringify(this.mintedData, null, 2)
      );
      console.log("Minted data saved successfully");
    } catch (error) {
      console.error("Error saving minted data:", error);
    }
  }

  // Upload image to Pinata IPFS
  async uploadImageToPinata(imagePath, fileName) {
    try {
      const formData = new FormData();
      const fileStream = fs.createReadStream(imagePath);

      formData.append("file", fileStream);
      formData.append(
        "pinataMetadata",
        JSON.stringify({
          name: fileName,
        })
      );

      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            pinata_api_key: CONFIG.PINATA_API_KEY,
            pinata_secret_api_key: CONFIG.PINATA_SECRET_API_KEY,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (result.IpfsHash) {
        return result.IpfsHash;
      } else {
        throw new Error("Failed to upload image to IPFS");
      }
    } catch (error) {
      console.error("Error uploading image to Pinata:", error);
      throw error;
    }
  }

  // Upload metadata to Pinata IPFS
  async uploadMetadataToPinata(metadata) {
    try {
      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            pinata_api_key: CONFIG.PINATA_API_KEY,
            pinata_secret_api_key: CONFIG.PINATA_SECRET_API_KEY,
          },
          body: JSON.stringify(metadata),
        }
      );

      const result = await response.json();

      if (result.IpfsHash) {
        return result.IpfsHash;
      } else {
        throw new Error("Failed to upload metadata to IPFS");
      }
    } catch (error) {
      console.error("Error uploading metadata to Pinata:", error);
      throw error;
    }
  }

  // Create metadata object
  createMetadata(nftData, imageHash) {
    return {
      name: nftData.name,
      description: nftData.description,
      image: `${CONFIG.PINATA_GATEWAY}${imageHash}`,
      attributes: nftData.attributes || [],
      external_url: nftData.external_url || "",
      background_color: nftData.background_color || "",
      youtube_url: nftData.youtube_url || "",
    };
  }

  // Mint NFT to the smart contract
  async mintNFT(tokenURI, price) {
    try {
      console.log("Getting listing price...");
      const listingPrice = await this.contract.getListingPrice();
      console.log("Listing price:", ethers.formatEther(listingPrice), "ETH");

      console.log("Minting NFT...");
      const priceInWei = ethers.parseEther(price.toString());

      const tx = await this.contract.createToken(tokenURI, priceInWei, {
        value: listingPrice,
        gasLimit: 500000,
      });

      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Transaction confirmed in block:", receipt.blockNumber);

      // Extract token ID from events
      const tokenId = this.extractTokenIdFromReceipt(receipt);
      return { tokenId, txHash: tx.hash, blockNumber: receipt.blockNumber };
    } catch (error) {
      console.error("Error minting NFT:", error);
      throw error;
    }
  }

  // Extract token ID from transaction receipt
  extractTokenIdFromReceipt(receipt) {
    for (const log of receipt.logs) {
      try {
        const parsedLog = this.contract.interface.parseLog(log);
        if (parsedLog.name === "MarketItemCreated") {
          return parsedLog.args.tokenId.toString();
        }
      } catch (error) {
        // Skip logs that don't match our interface
        continue;
      }
    }
    return null;
  }

  // Process a single NFT
  async processSingleNFT() {
    try {
      if (this.currentIndex >= this.nftDetails.length) {
        console.log("All NFTs have been minted! Stopping the bot...");
        this.stop();
        return;
      }

      const nftData = this.nftDetails[this.currentIndex];
      console.log(
        `\n=== Processing NFT ${this.currentIndex + 1}/${
          this.nftDetails.length
        } ===`
      );
      console.log("NFT Name:", nftData.name);

      // Check if image file exists
      const imagePath = path.join(CONFIG.IMAGES_FOLDER, nftData.image);
      if (!fs.existsSync(imagePath)) {
        console.error(`Image file not found: ${imagePath}`);
        this.currentIndex++;
        return;
      }

      // Step 1: Upload image to IPFS
      console.log("1. Uploading image to IPFS...");
      const imageHash = await this.uploadImageToPinata(
        imagePath,
        nftData.image
      );
      console.log("Image uploaded to IPFS:", imageHash);

      // Step 2: Create and upload metadata
      console.log("2. Creating and uploading metadata...");
      const metadata = this.createMetadata(nftData, imageHash);
      const metadataHash = await this.uploadMetadataToPinata(metadata);
      console.log("Metadata uploaded to IPFS:", metadataHash);

      // Step 3: Mint NFT
      console.log("3. Minting NFT to smart contract...");
      const tokenURI = `${CONFIG.PINATA_GATEWAY}${metadataHash}`;
      const mintResult = await this.mintNFT(tokenURI, CONFIG.NFT_PRICE);

      // Step 4: Save minted data
      const mintedNFT = {
        index: this.currentIndex,
        tokenId: mintResult.tokenId,
        name: nftData.name,
        description: nftData.description,
        imageHash: imageHash,
        metadataHash: metadataHash,
        tokenURI: tokenURI,
        price: CONFIG.NFT_PRICE,
        txHash: mintResult.txHash,
        blockNumber: mintResult.blockNumber,
        mintedAt: new Date().toISOString(),
      };

      this.mintedData.push(mintedNFT);
      this.saveMintedData();

      console.log("✅ NFT minted successfully!");
      console.log("Token ID:", mintResult.tokenId);
      console.log("Transaction Hash:", mintResult.txHash);

      this.currentIndex++;
    } catch (error) {
      console.error("Error processing NFT:", error);
      // Continue with next NFT on error
      this.currentIndex++;
    }
  }

  // Start the minting bot
  start() {
    if (this.isRunning) {
      console.log("Bot is already running!");
      return;
    }

    console.log("🚀 Starting NFT Minting Bot...");
    console.log("Contract Address:", CONFIG.CONTRACT_ADDRESS);
    console.log("Wallet Address:", this.wallet.address);
    console.log("Total NFTs to mint:", this.nftDetails.length);
    console.log("Mint interval:", CONFIG.MINT_INTERVAL / 1000, "seconds");
    console.log("Starting from index:", this.currentIndex);

    this.isRunning = true;

    // Mint first NFT immediately
    this.processSingleNFT();

    // Set up interval for subsequent mints
    this.intervalId = setInterval(() => {
      if (this.isRunning && this.currentIndex < this.nftDetails.length) {
        this.processSingleNFT();
      }
    }, CONFIG.MINT_INTERVAL);
  }

  // Stop the minting bot
  stop() {
    console.log("🛑 Stopping NFT Minting Bot...");
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    console.log("Bot stopped successfully");
  }

  // Get bot status
  getStatus() {
    return {
      isRunning: this.isRunning,
      currentIndex: this.currentIndex,
      totalNFTs: this.nftDetails.length,
      mintedCount: this.mintedData.length,
      remainingNFTs: this.nftDetails.length - this.currentIndex,
    };
  }
}

// Main execution
async function main() {
  try {
    // Validate configuration
    if (!CONFIG.PRIVATE_KEY) {
      throw new Error("PRIVATE_KEY is required in .env file");
    }

    if (!CONFIG.CONTRACT_ADDRESS) {
      throw new Error("CONTRACT_ADDRESS is required in .env file");
    }

    if (!CONFIG.PINATA_API_KEY || !CONFIG.PINATA_SECRET_API_KEY) {
      throw new Error(
        "PINATA_API_KEY and PINATA_SECRET_API_KEY are required in .env file"
      );
    }

    // Create and start the bot
    const bot = new NFTMintingBot();

    // Display initial status
    console.log("Bot Status:", bot.getStatus());

    // Start the bot
    bot.start();

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      console.log("\nReceived SIGINT, shutting down gracefully...");
      bot.stop();
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      console.log("\nReceived SIGTERM, shutting down gracefully...");
      bot.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error("Error starting the bot:", error);
    process.exit(1);
  }
}

// Export for use as a module
module.exports = { NFTMintingBot, CONFIG };

// Run if this file is executed directly
if (require.main === module) {
  main();
}
