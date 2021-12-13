use borsh::{ BorshDeserialize, BorshSerialize, BorshSchema };

#[repr(u8)]
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, BorshSchema, PartialEq)]
pub enum LifeOrigin {
    Heaven,
    Hell,
    Earth,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, BorshSchema, PartialEq)]
pub struct CharacterAttributes {
    pub magic: u8,
    pub strength: u8,
    pub vitality: u8,
    pub spirit: u8,
    pub luck: u8,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, BorshSchema, PartialEq)]
pub struct Character {
    pub life_origin: LifeOrigin,
    pub attributes: CharacterAttributes
}
impl Character {
    pub const LEN: u64 = 6;
}