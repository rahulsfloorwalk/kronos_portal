import React from "react";
import renderer from "react-test-renderer";

import AttachmentInProgressThumbnail from "../AttachmentInProgressThumbnail.jsx";

describe("<AttachmentInProgressThumbnail/>", () => {
	const sampleProps = {
		error: false,
		fileName: "sample_file.jpg",
		progress: 54,
		uploadMessage: undefined,
	};

	test("when upload is initializing", () => {
		const props = Object.assign({}, sampleProps, {
			progress: undefined,
			uploadMessage: "initializing",
		});
		const tree = renderer.create(<AttachmentInProgressThumbnail {...props} />).toJSON();
		expect(tree).toMatchSnapshot();
	});

	test("when upload is in progress and there is no fileName", () => {
		const props = Object.assign({}, sampleProps, {
			fileName: undefined,
		});
		const tree = renderer.create(<AttachmentInProgressThumbnail {...props} />).toJSON();
		expect(tree).toMatchSnapshot();
	});

	test("when upload is in progress", () => {
		const tree = renderer.create(<AttachmentInProgressThumbnail {...sampleProps} />).toJSON();
		expect(tree).toMatchSnapshot();
	});

	test("when upload has an error", () => {
		const props = Object.assign({}, sampleProps, {
			error: true,
			progress: undefined,
			uploadMessage: "there was an error",
		});
		const tree = renderer.create(<AttachmentInProgressThumbnail {...props} />).toJSON();
		expect(tree).toMatchSnapshot();
	});
});
