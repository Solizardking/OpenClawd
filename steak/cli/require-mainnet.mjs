if (process.env.OPENCLAWD_ENABLE_MAINNET !== '1') {
  console.error(
    [
      'Refusing mainnet operation.',
      'Set OPENCLAWD_ENABLE_MAINNET=1 only after completing the Steak mainnet gate:',
      '- aligned Anchor/toolchain build',
      '- devnet stake/unstake rehearsal',
      '- reviewed upgrade authority and admin recovery runbook',
      '- explicit [programs.mainnet] in Anchor.toml',
    ].join('\n')
  );
  process.exit(2);
}
