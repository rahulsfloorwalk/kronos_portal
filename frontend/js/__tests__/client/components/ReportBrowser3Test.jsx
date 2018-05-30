import React from "react";
import Datetime from 'react-datetime';
import { shallow } from "enzyme";
import renderer from "react-test-renderer";

import { fetchAuditCycles } from '../../../client/service/audit_cycle.js';

jest.mock("react-dom", () => ({
	findDOMNode: () => {},
}));

jest.mock('../../../client/service/audit_cycle.js');

describe("<ReportBrowser3/>", () => {
  const sampleAuditCycles = [
    {
      "audit__audit_cycle__id":109,
      "audit__audit_cycle__end_date":"2018-05-31",
      "audit__audit_cycle__start_date":"2018-03-12",
      "audit__audit_cycle__name":"Wave-1- 2018",
      "audit__audit_cycle__type":"WALKIN"
    }
  ];
	it("selects first audit cycle on successfully loading audit cycle list", (done) => {
    fetchAuditCycles.mockResolvedValue(sampleAuditCycles);
    const r = shallow(<ReportBrowser3/>);
    setTimeout( () => {
      expect(r.find("select").value).toEqual(sampleAuditCycles[0].audit__audit_cycle__id);
      done();
    });
	});
});
