import React from "react";
import moment from "moment";
import * as ReactRedux from "react-redux";
import {Link} from "react-router";

import {affectInputEventToComponent} from "../../../react_utils.js";
import {getGender} from "../../../utils.js";

import {setAuditorSearch} from "../../actions/auditor.js";
import {searchAuditors} from "../../service/auditor.js";

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
			profileinfo: PropTypes.object.isRequired
		}),
	};
	render() {
		var linkTo = `/auditor/${this.props.auditor.id}`;
		var prof = this.props.auditor.profileinfo || {};
		prof.city = prof.city || {};

		let activeIcon = this.props.auditor.is_active ? <Check/> : <Cross/>;
		return (
			<tr>
				<td>{prof.first_name} {prof.last_name}</td>
				<td>{this.props.auditor.email}</td>
				<td>{getGender(prof.gender)}</td>
				<td>{prof.mobile_number}</td>
				<td>{prof.city.name}, {prof.city.state_name}</td>
				<td>{prof.pincode}</td>
				<td><center>{prof.average_rating !== null ?
					<AuditStoreRating rating={Math.round(prof.average_rating)}/> : null}</center></td>
				<td><center><AuditorRating rating={prof.auditor_rating}/></center></td>
				<td>{moment(this.props.auditor.last_login).format(momentDateFormat)}</td>
				<td>{activeIcon}</td>
				<td>
					<Link to={linkTo} className="btn btn-default pull-right">View</Link>
				</td>
			</tr>
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
		gender: "",
		rating: ""
	};

	setLoading = (loading) => {
		this.setState(prevState => Object.assign({}, prevState, {loading}));
	};

	searchAuditors = (search, gender, rating) => {
		this.setLoading(true);
		searchAuditors(search, gender, rating).done((page) => {
			this.setState({
				auditors: page.results,
			});
		}).always(() => this.setLoading(false));
	};

	componentDidMount() {
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
		this.searchAuditors(this.state.search, this.state.gender,this.state.rating);
	};

	inputChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	render() {
		let table;
		let rows = [];
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
								<th>Gender</th>
								<th>Mobile Number</th>
								<th>City</th>
								<th>Pincode</th>
								<th>Report Rating</th>
								<th>Auditor Rating</th>
								<th>Last Login</th>
								<th>Active</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{rows}
						</tbody>
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
						<div className="col-md-6">
							<input className="form-control" placeholder="name, email, city, pincode or mobile number" name="search" value={this.state.search} onChange={this.inputChanged} required/>
						</div>
						<div className="col-md-2">
							<select name="gender" className="form-control" value={this.state.gender} onChange={this.inputChanged}>
								<option value="">Select gender</option>
								<option value="M">Male</option>
								<option value="F">Female</option>
							</select>
						</div>
						<div className="col-md-2">
							<select name="rating" className="form-control" value={this.state.rating} onChange={this.inputChanged}>
								<option value="">Select rating</option>
								<option value="E">Excellent</option>
								<option value="G">Good</option>
								<option value="A">Average</option>
								<option value="W">Wrost</option>
							</select>
						</div>
						<div className="col-md-2">
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
