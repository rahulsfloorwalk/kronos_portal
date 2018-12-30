import React from "react";
import renderer from "react-test-renderer";

import {QuestionRow} from "../AuditStoreSections";

const sampleQuestion = {
	"id":10928,
	"sequence": 1,
	"question_txt": "Visit Time in",
	"max_marks": 0,
	"section": 1617,
	"question_type": "PLAIN",
	"question_data": {}
};
const sampleAnswer = {
	"id": 120036,
	"question": 10928,
	"audit_store": 5384,
	"answer_text": "We were 4; two adults and two kids.",
	"answer_comment": "",
	"marks_obtained": 0,
	"not_applicable": false
};

const sampleAnswerWithMarks = {
	"id": 120036,
	"question": 10928,
	"audit_store": 5384,
	"answer_text": "We were 4; two adults and two kids.",
	"answer_comment": "",
	"marks_obtained": 1,
	"not_applicable": false
};

const sampleAuditStore = {
	"id": 5384,
	"status": "SUBMITTED",
	"audit_date": "2018-08-09",
	"audit": {
		"id": 4376,
		"count": 1,
		"earnings_per_audit": 0,
		"reimbursement": 5100,
		"store": {
			"id": 1095,
			"name": "Ambi, Gurgaon",
			"address": "4th Floor, Ambience Mall, Near Toll Plaza",
			"city": {
				"id": 170,
				"name": "Gurgaon",
				"state": "IN-HR",
				"lat": "28.459497",
				"lon": "77.026638",
				"gmaps_url": "http://maps.google.com/maps/place/Gurgaon/@28.459497,77.026638,12z"
			},
			"client": {
				"id": 9,
				"name": "Smaaash",
				"logo_url": "https://s3-ap-southeast-1.amazonaws.com/fw-client-logos/LOGOS/Smaaaash_logo.jpeg"
			}
		},
		"audit_cycle": {
			"id": 219,
			"name": "August 2018",
			"type": "SMAAASH",
			"status": "ACTIVE",
			"start_date": "2018-08-03",
			"end_date": "2018-08-26",
			"description": "Enjoy free gaming and Dining as part of audit process, apply only for Weekends that is Friday, Saturday and Sunday only.",
			"post_approval_description": "## Audit Guidelines:\n#### Play arena and Gaming zone-\n* Make a phone call at mentioned number before the visit and enquire about if any offers are going or not and also waiting times for Cricket or bowling. Total 3 attempts can be done by the auditor.\n* Make sure you record the phone conversation as it is a mandatory audit proof, ALSO TAKE SCREENSHOT OF CALL LOG.\n* Visit the Smaaash outlet based on your booking done on call. \n* Audit visit should be done only on weekends between 1 PM to 10:30 PM.\n* Take ample photographs of the entrance of arena with name board clearly visible.\n* Get a gaming card Recharge it for **Rs. 3300**, take a photograph of recharge receipt as well as of the Gaming card.\n* Take short video clip while doing recharge at cash counter in which staff will be clearly visible.\n* Take photographs of every game you play and experience during the visit.\n* If staff member name is not visible on name badge then clearly mention ''Name not visible'' in report.\n* Take short video clips for every game you play mainly Super keeper, Bowling, VR games, Cricket and any other video games. (Video clip should not be more than 1 min)\n* Inside photographs of different things are mandatory.\n* Take photographs of washroom interior.\n* ** Mandatory Games to play- Cricket, Super Keeper, Bowling, VR1, VR2, Laser Blast and Sky Karting (Laser blast and Sky karting is mandatory If available at assigned outlet)**\n#### Dining and Restaurant\n*  Allowed amount for reimbursement is **Rs. 1800**, if the bill exceeds the specified amount then the auditor will have to cover up the difference. \n* Order multiple dishes and take photographs of all the ordered food.\n* Take a group selfie at the restaurant as audit proof.\n* Photographs of bill and payment receipt is mandatory audit proof.\n* Take photos of interior and exterior of the restaurant as well.\n* Only one bill is allowed for Dining, auditor should refrain from ordering multiple times with different bills during the visit.\n* Alcohol strictly not allowed during audit visit, also note that alcohol charges will not be reimbursed. \n* Do not take buffet during audit, only À la carte will be considered.\n#### Sales Team Audit section- \n* Enquire for requirement Party and corporate gatherings at Smaaash and have an interaction with staff member present there, if ask for any senior person who can tell details about parties and group gatherings.\n* Also ask for visiting card of the concerned person at the outlet.\n* If Sales manager is not available at outlet during visit then meet Center head or staff member and make audio recording that sales manager is not available and make sure that you call the Manager on given number and enquire about party packages. Total 3 attempts can be done by the auditor.\n* TAKE SCREENSHOT OF CALL LOG.\n* **Call recording of conversation with Sales person is mandatory audit proof. **\n#### ONLY ONE BILL FOR GAMING (FOR RS. 3300) AND DINING (RS. 1800) WILL BE REIMBURSED, AUDITOR SHOULD NOT TAKE MULTIPLE BILLS FOR ANY OF THESE.\n**Important-** Note down names of staff members present at all games for every section, also photos needed for each section of questionnaire. Playing all the games mentioned in questionnaire is mandatory. Report will not be accepted if any data regarding any section is missing.\n* **ALSO NOTE: IF YOU FAIL TO SUBMIT THE AUDIT REPORT WITHIN NEXT DAY OF CONDUCTING YOUR AUDIT, IT WILL BE FAILED AUTOMATICALLY AND NO REIMBURSEMENT WILL BE GIVEN**",
			"client": {
				"id": 9,
				"name": "Smaaash",
				"logo_url": "https://s3-ap-southeast-1.amazonaws.com/fw-client-logos/LOGOS/Smaaaash_logo.jpeg"
			}
		},
		"post_approval_description": ""
	},
	"user": {
		"id": 5854,
		"email": "nitingureja@gmail.com",
		"mobile_numbers": [],
		"profileinfo": {
			"id": 5695,
			"first_name": "Nitin",
			"last_name": "Gureja",
			"mobile_number": "9899296001",
			"city": 168,
			"user_id": 5854
		},
		"agencyuser": null
	},
	"qa_rating": null
};
describe("<QuestionRow/>", () => {

	it("renders the question row correctly when answer has 0 marks", (done) => {
		const r = renderer.create(<QuestionRow q={sampleQuestion} key={sampleQuestion.id} answer={sampleAnswer} marking={true} auditStore={sampleAuditStore} auditStoreId={sampleAuditStore.id}/>);
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});

	it("renders the question row correctly when answer has non 0 marks", (done) => {
		const r = renderer.create(<QuestionRow q={sampleQuestion} key={sampleQuestion.id} answer={sampleAnswerWithMarks} marking={true} auditStore={sampleAuditStore} auditStoreId={sampleAuditStore.id}/>);
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});

});
