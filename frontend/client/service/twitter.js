import $ from 'jquery'
import { url } from '../../config.js'

export function fetchClientTwitterFeed(){
	return $.get( url.api_base_path + `client/twitter_feed`);
};

// use this to get comparison and stats data across twitter handles
export function fetchClientTwitterStats(){
	return $.get( url.api_base_path + `client/twitter_stats`);
};
