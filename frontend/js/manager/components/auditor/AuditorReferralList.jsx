import React, { Component } from "react";
import { hashHistory, Link } from "react-router";

import moment from "moment";
import { momentDateFormat, momentDateTimeFormat }  from "../../../../config.js";

import { findReferralsByReferredBy } from "../../service/referral.js";

import { King, Retweet, Inbox, Tasks, Pencil, File } from "../../../components/Icons.jsx";
import Loading from "../../../components/Loading.jsx";
import ReferralTypeLabel from "../../../components/ReferralTypeLabel.jsx";

export default class AuditorReferralList extends Component{
	constructor(props){
		super(props);
		this.state = {
			loading: true,
			referrals: [],
		};
	}

	setLoading = (loading) => this.setState( prevState =>  Object.assign({}, prevState, { loading }));

	reloadData = (userId) => {
		this.setLoading(true);
		findReferralsByReferredBy(userId).then((referrals)=> this.setState({ referrals })).always(() => this.setLoading(false));
	};

	componentDidMount(){
		this.reloadData(this.props.params.auditorId);
	}

	componentWillReceiveProps = (nextProps) => {
		if( this.props.params.auditorId !== nextProps.params.auditorId){
			this.reloadData(nextProps.params.auditorId);
		}
	};

	render(){
		if(this.state.loading){
			return <Loading/>;
		}
		return (
			<div className="panel panel-default">
				<table className="table table-striped">
					<thead>
						<tr>
							<th>Added On</th>
							<th className="text-right">Amount</th>
							<th>Referral Type</th>
							<th>Comment</th>
							<th>Referred To</th>
						</tr>
					</thead>
					<tbody>
						{this.state.referrals.map(r =>
							<tr key={r.id}>
								<td>{moment(r.added_on).format(momentDateFormat)}</td>
								<td className="text-right"><big>₹ {r.amount}</big></td>
								<td><ReferralTypeLabel type={r.type}/></td>
								<td>{r.comment}</td>
								<td><Link to={`/auditor/${r.referred_to}`} className="btn btn-default">Referred To</Link></td>
							</tr>
						)}
					</tbody>
					<tfoot>
						<tr>
							<td className="text-right">Total:</td>
							<td className="text-right">
								<big><b>₹ {this.state.referrals.reduce((sum, r) => sum += r.amount, 0)}</b></big>
							</td>
							<td></td>
							<td></td>
							<td></td>
						</tr>
					</tfoot>
				</table>
			</div>
		);
	}
}
