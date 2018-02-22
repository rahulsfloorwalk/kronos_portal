import axios from "axios";

export function login(username, password){
	return axios.post("/auth/agency/login",{
		username,
		password
	});
}

export function logout(){
	return axios.post("/auth/agency/logout");
}


export function signup(username, password1, password2,){
	return axios.post("/auth/agency/signup",{
		username,
		password1,
		password2,
	});
}
