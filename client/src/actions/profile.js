import axios from "axios";
import { setAlert } from "./alert";

import {
	GET_PROFILE,
	PROFILE_ERROR,
	CLEAR_PROFILE,
	ACCOUNT_DELETE,
	GET_PROFILES,
} from "./types";

// get current users profile
export const getCurrentProfile = () => async (dispatch) => {
	try {
		const config = {
			headers: {
				"Content-Type": "application/json",
			},
		};
		const res = await axios.get("/api/profile/me", {}, config);
		dispatch({ type: GET_PROFILE, payload: res.data });
	} catch (err) {
		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.stateText,
				status: err.response.status,
			},
		});
	}
};

// get all  profile
export const getProfiles = () => async (dispatch) => {
	dispatch({ type: CLEAR_PROFILE });
	try {
		const config = {
			headers: {
				"Content-Type": "application/json",
			},
		};
		const res = await axios.get("/api/profile", {}, config);
		dispatch({ type: GET_PROFILES, payload: res.data });
	} catch (err) {
		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.stateText,
				status: err.response.status,
			},
		});
	}
};

// get all  profile
export const getProfileById = (userId) => async (dispatch) => {
	dispatch({ type: CLEAR_PROFILE });
	try {
		const config = {
			headers: {
				"Content-Type": "application/json",
			},
		};
		const res = await axios.get(`/api/profile/user/${userId}`, {}, config);
		dispatch({ type: GET_PROFILE, payload: res.data });
	} catch (err) {
		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.stateText,
				status: err.response.status,
			},
		});
	}
};

// create or update profile
export const createProfile = (formData, history, edit = false) => async (
	dispatch
) => {
	try {
		const config = {
			headers: {
				"Content-Type": "application/json",
			},
		};
		const res = await axios.post("/api/profile", formData, config);

		dispatch({ type: GET_PROFILE, payload: res.data });

		dispatch(setAlert(edit ? "Profile Updated" : "Profile Created"));

		if (!edit) {
			history.push("/dashboard");
		}
	} catch (err) {
		const errors = err.response.data.errors;

		if (errors) {
			errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));
		}

		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.stateText,
				status: err.response.status,
			},
		});
	}
};

// update experience
export const addExperience = (formData, history) => async (dispatch) => {
	try {
		const config = {
			headers: {
				"Content-Type": "application/json",
			},
		};
		const res = await axios.put(
			"/api/profile/experience",
			formData,
			config
		);

		dispatch(getCurrentProfile());

		dispatch(setAlert("Experience Added", "success"));

		history.push("/dashboard");
	} catch (err) {
		const errors = err.response.data.errors;

		if (errors) {
			errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));
		}

		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.stateText,
				status: err.response.status,
			},
		});
	}
};

// update education
export const addEducation = (formData, history) => async (dispatch) => {
	try {
		const config = {
			headers: {
				"Content-Type": "application/json",
			},
		};
		const res = await axios.put("/api/profile/education", formData, config);

		dispatch(getCurrentProfile());

		dispatch(setAlert("Education Added", "success"));

		history.push("/dashboard");
	} catch (err) {
		const errors = err.response.data.errors;

		if (errors) {
			errors.forEach((error) => dispatch(setAlert(error.msg, "danger")));
		}

		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.stateText,
				status: err.response.status,
			},
		});
	}
};

// Delete experience
export const deleteExperience = (id) => async (dispatch) => {
	try {
		const res = await axios.delete(`/api/profile/experience/${id}`);
		dispatch(getCurrentProfile());

		dispatch(setAlert("Experience removed", "success"));
	} catch (err) {
		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.stateText,
				status: err.response.status,
			},
		});
	}
};

// Delete education
export const deleteEducation = (id) => async (dispatch) => {
	try {
		const res = await axios.delete(`/api/profile/education/${id}`);

		dispatch(getCurrentProfile());

		dispatch(setAlert("Education removed", "success"));
	} catch (err) {
		dispatch({
			type: PROFILE_ERROR,
			payload: {
				msg: err.response.stateText,
				status: err.response.status,
			},
		});
	}
};

// Delete account & profile
export const deleteAccount = () => async (dispatch) => {
	if (window.confirm("Are you sure? This can NOT be undone!")) {
		try {
			const res = await axios.delete(`/api/profile`);

			dispatch({ type: CLEAR_PROFILE });
			dispatch({ type: ACCOUNT_DELETE });

			dispatch(
				setAlert("Your account has been permanantly deleted", "success")
			);
		} catch (err) {
			dispatch({
				type: PROFILE_ERROR,
				payload: {
					msg: err.response.stateText,
					status: err.response.status,
				},
			});
		}
	}
};
