# Installation and Usage

## Installation

1. Install the core package

```bash
pip install openclawd
```

2. Depending on the type of wallet you want to use, install the corresponding wallet (see all wallets [here](https://github.com/openclawd/openclawd/tree/main#chains-and-wallets)):

```bash
pip install openclawd-wallet-solana
```

1. Install the adapter for the agent framework you want to use (see all available adapters [here](https://github.com/openclawd/openclawd/tree/main#agent-frameworks))

```bash
pip install openclawd-adapter-langchain
```

## Usage

1. Configure your wallet

```python
from openclawd_wallets.solana import solana

# Initialize Solana client and wallet
client = SolanaClient(os.getenv("SOLANA_RPC_ENDPOINT"))
keypair = Keypair.from_base58_string(os.getenv("SOLANA_WALLET_SEED") or "")
wallet = solana(client, keypair)
```

2. Configure your tools for the framework you want to use

```python
# Initialize tools with Solana wallet
tools = get_on_chain_tools(
    wallet=wallet,
    plugins=[]
)
```

3. Plug into your agent framework

```python
agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(
    agent=agent, tools=tools, handle_parsing_errors=True, verbose=True
)

response = agent_executor.invoke(
    {
        "input": "Send 10 USDC to openclawd.sol",
    }
)

print(response)
```

For concrete examples of how to use OpenClawd checkout our [quickstart guides](https://github.com/openclawd/openclawd/tree/main#-quickstarts).
