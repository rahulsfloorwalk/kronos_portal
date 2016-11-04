

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
		default:
			return `unknown status type ${value} - ${typeof value}`;
	}
};
