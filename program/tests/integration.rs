#![cfg(feature = "test-bpf")]

use {
    assert_matches::*,
    solana_program::{
        instruction::{AccountMeta, Instruction},
        pubkey::Pubkey,
    },
    solana_sdk::{signature::Signer, transaction::Transaction},
    solana_validator::test_validator::*,
};
use solana_program_test::{processor, ProgramTest};
use chain_crisis::{entrypoint::process_instruction};
use serde::{Deserialize, Serialize};


#[repr(packed)]
#[derive(Serialize, Deserialize)]
struct Attrib {
    damage: u64,
    resistance: u64,
}

#[repr(u8)]
enum Life {
    CorporateEspionage,
    SlumsSurvivor,
    Drifter,
}

#[repr(packed)]
#[derive(Serialize, Deserialize)]
struct Character {
    life: Life,
    attrib: Attrib,
}


#[tokio::test]
async fn test_chain_crisis_character_creation_demo() {
    let program_id = Pubkey::from_str(&"chaincrisis111111111111111111111111111111111").unwrap();

    let character_owner = Keypair::new();

    let mut program_test = 
        ProgramTest::new("chain_crisis", program_id, processor!(process_instruction));

    let c = Character {
        life: Attrib::CorporateEspionage,
        attrib: Attrib {
            damage: 62,
            resistance: 34,
        },
    };

    println!("life: {:?}", {c.life});
    println!("attrib: {:?}", {c.attrib});

    program_test.add_account(
        character_owner.pubkey(), 
        Account {
            lamports: sol_to_lamports(1000.0),
            ..Account::default()
        },
    );

    let (mut banks_client, payer, recent_blockhash) = program_test.start().await;

    let mut transaction = Transaction::new_with_payer(
        &[Instruction::new_with_bytes(
            program_id, 
            unsafe { any_as_u8_slice(&c) }, 
            vec![
                AccountMeta::new(character_owner.pubkey(), true),
                AccountMeta::new(character_owner.pubkey(), false),
                AccountMeta::new(system_program::ID, false),
            ], 
        )],
        Some(&payer.pubkey()),
    );

    transaction.sign(&[&payer, &alice, &pda], recent_blockhash);

    match banks_client.process_instruction(transaction).await {
        Ok(()) => (),
        Err(e) => panic!("{}", e),
    }
}
