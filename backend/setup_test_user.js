require('dotenv').config();
const { supabaseAdmin } = require('./config/supabase');
const { generateAccountNumber } = require('./utils/accountNumber');

async function setupTestUser() {
  const email = 'test@banco.cl';
  const password = 'test123456';
  const full_name = 'Usuario de Prueba Gold';

  console.log('--- CONFIGURANDO USUARIO DE PRUEBA ---');

  // 1. Intentar crear el usuario en Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  let userId;

  if (authError) {
    if (authError.message.includes('already')) {
      console.log('Aviso: El usuario ya existe en Auth. Obteniendo ID...');
      const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
      const user = userData.users.find(u => u.email === email);
      userId = user.id;

      // Resetear password por si acaso
      await supabaseAdmin.auth.admin.updateUserById(userId, { password });
      console.log('✅ Password reseteado a test123456');
    } else {
      console.error('Error Auth:', authError.message);
      return;
    }
  } else {
    userId = authData.user.id;
    console.log('✅ Usuario creado en Auth.');
  }

  // 2. Crear/Actualizar Perfil
  const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
    id: userId,
    full_name,
    rut: '12.345.678-9',
  });

  if (profileError) console.error('Error Perfil:', profileError.message);
  else console.log('✅ Perfil configurado.');

  // 3. Crear/Actualizar Cuenta con Saldo
  const { data: existingAccount } = await supabaseAdmin.from('accounts').select('id').eq('user_id', userId).single();

  if (!existingAccount) {
    const { error: accountError } = await supabaseAdmin.from('accounts').insert({
      user_id: userId,
      account_number: generateAccountNumber(),
      account_type: 'checking',
      balance: 2500000,
      currency: 'CLP',
      is_active: true
    });
    if (accountError) console.error('Error Cuenta:', accountError.message);
    else console.log('✅ Cuenta bancaria creada con $2,500,000.');
  } else {
    await supabaseAdmin.from('accounts').update({ balance: 2500000 }).eq('user_id', userId);
    console.log('✅ Saldo actualizado a $2,500,000.');
  }

  console.log('--- FINALIZADO ---');
  console.log('Credenciales listas:');
  console.log('Email: ' + email);
  console.log('Pass: ' + password);
}

setupTestUser();
