

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
	case "T":
		return "trans person";
	case "N":
		return "non-binary";
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


export function getIncomeText(income){
	switch(income){
	case "0":
	case 0:
		return "Not answered";
	case "1":
	case 1:
		return "Less than 1 LPA";
	case "2":
	case 2:
		return "1 to 3 LPA";
	case "3":
	case 3:
		return "3 to 8 LPA";
	case "4":
	case 4:
		return "8 to 15 LPA";
	case "5":
	case 5:
		return "15+ LPA";
	case "":
	case null:
	case undefined:
		return "";
	default:
		return "";
	}
}

export function getCarCost(cost){
	switch(cost){
	case "1":
	case 1:
		return "Less than 3 lacs";
	case "2":
	case 2:
		return "3 lacs – 5 lacs";
	case "3":
	case 3:
		return "5 lacs – 10 lacs";
	case "4":
	case 4:
		return "10 lacs – 15 lacs";
	case "5":
	case 5:
		return "15 lacs and above";
	case "":
	case null:
	case undefined:
		return "";
	default:
		return "";
	}
}

export function getIndustry(industry){
	switch(industry){
	case "1":
	case 1:
		return "Advertising and Marketing";
	case "2":
	case 2:
		return "Agriculture";
	case "3":
	case 3:
		return "Arts";
	case "4":
	case 4:
		return "Architecture";
	case "5":
	case 5:
		return "Advisory";
	case "6":
	case 6:
		return "Accounting";
	case "7":
	case 7:
		return "Aviation";
	case "8":
	case 8:
		return "Apprael";
	case "9":
	case 9:
		return "Automotive";
	case "10":
	case 10:
		return "Banking";
	case "11":
	case 11:
		return "Biotechnology";
	case "12":
	case 12:
		return "Civil Engineering";
	case "13":
	case 13:
		return "Civic-Social organization";
	case "14":
	case 14:
		return "Consumer Goods and Services";
	case "15":
	case 15:
		return "Cosmetics";
	case "16":
	case 16:
		return "Entertainment";
	case "17":
	case 17:
		return "Event Management";
	case "18":
	case 18:
		return "Financial Services";
	case "19":
	case 19:
		return "Food and Beverage";
	case "20":
	case 20:
		return "Graphic Designing";
	case "21":
	case 21:
		return "Health and Fitnes";
	case "22":
	case 22:
		return "Hospitality";
	case "23":
	case 23:
		return "Import-Export Industry";
	case "24":
	case 24:
		return "Information Technology";
	case "25":
	case 25:
		return "Insurance";
	case "26":
	case 26:
		return "Luxury Goods";
	case "27":
	case 27:
		return "Management Consulting";
	case "28":
	case 28:
		return "Market Research";
	case "29":
	case 29:
		return "Medical";
	case "30":
	case 30:
		return "Music";
	case "31":
	case 31:
		return "Not for Profit";
	case "32":
	case 32:
		return "Oil and Energy";
	case "33":
	case 33:
		return "Pharmaceuticals";
	case "34":
	case 34:
		return "Photography";
	case "35":
	case 35:
		return "Real-Estate";
	case "36":
	case 36:
		return "Retail Industry";
	case "37":
	case 37:
		return "Sales";
	case "38":
	case 38:
		return "Sports";
	case "39":
	case 39:
		return "Supply Chain and Logistics";
	case "40":
	case 40:
		return "Telecommunications";
	case "41":
	case 41:
		return "Transportation";
	case "42":
	case 42:
		return "Veterinary";
	case "43":
	case 43:
		return "Other";
	case null:
	case undefined:
		return "";
	default:
		return "";
	}
}


export function getMonthName(value){
	switch(value){
	case "1":
	case "01":
	case 1:
		return "January";
	case "2":
	case "02":
	case 2:
		return "February";
	case "3":
	case "03":
	case 3:
		return "March";
	case "4":
	case "04":
	case 4:
		return "April";
	case "5":
	case "05":
	case 5:
		return "May";
	case "6":
	case "06":
	case 6:
		return "June";
	case "7":
	case "07":
	case 7:
		return "July";
	case "8":
	case "08":
	case 8:
		return "August";
	case "9":
	case "09":
	case 9:
		return "September";
	case "10":
	case 10:
		return "October";
	case "11":
	case 11:
		return "November";
	case "12":
	case 12:
		return "December";
	case "":
	case null:
	case undefined:
		return "";
	default:
		return "Unknown month";
	}
}

export function getInterestArea(value){
	switch(value){
	case "ADVERTISING":
		return "Advertising";
	case "AGRICULTURE":
		return "Agriculture";
	case "ARCHITECTURE":
		return "Architecture";
	case "AVIATION":
		return "Aviation";
	case "BANKING":
		return "Banking";
	case "BUSINESS":
		return "Business";
	case "REAL_ESTATE":
		return "Real Estate";
	case "DESIGN":
		return "Design";
	case "SCIENCE":
		return "Science";
	case "HEALTH_CARE":
		return "Health Care";
	case "HIGHER_EDUCATION":
		return "Higher Education";
	case "FINANCE":
		return "Finance";
	case "RETAIL":
		return "Retail";
	case "GAMES":
		return "Games";
	case "MUSIC":
		return "Music";
	case "READING":
		return "Reading";
	case "FITNESS":
		return "Fitness";
	case "FOOD_AND_DRINK":
		return "Food And Drink";
	case "ARTS_AND_MUSIC":
		return "Arts and Music";
	case "TRAVEL":
		return "Travel";
	case "VEHICLES":
		return "Vehicles";
	case "BEAUTY":
		return "Beauty";
	case "FASHION_AND_ACCESSORIES":
		return "Fashion and Accessories";
	case "SPORTS":
		return "Sports";
	case "TECHNOLOGY":
		return "Technology";
	case "OTHERS":
		return "Others";
	case "":
	case null:
	case undefined:
		return "";
	default:
		return `unknown marital status ${value} - ${typeof value}`;
	}
}