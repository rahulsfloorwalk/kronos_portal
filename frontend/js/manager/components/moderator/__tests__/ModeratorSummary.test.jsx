import React from "react";
import renderer from "react-test-renderer";

import { ModeratorSummary } from "../ModeratorSummary.jsx";

const sampleProps = {
	summary: {
		"1": {
			"ASSIGNED": 1,
			"COMPLETED": 4,
		},
		"2": {
			"SUBMITTED": 3,
			"PM_REVIEW": 8,
		},
	},
	moderators: [
		{
			id: 1,
			email: "sentinel@redis.com",
		},
		{
			id: 2,
			email: "warthog@pulmonary.com",
		},
	],
};

describe(ModeratorSummary, () => {
	it("renders the moderator summary and moderator emails", () => {
		const fetchModerators = jest.fn();
		const fetchModeratorSummary = jest.fn();

		const r = renderer.create(<ModeratorSummary
			fetchModerators={fetchModerators}
			fetchModeratorSummary={fetchModeratorSummary}
			{...sampleProps}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders a loading widget there is no summary", () => {
		const fetchModerators = jest.fn();
		const fetchModeratorSummary = jest.fn();

		const r = renderer.create(<ModeratorSummary
			fetchModerators={fetchModerators}
			fetchModeratorSummary={fetchModeratorSummary}
			moderators={[]}
			summary={undefined}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("renders the empty message when there are no rows", () => {
		const fetchModerators = jest.fn();
		const fetchModeratorSummary = jest.fn();

		const r = renderer.create(<ModeratorSummary
			fetchModerators={fetchModerators}
			fetchModeratorSummary={fetchModeratorSummary}
			moderators={[]}
			summary={{}}
		/>);
		expect(r.toJSON()).toMatchSnapshot();
	});

	it("calls fetchModerators prop when it is mounted", () => {
		const fetchModerators = jest.fn();
		const fetchModeratorSummary = jest.fn();

		renderer.create(<ModeratorSummary
			fetchModerators={fetchModerators}
			fetchModeratorSummary={fetchModeratorSummary}
			{...sampleProps}
		/>);
		expect(fetchModerators).toBeCalled();
	});

	it("calls fetchModeratorSummary prop when it is mounted", () => {
		const fetchModerators = jest.fn();
		const fetchModeratorSummary = jest.fn();

		renderer.create(<ModeratorSummary
			fetchModerators={fetchModerators}
			fetchModeratorSummary={fetchModeratorSummary}
			{...sampleProps}
		/>);
		expect(fetchModeratorSummary).toBeCalled();
	});
});
