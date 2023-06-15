import React from "react";
import renderer from "react-test-renderer";
import { shallow } from "enzyme";
import { GrammarlyEditorPlugin} from "@grammarly/editor-sdk-react";
import { ClientID } from "../../../../constants.js";
import { __AuditorComment } from "../AuditorComment.jsx";
jest.mock("@grammarly/editor-sdk-react", () => ({
	GrammarlyEditorPlugin: ({ children }) => children,
}));

describe("<__AuditorComment/>", () => {
	describe("when auditor comment is editable", () => {
		const editable = true;

		it("renders a comment correctly", () => {
			const tree = renderer.create(<GrammarlyEditorPlugin clientId={ClientID}><__AuditorComment auditorComment="Hello World" onCommentChanged={jest.fn()} editable={editable}/></GrammarlyEditorPlugin>).toJSON();
			expect(tree).toMatchSnapshot();
		});

		it("calls onCommentChanged when input is blurred and has changed", () => {
			const onCommentChanged = jest.fn();
			const sampleComment = "Hello World";
			const r = shallow(<__AuditorComment auditorComment="" onCommentChanged={onCommentChanged} editable={editable}/>);
			r.find("input").simulate("change", { target: { value: sampleComment}});
			r.find("input").simulate("blur");
			expect(onCommentChanged).toHaveBeenCalledWith(sampleComment);
		});

		it("does not call onCommentChanged when input is blurred and has not changed", () => {
			const onCommentChanged = jest.fn();
			const sampleComment = "Hello World";
			const r = shallow(<__AuditorComment auditorComment={sampleComment} onCommentChanged={onCommentChanged} editable={editable}/>);
			r.find("input").simulate("change", { target: { value: sampleComment}});
			r.find("input").simulate("blur");
			expect(onCommentChanged).not.toHaveBeenCalled();
		});
	});

	describe("when auditor comment is not editable", () => {
		const editable = false;

		it("renders a comment correctly", () => {
			const tree = renderer.create(<__AuditorComment auditorComment="Hello World" onCommentChanged={jest.fn()} editable={editable}/>).toJSON();
			expect(tree).toMatchSnapshot();
		});
	});

});
