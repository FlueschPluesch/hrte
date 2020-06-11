# hrte - Horizen Rewards/Transactions Exporter
This application can be used to export the income of Horizen master and securenodes or mining of any address (e.g. for your tax report). If you want, you can also just export all transactions in raw format.
## User guide
Currently, the extension is not yet available from the Chrome web store, as it takes a while to complete the review. But you can still use it now with the help of the developer mode. For security reasons, I suggest you use a sperate chrome for this, which you don't use for anything else.
### Steps:
1. Download the latest source code from https://github.com/FlueschPluesch/hrte/releases and unpack it.
2. Navigate to chrome://extensions/ and activate the developer mode in the upper right corner.
3. Click the Load unpacked extension button and select the unzipped folder (last one) for your extension to install it.
4. The extension should now be loaded and appear in the upper left corner.
5. Navigate to a Horizen Explorer, e.g. https://explorer.horizen.global/.
6. Enter your address in the top search bar of the insight explorer.
7. Click the "Download all rewards/transactions" button.
8. Have a look at the reward addresses.
The two given addresses are for the payments from master- and securenodes.
They usually do not need to be changed.
You can add further addresses, for example those of a mining pool.
The rewards will later be recognized as such when they came from one of these addresses.
9. Click the "Start" button to fetch all transactions.
10. Wait for the tool to finish querying.
11. Select your time range.
12. If you want to combine your transactions into one per month or year, you can use the filter "Summarize rewards".
This can be useful if you would otherwise have hundreds or even thousands of transactions.
13. Select your export type and format.
14. Click the "Export rewards as CSV" button. Or, if you want to download all transactions in raw format and not only the rewards, click on the "Export all transactions (raw)" button.
