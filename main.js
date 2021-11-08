const config = require('./config');
const { ethers } = require('ethers');
const tgBot = require('node-telegram-bot-api');

const channel_id = config.channel_id;
const bot_id = config.bot_token;

infura_http = new ethers.providers.JsonRpcProvider(config.infura_mainnet_http, "homestead");
const tg_bot = new tgBot(bot_id, {polling: true});

function parseList() {
  const csv = require('csv-parser');
  const fs = require('fs');
  let addresses = [];
  return new Promise((resolve, reject) =>  {
  fs.createReadStream('whaleList.csv')
    .pipe(csv())
    .on('data', (row) => {
      addresses.push(row);
    })
    .on('end', () => {
      resolve(addresses);
    })
  })  
};

async function parseBlock(block_with_transactions,address_list) {
  let caught_whales = [];
  const transactions = block_with_transactions['transactions'];
  
  for (let tx of transactions) {
    const address = tx['from'];
    for (let whale of address_list) {
        try {
            let whale_wallet = ethers.utils.getAddress(whale['Wallet'])
            if (whale_wallet == address) {
                whale['tx'] = tx['hash'];
                caught_whales.push(whale);
            }
        } catch {
            console.log("Error checking whale addresses");
        }
    }
  }
  return caught_whales;
};

async function post(block,addresses) {
  try {
    const whale_list = await parseBlock(block,addresses);
    for (whale of whale_list) {
      let tx_receipt = await infura_http.getTransactionReceipt(whale['tx']);
      if (tx_receipt['status'] != 0 ) {
          const default_msg = whale['Name'] + " spotted!\n\n" + 
          "TX: " + "https://etherscan.io/tx/" + whale['tx'] + '\n\n' +
          "Recent ERC20 Transactions: " + "https://etherscan.io/address/" + whale['Wallet']+ "#tokentxns";
          tg_bot.sendMessage(channel_id, default_msg);
        } else {
      console.log("Failed tx detected! Ignoring...");
    }
  }
  } catch (e) {
    console.log("Error sending transaction post: " + e);
  }
};

let main = async function () {
  let eth_websocket = new ethers.providers.WebSocketProvider(config.infura_mainnet_ws);
  const address_list = await parseList();

  eth_websocket.on("block", (blk) => {
    eth_websocket.getBlockWithTransactions(blk).then(function (block) {
      post(block,address_list);
    });
  });

  eth_websocket._websocket.on("error", async () => {
    console.log(`Unable to connect to ${ep.subdomain} retrying in 3s...`);
    setTimeout(main, 3000);
  });
  eth_websocket._websocket.on("close", async (code) => {
    console.log(
      `Connection lost with code ${code}! Attempting reconnect in 3s...`
    );
    eth_websocket._websocket.terminate();
    setTimeout(main, 3000);
  });
};

main();