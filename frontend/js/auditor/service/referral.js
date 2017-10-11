import $ from 'jquery'
import { url } from '../../../config.js'

export function findReferrals(){
	return $.get( url.api_base_path + `auditor/referral`);
};
