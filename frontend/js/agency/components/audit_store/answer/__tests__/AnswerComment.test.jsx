import React from "react";
import renderer from "react-test-renderer";
import { shallow } from "enzyme";
// import { GrammarlyEditorPlugin} from "@grammarly/editor-sdk-react";
// import { ClientID } from "../../../../../constants.js";
import { __AnswerComment } from "../AnswerComment.jsx";

// jest.mock("@grammarly/editor-sdk-react", () => ({
// 	GrammarlyEditorPlugin: ({ children }) => children,
// }));

describe("<__AnswerComment/>", () => {

	describe("when answer comment is editable", () => {
		it("renders a blank answer comment correctly", () => {
			const tree = renderer.create(<__AnswerComment answerComment="" editable={true} onChange={() => {}}/>).toJSON();
			expect(tree).toMatchSnapshot();
		});
		it("renders a prefilled answer comment correctly", () => {
			const tree = renderer.create(<__AnswerComment answerComment="hello world" editable={true} onChange={() => {}}/>).toJSON();
			expect(tree).toMatchSnapshot();
		});
	});

	describe("when answer comment is not editable", () => {
		it("renders a blank answer comment correctly", () => {
			const tree = renderer.create(<__AnswerComment answerComment="" onChange={() => {}}/>).toJSON();
			expect(tree).toMatchSnapshot();
		});
		it("renders a prefilled answer comment correctly", () => {
			const tree = renderer.create(<__AnswerComment answerComment="hello world" onChange={() => {}}/>).toJSON();
			expect(tree).toMatchSnapshot();
		});
	});

	describe("when input loses focus", () => {
		it("calls onChange when answer comment has changed", () => {
			const onChange = jest.fn();
			const value = "Hello World";
			const r = shallow(<__AnswerComment answerComment="" editable={true} onChange={onChange}/>);
			r.find("input").simulate("change", { target: { value } });
			r.find("input").simulate("blur", { target: { value } });
			expect(onChange).toBeCalledWith(value);
		});

		it("does not call onChange if answer comment is unchanged", () => {
			const onChange = jest.fn();
			const value = "Hello World";
			const r = shallow(<__AnswerComment answerComment={value} editable={true} onChange={onChange}/>);
			r.find("input").simulate("blur", { target: { value } });
			expect(onChange).not.toHaveBeenCalled();
		});
	});
});

