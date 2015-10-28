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

The applicattion can be deep-linked to a prticular function with an anchor the name of the function, i.e. `index.html#changeRequirement`. Additionally, it's possible to load Solidity source or ABI from GitHub Gist and set the target contract address with URL query parameters, i.e. ?ABI_GIST=0e1b884de82d35053a34'. Combining the two might look this: '?SOLIDITY_GIST=c835f38889b989e8488c&TO_ADDRESS=0x21a3a128968f7fd17eb0a16045a84769374aeae0#confirm'

Valid URL query parameters include:
```
SOLIDITY_GIST=<gistid>
ABI_GIST=<gistid>
TO_ADDRESS=<address>
```
