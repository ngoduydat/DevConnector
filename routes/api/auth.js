const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth');
const User = require('../../models/User');

//  @route    GET api/auth
//  @desc     Test route
//  @access   Public

router.get('/', [auth], async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password');
		res.json(user);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

//  @route    Post api/auth
//  @desc     Authenticate user & get token
//  @access   public
router.post(
	'/',
	[
		check('email', 'Please include a valid email').isEmail(),
		check('password', 'Password is required').exists(),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, password } = req.body;

		try {
			// Check user existed
			let user = await User.findOne({ email });

			if (!user) {
				return res.status(400).json({
					errors: [{ msg: 'Invalid credentials' }],
				});
			}

			const isMatch = await bcrypt.compare(password, user.password);

			if (!isMatch) {
				return res.status(400).json({
					errors: [{ msg: 'Password is invalid' }],
				});
			}
			const payload = {
				user: {
					id: user._id,
					email: user.email,
				},
			};

			jwt.sign(
				payload,
				config.get('jwtSecret'),
				{ expiresIn: 36000 },
				(err, token) => {
					if (err) throw err;
					else res.json({ token });
				}
			);
		} catch (err) {
			console.log(err.message);
			res.status(500).send('Server error');
		}
	}
);

module.exports = router;
