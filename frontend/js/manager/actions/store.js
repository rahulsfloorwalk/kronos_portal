import $ from "jquery";
import { url } from "../../../config.js";
import types from "../action_types.js";
import Alert from "react-s-alert";
export function fetchStores(clientId){
	return function(dispatch){
		dispatch({
			type: types.STORE_GET,
			status: "request",
			clientId: clientId
		});

		return $.get( url.api_base_path + `manager/client/${clientId}/store`, function(stores){
			dispatch({
				type: types.STORE_GET,
				status: "success",
				stores: stores
			});
		});
		//TODO: Handle error
	};
}

export function fetchStore(storeId){
	return function(dispatch){
		dispatch({
			type: types.STORE_ID_GET,
			status: "request",
			storeId: storeId
		});

		return $.get( url.api_base_path + `manager/store/${storeId}`, function(store){
			dispatch({
				type: types.STORE_ID_GET,
				status: "success",
				store: store
			});
		});
		//TODO: Handle error
	};
}

export function deleteStore(storeId){
	return function(dispatch){
		dispatch({
			type: types.STORE_ID_DELETE,
			status: "request",
			storeId,
		});
		let req = $.ajax({
			url: url.api_base_path + `manager/store/${storeId}`,
			type: "DELETE"
		});
		req.done(function(){
			Alert.success("STORE DELETED");
			dispatch({
				type: types.STORE_ID_DELETE,
				status: "success",
				storeId,
			});
		});
		req.fail(function(){
			Alert.warning("STORE CANNOT BE DELETED");
			dispatch({
				type: types.STORE_ID_DELETE,
				status: "error",
				storeId,
			});
		});
		return req;
	};
}

export function loadStoreAddForm(){
	return function(dispatch){
		dispatch({
			type: types.STORE_FORM_LOAD,
			status: "success"
		});
	};
}

export function loadStoreEditForm(storeId){
	return function(dispatch){
		dispatch({
			type: types.STORE_FORM_LOAD,
			status: "request",
			storeId: storeId
		});
		return dispatch(fetchStore(storeId));
	};
}

export function saveStoreAddForm(store){
	return function(dispatch){
		dispatch({
			type: types.STORE_FORM_SUB,
			status: "request",
			store: store

		});
		dispatch({
			type: types.STORE_POST,
			status: "request",
			store: store
		});

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + "manager/store",
			data: JSON.stringify(store),
			contentType: "application/json"
		});
		req.done(function(savedStore){
			dispatch({
				type: types.STORE_POST,
				status: "success",
				store: savedStore
			});
			dispatch({
				type: types.STORE_FORM_SUB,
				status: "success",
			});
		});
		req.fail(function(error){
			dispatch({
				type: types.STORE_POST,
				status: "error",
				errors: error.responseJSON
			});
			dispatch({
				type: types.STORE_FORM_SUB,
				status: "error",
			});
		});
		return req;
	};
}

export function saveStoreEditForm(store){
	return function(dispatch){
		dispatch({
			type: types.STORE_FORM_SUB,
			status: "request"
		});
		dispatch({
			type: types.STORE_ID_POST,
			status: "request",
			store: store
		});

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + `manager/store/${store.id}`,
			data: JSON.stringify(store),
			contentType: "application/json"
		});
		req.done(function(savedStore){
			dispatch({
				type: types.STORE_ID_POST,
				status: "success",
				store: savedStore
			});
			dispatch({
				type: types.STORE_FORM_SUB,
				status: "success"
			});
		});
		req.fail(function(error){
			dispatch({
				type: types.STORE_ID_POST,
				status: "error",
				errors: error.responseJSON
			});
			dispatch({
				type: types.STORE_FORM_SUB,
				status: "error",
			});
		});
		return req;
	};
}

export function updateStore(store){
	return function(dispatch){
		dispatch({
			type: types.STORE_UPDATED,
			status: "success",
			store
		});
	};
}
