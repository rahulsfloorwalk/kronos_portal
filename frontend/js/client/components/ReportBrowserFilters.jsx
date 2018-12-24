import React from "react";
import { connect } from "react-redux";

import CitySelector from  "./report_browser/CitySelector.jsx";
import StateSelector from  "./report_browser/StateSelector.jsx";
import EndDateSelector from  "./report_browser/EndDateSelector.jsx";
import StartDateSelector from  "./report_browser/StartDateSelector.jsx";
import StorePrioritySelector from  "./report_browser/StorePrioritySelector.jsx";
import StoreTypeSelector from  "./report_browser/StoreTypeSelector.jsx";

export class ReportBrowserFilters extends React.Component {
	render(){
		return (
			<div>
				<div className="form-group">
					<CitySelector/>&nbsp;
					<StateSelector/>&nbsp;
					<StoreTypeSelector/>&nbsp;
					<StorePrioritySelector/>&nbsp;
					<StartDateSelector/>&nbsp;
					<EndDateSelector/>&nbsp;
				</div>
			</div>
		);
	}
}

export default connect()(ReportBrowserFilters);
