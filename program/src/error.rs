//! Error types

use num_derive::FromPrimitive;
use num_traits::FromPrimitive;
use solana_program::{
    decode_error::DecodeError,
    msg,
    program_error::{PrintProgramError, ProgramError},
};
use thiserror::Error;

#[derive(Clone, Debug, Eq, Error, FromPrimitive, PartialEq)]
pub enum CharacterError {
    // 0
    #[error("Failed to unpack instruction data")]
    InstructionUnpackError,
    // 1
    #[error("Invalid account data")]
    InvalidAccountData,
    // 2
    #[error("Character already created")]
    AlreadyCreated,
    // 3
    #[error("Input value is invalid")]
    InvalidInput,
}

impl From<CharacterError> for ProgramError {
    fn from(e: CharacterError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

impl<T> DecodeError<T> for CharacterError {
    fn type_of() -> &'static str {
        "Character Error"
    }
}

impl PrintProgramError for CharacterError {
    fn print<E>(&self)
    where
        E: 'static + std::error::Error + DecodeError<E> + PrintProgramError + FromPrimitive,
    {
        msg!(&self.to_string());
    }
}
