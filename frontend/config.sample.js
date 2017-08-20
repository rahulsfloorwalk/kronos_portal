/**
 * define configuration options here
 */

var url = {
	protocol : 'http',
	hostname : 'localhost',
	port : '8000',
	api_base_path: "/"
};

var momentDateFormat = "Do MMM YYYY";
var momentDateTimeFormat = "HH:mm Do MMM YYYY";

const auditorGAId = "UA-XXXXXXX-X";

const demo = true;

const facebook_client_id = "122450261725178"

const facebook_fields = "id,name,first_name,last_name,gender,age_range,email,picture,likes,friends,location,birthday,link,verified";
const facebook_scope = "email,public_profile,user_friends,user_likes,user_location,user_birthday";

export { url, momentDateFormat, auditorGAId, momentDateTimeFormat, demo, facebook_client_id, facebook_scope, facebook_fields };
