import React from "react";
import { connect } from "react-redux";
import Datetime from "react-datetime";

export class ReportBrowserFilters extends React.Component {
	state = {
		reports: [],
		cities: [],
		types: [],
		priorities: [],
		months: [],
		selectedCityId: "",
		selectedType: "",
		selectedPriority: "",
		cycleStartDate: null,
		cycleEndDate: null,
		startDate: null,
		endDate: null,
	};

	selectStorePriority = (e) => {
		this.setState({
			selectedPriority: e.target.value,
		});
	};

	selectStoreType = (e) => {
		this.setState({
			selectedType: e.target.value,
		});
	};

	selectMonth = (e) => {
		this.setState({
			selectedMonth: e.target.value,
		});
	};

	setStartDate = (date) => {
		this.setState({
			startDate: date,
		});
	};

	setEndDate = (date) => {
		this.setState({
			endDate: date,
		});
	};

	validateStartDate = (currentDate, selectedDate) => {
		return currentDate.isBetween(this.state.cycleStartDate, this.state.endDate, null, "[]");
	};

	validateEndDate = (currentDate, selectedDate) => {
		return currentDate.isBetween(this.state.startDate, this.state.cycleEndDate, null, "[]");
	};

	render(){

		let storeTypeSelect = (
			<div style={{display:"inline-block",width:"200px"}}>
				<label className="control-label">&nbsp;Store Type:</label>
				<select onChange={this.selectStoreType} value={this.state.selectedType} className="form-control" style={{display:"inline-block",width:"200px"}}>
					<option value="">All Types</option>
					{this.state.types.filter(t=>!!t).map(t => <option key={t} value={t}>{t}</option>)}
				</select>
			</div>
		);

		let startDatePicker = (
			<div style={{display:"inline-block",width:"200px"}}>
				<label className="control-label">&nbsp;Start Date:</label>
				<Datetime name="start_date"
					value={this.state.startDate}
					onChange={this.setStartDate}
					isValidDate={this.validateStartDate}
					timeFormat={false}
					dateFormat="YYYY-MM-DD"
					closeOnSelect={true}/>
			</div>
		);

		let endDatePicker = (
			<div style={{display:"inline-block",width:"200px"}}>
				<label className="control-label">&nbsp;End Date:</label>
				<Datetime name="end_date"
					value={this.state.endDate}
					onChange={this.setEndDate}
					isValidDate={this.validateEndDate}
					timeFormat={false}
					dateFormat="YYYY-MM-DD"
					closeOnSelect={true}/>
			</div>
		);

		let storePrioritySelect = (
			<div style={{display:"inline-block",width:"200px"}}>
				<label className="control-label">&nbsp;Priority:</label>
				<select onChange={this.selectStorePriority} value={this.state.selectedPriority} className="form-control" style={{display:"inline-block",width:"200px"}}>
					<option value="">All Priorities</option>
					{this.state.priorities.filter(p=>!!p).map(p => <option key={p} value={p}>{p}</option>)}
				</select>
			</div>
		);

		return (
			<div>
				<div className="form-group">
					{citySelect}&nbsp;
					{storeTypeSelect}&nbsp;
					{storePrioritySelect}&nbsp;
					{startDatePicker}&nbsp;
					{endDatePicker}&nbsp;
				</div>
			</div>
		);
	}
}

export default connect()(ReportBrowserFilters);
