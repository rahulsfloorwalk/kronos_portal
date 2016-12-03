

export function getAuditType(value){
	switch(value){
		case "1":
		case 1:
			return "Walk In";
		case "2":
		case 2:
			return "Phone";
		case "3":
		case 3:
			return "Web";
		case "4":
		case 4:
			return "Visibility";
		case "5":
		case 5:
			return "Competition";
		case "":
		case null:
			return "";
		default:
			return `unknown audit type ${value} - ${typeof value}`;
	}
};

export function getAuditStatus(value){
	switch(value){
		case "1":
		case 1:
			return "Upcoming";
		case "2":
		case 2:
			return "Active";
		case "3":
		case 3:
			return "Archived";
		case "":
		case null:
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
			return "";
		default:
			return `unknown marital status ${value} - ${typeof value}`;
	}
};

export function getAuditApplicationStatus(value){
	switch(value){
		case "APPLIED":
			return "Applied";
		case "NOT_APPLIED":
			return "Not Applied";
		case "ASSIGNED":
			return "Assigned";
		case "REJECTED":
			return "Rejected";
		case "COMPLETED":
			return "Completed";
		case "FAILED":
			return "Failed";
		case "":
		case null:
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
			return "";
		default:
			return `unknown camera resolution ${value} - ${typeof value}`;
	}
}

