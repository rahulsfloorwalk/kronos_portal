import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import { findPayments } from '../../auditor/service/payment.js';

import ExpandableDetails from '../ExpandableDetails.jsx';
import { Cross, ShareAlt } from '../Icons.jsx';
import { getAuditType, getAuditStatus } from '../../utils.js';
import { LabelValue_2_10 } from '../LabelValue.jsx';
import AuditStoreStatusLabel from '../AuditStoreStatusLabel.jsx';
import PaymentStatusLabel from '../PaymentStatusLabel.jsx';
import Jumbotron from '../Jumbotron.jsx';
import MarkdownViewer from '../MarkdownViewer.jsx';

class PaymentRow extends React.Component{

	render(){
		return (
				<div className="panel panel-default" style={{minHeight:"75px"}}>
					<div className="row">
						<div className="col-md-2 text-right">
							<h3><big><b>₹ {this.props.payment.amount}</b></big></h3>
						</div>
						<div className="col-md-2 text-right">
							<br/>
							<p>{moment(this.props.payment.added_on).format(momentDateFormat)}</p>
						</div>
						<div className="col-md-6">
							<br/>
							<p>{this.props.payment.comment}</p>
						</div>
						<div className="col-md-2">
							<br/>
							<p><PaymentStatusLabel status={this.props.payment.status}/></p>
						</div>
					</div>
				</div>
		);
	}
}

class PaymentList extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			loading: false,
			payments: [],
		};
	}

	setLoading = (loading) => {
		this.setState(oldState => {
			Object.assign({}, oldState, {
				loading
			});
		});
	}

	componentDidMount() {
		this.setLoading(true);
		findPayments().then(payments => {
			this.setState({
				payments
			});
		}).always(() => this.setLoading(false));
	}

	render(){
		let rows = this.state.payments.map(p => <PaymentRow payment={p} key={p.id}/>);
		if(rows.length > 0){
			return (
				<div>
					<h2 className="page-header">
						Your Payments
					</h2>
					{rows}
					{this.props.children}
				</div>
			);
		} else {
			return (
				<div className="jumbotron text-center">
					<h2>There are no payments here.</h2>
					<h3>Pending payments will start appearing once your reports have been accepted!</h3>
					<p>We will keep you informed when payments are approved and processed for you</p>
				</div>
			);
		}
	}
}

var mapStoreToProps = function(store){
	return {
	};
};

export default ReactRedux.connect(mapStoreToProps)(PaymentList); 
