# Solizard Agents FAQ

## What is this repository?

It is a Solizard-maintained catalog of JSON agent definitions for DeFi, trading, portfolio, yield, risk, security, and blockchain automation workflows.

## Where is the canonical repo?

The canonical repository is https://github.com/solizardking/agents.

## Where is the static API?

The expected GitHub Pages URL is https://solizardking.github.io/agents. If a custom domain is added later, update `CNAME`, package metadata, and the docs together.

## Is the upstream license preserved?

Yes. The project remains MIT licensed, and required upstream copyright attribution stays in `LICENSE`.

## How do I add an agent?

Add a JSON file under `src/`, validate it against the schema, and run the build script to regenerate public indexes.
