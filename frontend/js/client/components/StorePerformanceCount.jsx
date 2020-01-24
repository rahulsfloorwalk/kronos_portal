import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router";

import Loading from "../../components/Loading.jsx";
// import QuestionnaireTypeTabs from "./QuestionnaireTypeTabs.jsx";
import QuestionnaireTypeTabsForDashboard from "./QuestionnaireTypeTabsForDashboard.jsx";

import { questionnaireTypeSelectors } from "../selectors";
import { affectInputEventToComponent } from "../../react_utils.js";
import {searchStorePerformance} from "../service/report_section.js";
import Jumbotron from "../../components/Jumbotron.jsx";

const questionnaireTypePropType = PropTypes.shape({
	id: PropTypes.number.isRequired,
	name: PropTypes.string.isRequired,
});
export class StorePerformanceCount extends React.Component{
	static propTypes = {
		selectedQuestionnaireType: questionnaireTypePropType,
		children: PropTypes.node,
	};

	state = {
		percentage : "",
		storePerformanceData: null,
		blank_percentage : false,
		value_percentage: false,
		loading: false
	};

	componentWillReceiveProps(nextProps){
		if(nextProps.selectedQuestionnaireType !== this.props.selectedQuestionnaireType){
			this.setState({
				percentage : "",
				storePerformanceData: null,
				blank_percentage : false,
				value_percentage: false,
				loading: false
			});
		}
	}

	setLoading = (loading) => {
		this.setState(prevState => {
			return Object.assign({}, prevState, {
				loading
			});
		});
	};

	onSearch = () => {
		if (this.state.percentage === ""){
			this.setState({
				blank_percentage: true
			});
		}
		else if (this.state.percentage > 100 || this.state.percentage == 0){
			this.setState({
				value_percentage: true
			});
		}
		else {
			this.setLoading(true);
			this.setState({
				storePerformanceData: null
			});
			searchStorePerformance(this.state.percentage, this.props.selectedQuestionnaireType.id).then((storePerformanceData)=>{
				this.setState({
					storePerformanceData:storePerformanceData
				});
			}).always(() => this.setLoading(false));
		}
	};
	inputChanged = (e) => {
		affectInputEventToComponent(e, this);
		const re = /^[0-9\b]+$/;

		if (e.target.value === "" || re.test(e.target.value)) {
			this.setState({
				percentage: e.target.value,
				blank_percentage: false,
				value_percentage: false
			});
		}
	};

	inputKeyDown = (e) =>{
		if(e.key == "Enter"){
			this.onSearch();
		}
	};

	render(){
		var blank_percentage_element = (<span style={{color:"red"}}>Please enter percentage</span>);
		var value_percentage_element = (<span style={{color:"red"}}>Percentage should be between 1 to 100</span>);

		let table;
		if(this.state.storePerformanceData){
			let headers = [];
			let headers_section = [];
			headers.push(<th key="audit_cycle" rowSpan="2" style={{textAlign:"center"}}>Audit Cycle</th>);
			headers.push(<th key="store_count" colSpan="3" style={{textAlign:"center"}}>{"Store count which is less than "+this.state.storePerformanceData["percentage"]+"%" }</th>);
			headers_section = headers_section.concat(this.state.storePerformanceData["sections"].map(s => <th key={s["id"]} className="text-right">{s["name"]}</th>));

			let trs = [];
			this.state.storePerformanceData["section_count"].forEach(r => {
				let tds = [];
				for(let s of r.section){
					if(s["count"] > 0){
						tds.push(<td key={s["key"]} className="text-right" style={{fontSize:"18px"}}><Link to={`store_performance/audit_cycle/${s["audit_cycle_id"]}/section/${s["section_id"]}/percentage/${this.state.storePerformanceData["percentage"]}/store_list`}><b>{s["count"]}</b></Link></td>);
					}
					else{
						tds.push(<td key={s["key"]} className="text-right">{s["count"]}</td>);
					}
				}
				trs.push(
					<tr key={r.audit_cycle_id}>
						<td>{r.audit_cycle}</td>
						{tds}
					</tr>
				);

			});

			table = (
				<table className="table table-bordered table-hover table-responsive table-striped">
					<thead>
						<tr>{headers}</tr>
						<tr>{headers_section}</tr>
					</thead>
					<tbody>
						{trs}
					</tbody>
				</table>
			);
		}
		else if(this.state.loading){
			table = <Loading/>;
		}
		else{
			table = <Jumbotron heading="no results found" para="Use this dashboard to get stores which have scored less than optimal value. You can enter the optimal value in the input box above between 1-100"/>;
		}

		return (
			<div>
				<QuestionnaireTypeTabsForDashboard />
				<div style={{width: "250px", display: "inline-block"}}>
					<label className="control-label">Percentage : </label><br/>
					{this.state.blank_percentage ? blank_percentage_element : null}
					{this.state.value_percentage ? value_percentage_element : null}
					<input type="text" className="form-control" placeholder="Enter percentage" maxLength="3" value={this.state.percentage} onChange={this.inputChanged} onKeyDown={this.inputKeyDown}/>

				</div>
				<div style={{width: "200px", display: "inline-block"}}>
					&nbsp;&nbsp;<button type="button" className="btn btn-primary" onClick={this.onSearch}>Search</button>
				</div>
				<hr/>
				{table}
				{this.props.children}
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		selectedQuestionnaireType: questionnaireTypeSelectors.findSelectedQuestionnaireType(state),
	};
};

export default connect(mapStateToProps)(StorePerformanceCount);
