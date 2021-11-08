# whale-watcher
Telegram Bot for tracking certain wallet transactions on the etheruem blockchian, can be used with other EVM compatible blockchains.

## Getting started

### Installation
To run the whale watcher, you need to have the following installed

* NodeJS => 14.17.6
* csv-parser
* etherjs
* node-telegram-bot-api

After that just clone the repository, cd into which ever exchange you want to run on, and run main.py inside that directory.

### Configuration

#### config.js

Add your own links for the jsonRPC provider(infura_mainnet_ws in config.js). Then create a tg bot and make it an admin in your newly created channel. Then plug the channel and bot ID in the config file so the whale watcher can now send messages. 

#### whaleList.csv
This is the csv file that will contain the addresses you want to track, you dont have to make sure ever address is checksum, since the code checks for that anyway, but it would probably be optimal. Just follow the format in the example_file.

### Run
Just run >node main.js

