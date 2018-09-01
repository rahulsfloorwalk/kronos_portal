import React from "react";
import renderer from "react-test-renderer";

import MarkdownViewer from "../MarkdownViewer.jsx";

describe("<MarkdownViewer/>", () => {
	const sampleMarkdown = `
# The Fountainhead

## Roark

> I could die for you. But I **couldn't**, and **wouldn't**, live for you.

> But I don't think of you.

## Toohey

> One loses everything when one loses one's sense of humor.

## Dominique

> To ask nothing. To expect nothing. To depend on nothing.

	`;

	it("renders a loading widget when the Markdown module is loading", () => {
		const r = renderer.create(<MarkdownViewer markdown={sampleMarkdown}/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders sample transformed markdown content", (done) => {
		const r = renderer.create(<MarkdownViewer markdown={sampleMarkdown}/>);
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});

	it("renders a blank when markdown is not given", (done) => {
		const r = renderer.create(<MarkdownViewer markdown=""/>);
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});
});
