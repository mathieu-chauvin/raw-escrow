use solana_program::{pubkey::Pubkey,system_instruction, program::{invoke,invoke_signed}, account_info::{AccountInfo,next_account_info}, entrypoint::ProgramResult, msg};

pub fn process_instruction(program_id:&Pubkey, accounts:&[AccountInfo], instruction_data:&[u8])->ProgramResult{

    msg!("hello");
    let accountiter = &mut accounts.iter();

    msg!("hello bis");

    

    let source = next_account_info(accountiter)?;
    let destination = next_account_info(accountiter)?;

    
    let pda_account_info = next_account_info(accountiter)?;
    let system_program_info = next_account_info(accountiter)?;
    let bump_seed = instruction_data[0];

    //msg!("bump seed:{}",bump_seed);



    //let (pda, bump_seed) = Pubkey::find_program_address(&[b"chestb"], program_id);

    let pda_expected = Pubkey::create_program_address(&[b"chestb",&[bump_seed]], program_id).unwrap();

    assert_eq!(&pda_expected, pda_account_info.key);

    

    msg!("invoking");
    //
    //msg!("{}",pda_expected);
   
      


    if (**pda_account_info.try_borrow_mut_lamports()?) == 0 {
        msg!("pda is empty");

        let ix = system_instruction::create_account(
            &source.key,
            &pda_account_info.key,
            100000000,
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

    **destination.try_borrow_mut_lamports()? += **pda_account_info.try_borrow_mut_lamports()?;
    **pda_account_info.try_borrow_mut_lamports()? = 0;

   Ok(())
}