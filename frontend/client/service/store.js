import $ from 'jquery'
import { url } from '../../config.js'

export function fetchStores(){
	return $.get( url.api_base_path + `client/store`);
};

export function fetchStore(storeId){
	return $.get( url.api_base_path + `client/store/${storeId}`);
};
