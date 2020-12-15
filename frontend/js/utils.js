

export function getAuditType(value){
	switch(value){
	case "WALKIN":
		return "Walk In";
	case "PHONE":
		return "Phone";
	case "WEB":
		return "Web";
	case "VISIBILITY":
		return "Visibility";
	case "COMPETITION":
		return "Competition";
	case "SERVICE":
		return "Service";
	case "SALES":
		return "Sales";
	case "FINE_DINE":
		return "Fine Dine";
	case "SKY_KARTING":
		return "Sky Karting";
	case "SMAAASH_ARENA":
		return "Smaaash Arena";
	case "GENERAL":
		return "General";
	case "SMAAASH":
		return "Smaaash";
	case "SMAAASH_MEGA":
		return "Smaaash Mega";
	case "SMAAASH_ZONE":
		return "Smaaash Zone";
	case "DDC":
		return "Ddc";
	case "HTC":
		return "Htc";
	case "ASCVD":
		return "Ascvd";
	case "SKIN_HYDRATION":
		return "Skin Hydration";
	case "HYPER_PIGMENTATION":
		return "Hyper Pigmentation";
	case "SKIN_SENSITIVE":
		return "Skin Sensitive";
	case "RETAIL":
		return "Retail";
	case "":
	case null:
	case undefined:
	default:
		return value;
	}
}

export function getAuditStatus(value){
	switch(value){
	case "PREPARATION":
		return "Preparation";
	case "UPCOMING":
		return "Upcoming";
	case "ACTIVE":
		return "Active";
	case "REPORT":
		return "Report";
	case "CLEARING":
		return "Clearing";
	case "ARCHIVED":
		return "Archived";
	case "":
	case null:
	case undefined:
		return "";
	default:
		return `unknown status type ${value} - ${typeof value}`;
	}
}

export function getGender(value){
	switch(value){
	case "M":
		return "male";
	case "F":
		return "female";
	case "":
	case null:
	case undefined:
		return "";
	default:
		return `unknown gender ${value} - ${typeof value}`;
	}
}

export function getEducationStatus(value){
	switch(value){
	case "TE":
		return "10th (Middle School)";
	case "TW":
		return "12th (High School)";
	case "CO":
		return "In College";
	case "GR":
		return "Graduate";
	case "PG":
		return "Post Graduate and Above";
	case "":
	case null:
	case undefined:
		return "";
	default:
		return `unknown education status ${value} - ${typeof value}`;
	}
}

export function getMaritalStatus(value){
	switch(value){
	case "S":
		return "Single";
	case "M":
		return "Married";
	case "D":
		return "Divorced";
	case "W":
		return "Widowed";
	case "":
	case null:
	case undefined:
		return "";
	default:
		return `unknown marital status ${value} - ${typeof value}`;
	}
}

export function getAuditApplicationStatus(value){
	switch(value){
	case "APPLIED":
		return "Pending for Approval";
	case "NOT_APPLIED":
		return "Not Applied";
	case "WAITLISTED":
		return "Wait Listed";
	case "APPROVED":
		return "Approved";
	case "REJECTED":
		return "Denied";
	case "WITHDRAWN":
		return "Withdrawn";
	case "":
	case null:
	case undefined:
		return "";
	default:
		return `unknown status type ${value} - ${typeof value}`;
	}
}

export function getAuditStoreStatus(value){
	switch(value){
	case "ASSIGNED":
		return "Assigned";
	case "ACKNOWLEDGED":
		return "In Progress";
	case "FAILED":
		return "Failed";
	case "WITHDRAWN":
		return "Withdrawn";
	case "AUDITOR_WITHDRAWN":
		return "Auditor Withdrawn";
	case "SUBMITTED":
		return "QA Review";
	case "PM_REVIEW":
		return "PM Review";
	case "COMPLETED":
		return "Client Review";
	case "ACCEPTED":
		return "Accepted";
	case "REJECTED":
		return "Rejected";
	case "":
	case null:
	case undefined:
		return "";
	default:
		return `unknown status type ${value} - ${typeof value}`;
	}
}

export function getPaymentStatus(value){
	switch(value){
	case "PENDING":
		return "Pending";
	case "FAILED":
		return "Failed";
	case "PAID":
		return "Paid";
	case "":
	case null:
	case undefined:
		return "";
	default:
		return `unknown status type ${value} - ${typeof value}`;
	}
}

export function getHairColor(value){
	switch(value){
	case "1":
	case 1:
		return "Black";
	case "2":
	case 2:
		return "Blonde";
	case "3":
	case 3:
		return "Brown";
	case "4":
	case 4:
		return "Red";
	case "5":
	case 5:
		return "Grey";
	case "6":
	case 6:
		return "White";
	case "7":
	case 7:
		return "Bald";
	case "8":
	case 8:
		return "Other";
	case "":
	case null:
	case undefined:
		return "";
	default:
		return `unknown hair color type ${value} - ${typeof value}`;
	}
}

export function getCameraResolution(value){
	switch(value){
	case "1":
	case 1:
		return "1 to 5 Megapixel";
	case "2":
	case 2:
		return "5 to 10 Megapixel";
	case "3":
	case 3:
		return "10 to 15 Megapixel";
	case "4":
	case 4:
		return "15+ Megapixel";
	case "5":
	case 5:
		return "Dont Know";
	case "6":
	case 6:
		return "No Camera";
	case "":
	case null:
	case undefined:
		return "";
	default:
		return `unknown camera resolution ${value} - ${typeof value}`;
	}
}

export function getColor(value){
	switch(value){
	case "0":
	case 0:
		return "rating-na";
	case "1":
	case 1:
		return "rating-bad";
	case "2":
	case 2:
		return "rating-poor";
	case "3":
	case 3:
		return "rating-average";
	case "4":
	case 4:
		return "rating-good";
	case "5":
	case 5:
		return "rating-excellent";
	case "":
	case null:
	case undefined:
		return "";
	default:
		return "";
	}
}

export function getRatingText(colorCode){
	switch(colorCode){
	case "1":
	case 1:
		return "Bad";
	case "2":
	case 2:
		return "Poor";
	case "3":
	case 3:
		return "Average";
	case "4":
	case 4:
		return "Good";
	case "5":
	case 5:
		return "Excellent";
	case "":
	case null:
	case undefined:
		return "";
	default:
		return "";
	}
}

export function getOccupation(value){
	switch(value){
	case "STUDENT":
		return "Student";
	case "SERVICE":
		return "Service";
	case "SELF_EMPLOYED":
		return "Self Employed";
	case "BUSINESS":
		return "Business";
	case "UNEMPLOYED":
		return "Unemployed";
	case "RETIRED":
		return "Retired";
	case "":
	case null:
	case undefined:
		return "";
	default:
		return `unknown occupation ${value} - ${typeof value}`;
	}
}


export function getQuestionType(value){
	switch(value){
	case "PLAIN":
		return "Plain";
	case "MUTEX":
		return "Mutually Exclusive";
	case "MULTISELECT":
		return "Multiple Select";
	case "":
	case null:
	case undefined:
	default:
		return "";
	}
}

export function getReferralType(value){
	switch(value){
	case "SIGNUP":
		return "Signup";
	case "AUDIT":
		return "Audit";
	case "PAID":
		return "Paid";
	case "":
	case null:
	case undefined:
		return "";
	default:
		return `unknown referral type ${value} - ${typeof value}`;
	}
}


export function getColorbyValue(value){
	if (value >= 90){
		return "#688833"; // Green
	}
	else if (value >=85){
		return "#4ca9d7"; // Blue
	}
	else if (value >= 75){
		// return "#808080"; // Grey
		return "#dbb001"; //Yellow
	}
	else if (value >= 66){
		return "#FF7F50"; // Orange
	}
	else{
		return "#CD5C5C"; // Red
	}
}

export function getColorForActionPlanStatus(value){
	if(value == "Pending"){
		return "#CD5C5C";
	}
	else{
		return "#688833";
	}
}
