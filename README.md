# abi2html-js

Generate HTML page from Solidity ABI with JavaScript. This is useful as an "admin" interface to a contract or as a basis for generating forms for more advanced DApps.

Usage:

0. Connect to an ethereum instance with provided params
1. Declare ABI in abi.js
2. Set deployed contract address in page
3. Interact with functions or observe events

Call and Transact buttons are conditionally shown based on the following:

* Call
    - Only shown when output parameters are defined
* Transact
    - Hidden when function is declared as constant

Events are always shown and automatically subscribed to. 
