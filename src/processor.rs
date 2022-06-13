use solana_program::{rent::Rent,pubkey::Pubkey,system_instruction, program::{invoke,invoke_signed}, account_info::{AccountInfo,next_account_info}, entrypoint::ProgramResult, msg};
use crate::constants::AMOUNT;
pub fn process_instruction(program_id:&Pubkey, accounts:&[AccountInfo], instruction_data:&[u8])->ProgramResult{

    let accountiter = &mut accounts.iter();

    let source = next_account_info(accountiter)?;
    let destination = next_account_info(accountiter)?;

    
    let pda_account_info = next_account_info(accountiter)?;
    let system_program_info = next_account_info(accountiter)?;

    let bump_seed = instruction_data[0];

    let choice = instruction_data[1];


    let pda_expected = Pubkey::create_program_address(&[b"chestb",&[bump_seed]], program_id).unwrap();

    assert_eq!(&pda_expected, pda_account_info.key);

    // initialize the PDA account
    if choice == 0 {
        msg!("initializing");


        // if there is no account associated with the pda, we create it
        if (**pda_account_info.try_borrow_mut_lamports()?) == 0 {
            msg!("pda is empty");

            let ix = system_instruction::create_account(
                &source.key,
                &pda_account_info.key,
                Rent::default().minimum_balance(1),
                1,
                program_id
            );

            invoke_signed(
                &ix,
                &[
                    source.clone(),
                    pda_account_info.clone(),
                    system_program_info.clone()
                ],
                &[&[b"chestb", &[bump_seed]]]
            )?;
        
            msg!("account created");
        }
        else {
            msg!("pda is not empty");   
        }


        //**pda_account_info.try_borrow_mut_lamports()? += AMOUNT;
        //**source.try_borrow_mut_lamports()? -= AMOUNT;
    }

    // transfer lamports to the other person
    else if choice == 1 {
        msg!("dumping");


        let amount = **pda_account_info.try_borrow_mut_lamports()? - Rent::default().minimum_balance(1);
        **pda_account_info.try_borrow_mut_lamports()? -= amount;
        **destination.try_borrow_mut_lamports()? += amount;

    }

    else {
        msg!("error");

    }

        


    //msg!("bump seed:{}",bump_seed);



    //let (pda, bump_seed) = Pubkey::find_program_address(&[b"chestb"], program_id);

    
    //
    //msg!("{}",pda_expected);



    

    

   Ok(())
}