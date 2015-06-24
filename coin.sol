/// @title Demo coin contract
contract Coin {
    address minter;
    mapping (address => uint) balances;

    event Send(address from, address to, uint value);
    event Deposit(address from, uint value);

    function Coin() {
        minter = msg.sender;
    }

    /// @notice Mint a new balance
    /// @param owner The address of the coin recipient
    /// @param amount Number of units to assign
    function mint(address owner, uint amount) {
        if (msg.sender != minter) return;
        balances[owner] += amount;
    }

    /// @notice Send units to another account based on caller's address
    /// @param receiver The address of the recipient
    /// @param amount Number of units to transfer
    function send(address receiver, uint amount) {
        if (balances[msg.sender] < amount) return;
        balances[msg.sender] -= amount;
        balances[receiver] += amount;
        Send(msg.sender, receiver, amount);
    }

    /// @notice Check the balance of an account
    /// @param addr The account balance to check
    /// @return The balance of the account
    function queryBalance(address addr) constant returns (uint balance) {
        return balances[addr];
    }

    /// @notice Returns boolean true
    /// @return Should be true
    function isTrue() constant returns (bool) {
        return true;
    }

    /// @dev Fallback function to trigger Deposit event
    function () {
        Deposit(msg.sender, msg.value);
    }
}
