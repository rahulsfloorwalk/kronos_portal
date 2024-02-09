import React from "react";
import renderer from "react-test-renderer";
import { shallow } from "enzyme";
// import { GrammarlyEditorPlugin} from "@grammarly/editor-sdk-react";
// import { ClientID } from "../../../../../constants.js";
import PlainAnswerElement from "../PlainAnswerElement.jsx";

// jest.mock("@grammarly/editor-sdk-react", () => ({
// 	GrammarlyEditorPlugin: ({ children }) => children,
// }));

describe("<PlainAnswerElement/>", () => {

	describe("when answer is editable", () => {
		const editable = true;

		it("renders a blank answer text correctly", () => {
			const props = {
				onChange: jest.fn(),
				onFocus: jest.fn(),
				onBlur: jest.fn(),
				editable,
				answerText: "",
			};
			const tree = renderer.create(<PlainAnswerElement {...props}/>);
			expect(tree).toMatchSnapshot();
		});
		it("renders a prefilled answer text correctly", () => {
			const props = {
				onChange: jest.fn(),
				onFocus: jest.fn(),
				onBlur: jest.fn(),
				editable,
				answerText: "Hello World",
			};
			const tree = renderer.create(<PlainAnswerElement {...props}/>);
			expect(tree).toMatchSnapshot();
		});
	});

	describe("when answer is not editable", () => {
		const editable = false;

		it("renders a blank answer text correctly", () => {
			const props = {
				onChange: jest.fn(),
				onFocus: jest.fn(),
				onBlur: jest.fn(),
				editable,
				answerText: "",
			};
			const tree = renderer.create(<PlainAnswerElement {...props}/>);
			expect(tree).toMatchSnapshot();
		});
		it("renders a prefilled answer text correctly", () => {
			const props = {
				onChange: jest.fn(),
				onFocus: jest.fn(),
				onBlur: jest.fn(),
				editable,
				answerText: "Hello World",
			};
			const tree = renderer.create(<PlainAnswerElement {...props}/>);
			expect(tree).toMatchSnapshot();
		});
	});

	describe("when input is focused", () => {
		it("calls onFocus prop", () => {
			const props = {
				onChange: jest.fn(),
				onFocus: jest.fn(),
				onBlur: jest.fn(),
				editable: true,
				answerText: "Hello World",
			};

			const r = shallow(<PlainAnswerElement {...props}/>);
			r.find("textarea").simulate("focus");
			expect(props.onFocus).toBeCalled();
		});
	});

	describe("when input is blurred", () => {
		it("calls onBlur prop", () => {
			const props = {
				onChange: jest.fn(),
				onFocus: jest.fn(),
				onBlur: jest.fn(),
				editable: true,
				answerText: "Hello World",
			};

			const r = shallow(<PlainAnswerElement {...props}/>);
			r.find("textarea").simulate("blur");
			expect(props.onBlur).toBeCalled();
		});
	});

	describe("when form is submitted", () => {
		it("prevents form submission and calls onBlur prop", () => {
			const props = {
				onChange: jest.fn(),
				onFocus: jest.fn(),
				onBlur: jest.fn(),
				editable: true,
				answerText: "Hello World",
			};
			const preventDefault = jest.fn();

			const r = shallow(<PlainAnswerElement {...props}/>);
			r.find("form").simulate("submit", { preventDefault });

			expect(preventDefault).toBeCalled();
			expect(props.onBlur).toBeCalled();
		});
	});

	describe("when input is changed", () => {
		it("calls onChange prop", () => {
			const props = {
				onChange: jest.fn(),
				onFocus: jest.fn(),
				onBlur: jest.fn(),
				editable: true,
				answerText: "",
			};
			const onChangeEvent = { target: { value: "Hello World" } };

			const r = shallow(<PlainAnswerElement {...props}/>);
			r.find("textarea").simulate("change", onChangeEvent);

			expect(props.onChange).toBeCalledWith(onChangeEvent);
		});
	});
});

