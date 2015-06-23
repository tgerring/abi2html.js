contract Coin {
    address minter;
    mapping (address => uint) balances;

    event Send(address from, address to, uint value);
    event Deposit(address from, uint value);

    function Coin() {
        minter = msg.sender;
    }

    function mint(address owner, uint amount) {
        if (msg.sender != minter) return;
        balances[owner] += amount;
    }

    function send(address receiver, uint amount) {
        if (balances[msg.sender] < amount) return;
        balances[msg.sender] -= amount;
        balances[receiver] += amount;
        Send(msg.sender, receiver, amount);
    }

    function queryBalance(address addr) constant returns (uint balance) {
        return balances[addr];
    }

    function isTrue() returns (bool) {
        return true;
    }

    function () {
        Deposit(msg.sender, msg.value);
    }
}
