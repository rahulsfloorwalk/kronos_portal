import $ from "jquery";

export default class FBGraph {
	constructor(accessToken){
		this._accessToken = accessToken;
	}

	me(fields){
		return $.get("https://graph.facebook.com/v2.10/me", {
			fields: fields,
			access_token: this._accessToken,
			debug: "all",
			format: "json",
			method: "get",
			pretty: 0,
			suppress_http_code: 1,
		});
	}
}

