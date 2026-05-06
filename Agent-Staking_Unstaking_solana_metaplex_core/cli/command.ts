import { program } from 'commander';
import {
  initProject,
  lockCorenft,
  unlockCorenft,
  setClusterConfig,
} from './scripts';
import { CORE_COLLECTION_ADDRESS, DEFAULT_MAINNET_RPC } from '../lib/constant';

// program.version('0.0.1');

programCommand('init')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .action(async (directory, cmd) => {
    const { env, keypair, rpc } = cmd.opts();

    console.log('Solana Cluster:', env);
    console.log('Keypair Path:', keypair);
    console.log('RPC URL:', rpc);

    await setClusterConfig(env, keypair, rpc);

    await initProject();
  });

programCommand('lock')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .option('-t, --nftType <string>', 'NFT standard to stake', 'Corenft')
  .option('-m, --mint <string>')
  .option('-c, --collection <string>', 'Metaplex Core collection address', CORE_COLLECTION_ADDRESS.toBase58())
  .action(async (directory, cmd) => {
    const { env, keypair, rpc, mint, nftType, collection } = cmd.opts();
    
    await setClusterConfig(env, keypair, rpc);
    if (mint === undefined) {
      console.log('Missing agent asset mint');
      return;
    }

    switch(nftType) {
      case "Corenft": {
        await lockCorenft(mint, collection, keypair);
        break;
      }
      default: {
        console.log('Nft Type is invalid');
        return;
      }
    }

    
  });

programCommand('unlock')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .option('-t, --nftType <string>', 'NFT standard to unlock', 'Corenft')
  .option('-m, --mint <string>')
  .option('-c, --collection <string>', 'Metaplex Core collection address', CORE_COLLECTION_ADDRESS.toBase58())
  .action(async (directory, cmd) => {
    const { env, keypair, rpc, mint, nftType, collection } = cmd.opts();

    await setClusterConfig(env, keypair, rpc);
    if (mint === undefined) {
      console.log('Missing agent asset mint');
      return;
    }

    switch(nftType) {
      case "Corenft": {
        await unlockCorenft(mint, collection, keypair);
        break;
      }
      default: {
        console.log('Mission Type is invalid');
        return;
      }
    }
  });

function programCommand(name: string) {
  return (
    program
      .command(name)
      .option('-e, --env <string>', 'Solana cluster env name', 'mainnet-beta') // mainnet-beta, testnet, devnet
      .option(
        '-r, --rpc <string>',
        'Solana cluster RPC name',
        DEFAULT_MAINNET_RPC
      )
      .option(
        '-k, --keypair <string>',
        'Solana wallet Keypair Path',
        process.env.ANCHOR_WALLET ?? `${process.env.HOME}/.config/solana/id.json`
      )
  );
}

program.parse(process.argv);
