import $ from 'jquery'
import { url } from '../../../config.js'

export function fetchAuditorPreferences(userId){
	return $.get( url.api_base_path + `manager/auditor/${userId}/preferences`);
};

