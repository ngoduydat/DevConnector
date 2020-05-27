const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
var ObjectId = require('mongoose').Types.ObjectId;

const Profile = require('../../models/Profile');
const User = require('../../models/User');

//  @route    GET api/profile
//  @desc     Get current user profile
//  @access   Public
router.get('/me', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.user.id,
		}).populate('user', ['name', 'avatar']);

		if (!profile) {
			return res
				.status(400)
				.json({ msg: 'There is no profile for this user' });
		}

		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
	res.send('Profile');
});

//  @route    POST api/profile
//  @desc     Create or update  user profile
//  @access   Private
router.post(
	'/',
	[
		auth,
		[
			check('status', 'Status is required').not().isEmpty(),
			check('skills', 'Skills is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const {
			company,
			website,
			location,
			bio,
			status,
			githubusername,
			skills,
			youtube,
			facebook,
			twitter,
			instagram,
			linkedin,
		} = req.body;

		// Build profile object
		const profileFields = {};
		profileFields.user = req.user.id;
		if (company) profileFields.company = company;
		if (website) profileFields.website = website;
		if (location) profileFields.location = location;
		if (bio) profileFields.bio = bio;
		if (status) profileFields.status = status;
		if (githubusername) profileFields.githubusername = githubusername;
		if (skills) {
			profileFields.skills = skills
				.split(',')
				.map((skill) => skill.trim());
		}

		// Build social object
		profileFields.social = {};
		if (youtube) profileFields.social.youtube = youtube;
		if (twitter) profileFields.social.twitter = twitter;
		if (facebook) profileFields.social.facebook = facebook;
		if (linkedin) profileFields.social.linkedin = linkedin;
		if (instagram) profileFields.social.instagram = instagram;

		try {
			let profile = Profile.findOne(
				{ user: new ObjectId(req.user.id) },
				async (err, result) => {
					if (err) {
						console(err);
					}

					if (result) {
						// Update
						profile = await Profile.findOneAndUpdate(
							{ user: req.user.id },
							{ $set: profileFields }
						);
						console.log('update');
						return res.json(profile);
					} else {
						// Create
						profile = new Profile(profileFields);
						await profile.save();
						console.log('create');
						res.json(profile);
					}
				}
			);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server error');
		}
	}
);

//  @route    GET api/profile
//  @desc     Get all profile
//  @access   Public
router.get('/', async (req, res) => {
	try {
		const profiles = await Profile.find().populate('user', [
			'name',
			'avatar',
		]);
		res.json(profiles);
	} catch (err) {
		console.log(err.message);
		res.status(500).send('Server error');
	}
});

//  @route    GET api/profile/user/:user_id
//  @desc     Get profile by user id
//  @access   Public
router.get('/user/:user_id', async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.params.user_id,
		}).populate('user', ['name', 'avatar']);

		if (!profile)
			return res
				.status(400)
				.json({ msg: 'There is no profile for this user' });

		res.json(profile);
	} catch (err) {
		console.log(err.message);
		if (err.kind === 'ObjectId') {
			return res.status(400).json({ msg: 'Profile not found' });
		}
		res.status(500).send('Server error');
	}
});

//  @route    DELETE api/profile
//  @desc     Delete profile, user & posts
//  @access   Private
router.delete('/', auth, async (req, res) => {
	try {
		// @todo - remove user posts
		//remove profile
		await Profile.findOneAndRemove({
			user: req.user.id,
		});

		// Remove user
		await User.findOneAndRemove({
			_id: req.user.id,
		});

		res.json({ msg: 'User deleted' });
	} catch (err) {
		console.log(err.message);
		if (err.kind === 'ObjectId') {
			return res.status(400).json({ msg: 'Profile not found' });
		}
		res.status(500).send('Server error');
	}
});

//  @route    PUT api/profile/experience
//  @desc     Add profile experience
//  @access   Private
router.put(
	'/experience',
	[
		auth,
		[
			check('title', 'Title is required').not().isEmpty(),
			check('company', 'Company is required').not().isEmpty(),
			check('from', 'From date is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const {
			title,
			company,
			location,
			from,
			to,
			current,
			description,
		} = req.body;

		const newExp = {
			title,
			company,
			location,
			from,
			to,
			current,
			description,
		};

		try {
			const profile = await Profile.findOne({ user: req.user.id });

			if (!profile) {
				return res.status(400).json({ msg: 'Profile not found' });
			}

			profile.experience.unshift(newExp);
			await profile.save();
			res.json({ msg: 'Update experience of profile success' });
		} catch (err) {
			console.log(err.message);
			res.status(500).send('Server error');
		}
	}
);

//  @route    DELETE api/profile/experience
//  @desc     Delete experience from profile
//  @access   Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });

		if (!profile) {
			return res.status(400).json({ msg: 'Profile not found' });
		}

		// Get index
		const removeIndex = profile.experience
			.map((item) => item._id)
			.indexOf(req.params.exp_id);
		profile.experience.splice(removeIndex, 1);

		await profile.save();

		return res.json({ msg: 'Remove experience of profile success' });
	} catch (err) {
		console.log(err.message);
		if (err.kind === 'ObjectId') {
			return res.status(400).json({ msg: 'Profile not found' });
		}
		return res.status(500).send('Server error');
	}
});

//  @route    PUT api/profile/education
//  @desc     Add profile education
//  @access   Private
router.put(
	'/education',
	[
		auth,
		[
			check('school', 'Shool is required').not().isEmpty(),
			check('degree', 'Degree is required').not().isEmpty(),
			check('fieldofstudy', 'Field of study is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const {
			school,
			degree,
			fieldofstudy,
			from,
			to,
			current,
			description,
		} = req.body;

		const newEdu = {
			school,
			degree,
			fieldofstudy,
			from,
			to,
			current,
			description,
		};

		try {
			const profile = await Profile.findOne({ user: req.user.id });

			if (!profile) {
				return res.status(400).json({ msg: 'Profile not found' });
			}

			profile.education.unshift(newEdu);
			await profile.save();
			res.json({ msg: 'Update education of profile success' });
		} catch (err) {
			console.log(err.message);
			res.status(500).send('Server error');
		}
	}
);

//  @route    DELETE api/profile/education
//  @desc     Delete education from profile
//  @access   Private
router.delete('/education/:edu_id', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });

		if (!profile) {
			return res.status(400).json({ msg: 'Profile not found' });
		}

		// Get index
		const removeIndex = profile.education
			.map((item) => item._id)
			.indexOf(req.params.edu_id);
		profile.education.splice(removeIndex, 1);

		await profile.save();

		res.json({ msg: 'Remove education of profile success' });
	} catch (err) {
		console.log(err.message);
		if (err.kind === 'ObjectId') {
			return res.status(400).json({ msg: 'Profile not found' });
		}
		return res.status(500).send('Server error');
	}
});

module.exports = router;
