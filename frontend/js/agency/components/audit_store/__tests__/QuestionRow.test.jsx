import React from "react";
import ShallowRenderer from "react-test-renderer/shallow";

import { __QuestionRow } from "../QuestionRow.jsx";

describe("<__QuestionRow/>", () => {
	const renderer = new ShallowRenderer();
	const auditStoreId = 1;

	const sampleQuestion = {
		id: 1,
		sequence: 1,
		question_txt: "How are you feeling today?",
		question_type: "PLAIN",
		question_data: {},
		hide_question: false,
	};

	const possibleStates = [
		[true, ""],
		[true, "Hello World"],
		[false, ""],
		[false, "Hello World"],
	];

	test.each(possibleStates)("when showErrors is %s and answerText is '%s':", (showErrors, answerText) => {
		const tree = renderer.render(<__QuestionRow question={sampleQuestion} showErrors={showErrors} answerText={answerText} auditStoreId={auditStoreId}/>);
		expect(tree).toMatchSnapshot();
	});
});
