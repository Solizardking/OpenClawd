# Farcaster Plugin for OpenClawd

A plugin for the OpenClawd that provides Farcaster social protocol functionality through the Neynar API.

## Installation

```bash
# Install the plugin
poetry add openclawd-plugin-farcaster

# Install required wallet dependency
poetry add openclawd-wallet-evm
```

## Usage

```python
from openclawd_plugins.farcaster import farcaster, FarcasterPluginOptions

# Initialize the plugin
options = FarcasterPluginOptions(
    api_key="${ETHERSCAN_API}",  # Your Neynar API key
    base_url="https://api.neynar.com"  # Optional: Custom API base URL
)
plugin = farcaster(options)

# Create a new cast
cast = await plugin.create_cast(
    text="Hello Farcaster! 🐐",
    signer_uuid="your-signer-uuid"
)

# Get user's casts
casts = await plugin.get_user_casts(
    fid=1234,  # Farcaster user ID
    limit=10
)

# Search casts
search_results = await plugin.search_casts(
    query="openclawd sdk",
    limit=20
)
```

## Features

- Social Protocol Integration:
  - Cast creation and interaction
  - Thread and conversation management
  - User profile management
  - Follow/unfollow functionality
  
- Content Discovery:
  - Cast search and filtering
  - Trending topics
  - User recommendations
  - Channel exploration
  
- Authentication:
  - Signer UUID management
  - Key rotation support
  - Multi-device support
  
- Protocol Features:
  - Reactions and recasts
  - Mentions and notifications
  - Rich media support
  - Channel-based organization
  
- Network Support:
  - Optimism (Layer 2)
  - Farcaster Hub Network

## License

This project is licensed under the terms of the MIT license.
