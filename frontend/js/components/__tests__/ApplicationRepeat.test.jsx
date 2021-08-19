import React from "react";
import renderer from "react-test-renderer";

import ApplicationRepeat from "../ApplicationRepeat.jsx";

describe("<ApplicationRepeat/>", () => {
	let reports = [
		{
			status:true,
			data:{
				audit_date: "2021-06-28",
				audit_cycle_id: 1,
				audit_cycle_name: "FloorWalk Demo - March 2021"
			}
		},
		{
			status:false,
			data:{}
		},
		{
			status:undefined,
			data:{}
		}
	];
	test.each(reports)("renders correctly when report_exists is: %s", (report) => {
		const tree = renderer.create(<ApplicationRepeat report_exists={report.status} report_data={report.data}/>).toJSON();
		expect(tree).toMatchSnapshot();
	});
});
