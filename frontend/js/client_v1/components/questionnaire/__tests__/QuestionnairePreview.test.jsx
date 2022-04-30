import React from "react";
import renderer from "react-test-renderer";

import QuestionnairePreview from "../QuestionnairePreview.jsx";


describe(QuestionnairePreview, () => {

	const sampleQuestionnaire = {"id": 1, "sample_questionnaire_type": 1, "questionnaire_data":{"questionnaire":[{"id":1,"name":"Entrance","sequence":1,"max_marks":5,"questions":[{"id":1,"sequence":1,"max_marks":5,"question_txt":"Please Rate Overall Experience. (1 to 5)","question_data":{"options":[{"marks":1,"value":"1","sequence":1},{"marks":2,"value":"2","sequence":2},{"marks":3,"value":"3","sequence":3},{"marks":4,"value":"4","sequence":4},{"marks":5,"value":"5","sequence":5}],"version":1},"question_type":"MUTEX"},{"id":2,"sequence":2,"max_marks":0,"question_txt":"Enter name https://www.google.com","question_type":"PLAIN"}]},{"id":2,"name":"Need Analysis","sequence":2,"max_marks":3,"questions":[{"id":1,"sequence":1,"max_marks":1,"question_txt":"Did the staff greet you upon arrival?","question_data":{"options":[{"marks":1,"value":"Yes","sequence":1},{"marks":0,"value":"No","sequence":2}],"version":1},"question_type":"MULTISELECT"},{"id":2,"sequence":2,"max_marks":1,"question_txt":"Did the staff enquire about your purpose of visit?","question_data":{"options":[{"marks":1,"value":"Yes","sequence":1},{"marks":0,"value":"No","sequence":2}],"version":1},"question_type":"MUTEX"}]},{"id":3,"name":"Staff Analysis","sequence":3,"max_marks":1,"questions":[{"id":1,"sequence":1,"max_marks":1,"question_txt":"Did the staff member address you by saying 'Sir' or 'Madam'?","question_data":{"options":[{"marks":1,"value":"Yes","sequence":1},{"marks":0,"value":"No","sequence":2}],"version":1},"question_type":"MUTEX"}]},{"id":4,"name":"Selling and Recommendation skills","sequence":4,"max_marks":1,"questions":[{"id":1,"sequence":1,"max_marks":1,"question_txt":"Did the staff ask for your budget before starting to show products?","question_data":{"options":[{"marks":1,"value":"Yes","sequence":1},{"marks":0,"value":"No","sequence":2}],"version":1},"question_type":"MUTEX"}]},{"id":5,"name":"Outlet analysis","sequence":5,"max_marks":1,"questions":[{"id":1,"sequence":1,"max_marks":1,"question_txt":"Was the outlet neat and clean?","question_data":{"options":[{"marks":1,"value":"Yes","sequence":1},{"marks":0,"value":"No","sequence":2}],"version":1},"question_type":"MUTEX"}]}]}};

	it("renders an sample questionnaire preview", () => {
		const auditCycleId = "1";
		const r = renderer.create(<QuestionnairePreview auditCycleId={auditCycleId} sampleQuestionnaire={sampleQuestionnaire} />);
		expect(r.toJSON()).toMatchSnapshot();
	});
});