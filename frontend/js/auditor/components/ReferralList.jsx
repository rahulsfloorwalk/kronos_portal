import React from 'react';
import { Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';
import Loading from '../../components/Loading.jsx';
import { findReferrals } from '../service/referral.js';
import ReferralTypeLabel from '../../components/ReferralTypeLabel.jsx';

class ReferralRow extends React.Component{

	render(){
		return (
				<div className="panel panel-default" style={{minHeight:"75px"}}>
					<div className="row">
						<div className="col-md-2 text-right">
							<h3><big><b>₹ {this.props.referral.amount}</b></big></h3>
						</div>
						<div className="col-md-2 text-right">
							<br/>
							<p>{moment(this.props.referral.added_on).format(momentDateFormat)}</p>
						</div>
						<div className="col-md-6">
							<br/>
							<p>{this.props.referral.comment}</p>
						</div>
			{/*<div className="col-md-2">
							<br/>
              <p><ReferralTypeLabel type={this.props.referral.type}/></p>
						</div>*/}
					</div>
				</div>
		);
	}
}

class ReferralList extends React.Component{

	constructor(props){
		super(props);
		this.state = {
      pending: 0,
			referrals: [],
      loading: false
		};
	}

	componentDidMount() {
    this.setLoading(true);
		findReferrals().then(referrals => {
      let pending = this.calculatePending(referrals);
			this.setState({
				referrals: referrals,
        pending: pending
			});
		}).always(() => this.setLoading(false));
	}

  calculatePending = (referrals) => {
    return referrals.reduce((sum, r) => sum += r.amount, 0);
  }

  setLoading = (loading) => {
		this.setState(oldState => {
			Object.assign({}, oldState, {
				loading
			});
		});
	}

	render(){
    if(this.state.loading){
			return <Loading/>;
		}
		let rows = this.state.referrals.map(r => <ReferralRow referral={r} key={r.id}/>);
		if(rows.length > 0){
			return (
				<div>
					<h2 className="page-header">
						<span>Referral Payments</span>
            <span className="pull-right"><big><b>₹ {this.state.pending}</b> pending</big></span>
					</h2>
					{rows}
					{this.props.children}
				</div>
			);
		} else {
			return (
				<div className="jumbotron text-center">
					<h2>You have not referred anyone yet</h2>
					<h3>Referral payments will start appearing after an email is verified or an audit is completed</h3>
					<p className="text-muted">We will keep you informed when payments are approved and processed for you</p>
				</div>
			);
		}
	}
}

export default ReferralList;
