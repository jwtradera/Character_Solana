import { Keypair } from "@solana/web3.js";
import creature_program_keypair from '../assets/creature_program_keypair.json';

import * as BufferLayout from '@solana/buffer-layout';
import { Buffer } from 'buffer';
import { useCallback, useState } from "react";

/**
 * Layout for a public key
 */
const publicKey = (property = "publicKey") => {
    return BufferLayout.blob(32, property);
};

/**
 * Layout for a 64bit unsigned value
 */
const uint64 = (property = "uint64") => {
    return BufferLayout.blob(8, property);
};

export const CREATE_CHARACTER_DATA_LAYOUT = BufferLayout.struct([
    BufferLayout.u8("life_origin"),
    BufferLayout.u8("magic")
]);

export function getProgramKeypair() {
    const programKeypair = Keypair.fromSecretKey(Uint8Array.from(creature_program_keypair));
    return programKeypair;
}

export function useLocalStorageState(key: string, defaultState?: string) {
    const [state, setState] = useState(() => {
        const storedState = localStorage.getItem(key);
        if (storedState) {
            try {
                return JSON.parse(storedState);
            } catch (error) {
                return undefined;
            }
        }
        return defaultState;
    });

    const setLocalStorageState = useCallback(
        (newState) => {
            const changed = state !== newState;
            if (!changed) {
                return;
            }
            setState(newState);
            if (newState === null) {
                localStorage.removeItem(key);
            } else {
                localStorage.setItem(key, JSON.stringify(newState));
            }
        },
        [state, key]
    );

    return [state, setLocalStorageState];
}


export function concatTypedArrays(a, b) { // a, b TypedArray of same type
    var c = new (a.constructor)(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
}