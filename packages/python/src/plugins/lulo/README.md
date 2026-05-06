# Lulo Plugin for OpenClawd

A plugin for the OpenClawd that provides LULO deposit functionality.

## Installation

```bash
# Install the plugin
poetry add openclawd-plugin-lulo

# Install required wallet dependency
poetry add openclawd-wallet-solana
```

## Usage

```python
from openclawd_plugins.lulo import lulo, LuloPluginOptions

# Initialize the plugin
options = LuloPluginOptions()
plugin = lulo(options)
```

## Features

- Deposit USDC

## License

This project is licensed under the terms of the MIT license.
