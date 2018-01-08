

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
		case "":
		case null:
		case undefined:
		default:
			return value;
	}
};

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
		case "ARCHIVED":
			return "Archived";
		case "":
		case null:
		case undefined:
			return "";
		default:
			return `unknown status type ${value} - ${typeof value}`;
	}
};

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
};

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
};

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
};

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
		case "":
		case null:
		case undefined:
			return "";
		default:
			return `unknown status type ${value} - ${typeof value}`;
	}
};

export function getAuditStoreStatus(value){
	switch(value){
		case "ASSIGNED":
			return "Assigned";
		case "FAILED":
			return "Failed";
		case "WITHDRAWN":
			return "Withdrawn";
		case "SUBMITTED":
			return "Submitted";
		case "COMPLETED":
			return "Completed";
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
};

export function getPaymentStatus(value){
	switch(value){
		case "PENDING":
			return "Pending";
		case "PAID":
			return "Paid";
		case "":
		case null:
		case undefined:
			return "";
		default:
			return `unknown status type ${value} - ${typeof value}`;
	}
};

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
};

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
		case "1":
		case 1:
			return "danger";
		case "2":
		case 2:
			return "warning";
		case "3":
		case 3:
			return "info";
		case "4":
		case 4:
			return "success";
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
};


export function getQuestionType(value){
	switch(value){
		case "PLAIN":
			return "Plain";
		case "MUTEX":
			return "Mutually Exclusive";
		case "":
		case null:
		case undefined:
		default:
			return "";
	}
};

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
};
