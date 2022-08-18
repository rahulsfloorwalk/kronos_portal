import React from "react";
import moment from "moment";
import * as ReactRedux from "react-redux";
import {Link} from "react-router";

import {affectInputEventToComponent} from "../../../react_utils.js";
import {getGender, getIndustry, getCarCost, getIncomeText, getOccupation} from "../../../utils.js";

import { CSSTransitionGroup } from "react-transition-group";

import {setAuditorSearch} from "../../actions/auditor.js";
import {searchAuditors} from "../../service/auditor.js";
import { fetchStates, fetchCities } from "../../service/location.js";

import { pointerStyle }  from "../../../styles.js";

import {Search, Check, Cross, Pawn} from "../../../components/Icons.jsx";
import AuditStoreRating from "../../../components/AuditStoreRating.jsx";
import AuditorRating from "../../../components/AuditorRating.jsx";
import {momentDateFormat} from "../../../../config.js";
import Loading from "../../../components/Loading.jsx";
import PropTypes from "prop-types";

export class AuditorRow extends React.Component {
	static propTypes = {
		auditor: PropTypes.shape({
			id: PropTypes.number.isRequired,
			is_active: PropTypes.bool.isRequired,
			email: PropTypes.string.isRequired,
			last_login: PropTypes.string,
			profileinfo: PropTypes.object.isRequired,
			additionalinfo: PropTypes.object.isRequired
		}),
	};

	state = {
		expanded: false,
	};

	viewButtonClicked = (e) => {
		e.preventDefault();
		this.setState({
			expanded: !this.state.expanded
		});
	};

	render() {
		var linkTo = `/auditor/${this.props.auditor.id}`;
		var prof = this.props.auditor.profileinfo || {};
		prof.city = prof.city || {};

		let activeIcon = this.props.auditor.is_active ? <Check/> : <Cross/>;

		var {occupation, industry, car_cost, income} = this.props.auditor.additionalinfo;

		let expandedBorder = {
			borderLeft: "solid #337ab7 5px",
		};

		let backgroundColor = "";

		let trStyle = Object.assign({}, pointerStyle, {
			backgroundColor
		}, this.state.expanded ? expandedBorder : {},
		this.state.expanded ? { fontSize : "100%", fontWeight: "bold", } : {},
		);

		return (
			<tbody>
				<tr style={trStyle} onClick={this.viewButtonClicked} title={this.state.expanded ? "Click to Collapse" : "Click to Expand"} className={this.state.expanded ? "active" : ""}>
					<td>{prof.first_name} {prof.last_name}</td>
					<td>{this.props.auditor.email}</td>
					<td>{occupation == null ? "N/A" : getOccupation(occupation)}</td>
					<td>{income == null ? "N/A" : getIncomeText(income)}</td>
					<td>{industry == null ? "N/A" : getIndustry(industry)}</td>
					<td>{car_cost == null ? "N/A" : getCarCost(car_cost)}</td>
					<td><center>{prof.average_rating !== null ?
						<AuditStoreRating rating={Math.round(prof.average_rating)}/> : null}</center></td>
					<td>{moment(this.props.auditor.last_login).format(momentDateFormat)}</td>
					<td>{activeIcon}</td>
					<td>
						<Link to={linkTo} className="btn btn-default pull-right">View</Link>
					</td>
				</tr>
				<CSSTransitionGroup
					component="tr"
					transitionName="fade"
					style={expandedBorder}
					transitionEnterTimeout={300}
					transitionLeaveTimeout={300}>
					{ this.state.expanded ?
						<td colSpan="10" style={{backgroundColor: "White"}}>
							<div className="col-md-2"><b>Gender:</b><br/>{getGender(prof.gender)}</div>
							<div className="col-md-2"><b>Mobile No.:</b><br/>{prof.mobile_number}</div>
							<div className="col-md-2"><b>Rating:</b><br/><AuditorRating rating={prof.avg_auditor_rating} /></div>
							<div className="col-md-2"><b>Pincode:</b><br/>{prof.pincode}</div>
							<div className="col-md-2"><b>City:</b><br/>{prof.city.name}</div>
							<div className="col-md-2"><b>State:</b><br/>{prof.city.state_name}</div>
						</td>
						: null
					}
				</CSSTransitionGroup>
			</tbody>
		);
	}
}

export class AuditorList extends React.Component {

	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		search: PropTypes.string,
		children: PropTypes.node,
	};

	state = {
		auditors: [],
		loading: false,
		search: "",
		state: "",
		city: "",
		gender: "",
		rating: "",
		occupation: "",
		income: "",
		industry: "",
		car_cost: "",
		states: {},
		cities: []
	};

	setLoading = (loading) => {
		this.setState(prevState => Object.assign({}, prevState, {loading}));
	};

	searchAuditors = (search, state, city, gender, rating, occupation, income, industry, car_cost) => {
		this.setLoading(true);
		searchAuditors(search, state, city, gender, rating, occupation, income, industry, car_cost).done((page) => {
			this.setState({
				auditors: page.results,
			});
		}).always(() => this.setLoading(false));
	};

	componentDidMount() {
		fetchStates().done((states)=>this.setState({states}));
		this.setState({
			search: this.props.search
		});
		if (this.props.search && this.props.search !== "") {
			this.searchAuditors(this.props.search);
		}
	}

	onSubmit = (e) => {
		e.preventDefault();
		this.props.dispatch(setAuditorSearch(this.state.search));
		this.searchAuditors(this.state.search, this.state.state, this.state.city,
			this.state.gender,this.state.rating, this.state.occupation, this.state.income,
			this.state.industry, this.state.car_cost);
	};

	inputChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	myStateChanged = (e) => {
		this.inputChanged(e);
		if(e.target.value){
			fetchCities(e.target.value).done((cities)=>this.setState({cities}));
		} else {
			this.setState({
				state: "",
				city: "",
			});
		}
	};

	render() {
		let table;
		let rows = [];
		let stateOptions = [];
		let cityOptions = [];

		for( let s in this.state.states){
			stateOptions.push(<option key={s} value={s}>{this.state.states[s]}</option>);
		}

		for( let s of this.state.cities){
			cityOptions.push(<option key={s.id} value={s.id}>{s.name}</option>);
		}

		for (let a of this.state.auditors) {
			rows.push(<AuditorRow auditor={a} key={a.id}/>);
		}
		if (rows.length > 0) {
			table = (
				<div className="table-responsive">
					<table className="table table-striped">
						<thead>
							<tr>
								<th>Full Name</th>
								<th>Email</th>
								<th>Occupation</th>
								<th>Income</th>
								<th>Industry</th>
								<th>Car Price</th>
								<th>Report Rating</th>
								<th>Last Login</th>
								<th>Active</th>
								<th></th>
							</tr>
						</thead>
						{rows}
					</table>
				</div>
			);
		} else {
			table = (
				<div className="jumbotron text-center">
					<h2>no results found</h2>
					<p>try modifying your search terms a bit..</p>
				</div>
			);
		}
		if (this.state.loading) {
			table = <Loading/>;
		}

		return (
			<div>
				<h2 className="page-header">
					<Pawn/> Auditors
				</h2>
				<form className="form-group" onSubmit={this.onSubmit}>
					<div className="row">
						<div className="col-md-4 form-group">
							<input className="form-control" placeholder="name, email, city, pincode or mobile number" name="search" value={this.state.search} onChange={this.inputChanged}/>
						</div>
						<div className="col-md-2 form-group">
							<select name="state" className="form-control" value={this.state.state} onChange={this.myStateChanged}>
								<option value="">Select state</option>
								{stateOptions}
							</select>
						</div>
						<div className="col-md-2 form-group">
							<select name="city" className="form-control" value={this.state.city} onChange={this.inputChanged}>
								<option>Select city</option>
								{cityOptions}
							</select>
						</div>
						<div className="col-md-2 form-group">
							<select name="gender" className="form-control" value={this.state.gender} onChange={this.inputChanged}>
								<option value="">Select gender</option>
								<option value="M">Male</option>
								<option value="F">Female</option>
							</select>
						</div>
						<div className="col-md-2 form-group">
							<select name="rating" className="form-control" value={this.state.rating} onChange={this.inputChanged}>
								<option value="">Select auditor rating</option>
								<option value="4">Excellent</option>
								<option value="3">Good</option>
								<option value="2">Average</option>
								<option value="1">Worse</option>
							</select>
						</div>
						<div className="col-md-2 form-group">
							<select name="occupation" className="form-control" value={this.state.occupation} onChange={this.inputChanged}>
								<option value="">Select occupation</option>
								<option value="STUDENT">{getOccupation("STUDENT")}</option>
								<option value="SERVICE">{getOccupation("SERVICE")}</option>
								<option value="SELF_EMPLOYED">{getOccupation("SELF_EMPLOYED")}</option>
								<option value="BUSINESS">{getOccupation("BUSINESS")}</option>
								<option value="UNEMPLOYED">{getOccupation("UNEMPLOYED")}</option>
								<option value="RETIRED">{getOccupation("RETIRED")}</option>
							</select>
						</div>
						<div className="col-md-2 form-group">
							<select name="income" className="form-control" value={this.state.income} onChange={this.inputChanged}>
								<option value="">Select income</option>
								<option value="0">{getIncomeText("0")}</option>
								<option value="1">{getIncomeText("1")}</option>
								<option value="2">{getIncomeText("2")}</option>
								<option value="3">{getIncomeText("3")}</option>
								<option value="4">{getIncomeText("4")}</option>
								<option value="5">{getIncomeText("5")}</option>
							</select>
						</div>
						<div className="col-md-2 form-group">
							<select name="industry" className="form-control" value={this.state.industry} onChange={this.inputChanged}>
								<option value="">Select Industry</option>
								<option value="1">{getIndustry("1")}</option>
								<option value="2">{getIndustry("2")}</option>
								<option value="3">{getIndustry("3")}</option>
								<option value="4">{getIndustry("4")}</option>
								<option value="5">{getIndustry("5")}</option>
								<option value="6">{getIndustry("6")}</option>
								<option value="7">{getIndustry("7")}</option>
								<option value="8">{getIndustry("8")}</option>
								<option value="9">{getIndustry("9")}</option>
								<option value="10">{getIndustry("10")}</option>
								<option value="11">{getIndustry("11")}</option>
								<option value="12">{getIndustry("12")}</option>
								<option value="13">{getIndustry("13")}</option>
								<option value="14">{getIndustry("14")}</option>
								<option value="15">{getIndustry("15")}</option>
								<option value="16">{getIndustry("16")}</option>
								<option value="17">{getIndustry("17")}</option>
								<option value="18">{getIndustry("18")}</option>
								<option value="19">{getIndustry("19")}</option>
								<option value="20">{getIndustry("20")}</option>
								<option value="21">{getIndustry("21")}</option>
								<option value="22">{getIndustry("22")}</option>
								<option value="23">{getIndustry("23")}</option>
								<option value="24">{getIndustry("24")}</option>
								<option value="25">{getIndustry("25")}</option>
								<option value="26">{getIndustry("26")}</option>
								<option value="27">{getIndustry("27")}</option>
								<option value="28">{getIndustry("28")}</option>
								<option value="29">{getIndustry("29")}</option>
								<option value="30">{getIndustry("30")}</option>
								<option value="31">{getIndustry("31")}</option>
								<option value="32">{getIndustry("32")}</option>
								<option value="33">{getIndustry("33")}</option>
								<option value="34">{getIndustry("34")}</option>
								<option value="35">{getIndustry("35")}</option>
								<option value="36">{getIndustry("36")}</option>
								<option value="37">{getIndustry("37")}</option>
								<option value="38">{getIndustry("38")}</option>
								<option value="39">{getIndustry("39")}</option>
								<option value="40">{getIndustry("40")}</option>
								<option value="41">{getIndustry("41")}</option>
								<option value="42">{getIndustry("42")}</option>
								<option value="43">{getIndustry("43")}</option>
							</select>
						</div>
						<div className="col-md-2 form-group">
							<select name="car_cost" className="form-control" value={this.state.car_cost} onChange={this.inputChanged}>
								<option value="">Select car price</option>
								<option value="1">{getCarCost("1")}</option>
								<option value="2">{getCarCost("2")}</option>
								<option value="3">{getCarCost("3")}</option>
								<option value="4">{getCarCost("4")}</option>
								<option value="5">{getCarCost("5")}</option>
							</select>
						</div>
						<div className="col-md-12">
							<button type="submit" className="btn btn-primary"><Search/> Search</button>
						</div>
					</div>
				</form>
				{table}
				{this.props.children}
			</div>
		);
	}
}

var mapStoreToProps = function (store) {
	return {
		search: store.forms.auditorSearch.search
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditorList);
