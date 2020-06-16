# hrte - Horizen Rewards/Transactions Exporter
This application can be used to export the income of Horizen master and securenodes or mining of any address (e.g. for your tax report). If you want, you can also just export all transactions in raw format.
## User guide
The extension is available in the Chrome Web Store https://chrome.google.com/webstore/detail/hrte/hlcokiejfjkkafinoiknhkbhpedhbgld. But you can still use the source code with the help of the developer mode. For security reasons, I suggest you use a sperate chrome for this, which you don't use for anything else.
### Steps to install using the source code:
1. Download the latest source code from https://github.com/FlueschPluesch/hrte/releases and unpack it.
2. Navigate to chrome://extensions/ and activate the developer mode in the upper right corner.
3. Click the Load unpacked extension button and select the unzipped folder (last one) for your extension to install it.
4. The extension should now be loaded and appear in the upper left corner.
### Extension usage:
1. Navigate to a Horizen Explorer, e.g. https://explorer.horizen.global/.
2. Enter your address in the top search bar of the insight explorer.
3. Click the "Download all rewards/transactions" button.
4. Have a look at the reward addresses.
The two given addresses are for the payments from master- and securenodes.
They usually do not need to be changed.
You can add further addresses, for example those of a mining pool.
The rewards will later be recognized as such when they came from one of these addresses.
5. Click the "Start" button to fetch all transactions.
6. Wait for the tool to finish querying.
7. Select your time range.
8. If you want to combine your transactions into one per month or year, you can use the filter "Summarize rewards".
This can be useful if you would otherwise have hundreds or even thousands of transactions.
9. Select your export type and format.
10. Click the "Export rewards as CSV" button. Or, if you want to download all transactions in raw format and not only the rewards, click on the "Export all transactions (raw)" button.
