export enum LifeOrigins {
    Heaven,
    Hell,
    Earth
}


export interface CharAttribute {
    magic: number
    vitality: number
    strength: number
    luck: number
    spirit: number
}


export class Character {

    life_origin: LifeOrigins;
    attributes: CharAttribute;

    constructor(properties: any) {
        this.life_origin = properties['life_origin'];
        this.attributes = {
            magic: properties['magic'],
            vitality: properties['vitality'],
            strength: properties['strength'],
            luck: properties['luck'],
            spirit: properties['spirit'],
        };
    }

}

export class Assignable {

    constructor(properties) {
        Object.keys(properties).map((key) => {
            this[key] = properties[key];
        });
    }

}

// Prepare data layout with input data
export const CharacterSchema = new Map([[Assignable, {
    kind: 'struct',
    fields: [
        ['life_origin', 'u8'],
        ['magic', 'u8'],
        ['strength', 'u8'],
        ['vitality', 'u8'],
        ['spirit', 'u8'],
        ['luck', 'u8']
    ]
}]]);