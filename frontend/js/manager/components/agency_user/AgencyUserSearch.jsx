import React from "react";
import {Link} from "react-router";

import {affectInputEventToComponent} from "../../../react_utils.js";

import {searchAgencyUsers} from "../../service/agency_user.js";

import {Search, Check, Cross, Rook} from "../../../components/Icons.jsx";
import InputGroup from "../../../components/InputGroup.jsx";
import {InputGroupBtn} from "../../../components/InputGroup.jsx";
import Loading from "../../../components/Loading.jsx";
import PropTypes from "prop-types";

export class AgencyUserRow extends React.Component {
	static propTypes = {
		user: PropTypes.shape({
			id: PropTypes.number.isRequired,
			is_active: PropTypes.bool.isRequired,
			email: PropTypes.string.isRequired,
			mobile_numbers: PropTypes.arrayOf(PropTypes.shape({
				id: PropTypes.number,
				mobile_number: PropTypes.string,
			})),
			agencyuser: PropTypes.shape({
				id: PropTypes.number,
				full_name: PropTypes.string,
				agency: PropTypes.shape({
					id: PropTypes.number,
					name: PropTypes.string,
				}),
			}),
		}),
	};
	render() {
		const activeIcon = this.props.user.is_active ? <Check/> : <Cross/>;

		return (
			<tr>
				<td>{this.props.user.agencyuser.agency.name}</td>
				<td>{this.props.user.agencyuser.full_name}</td>
				<td>{this.props.user.email}</td>
				<td>{this.props.user.mobile_numbers[0].mobile_number}</td>
				<td>{activeIcon}</td>
				<td>
					<Link to={`/agency_user/${this.props.user.id}`} className="btn btn-default pull-right">View</Link>
				</td>
			</tr>
		);
	}
}

export default class AgencyUserSearch extends React.Component {

	static propTypes = {};

	state = {
		users: [],
		loading: false,
		search: ""
	};

	setLoading = (loading) => this.setState(prevState => Object.assign({}, prevState, {loading}));

	onSubmit = (e) => {
		e.preventDefault();
		this.setLoading(true);
		searchAgencyUsers(this.state.search).done((page) => {
			this.setState({
				users: page.results,
			});
		}).always(() => this.setLoading(false));
	};

	inputChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	render() {
		const rows = this.state.users.map(u => <AgencyUserRow user={u} key={u.id}/>);

		let table;
		if (rows.length > 0) {
			table = (
				<div className="table-responsive">
					<table className="table table-striped">
						<thead>
							<tr>
								<th>Agency</th>
								<th>Full Name</th>
								<th>Email</th>
								<th>Mobile Number</th>
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
					<Rook/> Agencies
				</h2>
				<form className="form-group" onSubmit={this.onSubmit}>
					<InputGroup>
						<input className="form-control" placeholder="name, email, city or mobile number" name="search" value={this.state.search} onChange={this.inputChanged} required/>
						<InputGroupBtn>
							<button type="submit" className="btn btn-primary"><Search/> Search</button>
						</InputGroupBtn>
					</InputGroup>
				</form>
				{table}
			</div>
		);
	}
}
