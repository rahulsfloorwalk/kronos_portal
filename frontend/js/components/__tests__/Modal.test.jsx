import React from "react";
import renderer from "react-test-renderer";

import Modal from "../Modal.jsx";

describe("<Modal/>", () => {
	const sampleModalTitle = "Slartibartfast!";
	const sampleContent = <div>
		<h1>Chimichangas!</h1>
		<p>Ay, Caramba!</p>
	</div>;

	it("renders content within a Modal", () => {
		const tree = renderer
			.create(<Modal modalTitle={sampleModalTitle}>
				{sampleContent}
			</Modal>)
			.toJSON();
		expect(tree).toMatchSnapshot();
	});
});
