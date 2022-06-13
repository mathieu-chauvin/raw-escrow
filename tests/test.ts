import * as web3 from '@solana/web3.js';

import {expect} from 'chai';
import exp from 'constants';
import 'mocha'
//import { sign } from 'crypto';

//console.log(solanaWeb3);

describe("escrow", ()=>{

    const programKey = new web3.PublicKey("85hpvNKP1PdhwFDPYN8aaGV9owqDEXFD6CLNKZ7XY41m");

    let connection = new web3.Connection(
        'http://localhost:8899',
        'confirmed',
    );


    it("alice sends to bob", async ()=> {
        
    
        //console.log(connection)
    
        const alice = web3.Keypair.generate();
        
        let airdropSignature = await connection.requestAirdrop(alice.publicKey, 5 * web3.LAMPORTS_PER_SOL);
        const latestBlockhash = await connection.getLatestBlockhash('confirmed');
    
        await connection.confirmTransaction({
            signature:airdropSignature,
            blockhash:latestBlockhash.blockhash,
            lastValidBlockHeight:latestBlockhash.lastValidBlockHeight
        });
    
    
        const bob = web3.Keypair.generate();
    
    
    
        const transaction = new web3.Transaction().add(
            web3.SystemProgram.transfer({
                fromPubkey:alice.publicKey,
                toPubkey:bob.publicKey,
                lamports:1*web3.LAMPORTS_PER_SOL,
            })
        )
    
        let signature = await web3.sendAndConfirmTransaction(connection, transaction, [alice]);
    
        const bobBalance = await connection.getBalance(bob.publicKey);
        expect(bobBalance).to.equal(1*web3.LAMPORTS_PER_SOL);
    
    });

    it("sends sol to program", async () => {

        // airdrop 5 sol to alice

        const alice = web3.Keypair.generate();

        //const bob = web3.Keypair.generate();

        const chest = web3.Keypair.generate();

        let airdropSignature = await connection.requestAirdrop(alice.publicKey, 5 * web3.LAMPORTS_PER_SOL);
        const latestBlockhash = await connection.getLatestBlockhash('confirmed');
    
        await connection.confirmTransaction({
            signature:airdropSignature,
            blockhash:latestBlockhash.blockhash,
            lastValidBlockHeight:latestBlockhash.lastValidBlockHeight
        });
        
        
    
        const transaction = new web3.Transaction().add(
            web3.SystemProgram.createAccount({
                fromPubkey:alice.publicKey,
                newAccountPubkey:chest.publicKey,
                lamports:web3.LAMPORTS_PER_SOL,
                programId:programKey,
                space:10,
            }),
            web3.SystemProgram.transfer({
                fromPubkey:alice.publicKey,
                toPubkey:chest.publicKey,
                lamports:1*web3.LAMPORTS_PER_SOL,
            })
        );
    
        await web3.sendAndConfirmTransaction(connection, transaction, [alice, chest]);

        const programBalance = await connection.getBalance(chest.publicKey);

        expect(programBalance).to.equal(2*web3.LAMPORTS_PER_SOL);
    
    

    });

    it("program sends sol to me", async () => {

        // airdrop 5 sol to alice

        const alice = web3.Keypair.generate();

        let airdropSignature = await connection.requestAirdrop(alice.publicKey, 5 * web3.LAMPORTS_PER_SOL);
        const latestBlockhash = await connection.getLatestBlockhash('confirmed');
    
        await connection.confirmTransaction({
            signature:airdropSignature,
            blockhash:latestBlockhash.blockhash,
            lastValidBlockHeight:latestBlockhash.lastValidBlockHeight
        });

        console.log('alice');
        console.log(alice.publicKey.toBase58());

        //const chestKey = web3.Keypair.generate();
        //const chest = [chestKey.publicKey];

        //web3.Keypair.fromSeed
        const chest = web3.PublicKey.findProgramAddressSync([Buffer.from("chestb")],programKey);


        console.log('chest');
        console.log(chest[0].toBase58())

        console.log('chest seeds');
        console.log(chest[1]);

        const bob = web3.Keypair.generate();

        console.log('bob');
        console.log(bob.publicKey.toBase58());

        let airdropSignature2 = await connection.requestAirdrop(bob.publicKey, 5 * web3.LAMPORTS_PER_SOL);
        const latestBlockhash2 = await connection.getLatestBlockhash('confirmed');
    
        await connection.confirmTransaction({
            signature:airdropSignature,
            blockhash:latestBlockhash.blockhash,
            lastValidBlockHeight:latestBlockhash.lastValidBlockHeight
        });

        //chest[1]+=1;


        const instruction_data_1 = Uint8Array.from([chest[1],0]);

        const transaction1 = new web3.Transaction().add(
            new web3.TransactionInstruction({
                programId:programKey,
                keys:[
                    {pubkey:alice.publicKey, isSigner:true, isWritable:false},
                    {pubkey:bob.publicKey, isSigner:false, isWritable:true},
                    {pubkey:chest[0], isSigner:false, isWritable:true},
                    //{pubkey:chest[0], isSigner:false, isWritable:true},
                    {pubkey:web3.SystemProgram.programId, isSigner:false, isWritable:false},
                ],
                data:Buffer.from(instruction_data_1),

            }),
            web3.SystemProgram.transfer({fromPubkey:alice.publicKey, toPubkey:chest[0], lamports:web3.LAMPORTS_PER_SOL})
        );

        await web3.sendAndConfirmTransaction(connection,transaction1,[alice]);
        

        console.log('transaction1 finished');

        const instruction_data_2 = Uint8Array.from([chest[1],1]);

        const transaction2 = new web3.Transaction().add(
            new web3.TransactionInstruction({
                programId:programKey,
                keys:[
                    {pubkey:alice.publicKey, isSigner:false, isWritable:false},
                    {pubkey:bob.publicKey, isSigner:true, isWritable:true},
                    {pubkey:chest[0], isSigner:false, isWritable:true},
                    //{pubkey:chest[0], isSigner:false, isWritable:true},
                    {pubkey:web3.SystemProgram.programId, isSigner:false, isWritable:false},
                ],
                data:Buffer.from(instruction_data_2),
            })
        );
    
        await web3.sendAndConfirmTransaction(connection, transaction2, [bob]);


        const aliceBalance = await connection.getBalance(alice.publicKey);
        console.log('alice');
        console.log(aliceBalance);

        const chestBalance = await connection.getBalance(chest[0]);

        expect(chestBalance).to.equal(await connection.getMinimumBalanceForRentExemption(1));

        const bobBalance = await connection.getBalance(bob.publicKey);

        // 5 sol initialized + 1 sol - cost transaction
        expect(bobBalance).to.equal(6*web3.LAMPORTS_PER_SOL-5000);
    

    });

});
