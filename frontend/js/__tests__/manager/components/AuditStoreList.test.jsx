import React from "react";
import PropTypes from "prop-types";
import { Provider } from "react-redux";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";
import configureStore from "redux-mock-store";
import ReduxThunk from "redux-thunk";

import { AuditStoreList } from "../../../manager/components/AuditStoreList";
import types from "../../../manager/action_types";

const middlewares = [ReduxThunk];
const mockStore = configureStore(middlewares);

describe("<AuditStoreList/>", () => {
	const sampleParams = {
		auditCycleId: "5",
	};
	const sampleClient = {
		id: 6,
		name: "Client Name",
	};
	const sampleStore = {
		subscribe: jest.fn(),
		dispatch: jest.fn(),
		getState: jest.fn().mockImplementation(() => {
			return {
				auditStores: {
					[sampleAuditStore.id]: sampleAuditStore,
				},
			};
		}),
	};

	const sampleAuditStores = [];


	it("sets the filtered status correctly", () => {
		const selectedStatus = "PM_REVIEW";
		const r = shallow(<AuditStoreList params={sampleParams} dispatch={jest.fn()}/>);
		const select = r.find("select").at(1);
		select.simulate("change", {
			target: {
				value: selectedStatus,
			},
		});
		expect(r.state().selectedStatus).toEqual(selectedStatus);
	});
});

