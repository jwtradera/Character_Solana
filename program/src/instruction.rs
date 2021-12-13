
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    instruction::{AccountMeta, Instruction},
    pubkey::Pubkey,
    sysvar,
};
use crate::{
    id,
    state::Character,
};


#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, PartialEq)]
pub enum CharacterInstruction {

    AddCharacter(Character),

}
impl CharacterInstruction {
    pub fn add_character(
        input: Character,
        account: &Pubkey,
    ) -> Instruction {
        let data = CharacterInstruction::AddCharacter(input);

        let accounts = vec![
            AccountMeta::new(*account, true),
        ];
        Instruction::new_with_borsh(id(), &data, accounts)
    }
}
