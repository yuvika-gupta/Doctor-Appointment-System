const User = require('../models/User');
const Doctor = require('../models/Doctor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const register = async (req, res) => {
  try {
    const { name, email, password, phone, specialization, bio, experience } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = new User({ name, email, passwordHash, role: 'doctor', phone });
    await user.save();

    const doctor = new Doctor({ userId: user._id, specialization, bio, experience });
    await doctor.save();

    res.status(201).json({ message: 'Doctor registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { id: user._id, role: user.role };
    let doctorId = null;
    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: user._id });
      if (doctor) doctorId = doctor._id;
    }

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user._id, name: user.name, role: user.role, doctorId } });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with that email' });

    // Ethereal mock email setup
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });

    const resetLink = `http://localhost:5173/reset-password?email=${encodeURIComponent(email)}&token=mocktoken123`;

    const info = await transporter.sendMail({
      from: '"Doctor App" <no-reply@doctorapp.com>',
      to: email,
      subject: 'Password Reset Request',
      html: `<p>Hello <b>${user.name}</b>,</p><p>Click <a href="${resetLink}">here</a> to reset your password.</p><p>Link: ${resetLink}</p>`,
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    res.json({
      message: 'Password reset email sent. Check the server console for the Ethereal preview URL.',
      previewUrl: nodemailer.getTestMessageUrl(info)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ userId: user._id });
    }
    res.json({ user, doctorProfile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, specialization, bio, experience } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true, select: '-passwordHash' }
    );

    if (user.role === 'doctor') {
      await Doctor.findOneAndUpdate(
        { userId: req.user.id },
        { specialization, bio, experience },
        { new: true }
      );
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with that email' });

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    await user.save();

    res.json({ message: 'Password reset successfully. You can now login with your new password.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login, forgotPassword, changePassword, resetPassword, getProfile, updateProfile };

