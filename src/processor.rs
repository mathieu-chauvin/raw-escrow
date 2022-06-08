use solana_program::{pubkey::Pubkey,system_instruction, program::invoke_signed, account_info::{AccountInfo,next_account_info}, entrypoint::ProgramResult, msg};

pub fn process_instruction(program_id:&Pubkey, accounts:&[AccountInfo], instruction_data:&[u8])->ProgramResult{

    msg!("hello");
    let accountiter = &mut accounts.iter();

    msg!("hello bis");

    

    let source = next_account_info(accountiter)?;
    let destination = next_account_info(accountiter)?;


    **destination.try_borrow_mut_lamports()? += **source.try_borrow_mut_lamports()?;
    **source.try_borrow_mut_lamports()? = 0;
   /* let pda_account_info = next_account_info(accountiter)?;
    let system_program = next_account_info(accountiter)?;

    let (pda, bump_seed) = Pubkey::find_program_address(&[b"chest"], program_id);

    msg!("invoking");
        
    invoke_signed(
        &system_instruction::create_account(
            &source.key,
            &pda,
            1000000,
            1,
            program_id
        ),
        &[
            source.clone(),
            pda_account_info.clone()
        ],
        &[&[&source.key.as_ref(), &[bump_seed]]]
    )?;
*/

   Ok(())
}