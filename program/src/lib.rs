pub mod error;
pub mod instruction;
pub mod processor;
pub mod state;

#[cfg(not(feature = "no-entrypoint"))]
pub mod entrypoint;

solana_program::declare_id!("aVLpDXSnynypJE3eiFTtkKamMQjkDciTwY8Lw2fgdDo");