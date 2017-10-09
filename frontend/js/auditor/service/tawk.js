import { _fetchProfileInfo } from '../actions/profile_info.js';
import { _fetchUser } from '../actions/user.js';

export const initializeTawk = function(global, tawkSrc){
	//Start of Tawk.to Script
	global.Tawk_API=global.Tawk_API||{}, global.Tawk_LoadStart=new Date();
	Promise.all([_fetchUser(), _fetchProfileInfo()]).then(function([user, profileInfo]){

		global.Tawk_API.visitor = {
			name: `${profileInfo.first_name || "FIRST"} ${profileInfo.last_name || "LAST"}`,
			email: user.email,
		};

		let s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
		s1.async=true;
		s1.src=tawkSrc;
		s1.charset='UTF-8';
		s1.setAttribute('crossorigin','*');
		s0.parentNode.insertBefore(s1,s0);
	});

	//End of Tawk.to Script
};
