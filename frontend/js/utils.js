

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
			return `unknown audit type ${value} - ${typeof value}`;
	}
};
