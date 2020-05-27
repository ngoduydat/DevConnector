const mongooes = require('mongoose');

const ProfileSchema = new mongooes.Schema({
	user: {
		type: mongooes.Schema.Types.ObjectId,
		ref: 'user',
	},
	company: {
		type: String,
	},
	website: {
		type: String,
	},
	location: {
		type: String,
	},
	status: {
		type: String,
		required: true,
	},
	skills: {
		type: [String],
		required: true,
	},
	bio: {
		type: String,
	},
	githubusername: {
		type: String,
	},
	experience: [
		{
			title: {
				type: String,
				required: true,
			},
			company: {
				type: String,
				required: true,
			},
			location: {
				type: String,
				required: true,
			},
			from: {
				type: Date,
			},
			to: {
				type: Date,
			},
			current: {
				type: Boolean,
				default: false,
			},
			decription: {
				type: String,
			},
		},
	],
	education: [
		{
			school: {
				type: String,
				required: true,
			},
			degree: {
				type: String,
				required: true,
			},
			fieldofstudy: {
				type: String,
				required: true,
			},
			from: {
				type: Date,
			},
			to: {
				type: Date,
			},
			current: {
				type: Boolean,
				default: false,
			},
			decription: {
				type: String,
			},
		},
	],
	social: {
		youtube: {
			type: String,
		},
		twitter: {
			type: String,
		},
		facebook: {
			type: String,
		},
		linkedin: {
			type: String,
		},
		instagram: {
			type: String,
		},
	},

	date: {
		type: Date,
		default: Date.now,
	},
});

module.exports = Profile = mongooes.model('profile', ProfileSchema);
