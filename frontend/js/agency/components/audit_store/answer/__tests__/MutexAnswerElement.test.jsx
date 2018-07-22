import React from "react";
import ShallowRenderer from "react-test-renderer/shallow";

import { shallow } from "enzyme";

import MutexAnswerElement from "../MutexAnswerElement.jsx";
import AnswerComment from "../AnswerComment.jsx";

describe("<MutexAnswerElement/>", () => {
	const renderer = new ShallowRenderer();

	const options = [
		{
			sequence: 1,
			value: "Yes",
		},
		{
			sequence: 2,
			value: "No",
		},
	];

	const auditStoreId = 1;
	const questionId = 1;

	it("renders AnswerComment with correct IDs", () => {
		const props = {
			auditStoreId,
			questionId,

			onChange: jest.fn(),
			onFocus: jest.fn(),
			onBlur: jest.fn(),
			editable: true,
			answerText: "",

			options,
		};
		const r = shallow(<MutexAnswerElement {...props}/>);
		expect(r.find(AnswerComment).prop("auditStoreId")).toEqual(auditStoreId);
		expect(r.find(AnswerComment).prop("questionId")).toEqual(questionId);
	});

	describe("when answer is editable", () => {
		const editable = true;

		it("renders no selection correctly", () => {
			const props = {
				auditStoreId,
				questionId,

				onChange: jest.fn(),
				onFocus: jest.fn(),
				onBlur: jest.fn(),

				editable,
				answerText: "",

				options,
			};
			const tree = renderer.render(<MutexAnswerElement {...props}/>);
			expect(tree).toMatchSnapshot();
		});
		it("renders a selected option correctly", () => {
			const props = {
				auditStoreId,
				questionId,

				onChange: jest.fn(),
				onFocus: jest.fn(),
				onBlur: jest.fn(),
				editable,
				answerText: options[0].value,

				options,
			};
			const tree = renderer.render(<MutexAnswerElement {...props}/>);
			expect(tree).toMatchSnapshot();
		});
	});

	describe("when answer is not editable", () => {
		const editable = false;

		it("renders no selection correctly", () => {
			const props = {
				auditStoreId,
				questionId,

				onChange: jest.fn(),
				onFocus: jest.fn(),
				onBlur: jest.fn(),
				editable,
				answerText: "",

				options,
			};
			const tree = renderer.render(<MutexAnswerElement {...props}/>);
			expect(tree).toMatchSnapshot();
		});
		it("renders a selected option correctly", () => {
			const props = {
				auditStoreId,
				questionId,

				onChange: jest.fn(),
				onFocus: jest.fn(),
				onBlur: jest.fn(),
				editable,
				answerText: options[0].value,

				options,
			};
			const tree = renderer.render(<MutexAnswerElement {...props}/>);
			expect(tree).toMatchSnapshot();
		});
	});

	describe("when input is focused", () => {
		it("calls onFocus prop", () => {
			const props = {
				auditStoreId,
				questionId,

				onChange: jest.fn(),
				onFocus: jest.fn(),
				onBlur: jest.fn(),
				editable: true,
				answerText: "",

				options,
			};

			const r = shallow(<MutexAnswerElement {...props}/>);
			r.find("select").simulate("focus");
			expect(props.onFocus).toBeCalled();
		});
	});

	describe("when input is blurred", () => {
		it("calls onBlur prop", () => {
			const props = {
				auditStoreId,
				questionId,

				onChange: jest.fn(),
				onFocus: jest.fn(),
				onBlur: jest.fn(),
				editable: true,
				answerText: "",

				options,
			};

			const r = shallow(<MutexAnswerElement {...props}/>);
			r.find("select").simulate("blur");
			expect(props.onBlur).toBeCalled();
		});
	});

	describe("when input is changed", () => {
		it("calls onChange prop", () => {
			const props = {
				auditStoreId,
				questionId,

				onChange: jest.fn(),
				onFocus: jest.fn(),
				onBlur: jest.fn(),
				editable: true,
				answerText: "",

				options,
			};

			const onChangeEvent = { target: { value: options[0].value } };

			const r = shallow(<MutexAnswerElement {...props}/>);
			r.find("select").simulate("change", onChangeEvent);
			expect(props.onChange).toBeCalledWith(onChangeEvent);
		});
	});
});

