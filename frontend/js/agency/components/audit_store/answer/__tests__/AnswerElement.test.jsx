import React from "react";

import { shallow } from "enzyme";

import { __AnswerElement } from "../AnswerElement.jsx";
import PlainAnswerElement from "../PlainAnswerElement.jsx";
import MutexAnswerElement from "../MutexAnswerElement.jsx";

describe("<__AnswerElement/>", () => {
	const auditStoreId = 1;

	describe("for both question types", () => {

		const sampleQuestion = {
			id: 1,
			sequence: 1,
			question_txt: "How are you feeling today?",
			question_type: "PLAIN",
			question_data: {},
		};

		it("sets the answerText prop for the inner element when it calls onChange", () => {
			const props = {
				auditStoreId,
				question: sampleQuestion,

				setAnswerText: jest.fn(),
				onFocus: jest.fn(),
				onBlur: jest.fn(),

				editable: true,
				answerText: "",
			};
			const r = shallow(<__AnswerElement {...props}/>);
			r.find(PlainAnswerElement).simulate("change", { target: { value: "Hello World" }});
			expect(r.find(PlainAnswerElement).prop("answerText")).toEqual("Hello World");
		});

		it("calls setAnswerText when the inner element is blurred", () => {
			const props = {
				auditStoreId,
				question: sampleQuestion,

				setAnswerText: jest.fn(),
				onFocus: jest.fn(),
				onBlur: jest.fn(),

				editable: true,
				answerText: "",
			};
			const r = shallow(<__AnswerElement {...props}/>);
			r.find(PlainAnswerElement).simulate("change", { target: { value: "Hello World" }});
			r.find(PlainAnswerElement).simulate("blur", { target: { value: "Hello World" }});
			expect(props.setAnswerText).toHaveBeenCalledWith("Hello World", true);
		});

		it("calls onFocus when the inner element is focused", () => {
			const props = {
				auditStoreId,
				question: sampleQuestion,

				setAnswerText: jest.fn(),
				onFocus: jest.fn(),
				onBlur: jest.fn(),

				editable: true,
				answerText: "",
			};
			const r = shallow(<__AnswerElement {...props}/>);
			r.find(PlainAnswerElement).simulate("focus");
			expect(props.onFocus).toHaveBeenCalled();
		});

		it("calls onBlur when the inner element is blurred", () => {
			const props = {
				auditStoreId,
				question: sampleQuestion,

				setAnswerText: jest.fn(),
				onFocus: jest.fn(),
				onBlur: jest.fn(),

				editable: true,
				answerText: "",
			};
			const r = shallow(<__AnswerElement {...props}/>);
			r.find(PlainAnswerElement).simulate("blur");
			expect(props.onBlur).toHaveBeenCalled();
		});
	});

	describe("when the question type is plain", () => {

		const sampleQuestion = {
			id: 1,
			sequence: 1,
			question_txt: "How are you feeling today?",
			question_type: "PLAIN",
			question_data: {},
		};

		it("renders a Plain Answer Element", () => {
			const props = {
				auditStoreId,
				question: sampleQuestion,

				setAnswerText: jest.fn(),
				onFocus: jest.fn(),
				onBlur: jest.fn(),

				editable: true,
				answerText: "",
			};
			const r = shallow(<__AnswerElement {...props}/>);
			expect(r.find(PlainAnswerElement)).toHaveLength(1);
		});

	});

	describe("when the question type is mutex", () => {

		const sampleQuestion = {
			id: 1,
			sequence: 1,
			question_txt: "How are you feeling today?",
			question_type: "MUTEX",
			question_data: {
				version: 1,
				options: [
					{
						sequence: 1,
						value: "Yes",
					},
					{
						sequence: 2,
						value: "No",
					},
				],
			},
		};

		it("renders a Mutex Answer Element", () => {
			const props = {
				auditStoreId,
				question: sampleQuestion,

				onChange: jest.fn(),
				onFocus: jest.fn(),
				onBlur: jest.fn(),

				editable: true,
				answerText: "",
				setAnswerText: jest.fn(),
			};
			const r = shallow(<__AnswerElement {...props}/>);
			expect(r.find(MutexAnswerElement)).toHaveLength(1);
		});
	});
});

