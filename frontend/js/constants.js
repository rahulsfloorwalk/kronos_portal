export const MinimumPayableAmount = 5000;

export const PaymentGSTAmount = 18;

export const ClientID="client_WpuFqThfMu4rQ4hTvbnDww";

export const ApplicationStatus = [
	"APPLIED",
	"NOT_APPLIED",
	"WAITLISTED",
	"APPROVED",
	"REJECTED",
	"WITHDRAWN",
];

export const AuditStoreStatus = [
	"ASSIGNED",
	"ACKNOWLEDGED",
	"SUBMITTED",
	"PM_REVIEW",
	"COMPLETED",
	"ACCEPTED",
	"FAILED",
	"REJECTED",
	"WITHDRAWN",
	"AUDITOR_WITHDRAWN",
];

export const QuestionType = [
	"PLAIN",
	"MUTEX",
	"MULTISELECT"
];

export const PaymentStatus = [
	"PENDING",
	"PAID",
	"FAILED",
];

export const AttachmentProofType = [
	"AUDIO",
	"PHOTO",
	"VIDEO",
	"OTHER",
	"ID_PROOF",
];

export const AuditStoreRatings = [
	0,
	1,
	2,
	null,
];

export const AuditorRatings = [
	5,
	4,
	3,
	2,
	1,
	null,
];

export const AuditType = [
	"WALKIN",
	"PHONE",
	"WEB",
	"VISIBILITY",
	"COMPETITION",
	"SERVICE",
	"SALES",
	"FINE_DINE",
	"SKY_KARTING",
	"SMAAASH_ARENA",
	"GENERAL",
	"SMAAASH",
	"SMAAASH_MEGA",
	"SMAAASH_ZONE",
	"DDC",
	"HTC",
	"ASCVD",
	"SKIN_HYDRATION",
	"HYPER_PIGMENTATION",
	"SKIN_SENSITIVE",
	"RETAIL",
];


export const IndicatorScoreColorsList = [
	"#CD5C5C", //Red
	"#CD5C5C", //Red
	"#FF7F50", // Orange
	"#FF7F50", // Orange
	"#dbb001", //Yellow
	"#4ca9d7", // Blue
	"#3da940", // Green
	"#3da940", // Green
];


export const InterestAreaList = [
	"ADVERTISING",
	"AGRICULTURE",
	"ARCHITECTURE",
	"AVIATION",
	"BANKING",
	"BUSINESS",
	"REAL_ESTATE",
	"DESIGN",
	"SCIENCE",
	"HEALTH_CARE",
	"HIGHER_EDUCATION",
	"FINANCE",
	"RETAIL",
	"GAMES",
	"MUSIC",
	"READING",
	"FITNESS",
	"FOOD_AND_DRINK",
	"ARTS_AND_MUSIC",
	"TRAVEL",
	"VEHICLES",
	"BEAUTY",
	"FASHION_AND_ACCESSORIES",
	"SPORTS",
	"TECHNOLOGY",
	"OTHERS",
];

export const IndustryList = [
	"Advertising and Marketing",
	"Agriculture",
	"Arts",
	"Architecture",
	"Advisory",
	"Accounting",
	"Aviation",
	"Apprael",
	"Automotive",
	"Banking",
	"Biotechnology",
	"Civil Engineering",
	"Civic-Social organization",
	"Consumer Goods and Services",
	"Cosmetics",
	"Entertainment",
	"Event Management",
	"Financial Services",
	"Food and Beverage",
	"Graphic Designing",
	"Health and Fitnes",
	"Hospitality",
	"Import-Export Industry",
	"Information Technology",
	"Insurance",
	"Luxury Goods",
	"Management Consulting",
	"Market Research",
	"Medical",
	"Music",
	"Not for Profit",
	"Oil and Energy",
	"Pharmaceuticals",
	"Photography",
	"Real-Estate",
	"Retail Industry",
	"Sales",
	"Sports",
	"Supply Chain and Logistics",
	"Telecommunications",
	"Transportation",
	"Veterinary",
	"Other",
];

export const OccupationList = [
	"STUDENT",
	"SERVICE",
	"SELF_EMPLOYED",
	"BUSINESS",
	"UNEMPLOYED",
	"RETIRED",
];

export const EducationList = [
	"TE",
	"TW",
	"CO",
	"GR",
	"PG",
];

export const GenderList = [
	"M",
	"F",
	"T",
	"N",
];

export const IncomeList = [
	"0",
	"1",
	"2",
	"3",
	"4",
	"5"
];

export const CarCostList = [
	"1",
	"2",
	"3",
	"4",
	"5"
];

export const AuditorAgeList=[
	"1",
	"2",
	"3",
	"4",
	"5",
	"6"
];
export const MaritalStatusList = [
	"S",
	"M",
	"D",
	"W"
];

export const ReportRatingList = [
	"0",
	"1",
	"2",
];

export const auditCategoryList = [
	"CONSUMER_EXPERIENCE_JOURNEY",
	"SALES_PROCESS",
	"VISUAL_MERCHANDISE",
	"COMPETITION",
	"PROCESS_COMPLIANCE",
	"RETAIL_RECOMMENDATION",
	"INVENTORY_AUDIT",
];

export const clientRequirementQuestionaryList = [
	"WEB",
	"TELEPHONIC",
	"VISIT",
];

export const languagesKnownList = [
	"English",
	"Hindi",
	"Marathi",
	"Konkani",
	"Gujarati",
	"Punjabi",
	"Tamil",
	"Telugu",
	"Kannad",
	"Bangla",
	"Maithili",
	"Nepali",
	"Oriya",
	"Sindhu",
	"Urdu",
	"Santali",
	"Manipuri",
	"Malayalam",
	"Kashmiri",
	"Dogri",
	"Assamese",
	"Sanskrit",
	"Bodo"
];

export const allTypeofQuiz = [
	{
		heading: "Comprehension Skill Test:",
		extraInfo: "Rita went to a clothing store to buy a dress for her mom. As Rita entered the store, she was immediately greeted by a staff associate, Mona who also asked about her requirements and showed Rita different ranges of clothes and briefly detailed the store’s current offer: buy 2 and get 55% off.Rita continued looking for various options then after finalizing a dress she asked Mona if the alteration could be done in the store itself to which Mona replied, “Yes, alteration could be done which may take 2 working days but once it is done we will not accept returns or exchanges of the dress”. Rita agreed to the same and decided to buy the blue dress. When Rita started heading towards the billing counter, Mona reminded her of the offer: buy 2 and get 55% off; however, Rita declined that offer.The total purchase amount was Rs. 1500. Rita was given different payment options: UPI, Net Banking, Credit Card, and Cash payment. Rita chose to make payment through cash and passed a bill of Rs. 2000. Mona paid her the change of Rs. 500 back and greeted her with a thank you note.",
		extraInfoSubheading: "Read the passage carefully and answer the following questions:",
		questionNumber: "Q1",
		question: "What offer was made to Rita?",
		options: [
			{ answerText: "Buy 2 get 40% off", isCorrect: false, serialNumber: "A" },
			{ answerText: "Buy 2 get 1 free", isCorrect: false, serialNumber: "B" },
			{ answerText: "Buy 2 get 55% off", isCorrect: true, serialNumber: "C" },
			{ answerText: "Buy 2 get 50% off ", isCorrect: false, serialNumber: "D" },
		],
		marks: 5,
	},
	{
		heading: "Comprehension Skill Test:",
		extraInfo: "Rita went to a clothing store to buy a dress for her mom. As Rita entered the store, she was immediately greeted by a staff associate, Mona who also asked about her requirements and showed Rita different ranges of clothes and briefly detailed the store’s current offer: buy 2 and get 55% off.Rita continued looking for various options then after finalizing a dress she asked Mona if the alteration could be done in the store itself to which Mona replied, “Yes, alteration could be done which may take 2 working days but once it is done we will not accept returns or exchanges of the dress”. Rita agreed to the same and decided to buy the blue dress. When Rita started heading towards the billing counter, Mona reminded her of the offer: buy 2 and get 55% off; however, Rita declined that offer.The total purchase amount was Rs. 1500. Rita was given different payment options: UPI, Net Banking, Credit Card, and Cash payment. Rita chose to make payment through cash and passed a bill of Rs. 2000. Mona paid her the change of Rs. 500 back and greeted her with a thank you note.",
		extraInfoSubheading: "Read the passage carefully and answer the following questions:",
		questionNumber: "Q2",
		question: "Can Rita exchange or return the dress?",
		options: [
			{ answerText: "Yes", isCorrect: false, serialNumber: "A" },
			{ answerText: "Exchange or return was not possible to post alteration", isCorrect: true, serialNumber: "B" },
			{ answerText: "Exchange or return was possible even post alteration", isCorrect: false, serialNumber: "C" },
			{ answerText: "No", isCorrect: false, serialNumber: "D" },
		],
		marks: 5,
	},
	{
		heading: "Comprehension Skill Test:",
		extraInfo: "Rita went to a clothing store to buy a dress for her mom. As Rita entered the store, she was immediately greeted by a staff associate, Mona who also asked about her requirements and showed Rita different ranges of clothes and briefly detailed the store’s current offer: buy 2 and get 55% off.Rita continued looking for various options then after finalizing a dress she asked Mona if the alteration could be done in the store itself to which Mona replied, “Yes, alteration could be done which may take 2 working days but once it is done we will not accept returns or exchanges of the dress”. Rita agreed to the same and decided to buy the blue dress. When Rita started heading towards the billing counter, Mona reminded her of the offer: buy 2 and get 55% off; however, Rita declined that offer.The total purchase amount was Rs. 1500. Rita was given different payment options: UPI, Net Banking, Credit Card, and Cash payment. Rita chose to make payment through cash and passed a bill of Rs. 2000. Mona paid her the change of Rs. 500 back and greeted her with a thank you note.",
		extraInfoSubheading: "Read the passage carefully and answer the following questions:",
		questionNumber: "Q3",
		question: "Did the staff associate greet Rita?",
		options: [
			{ answerText: "Yes but only at the time of entry", isCorrect: false, serialNumber: "A" },
			{ answerText: "Yes but only at the time of exit ", isCorrect: false, serialNumber: "B" },
			{ answerText: "No greetings were received at all", isCorrect: false, serialNumber: "C" },
			{ answerText: "Greeted while entry and exit both", isCorrect: true, serialNumber: "D" },
		],
		marks: 5,
	},
	{
		heading: "Comprehension Skill Test:",
		extraInfo: "Rita went to a clothing store to buy a dress for her mom. As Rita entered the store, she was immediately greeted by a staff associate, Mona who also asked about her requirements and showed Rita different ranges of clothes and briefly detailed the store’s current offer: buy 2 and get 55% off.Rita continued looking for various options then after finalizing a dress she asked Mona if the alteration could be done in the store itself to which Mona replied, “Yes, alteration could be done which may take 2 working days but once it is done we will not accept returns or exchanges of the dress”. Rita agreed to the same and decided to buy the blue dress. When Rita started heading towards the billing counter, Mona reminded her of the offer: buy 2 and get 55% off; however, Rita declined that offer.The total purchase amount was Rs. 1500. Rita was given different payment options: UPI, Net Banking, Credit Card, and Cash payment. Rita chose to make payment through cash and passed a bill of Rs. 2000. Mona paid her the change of Rs. 500 back and greeted her with a thank you note.",
		extraInfoSubheading: "Read the passage carefully and answer the following questions:",
		questionNumber: "Q4",
		question: "Which colored dress did Rita buy?",
		options: [
			{ answerText: "Green", isCorrect: false, serialNumber: "A" },
			{ answerText: "Pink", isCorrect: false, serialNumber: "B" },
			{ answerText: "Yellow", isCorrect: false, serialNumber: "C" },
			{ answerText: "Blue", isCorrect: true, serialNumber: "D" },
		],
		marks: 5,
	},
	{
		heading: "Comprehension Skill Test:",
		extraInfo: "Rita went to a clothing store to buy a dress for her mom. As Rita entered the store, she was immediately greeted by a staff associate, Mona who also asked about her requirements and showed Rita different ranges of clothes and briefly detailed the store’s current offer: buy 2 and get 55% off.Rita continued looking for various options then after finalizing a dress she asked Mona if the alteration could be done in the store itself to which Mona replied, “Yes, alteration could be done which may take 2 working days but once it is done we will not accept returns or exchanges of the dress”. Rita agreed to the same and decided to buy the blue dress. When Rita started heading towards the billing counter, Mona reminded her of the offer: buy 2 and get 55% off; however, Rita declined that offer.The total purchase amount was Rs. 1500. Rita was given different payment options: UPI, Net Banking, Credit Card, and Cash payment. Rita chose to make payment through cash and passed a bill of Rs. 2000. Mona paid her the change of Rs. 500 back and greeted her with a thank you note.",
		extraInfoSubheading: "Read the passage carefully and answer the following questions:",
		questionNumber: "Q5",
		question: "How much rupee note did Rita give? ",
		options: [
			{ answerText: "1000", isCorrect: false, serialNumber: "A" },
			{ answerText: "1500", isCorrect: false, serialNumber: "B" },
			{ answerText: "2000", isCorrect: true, serialNumber: "C" },
			{ answerText: "2500", isCorrect: false, serialNumber: "D" },
		],
		marks: 5,
	},
	{
		heading: "Visual Observation Skill Test:",
		imgUrl: "https://floorwalk-attachments.s3.ap-south-1.amazonaws.com/cartification/Pizza+shop.png",
		extraInfoSubheading: "Look at the picture carefully and answer the following questions:",
		questionNumber: "Q1",
		question: "Which place picture is showcasing?",
		options: [
			{ answerText: "Bakery", isCorrect: false, serialNumber: "A" },
			{ answerText: "Subway", isCorrect: false, serialNumber: "B" },
			{ answerText: "Pizza Kitchen", isCorrect: true, serialNumber: "C" },
			{ answerText: "Coffee Shop", isCorrect: false, serialNumber: "D" },
		],
		marks: 5,
	},
	{
		heading: "Visual Observation Skill Test:",
		imgUrl: "https://floorwalk-attachments.s3.ap-south-1.amazonaws.com/cartification/Pizza+shop.png",
		extraInfoSubheading: "Look at the picture carefully and answer the following questions:",
		questionNumber: "Q2",
		question: " Were the staff wearing face masks?",
		options: [
			{ answerText: "Yes, all of them", isCorrect: false, serialNumber: "A" },
			{ answerText: "Yes, some of them", isCorrect: true, serialNumber: "B" },
			{ answerText: "No one wore a mask", isCorrect: false, serialNumber: "C" },
		],
		marks: 5,
	},
	{
		heading: "Listening Skill Test:",
		audioUrl: "https://floorwalk-attachments.s3.ap-south-1.amazonaws.com/cartification/alexa-The_Great_Wall_of_Ch+(1).wav",
		extraInfoSubheading: "Listen to the above audio carefully and answer the following questions:",
		questionNumber: "Q1",
		question: "How old is the wall?",
		options: [
			{ answerText: "3000 years", isCorrect: false, serialNumber: "A" },
			{ answerText: "4000 years", isCorrect: false, serialNumber: "B" },
			{ answerText: "1000 years ", isCorrect: false, serialNumber: "C" },
			{ answerText: "2000 years ", isCorrect: true, serialNumber: "D" },
		],
		marks: 5,
	},
	{
		heading: "Listening Skill Test:",
		audioUrl: "https://floorwalk-attachments.s3.ap-south-1.amazonaws.com/cartification/alexa-The_Great_Wall_of_Ch+(1).wav",
		extraInfoSubheading: "Listen to the above audio carefully and answer the following questions:",
		questionNumber: "Q2",
		question: " When did the construction of the wall start?",
		options: [
			{ answerText: "8th century BC", isCorrect: false, serialNumber: "A" },
			{ answerText: "6th century BC", isCorrect: false, serialNumber: "B" },
			{ answerText: "7th century BC", isCorrect: true, serialNumber: "C" },
			{ answerText: "9th century BC", isCorrect: false, serialNumber: "D" },
		],
		marks: 5,
	},
	{
		heading: "Listening Skill Test:",
		audioUrl: "https://floorwalk-attachments.s3.ap-south-1.amazonaws.com/cartification/alexa-The_Great_Wall_of_Ch+(1).wav",
		extraInfoSubheading: "Listen to the above audio carefully and answer the following questions:",
		questionNumber: "Q3",
		question: "The Great Wall of China is a symbol of?",
		options: [
			{ answerText: "Chinese population", isCorrect: false, serialNumber: "A" },
			{ answerText: "Chinese History and Culture", isCorrect: true, serialNumber: "B" },
			{ answerText: "Peace", isCorrect: false, serialNumber: "C" },
			{ answerText: "Unity", isCorrect: false, serialNumber: "D" },
		],
		marks: 5,
	},
	{
		heading: "Listening Skill Test:",
		audioUrl: "https://floorwalk-attachments.s3.ap-south-1.amazonaws.com/cartification/alexa-The_Great_Wall_of_Ch+(1).wav",
		extraInfoSubheading: "Listen to the above audio carefully and answer the following questions:",
		questionNumber: "Q4",
		question: "How long is the wall?",
		options: [
			{ answerText: "More than 13000 miles", isCorrect: true, serialNumber: "A" },
			{ answerText: "More than 14000 miles", isCorrect: false, serialNumber: "B" },
			{ answerText: "More than 15000 miles", isCorrect: false, serialNumber: "C" },
			{ answerText: "More than 17000 miles", isCorrect: false, serialNumber: "D" },
		],
		marks: 5,
	},
	{
		heading: "English Grammer Knowledge:",
		questionNumber: "Q1",
		question: "For the underlined part of the sentence choose the grammatically correct option.",
		instruction:"The President of India, along with vice presidents,",
		underline: "are elected for a five-year term by the people." ,
		options: [
			{ answerText: "are elected for a five-year term by the people", isCorrect: false, serialNumber: "A" },
			{ answerText: "is elected for a five-year term by the people", isCorrect: true, serialNumber: "B" },
			{ answerText: "are elected, by the people, for a five-year term", isCorrect: false, serialNumber: "C" },
			{ answerText: "is elected for five-year terms by the people", isCorrect: false, serialNumber: "D" },
		],
		marks: 5,
	},
	{
		heading: "English Grammer Knowledge:",
		questionNumber: "Q2",
		question: "Earth, our home, is the third planet from the sun. It’s the only _________ known to have an atmosphere containing free oxygen, oceans of water on its surface and, of course, life. The fifth-largest planet in the Solar system is the Earth. It is smaller ________ the four gas giants - Jupiter, Saturn, Uranus, and Neptune - but larger than the three other rocky planets, Mercury, Mars, and Venus. ",
		instruction:"Read the above paragraph and select the suitable option from below to fill in the blanks:" ,
		options: [
			{ answerText: "1. Surface, 2. Of", isCorrect: false, serialNumber: "A" },
			{ answerText: "1. Planet, 2. Of ", isCorrect: true, serialNumber: "B" },
			{ answerText: "1. Planet, 2. Than", isCorrect: false, serialNumber: "C" },
			{ answerText: "1. Surface, 2. On", isCorrect: false, serialNumber: "D" },
		],
		marks: 5,
	},
	{
		heading: "English Grammer Knowledge:",
		questionNumber: "Q3",
		question: "Which of the following sentence is grammatically correct?",
		options: [
			{ answerText: "I had see the horse that run away.", isCorrect: false, serialNumber: "A" },
			{ answerText: "The train has already left when we reached the station.", isCorrect: false, serialNumber: "B" },
			{ answerText: "He ought to be told what has happened.", isCorrect: true, serialNumber: "C" },
			{ answerText: "Where theres a will theres a way.", isCorrect: false, serialNumber: "D" },
		],
		marks: 5,
	},
	{
		heading: "Problem-solving Ability Test:",
		questionNumber: "Q1",
		questionBold: "The Audit opportunities will be visible on the auditor portal also you will receive notifications regarding the available audits,",
		question: "how will you apply for the audit?",
		options: [
			{ answerText: "I will not apply for the audits as I don’t need any audits and payments", isCorrect: false, serialNumber: "A" },
			{ answerText: "I randomly apply for all the available audits without reading the audit details", isCorrect: false, serialNumber: "B" },
			{ answerText: "I will apply for all the available audits but post receiving the audit, I will never perform any audit", isCorrect: false, serialNumber: "C" },
			{ answerText: "I want to perform the audit so I will read the audit details of every available audit and if it is suitable for me only then I will apply for the audit", isCorrect: true, serialNumber: "D" },
		],
		marks: 5,
	},
	{
		heading: "Problem-solving Ability Test:",
		questionNumber: "Q2",
		questionBold: " All the audits will be assigned via the system so no oral audit guidelines will be given,",
		question: "how will you make yourself ready for the audit?",
		options: [
			{ answerText: "Since all the audits will be assigned through the system, I will never apply and earn through audits", isCorrect: false, serialNumber: "A" },
			{ answerText: "I will not read the guidelines and cancel the audit to lose the opportunity to earn via the audit", isCorrect: false, serialNumber: "B" },
			{ answerText: "I will wait for oral guidelines and only after getting oral guidelines, I will perform the audit", isCorrect: false, serialNumber: "C" },
			{ answerText: "I will read and understand audit guidelines properly before performing the audit", isCorrect: true, serialNumber: "D" },
		],
		marks: 5,
	},
	{
		heading: "Problem-solving Ability Test:",
		questionNumber: "Q3",
		questionBold: "It is mandatory to perform the assigned audit on the given date only as it shows your commitment towards your work,",
		question: "what if you are not available to perform the audit on the assigned date?",
		options: [
			{ answerText: "Since I am not available on the day of the audit, I will not perform the audit", isCorrect: false, serialNumber: "A" },
			{ answerText: "I will ignore the Project Team if they will contact me to perform the audit", isCorrect: false, serialNumber: "B" },
			{ answerText: "As it will affect chances for future audits, I will immediately inform the Project Team about my unavailability for the audit and will check for a date extension if possible for them", isCorrect: true, serialNumber: "C" },
			{ answerText: "I will ask my friend to perform the audit and completely guide him/her to get it done properly on the same date only", isCorrect: true, serialNumber: "D" },
		],
		marks: 5,
	},
	{
		heading: "Problem-solving Ability Test:",
		questionNumber: "Q4",
		questionBold: "Post audit completion, it is mandatory to submit all the inquired questions and asked audit proofs,",
		question: " what would you do if you could not gather any of the mandatory proofs?",
		options: [
			{ answerText: "I will not inform the Project Team about missing proofs and try to submit the audit report ", isCorrect: false, serialNumber: "A" },
			{ answerText: "I will not take any effort to submit my audit report", isCorrect: false, serialNumber: "B" },
			{ answerText: "I will inform the Project Team and check if the audit report can be accepted", isCorrect: true, serialNumber: "C" },
			{ answerText: "I will check with the Project Team if I can perform the audit again to collect all the mandatory proofs", isCorrect: true, serialNumber: "D" },
		],
		marks: 5,
	},
	{
		heading: "Problem-solving Ability Test:",
		questionNumber: "Q5",
		questionBold: " The audit report fails in case of non-submission of it within 2 days post-audit completion.",
		question: "In this case, when do you prefer to submit your audit report?",
		options: [
			{ answerText: "I don’t want audit fees so I will not submit the audit report", isCorrect: false, serialNumber: "A" },
			{ answerText: "I am okay if I am not able to showcase my sincerity to the Project Team as I don’t want future audits so I will fill the report only when they will contact me", isCorrect: false, serialNumber: "B" },
			{ answerText: "I will keep relaxing and on the day of audit failure, will try to submit the report", isCorrect: false, serialNumber: "C" },
			{ answerText: "I will submit the report on the same day of the audit as I will have all the details available with me also it will showcase my sincerity to the Project Team", isCorrect: true, serialNumber: "D" },
		],
		marks: 5,
	},
	{
		heading: "Problem-solving Ability Test:",
		questionNumber: "Q6",
		questionBold: "The Quality Analyst (QA) Team rate the audit report based on which the auditor gets future audits. The Team gets in touch with the auditor in case of any further information is needed regarding the submitted audit report.",
		question: "In your audit, how will you cooperate with the QA team?",
		options: [
			{ answerText: "Post submission of my audit report, I will forget about my audit", isCorrect: false, serialNumber: "A" },
			{ answerText: "Even if the QA Team contacts me, I will not cooperate because I don’t need future audits", isCorrect: false, serialNumber: "B" },
			{ answerText: "If the QA Team contacts me, I will ask them for a Good rating but not help them", isCorrect: false, serialNumber: "C" },
			{ answerText: "Whenever the QA Team will contact me, I will help them with whatever audit information they will need", isCorrect: true, serialNumber: "D" },
		],
		marks: 5,
	},
];

export const dataaccordian = [
	{
		heading : "Customers",
		subheading : [
			{name:"Active Customer",link:"/admindashboard/activecustomer"},
		],
		id : 1,
	},
	{
		heading : "Master",
		subheading : [
			{name:"Category",link:"/admindashboard/category"},
			{name: "Tax",link:"/admindashboard/tax"},
		],
		id : 2,
	},
	{
		heading : "Solutions",
		subheading : [
			{name:"All Solutions",link:"/admindashboard/solution"},{name:"Archived Solutions",link:"/admindashboard/archivedsolution"}
		],
		id : 3,
	},
	{
		heading : "Orders",
		subheading : [
			{name:"All Orders",link:"/admindashboard/allorder"},{name: "Active Orders",link:"/admindashboard/activeorder"},{name:"Draft Orders",link:"/admindashboard/draftorder"},{name:"Complete Orders",link:"/admindashboard/completeorder"}
		],
		id : 4,
	}
];