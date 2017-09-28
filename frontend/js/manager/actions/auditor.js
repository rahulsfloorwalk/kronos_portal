import $ from 'jquery'
import { url } from '../../../config.js'
import types from '../action_types.js';

export function searchAuditors(search){
	return function(dispatch){
		dispatch({
			type: types.AUDITOR_SEARCH,
			status: 'request',
			search
		});

		return $.ajax( url.api_base_path + "manager/auditor",{
			data: {
				search
			},
			success: function(auditorPage){
				dispatch({
					type: types.AUDITOR_SEARCH,
					status: 'success',
					page: auditorPage,
					search
				});
			}
		});
		//TODO: Handle error
	};
};

export function fetchAuditor(auditorId){
	return function(dispatch){
		dispatch({
			type: types.AUDITOR_ID_GET,
			status: 'request',
			auditorId: auditorId
		});

		$.get( url.api_base_path + `manager/auditor/${auditorId}`, function(auditor){
			dispatch({
				type: types.AUDITOR_ID_GET,
				status: 'success',
				auditor: auditor
			});
		});
		//TODO: Handle error
	};
};

export function fetchProfileInfoForAuditor(auditorId){
	return function(dispatch){
		dispatch({
			type: types.AUDITOR_GET_PROFILE_INFO,
			status: 'request',
			auditorId: auditorId
		});

		$.get( url.api_base_path + `manager/auditor/${auditorId}/profile_info`, function(profileInfo){
			dispatch({
				type: types.AUDITOR_GET_PROFILE_INFO,
				status: 'success',
				profileInfo: profileInfo,
			});
		});
		//TODO: Handle error
	};
};

export function fetchBankInfoForAuditor(auditorId){
	return function(dispatch){
		dispatch({
			type: types.AUDITOR_GET_BANK_INFO,
			status: 'request',
			auditorId: auditorId
		});

		$.get( url.api_base_path + `manager/auditor/${auditorId}/bank_info`, function(bankInfo){
			dispatch({
				type: types.AUDITOR_GET_BANK_INFO,
				status: 'success',
				bankInfo: bankInfo,
			});
		});
		//TODO: Handle error
	};
};

export function fetchAdditionalInfoForAuditor(auditorId){
	return function(dispatch){
		dispatch({
			type: types.AUDITOR_GET_ADDITIONAL_INFO,
			status: 'request',
			auditorId: auditorId
		});

		$.get( url.api_base_path + `manager/auditor/${auditorId}/additional_info`, function(additionalInfo){
			dispatch({
				type: types.AUDITOR_GET_ADDITIONAL_INFO,
				status: 'success',
				additionalInfo: additionalInfo,
			});
		});
		//TODO: Handle error
	};
};

export function fetchFacebookInfoForAuditor(auditorId){
	return function(dispatch){
		dispatch({
			type: types.AUDITOR_GET_FACEBOOK_INFO,
			status: 'request',
			auditorId: auditorId
		});

		$.get( url.api_base_path + `manager/auditor/${auditorId}/facebook_info`, function(socialInfo){
			dispatch({
				type: types.AUDITOR_GET_FACEBOOK_INFO,
				status: 'success',
				socialInfo: socialInfo,
			});
		});
		//TODO: Handle error
	};
};

export function activateAuditor(userId){
	return function(dispatch){
		dispatch({
			type: types.AUDITOR_ID_ACTIVATE,
			status: 'request',
			userId
		});

		return $.post( url.api_base_path + `manager/auditor/${userId}/activate`, function(auditor){
			dispatch({
				type: types.AUDITOR_ID_ACTIVATE,
				status: 'success',
				auditor
			});
		});
		//TODO: Handle error
	};
};

export function deactivateAuditor(userId){
	return function(dispatch){
		dispatch({
			type: types.AUDITOR_ID_DEACTIVATE,
			status: 'request',
			userId
		});

		return $.post( url.api_base_path + `manager/auditor/${userId}/deactivate`, function(auditor){
			dispatch({
				type: types.AUDITOR_ID_DEACTIVATE,
				status: 'success',
				auditor
			});
		});
		//TODO: Handle error
	};
};

export function verifyAuditor(userId){
	return function(dispatch){
		dispatch({
			type: types.AUDITOR_ID_VERIFY,
			status: 'request',
			userId
		});

		return $.post( url.api_base_path + `manager/auditor/${userId}/verify`, function(auditor){
			dispatch({
				type: types.AUDITOR_ID_VERIFY,
				status: 'success',
				auditor
			});
		});
		//TODO: Handle error
	};
};

export function setEmail(userId, email){
	return function(dispatch){
		dispatch({
			type: types.AUDITOR_ID_EMAIL,
			status: 'request',
			userId,
			email,
		});

		return $.post( url.api_base_path + `manager/auditor/${userId}/email`, {email}, function(auditor){
			dispatch({
				type: types.AUDITOR_ID_EMAIL,
				status: 'success',
				userId,
				auditor,
			});
		});
		//TODO: Handle error
	};
};

export function setMobileNumber(userId, mobile_number){
	return function(dispatch){
		dispatch({
			type: types.AUDITOR_ID_MOBILE_NUMBER,
			status: 'request',
			userId,
			mobile_number,
		});

		return $.post( url.api_base_path + `manager/auditor/${userId}/mobile_number`, {mobile_number}, function(auditor){
			dispatch({
				type: types.AUDITOR_ID_MOBILE_NUMBER,
				status: 'success',
				userId,
				auditor,
			});
		});
		//TODO: Handle error
	};
};

export function sendPasswordResetEmail(userId){
	return function(dispatch){
		dispatch({
			type: types.AUDITOR_ID_SEND_PASSWORD_RESET_EMAIL,
			status: 'request',
			userId,
		});

		return $.post( url.api_base_path + `manager/auditor/${userId}/password_reset`, function(auditor){
			dispatch({
				type: types.AUDITOR_ID_SEND_PASSWORD_RESET_EMAIL,
				status: 'success',
				userId,
				auditor,
			});
		});
		//TODO: Handle error
	};
};
