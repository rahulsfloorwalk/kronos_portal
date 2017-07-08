import $ from 'jquery'
import { url } from '../../../config'
import { hashHistory } from 'react-router';
import types from '../action_types.js';

/**
 * These are the action creators as mentioned here: http://redux.js.org/docs/basics/ExampleTodoList.html#action-creators
 * Call them with arguments (if any) to create action objects that you can pass to dispatch(...)
 */
function profileInfoGetReq(){
	return {
		type: types.PROFILE_INFO_GET,
		status: 'request',
	};
};
function profileInfoGetSuccess(profileInfo){
	return {
		type: types.PROFILE_INFO_GET,
		status: 'success',
		profileInfo: profileInfo
	};
};

function auditorStatsGetReq(){
	return {
		type: types.AUDITOR_STATS_GET,
		status: 'request',
	};
};
function auditorStatsGetSuccess(auditorStats){
	return {
		type: types.AUDITOR_STATS_GET,
		status: 'success',
		auditorStats: auditorStats
	};
};

function auditorScoreGetReq(){
	return {
		type: types.AUDITOR_SCORE_GET,
		status: 'request',
	};
};
function auditorScoreGetSuccess(auditorScore){
	return {
		type: types.AUDITOR_SCORE_GET,
		status: 'success',
		auditorScore: auditorScore
	};
};

/**
 * These are also action creators which employ redux-thunk so that we can return a function(dispatch) instead of a plain action.
 * This allows you to configure the returned function with parameters ala factories.
 */
export function fetchProfileInfo(){
	return function(dispatch){
		dispatch(profileInfoGetReq());

		return $.get( url.api_base_path + "auditor/profile_info", function(profileInfo){
			dispatch(profileInfoGetSuccess(profileInfo));
		});
		//TODO: Handle error
	};
};

export function fetchAuditorStats(){
  return function(dispatch){
		dispatch(auditorStatsGetReq());

		return $.get( url.api_base_path + "auditor/dashboard/stats", function(auditorStats){
			dispatch(auditorStatsGetSuccess(auditorStats));
		});
		//TODO: Handle error
	};
};

export function fetchAuditorScore(){
  return function(dispatch){
		dispatch(auditorScoreGetReq());

		return $.get( url.api_base_path + "auditor/dashboard/score", function(score){
			dispatch(auditorScoreGetSuccess(score));
		});
		//TODO: Handle error
	};
};
