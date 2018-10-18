
export const REQUEST = "REQUEST";
export const SUCCESS = "SUCCESS";
export const FAILURE = "FAILURE";

export default (state = {}, action) => {
	const { apiName, type } = action;
	if(type && apiName) {
		return Object.assign({}, state, {
			[apiName]: type === REQUEST,
		});
	} else {
		return state;
	}
};

export const setLoading = (apiName) => {
	return {
		type: REQUEST,
		apiName,
	};
};

export const setSuccess = (apiName) => {
	return {
		type: SUCCESS,
		apiName,
	};
};

export const setFailure = (apiName) => {
	return {
		type: FAILURE,
		apiName,
	};
};
