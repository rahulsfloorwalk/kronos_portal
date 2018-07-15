import React from "react";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";

import AuditorNameDisplay from "../AuditorNameDisplay";

const sampleAgencyUser = {
  "id": 7549,
  "email": "agency@floorwalk.in",
  "mobile_numbers": [{
    "mobile_number": "1234567898",
    "is_verified": false
  }],
  "profileinfo": null,
  "agencyuser": {
    "id": 20,
    "full_name": "GAIKI",
    "agency": {
      "id": 21,
      "name": "FW_AGENCY"
    },
    "user_id": 7549
  }
}

const sampleAuditorUser = {
  "id": 1728,
  "email": "Vsowrya@gmail.com",
  "mobile_numbers": [],
  "profileinfo": {
    "id": 1539,
    "first_name": "Raghava",
    "last_name": "Sowrya",
    "mobile_number": "8123450516",
    "city": 641,
    "user_id": 1728
  },
  "agencyuser": null
}

describe("<AuditorNameDisplay/>", () => {
	const sampleParams = {
		auditCycleId: "5",
	};

	it("renders the auditor name and phone correctly for modrator", (done) => {
		const dispatch = jest.fn().mockResolvedValue(sampleAuditorUser);
		const r = renderer.create(<AuditorNameDisplay user={sampleAuditorUser} />);
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});

  it("renders the agency name and phone correctly for modrator", (done) => {
		const dispatch = jest.fn().mockResolvedValue(sampleAgencyUser);
		const r = renderer.create(<AuditorNameDisplay user={sampleAgencyUser} />);
		setTimeout(() => {
			expect(r.toJSON()).toMatchSnapshot();
			done();
		});
	});

});
