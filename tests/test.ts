import * as web3 from '@solana/web3.js';

import {expect} from 'chai';
import exp from 'constants';
import 'mocha';
//import { sign } from 'crypto';
//console.log(solanaWeb3);

describe("escrow", ()=>{

    const programKey = new web3.PublicKey("85hpvNKP1PdhwFDPYN8aaGV9owqDEXFD6CLNKZ7XY41m");

    const controller = [255,94,147,170,29,232,35,171,165,96,247,72,153,117,33,89,134,192,11,228,170,73,230,14,176,241,189,119,245,176,220,137,31,147,19,157,76,242,213,216,60,215,225,43,59,233,141,206,165,103,22,107,234,69,76,120,167,197,249,99,209,23,195,226]
    .slice(0,32);

    const controllerKeypair = web3.Keypair.fromSeed(Uint8Array.from(controller));
    //console.log(controllerKeypair.publicKey.toBytes());
    /*for (let entry in controllerKeypair.publicKey.toBytes().entries()) {
        console.log(entry);
    }*/
    const arr = [...controllerKeypair.publicKey.toBytes()];
    console.log(arr);
    let connection = new web3.Connection(
        'http://localhost:8899',
        'confirmed',
    );

    const alice = web3.Keypair.generate();
    const bob = web3.Keypair.generate();
        //const chest = web3.Keypair.generate();
        
    
    const chest = web3.PublicKey.findProgramAddressSync([Buffer.from("chestb"), alice.publicKey.toBuffer(), bob.publicKey.toBuffer()],programKey);
    console.log('controllerKeypair');
    console.log(controllerKeypair.publicKey.toBase58());



    /*it("alice sends to bob", async ()=> {
        
    
        //console.log(connection)
    
        const alice = web3.Keypair.generate();
        
        let airdropSignature = await connection.requestAirdrop(alice.publicKey, 5 * web3.LAMPORTS_PER_SOL);
        const latestBlockhash = await connection.getLatestBlockhash('confirmed');
    
        await connection.confirmTransaction({
            signature:airdropSignature,
            blockhash:latestBlockhash.blockhash,
            lastValidBlockHeight:latestBlockhash.lastValidBlockHeight
        });
    
        const aliceBalance = await connection.getBalance(alice.publicKey);
        expect(aliceBalance).to.equal(5 * web3.LAMPORTS_PER_SOL);
        
    
    
    
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
    
    });*/

    it("initialize escrow", async () => {

        // airdrop 5 sol to alice


        let airdropSignature = await connection.requestAirdrop(alice.publicKey, 5 * web3.LAMPORTS_PER_SOL);
        const latestBlockhash = await connection.getLatestBlockhash('confirmed');
    
        await connection.confirmTransaction({
            signature:airdropSignature,
            blockhash:latestBlockhash.blockhash,
            lastValidBlockHeight:latestBlockhash.lastValidBlockHeight
        });
        
        

        const instruction_data_1 = Uint8Array.from([chest[1],0]);

        const transaction1 = new web3.Transaction().add(
            new web3.TransactionInstruction({
                programId:programKey,
                keys:[
                    {pubkey:alice.publicKey, isSigner:true, isWritable:false},
                    {pubkey:bob.publicKey, isSigner:false, isWritable:true},
                    {pubkey:controllerKeypair.publicKey, isSigner:false, isWritable:true},
                    {pubkey:chest[0], isSigner:false, isWritable:true},
                    
                    {pubkey:web3.SystemProgram.programId, isSigner:false, isWritable:false},
                ],
                data:Buffer.from(instruction_data_1),

            }),
            web3.SystemProgram.transfer({fromPubkey:alice.publicKey, toPubkey:chest[0], lamports:web3.LAMPORTS_PER_SOL})
        );

        await web3.sendAndConfirmTransaction(connection,transaction1,[alice]);
        

        console.log('transaction1 finished');
        

        const programBalance = await connection.getBalance(chest[0]);

        expect(programBalance).to.equal(1*web3.LAMPORTS_PER_SOL+await connection.getMinimumBalanceForRentExemption(1));
    
    

    });

    it("bob put sol in chest", async () => {

        let airdropSignature = await connection.requestAirdrop(bob.publicKey, 5 * web3.LAMPORTS_PER_SOL);
        const latestBlockhash = await connection.getLatestBlockhash('confirmed');
    
        await connection.confirmTransaction({
            signature:airdropSignature,
            blockhash:latestBlockhash.blockhash,
            lastValidBlockHeight:latestBlockhash.lastValidBlockHeight
        });
    
        const bobBalance = await connection.getBalance(bob.publicKey);
        expect(bobBalance).to.equal(5 * web3.LAMPORTS_PER_SOL);


        const transaction = new web3.Transaction().add(
            web3.SystemProgram.transfer({
                fromPubkey:bob.publicKey,
                toPubkey:chest[0],
                lamports:1*web3.LAMPORTS_PER_SOL,
            })
        );

        await web3.sendAndConfirmTransaction(connection, transaction, [bob]);

        const chestBalance = await connection.getBalance(chest[0]);
        expect(chestBalance).to.equal(2*web3.LAMPORTS_PER_SOL + await connection.getMinimumBalanceForRentExemption(1));
    });

    it("program sends sol to winner", async () => {

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


        console.log('chest');
        console.log(chest[0].toBase58())

        console.log('chest seeds');
        console.log(chest[1]);


        //chest[1]+=1;



        const instruction_data_2 = Uint8Array.from([chest[1],1]);

        const transaction2 = new web3.Transaction().add(
            new web3.TransactionInstruction({
                programId:programKey,
                keys:[
                    {pubkey:alice.publicKey, isSigner:false, isWritable:false},
                    {pubkey:bob.publicKey, isSigner:true, isWritable:true},
                    {pubkey:controllerKeypair.publicKey, isSigner:true, isWritable:true},
                    {pubkey:chest[0], isSigner:false, isWritable:true},
                    //{pubkey:chest[0], isSigner:false, isWritable:true},
                    {pubkey:web3.SystemProgram.programId, isSigner:false, isWritable:false},
                ],
                data:Buffer.from(instruction_data_2),
            })
        );
    
        await web3.sendAndConfirmTransaction(connection, transaction2, [bob, controllerKeypair]);


        const aliceBalance = await connection.getBalance(alice.publicKey);
        console.log('alice');
        console.log(aliceBalance);

        const chestBalance = await connection.getBalance(chest[0]);

        expect(chestBalance).to.equal(await connection.getMinimumBalanceForRentExemption(1));

        const bobBalance = await connection.getBalance(bob.publicKey);

        // 5 sol initialized + 1 sol win - cost of 2 transactions
        expect(bobBalance).to.equal(6*web3.LAMPORTS_PER_SOL-3*5000);
    

    });

});
