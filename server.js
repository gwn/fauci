const
    {createServer} = require('http'),
    {Wallet} = require('@ethersproject/wallet'),
    {InfuraProvider} = require('@ethersproject/providers'),
    {Contract} = require('@ethersproject/contracts'),
    {parseUnits} = require('@ethersproject/units'),
    {isAddress} = require('@ethersproject/address'),
    {log} = console,
    [, , serverPort = 1337] = process.argv,
    {INFURA_API_KEY, MINTER_PRIV_KEY,
        TOKEN_CONTRACT_ADDR, TOKEN_DECIMALS, SEND_AMOUNT} = process.env


const abi = [{
    inputs: [
        {
            internalType: 'address',
            name: 'account',
            type: 'address',
        },
        {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
        },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
}]


const serve = async () => {
    const
        provider = new InfuraProvider(4, INFURA_API_KEY),
        minterWallet = new Wallet(MINTER_PRIV_KEY, provider),
        tokenContract = new Contract(TOKEN_CONTRACT_ADDR, abi, minterWallet)


    createServer(async (req, res) => {
        const targetAddr = req.url.slice(1)

        log('request received for', targetAddr)

        if (!isAddress(targetAddr)) {
            log('invalid address')

            return reply(res, JSON.stringify({msg: 'invalid address'}), 400)
        }

        const mintResp =
            await tokenContract.mint(
                targetAddr,
                parseUnits(String(SEND_AMOUNT), TOKEN_DECIMALS),
            )

        log('mint txn sent, waiting for the network...', mintResp)

        const
            mintRecp = await mintResp.wait(),

            report = {
                blockHash: mintRecp.blockHash,
                transactionHash: mintRecp.transactionHash,
                tokensSent: SEND_AMOUNT,
            }

        log('minting successful!')

        reply(res, JSON.stringify(report))
    })
        .listen(serverPort, () => log('listening on port', serverPort))
}


const reply = (res, body, status = 200, headers = {}) =>
    res
        .writeHead(status, {'content-type': 'application/json', ...headers})
        .end(body)


serve()
