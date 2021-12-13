//! Program state processor

use crate::{
    error::CharacterError,
    instruction::{CharacterInstruction},
    state::{Character},
};
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    msg,
    account_info::AccountInfo, entrypoint::ProgramResult, program_error::ProgramError,
    pubkey::Pubkey, rent::Rent, sysvar::Sysvar,
};

/// Program state handler.
pub struct Processor {}
impl Processor {

    pub fn process_add_character(
        program_id: &Pubkey,
        account: &AccountInfo,
        data: Character
    ) -> ProgramResult {

        if account.owner != program_id {
            msg!("Character account is not owned by this program");
            return Err(ProgramError::IncorrectProgramId);
        }

        msg!("Character: {:?}", data);

        // Check input validation
        if data.attributes.magic < 2 || data.attributes.magic > 60
            || data.attributes.spirit < 2 || data.attributes.spirit > 60
            || data.attributes.vitality < 2 || data.attributes.vitality > 60
            || data.attributes.strength < 2 || data.attributes.strength > 60
            || data.attributes.luck < 2 || data.attributes.luck > 60 {
            return Err(CharacterError::InvalidInput.into());
        }

        let mut character_data = account.try_borrow_mut_data()?;

        // If initialized
        if Character::LEN != character_data.len() as u64 {
            return Err(CharacterError::InvalidAccountData.into());
        }

        // Second index will be magic attribute
        if character_data[1] > 1 {
            return Err(CharacterError::AlreadyCreated.into());
        }

        data.serialize(&mut character_data.as_mut())?;

        Ok(())
    }

    /// Processes an instruction
    pub fn process_instruction(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        input: &[u8],
    ) -> ProgramResult {
        let instruction =
            CharacterInstruction::try_from_slice(input).or(Err(ProgramError::InvalidInstructionData))?;
        match instruction {
            CharacterInstruction::AddCharacter(data) => {
                if let [account, ..] = accounts {
                    Self::process_add_character(program_id, account, data)
                } else {
                    Err(ProgramError::NotEnoughAccountKeys)
                }
            }
        }
    }
}