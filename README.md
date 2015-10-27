# abi2html-js

Generate HTML page from Solidity ABI with JavaScript. This is useful as an "admin" interface to a contract or as a basis for generating forms for more advanced DApps.

Usage:

0. Connect to an ethereum instance with provided params
1. Paste ABI or contract in respective text box
2. Set deployed contract address in page
3. Interact with functions or observe events

The "Call" button is only shown when output parameters are defined. The "Transact" button is hidden when the function is declared constant. When an event fires, the values are rendered in the matching text boxes.

```
git clone https://github.com/tgerring/abi2html-js.git
open abi2html-js/index.html
```
