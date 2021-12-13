import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Button, FormControl, Grid, InputLabel, MenuItem, TextField } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { WalletConnectionError } from '@solana/wallet-adapter-base';
import { Keypair, PublicKey, Struct, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import { PROGRAM_ID, CHARACTER_SPAN } from '../constants';
import * as borsh from 'borsh/lib/index';
import { Assignable, Character, CharacterSchema, CharAttribute, LifeOrigins } from '../data';
import { useLocalStorageState, concatTypedArrays } from '../utils';

const Home: NextPage = () => {

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [accountKey, setAccountKey] = useLocalStorageState("character_account", "");
  const [attrs, setAttrs] = React.useState<CharAttribute>({
    magic: 0,
    vitality: 0,
    strength: 0,
    luck: 0,
    spirit: 0
  });
  const [lifeOrigin, setLifeOrigin] = React.useState<string>('');
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [character, setCharacter] = React.useState<Character | null>(null);

  React.useEffect(() => {
    loadCharacter();
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAttrs((prevState) => ({
      ...prevState,
      [name]: value
    }));
  }

  const handleSelect = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setLifeOrigin(value);
  }

  const loadCharacter = React.useCallback(async () => {
    if (!publicKey) return;
    if (!accountKey) return;

    const accountInfo = await connection.getAccountInfo(new PublicKey(accountKey));
    if (accountInfo) {
      console.log(accountInfo);
      const data = borsh.deserialize(CharacterSchema, Assignable, accountInfo?.data);
      if (data) {
        // Check initialized
        if (data.magic > 1) {
          setCharacter(new Character(data));
        }
      }
    }

  }, [publicKey, accountKey, connection])

  const clearAccount = () => {
    setAccountKey("");
    setCharacter(null);
  }

  const createAccount = React.useCallback(async () => {
    if (!publicKey) throw new WalletConnectionError();

    const programId = new PublicKey(PROGRAM_ID);

    // Create character account
    const account = new Keypair();
    let transaction = new Transaction({
      feePayer: publicKey
    });
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: account.publicKey,
        lamports: await connection.getMinimumBalanceForRentExemption(
          CHARACTER_SPAN,
        ),
        space: CHARACTER_SPAN,
        programId: programId,
      })
    );

    setIsPending(true);

    const signature = await sendTransaction(transaction, connection, {
      signers: [account]
    });
    await connection.confirmTransaction(signature, 'processed');
    setAccountKey(account.publicKey.toString());

    setIsPending(false);

  }, [publicKey, sendTransaction, connection]);

  const addCharacter = React.useCallback(async () => {
    if (!publicKey) throw new WalletConnectionError();

    const programId = new PublicKey(PROGRAM_ID);

    const characterObj = new Assignable({
      life_origin: lifeOrigin,
      magic: attrs.magic,
      strength: attrs.strength,
      vitality: attrs.vitality,
      spirit: attrs.spirit,
      luck: attrs.luck
    });
    console.log(characterObj);
    const data = borsh.serialize(CharacterSchema, characterObj);
    const instructionIdx = new Uint8Array([0]);
    const bufferData = concatTypedArrays(instructionIdx, data);
    console.log(bufferData);

    // Add instruction index
    let transaction = new Transaction({
      feePayer: publicKey
    });
    transaction.add(new TransactionInstruction({
      keys: [
        { pubkey: new PublicKey(accountKey), isSigner: false, isWritable: true },
      ],
      programId: programId,
      data: Buffer.from(bufferData)
    }));

    setIsPending(true);

    const signature = await sendTransaction(transaction, connection);
    const result = await connection.confirmTransaction(signature, 'processed');
    console.log(result);

    setIsPending(false);

    setTimeout(() => {
      loadCharacter();
    }, 3000);

  }, [publicKey, sendTransaction, connection, attrs, lifeOrigin]);

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Solana Creature Example
        </Typography>

        <WalletMultiButton />

        <hr />

        {
          (publicKey && !accountKey) ?
            <Button variant="contained" onClick={createAccount} disabled={isPending}>
              Create Account
            </Button>
            : null
        }

        {
          character ?
            <Button variant="contained" onClick={clearAccount}>
              Clear Account
            </Button>
            : null
        }

      </Box>

      {
        character ? <>
          <Box
            sx={{
              my: 4,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '32px'
            }}>

            <Typography>Life Origins: {LifeOrigins[character.life_origin]}</Typography>
            <Typography>Magic: {character.attributes.magic}</Typography>
            <Typography>Strength: {character.attributes.strength}</Typography>
            <Typography>Vitality: {character.attributes.vitality}</Typography>
            <Typography>Spirit: {character.attributes.spirit}</Typography>
            <Typography>Luck: {character.attributes.luck}</Typography>

          </Box>
        </> : null
      }

      {
        (publicKey && accountKey && !character) ? <Box>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                fullWidth
                variant="outlined"
                label="Magic"
                type="number"
                name="magic"
                value={attrs?.magic || ""}
                onChange={handleChange} />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                variant="outlined"
                label="Strength"
                type="number"
                name="strength"
                value={attrs?.strength || ""}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                variant="outlined"
                label="Vitality"
                type="number"
                name="vitality"
                value={attrs?.vitality || ""}
                onChange={handleChange} />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                variant="outlined"
                label="Spirit"
                type="number"
                name="spirit"
                value={attrs?.spirit || ""}
                onChange={handleChange} />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                variant="outlined"
                label="Luck"
                type="number"
                name="luck"
                value={attrs?.luck || ""}
                onChange={handleChange} />
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel id="life-origin-label">Life Origins</InputLabel>
                <Select
                  labelId="life-origin-label"
                  label="Life Origins"
                  name="lifeOrigin"
                  value={lifeOrigin}
                  onChange={handleSelect}
                >
                  <MenuItem value={0}>Heaven</MenuItem>
                  <MenuItem value={1}>Hell</MenuItem>
                  <MenuItem value={2}>Earth</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} alignContent={"center"}>
              <Button variant="contained" onClick={addCharacter} disabled={isPending}>
                Add Character
              </Button>
            </Grid>
          </Grid>
        </Box> : null
      }

    </Container>
  );
};

export default Home;
