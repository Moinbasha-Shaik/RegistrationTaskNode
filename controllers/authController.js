const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../utils/supabaseClient.js');
const sendVerificationEmail = require("../utils/mailer.js");

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  const { data: existingUser } = await supabase.from('users').select('*').eq('email', email).single();
  if (existingUser) return res.status(400).json({ message: 'Email already registered.' });

  const password_hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase.from('users').insert([{ name, email, password_hash, is_verified: false }]);

  if (error) return res.status(500).json({ message: 'Signup failed', error });

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  await sendVerificationEmail(email, verifyLink);

  res.status(200).json({ message: 'Signup successful. Check email to verify.' });
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.query;
  try {
    const { email } = jwt.verify(token, process.env.JWT_SECRET);
    const { data: user } = await supabase.from('users').select('*').eq('email', email).single();

    if (!user) return res.status(400).json({ message: 'Invalid token' });
    if (user.is_verified) return res.status(200).json({ message: 'Email already verified' });

    await supabase.from('users').update({ is_verified: true }).eq('email', email);
    res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Token invalid or expired' });
  }
};
