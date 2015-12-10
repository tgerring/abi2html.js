# abi2html-js

[Preview on GitHub pages](https://tgerring.github.io/abi2html-js/) or open in Mist to connect to the network.

Generate HTML page from Solidity ABI with JavaScript. This is useful as an "admin" interface to a contract or as a basis for generating forms for more advanced DApps.

## Usage:

1. Paste ABI or contract in "Code" screen
2. Interact with functions or observe/search for events in "View" screen
3. Profit

```
git clone https://github.com/tgerring/abi2html-js.git
open abi2html-js/index.html
```


### Anchors


The application can be deep-linked to a particular function, event, block, transaction, or log with an anchor. For example `index.html#block/1234`. Additionally, it's possible to load Solidity source or ABI from a GitHub Gist  `?SOLIDITY_GIST=c835f38889b989e8488c`. Combining the two might look this: `?ABI_GIST=0e1b884de82d35053a34#confirm`.

Some options:

* #block/&lt;BlockNum&gt;
* #log/&lt;BlockNum&gt;/&lt;TransactionIndex&gt;/&lt;LogIndex&gt;
* #tx/&lt;TransactionHash&gt;
* #&lt;EventName&gt;
* #&lt;EventName&gt;/&lt;BlockNum&gt;/&lt;TransactionIndex&gt;/&ltLogIndex&gt;
* #&lt;FunctionName&gt;
