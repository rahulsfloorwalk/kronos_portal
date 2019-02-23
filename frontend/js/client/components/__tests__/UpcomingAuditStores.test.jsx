import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";
import $ from "jquery";

import UpcomingAuditStores from "../UpcomingAuditStores.jsx";
import { fetchUpcomingAuditStores } from "../../service/audit_store.js";
jest.mock("../../service/audit_store.js");

const sampleUpcomingAuditStores = [
	{
		"id": 4361,
		"audit_date": "2018-06-23",
		"audit": {
			"id": 2778,
			"store": {
				"id": 97,
				"code": null,
				"type": "Fine Dine",
				"priority": "",
				"name": "Verbena- BrewPub and SkyGarden",
				"address": "4th Floor, Trade View Building, Beside Smaaash, Kamala Mills Compound",
				"city": {
					"id": 3,
					"name": "Mumbai",
					"state": "IN-MH"
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
				"id": 181,
				"name": "June 2018",
				"type": "FINE_DINE",
				"start_date": "2018-06-08",
				"end_date": "2018-06-24",
				"client": {
					"id": 9,
					"name": "Smaaash",
					"email": "saurabh.sawhney@smaaash.in",
					"phone": "",
					"logo_url": "https://s3-ap-southeast-1.amazonaws.com/fw-client-logos/LOGOS/Smaaaash_logo.jpeg"
				}
			}
		},
		"color": 1,
		"percentage": 0
	},
	{
		"id": 4348,
		"audit_date": "2018-06-23",
		"audit": {
			"id": 2768,
			"store": {
				"id": 94,
				"code": null,
				"type": "Arena",
				"priority": "",
				"name": "Hyderabad Inorbit Mall",
				"address": "5th Floor, Inorbit Mall",
				"city": {
					"id": 9,
					"name": "Hyderabad",
					"state": "IN-TG"
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
				"id": 177,
				"name": "June 2018",
				"type": "SMAAASH",
				"start_date": "2018-06-08",
				"end_date": "2018-06-24",
				"client": {
					"id": 9,
					"name": "Smaaash",
					"email": "saurabh.sawhney@smaaash.in",
					"phone": "",
					"logo_url": "https://s3-ap-southeast-1.amazonaws.com/fw-client-logos/LOGOS/Smaaaash_logo.jpeg"
				}
			}
		},
		"color": 1,
		"percentage": 0
	},
	{
		"id": 3958,
		"audit_date": "2018-06-23",
		"audit": {
			"id": 2786,
			"store": {
				"id": 2144,
				"code": null,
				"type": "Smaaash Zone",
				"priority": "",
				"name": "6 Mall Kothapet, Hyderabad",
				"address": "4 th Floor, 6 mall opp fruit market, kothapet",
				"city": {
					"id": 9,
					"name": "Hyderabad",
					"state": "IN-TG"
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
				"id": 179,
				"name": "June 2018",
				"type": "SMAAASH_ZONE",
				"start_date": "2018-06-08",
				"end_date": "2018-06-24",
				"client": {
					"id": 9,
					"name": "Smaaash",
					"email": "saurabh.sawhney@smaaash.in",
					"phone": "",
					"logo_url": "https://s3-ap-southeast-1.amazonaws.com/fw-client-logos/LOGOS/Smaaaash_logo.jpeg"
				}
			}
		},
		"color": 1,
		"percentage": 0
	},
	{
		"id": 4373,
		"audit_date": "2018-06-23",
		"audit": {
			"id": 2787,
			"store": {
				"id": 2145,
				"code": null,
				"type": "Smaaash Zone",
				"priority": "",
				"name": "Smaaash Mysore",
				"address": "4 th Floor,Mall of Mysore, Ittigegoddu - Indiranagar Extension, Nazarabad",
				"city": {
					"id": 267,
					"name": "Mysore",
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
				"id": 179,
				"name": "June 2018",
				"type": "SMAAASH_ZONE",
				"start_date": "2018-06-08",
				"end_date": "2018-06-24",
				"client": {
					"id": 9,
					"name": "Smaaash",
					"email": "saurabh.sawhney@smaaash.in",
					"phone": "",
					"logo_url": "https://s3-ap-southeast-1.amazonaws.com/fw-client-logos/LOGOS/Smaaaash_logo.jpeg"
				}
			}
		},
		"color": 1,
		"percentage": 0
	},
	{
		"id": 4268,
		"audit_date": "2018-06-24",
		"audit": {
			"id": 2783,
			"store": {
				"id": 2141,
				"code": null,
				"type": "Smaaash Zone",
				"priority": "",
				"name": "Smaaash Madurai",
				"address": "No-31 , Fourth floor, Vishal De Mall , Gokhale Road , Chinna chokikulam",
				"city": {
					"id": 509,
					"name": "Madurai",
					"state": "IN-TN"
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
				"id": 179,
				"name": "June 2018",
				"type": "SMAAASH_ZONE",
				"start_date": "2018-06-08",
				"end_date": "2018-06-24",
				"client": {
					"id": 9,
					"name": "Smaaash",
					"email": "saurabh.sawhney@smaaash.in",
					"phone": "",
					"logo_url": "https://s3-ap-southeast-1.amazonaws.com/fw-client-logos/LOGOS/Smaaaash_logo.jpeg"
				}
			}
		},
		"color": 1,
		"percentage": 0
	},
	{
		"id": 4376,
		"audit_date": "2018-06-24",
		"audit": {
			"id": 2780,
			"store": {
				"id": 1203,
				"code": null,
				"type": "Arena",
				"priority": "",
				"name": "Smaaash Indore",
				"address": "5th floor, Treasure Island Next, 170, RNT Marg, Near SSP Office",
				"city": {
					"id": 309,
					"name": "Indore",
					"state": "IN-MP"
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
				"id": 179,
				"name": "June 2018",
				"type": "SMAAASH_ZONE",
				"start_date": "2018-06-08",
				"end_date": "2018-06-24",
				"client": {
					"id": 9,
					"name": "Smaaash",
					"email": "saurabh.sawhney@smaaash.in",
					"phone": "",
					"logo_url": "https://s3-ap-southeast-1.amazonaws.com/fw-client-logos/LOGOS/Smaaaash_logo.jpeg"
				}
			}
		},
		"color": 1,
		"percentage": 0
	},
	{
		"id": 4420,
		"audit_date": "2018-06-24",
		"audit": {
			"id": 2775,
			"store": {
				"id": 2139,
				"code": null,
				"type": "Smaaash",
				"priority": "",
				"name": "Sujana Mall Hyderabad",
				"address": "THE FORUM SUJANA MALL, 3RD FLOOR, UNIT NO. 301,KPHB KUKATPALLY",
				"city": {
					"id": 9,
					"name": "Hyderabad",
					"state": "IN-TG"
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
				"id": 177,
				"name": "June 2018",
				"type": "SMAAASH",
				"start_date": "2018-06-08",
				"end_date": "2018-06-24",
				"client": {
					"id": 9,
					"name": "Smaaash",
					"email": "saurabh.sawhney@smaaash.in",
					"phone": "",
					"logo_url": "https://s3-ap-southeast-1.amazonaws.com/fw-client-logos/LOGOS/Smaaaash_logo.jpeg"
				}
			}
		},
		"color": 1,
		"percentage": 0
	}
];

describe("<UpcomingAuditStores/>", () => {
	beforeEach(() => {
		fetchUpcomingAuditStores.mockReturnValue($.Deferred().resolve(sampleUpcomingAuditStores).promise());
	});

	it("calls fetchUpcomingAuditStores", () => {
		shallow(<UpcomingAuditStores/>);
		expect(fetchUpcomingAuditStores).toHaveBeenCalled();
	});

	it("renders the table correctly", (done) => {
		const r = renderer.create(<UpcomingAuditStores/>);
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});
});
