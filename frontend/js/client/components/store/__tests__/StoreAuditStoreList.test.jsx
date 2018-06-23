import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";
import $ from "jquery";

import StoreAuditStoreList from "../StoreAuditStoreList";

import { fetchAuditStoresByStore } from "../../../service/audit_store.js";

jest.mock("../../../service/audit_store.js");

const sampleParams = {
	storeId: "1098",
};

const sampleAuditStores = [
	{
		"id": 2082,
		"audit_date": "2018-02-11",
		"audit": {
			"id": 1330,
			"store": {
				"id": 1098,
				"code": null,
				"type": "Arena",
				"priority": "",
				"name": "Bangalore Marketcity",
				"address": "2nd Floor, Phoenix Marketcity, Mahadevpura, Whitefield Main Rd, Devasandra, Industrial estate, Krishnarajapura",
				"city": {
					"id": 641,
					"name": "Bangalore",
					"state": "IN-KA"
				},
				"client": {
					"id": 9,
					"name": "Smaaash",
					"email": "saurabh.sawhney@smaaash.in",
					"phone": "",
					"logo_url": "https://s3-ap-southeast-1.amazonaws.com/fw-client-logos/LOGOS/Smaaaash_logo.jpeg"
				}
			},
			"audit_cycle": {
				"id": 96,
				"name": "Arena February 2018",
				"type": "WALKIN",
				"start_date": "2018-02-09",
				"end_date": "2018-02-25",
				"client": {
					"id": 9,
					"name": "Smaaash",
					"email": "saurabh.sawhney@smaaash.in",
					"phone": "",
					"logo_url": "https://s3-ap-southeast-1.amazonaws.com/fw-client-logos/LOGOS/Smaaaash_logo.jpeg"
				},
				"questionnaire_type": {
					"id": 58,
					"name": "Walkin",
					"is_default": false,
					"client_id": 9
				}
			}
		},
		"color": 4,
		"percentage": 81
	},
	{
		"id": 2568,
		"audit_date": "2018-03-17",
		"audit": {
			"id": 1505,
			"store": {
				"id": 1098,
				"code": null,
				"type": "Arena",
				"priority": "",
				"name": "Bangalore Marketcity",
				"address": "2nd Floor, Phoenix Marketcity, Mahadevpura, Whitefield Main Rd, Devasandra, Industrial estate, Krishnarajapura",
				"city": {
					"id": 641,
					"name": "Bangalore",
					"state": "IN-KA"
				},
				"client": {
					"id": 9,
					"name": "Smaaash",
					"email": "saurabh.sawhney@smaaash.in",
					"phone": "",
					"logo_url": "https://s3-ap-southeast-1.amazonaws.com/fw-client-logos/LOGOS/Smaaaash_logo.jpeg"
				}
			},
			"audit_cycle": {
				"id": 114,
				"name": "Arena March 2018",
				"type": "WALKIN",
				"start_date": "2018-03-09",
				"end_date": "2018-03-25",
				"client": {
					"id": 9,
					"name": "Smaaash",
					"email": "saurabh.sawhney@smaaash.in",
					"phone": "",
					"logo_url": "https://s3-ap-southeast-1.amazonaws.com/fw-client-logos/LOGOS/Smaaaash_logo.jpeg"
				},
				"questionnaire_type": {
					"id": 58,
					"name": "Walkin",
					"is_default": false,
					"client_id": 9
				}
			}
		},
		"color": 3,
		"percentage": 72
	},
];

describe("<StoreAuditStoreList/>", () => {

	beforeEach(() => {
		fetchAuditStoresByStore.mockReturnValue($.Deferred().resolve(sampleAuditStores).promise());
	});

	it("makes the correct ajax calls", () => {
		shallow(<StoreAuditStoreList params={sampleParams}/>);
		expect(fetchAuditStoresByStore).toBeCalledWith(sampleParams.storeId);
	});

	it("renders the table correctly", (done) => {
		const r = renderer.create(<StoreAuditStoreList params={sampleParams}/>);
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});
});

