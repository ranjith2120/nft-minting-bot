# NFT Minting Trading Bot

Build & Deploy NFT Minting Trading Bot | Node.js + JavaScript | Create Your Own Minting Bot

![alt text](https://www.daulathussain.com/wp-content/uploads/2025/08/Build-Deploy-NFT-Minting-Trading-Bot-Node.js-JavaScript-Create-Your-Own-Minting-Bot.jpeg)

## Instruction

Kindly follow the following Instructions to run the project in your system and install the necessary requirements

- [Final Source Code](https://www.theblockchaincoders.com/sourceCode/build-and-deploy-nft-minting-trading-bot-or-node.js-+-javascript-or-create-your-own-minting-bot)

#### Setup Video

- [Final Code Setup video](https://youtu.be/cDsfn9wur38?si=L3TY3wvW2UGZKBM1)

Want to automate your NFT minting and trading? In this tutorial, I’ll show you how to build and deploy your own NFT Minting Trading Bot using Node.js and JavaScript. We’ll cover everything from setup to coding the core bot logic, connecting with blockchain networks, and executing trades automatically.

By the end, you’ll have your very own NFT minting bot ready to run on real-world projects. Perfect for developers, NFT traders, and blockchain enthusiasts!

👉 What you’ll learn:

- Setting up Node.js & project structure
- Writing minting and trading logic in JavaScript
- Connecting with NFT smart contracts
- Automating NFT mints and trades
- Deploying your bot for live usage

📌 Tech Stack: Node.js, JavaScript, Web3 libraries

#### Deploying Dapp

```
  WATCH: Hostinger
  Get : Discount 75%
  URL: https://www.hostg.xyz/aff_c?offer_id=6&aff_id=139422
```

### MULTI-CURRENCY ICO DAPP

```
  PROJECT: MULTI-CURRENCY ICO DAPP
  Code: https://www.theblockchaincoders.com/sourceCode/multi-currency-ico-dapp-using-next.js-solidity-and-wagmi
  VIDEO: https://youtu.be/j8NO8ea5zVo?si=jCmvfXmpmefwjhO5
```

#### Install Vs Code Editor

```
  GET: VsCode Editor
  URL: https://code.visualstudio.com/download
```

#### NodeJs & NPM Version

```
  NodeJs: 20 / LATEST
  NPM: 8.19.2
  URL: https://nodejs.org/en/download
  Video: https://youtu.be/PIR0oBVowXU?si=9eNdR29u37F2ujJJ
```

#### FINAL SOURCE CODE

```
  SETUP VIDEO: https://youtu.be/LatB3maYAnY?si=4Aj4bNCCBJrlsymS
  URL: https://www.theblockchaincoders.com/sourceCode/create-and-deploy-an-advanced-nft-marketplace-dapp-or-next.js-+-solidity-or-full-web3-project-any-blockchain
```

All you need to follow the complete project and follow the instructions which are explained in the tutorial by Daulat

## Final Code Instruction

If you download the final source code then you can follow the following instructions to run the Dapp successfully

#### PINATA IPFS

```
  OPEN: PINATA.CLOUD
  URL:https://pinata.cloud/
```

#### reown

```
  OPEN: WALLET CONNECT
  URL: https://docs.reown.com/cloud/relay
```

#### FORMSPREE

```
  OPEN: FORMSPREE
  URL: https://formspree.io/
```

#### ALCHEMY

```
  OPEN: ALCHEMY.COM
  URL: https://www.alchemy.com/
```

## Important Links

- [Get Pro Blockchain Developer Course](https://www.theblockchaincoders.com/pro-nft-marketplace)
- [Support Creator](https://bit.ly/Support-Creator)
- [All Projects Source Code](https://www.theblockchaincoders.com/SourceCode)

## Authors

- [@theblockchaincoders.com](https://www.theblockchaincoders.com/)
- [@consultancy](https://www.theblockchaincoders.com/consultancy)
- [@youtube](https://www.youtube.com/@daulathussain)

# NFT Minting Bot Setup Guide

## Prerequisites

1. **Node.js** (v16 or higher)
2. **NPM** or **Yarn**
3. **Pinata IPFS Account** (for metadata storage)
4. **Ethereum Wallet** with Holesky testnet ETH
5. **Deployed NFT Marketplace Contract** on Holesky

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Project Structure

Create the following folder structure:

```
project-root/
├── index.js (the main bot file)
├── package.json
├── .env (your environment variables)
├── .gitignore (excludes sensitive files)
├── nftdetails.json (your NFT metadata)
├── nfts/ (folder containing your NFT images)
│   ├── image1.png
│   ├── image2.jpg
│   └── ...
└── mintedNFTs.json (will be created automatically)
```

### 3. Setup Environment Variables

#### Create `.env` file:

Create a `.env` file in your project root and add your configuration:

```bash
# Blockchain Configuration
RPC_URL=https://ethereum-holesky-rpc.publicnode.com
PRIVATE_KEY=your_actual_private_key_here
CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890

# Pinata IPFS Configuration
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_API_KEY=your_pinata_secret_api_key_here

# Bot Configuration (optional - these are defaults)
MINT_INTERVAL=60000
LISTING_PRICE=0.000001
NFT_PRICE=0.01
```

⚠️ **Security Important:**

- Never commit your `.env` file to git
- The provided `.gitignore` will exclude it automatically
- Keep your private keys and API keys secure

### 4. Prepare Your NFT Data

#### Create `nftdetails.json`:

Structure your NFT metadata following the example provided. Each NFT should have:

- `name`: NFT title
- `description`: NFT description
- `image`: filename of the image (must exist in `nfts/` folder)
- `attributes`: array of traits/properties
- `external_url`: optional external link
- `background_color`: optional hex color

#### Organize Images:

Place all your NFT images in the `nfts/` folder. The filenames should match the `image` field in your JSON data.

### 5. Get Required Credentials

#### Pinata Setup:

1. Create account at [Pinata.cloud](https://pinata.cloud)
2. Generate API keys from your dashboard
3. Add keys to the configuration

#### Blockchain Setup:

1. Export your wallet's private key
2. Ensure you have Holesky testnet ETH
3. Get Holesky ETH from faucets if needed

## Running the Bot

### Start the Bot:

```bash
npm start
```

### Development Mode (with auto-restart):

```bash
npm run dev
```

### Stop the Bot:

Press `Ctrl+C` to stop gracefully

## Bot Features

### ✅ **Automated Minting**

- Mints one NFT every minute
- Processes NFTs sequentially from your JSON file
- Handles errors gracefully and continues

### ✅ **IPFS Integration**

- Uploads images to Pinata IPFS
- Creates and uploads metadata
- Generates proper tokenURI for smart contract

### ✅ **Data Persistence**

- Saves all minted NFT data to `mintedNFTs.json`
- Includes transaction hashes, token IDs, and timestamps
- Resumes from where it left off if restarted

### ✅ **Error Handling**

- Comprehensive error logging
- Continues processing on individual failures
- Graceful shutdown handling

## Monitoring

### Check Progress:

The bot logs detailed information:

- Current NFT being processed
- Upload progress (image → metadata → minting)
- Transaction hashes and token IDs
- Success/error messages

### Minted Data:

Check `mintedNFTs.json` for:

- All successfully minted NFTs
- Token IDs and transaction hashes
- IPFS hashes for images and metadata
- Timestamps and blockchain details

## Troubleshooting

### Common Issues:

1. **"Private key not set"**

   - Update the `PRIVATE_KEY` in configuration

2. **"Contract address not set"**

   - Add your deployed contract address

3. **"Image file not found"**

   - Ensure image files exist in `nfts/` folder
   - Check filename matches exactly in JSON

4. **"Insufficient funds"**

   - Add more Holesky ETH to your wallet
   - Each mint costs listing price + gas fees

5. **"Pinata upload failed"**
   - Check your Pinata API keys
   - Verify internet connection

### Gas Optimization:

- The bot uses a gas limit of 500,000
- Adjust if needed based on network conditions
- Monitor gas prices for optimal minting times

## Security Notes

⚠️ **Critical Security Reminders:**

- **Never commit `.env` file to version control** - it contains sensitive keys
- The provided `.gitignore` automatically excludes `.env` files
- Use strong, unique API keys and rotate them regularly
- Test thoroughly on testnet before mainnet deployment
- Consider using hardware wallets for production environments
- Backup your `.env` file securely and separately from your code

## Customization

### Modify Timing:

Change `MINT_INTERVAL` in config (default: 60000ms = 1 minute)

### Adjust Prices:

- `LISTING_PRICE`: Fee paid to marketplace
- `NFT_PRICE`: Sale price for each NFT

### Custom Metadata:

Modify the `createMetadata()` function to add custom fields or formatting

## Support

For issues or questions:

1. Check the console logs for error messages
2. Verify all configuration settings
3. Ensure sufficient wallet balance
4. Confirm contract deployment and ABI compatibility