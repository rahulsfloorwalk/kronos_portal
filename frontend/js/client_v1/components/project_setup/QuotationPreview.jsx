import React, {Component} from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { hashHistory, Link } from "react-router";
import Alert from "react-s-alert";

import Loading from "../../../components/Loading.jsx";

class QuotationPreview extends Component{
	static propTypes = {
		clientId: PropTypes.number,
		quotation: PropTypes.object,
		dispatch: PropTypes.func,
	};

	state = {
		loading: false,
		quotation: {
			industry: {},
			problem_statement: {},
			sample_questionnaire_type: {},
		},
	};

	componentDidMount(){
		if(this.props.clientId && this.props.quotation){
			if(this.props.quotation.status == "PENDING"){
				Alert.warning("Please make payment for quotation");
				hashHistory.replace("/project_setup/quotation");
			}
			this.setState({quotation: this.props.quotation});
		}
	}

	componentWillReceiveProps(ownProps){
		if(Object.keys(ownProps.quotation).length > 0){
			if(ownProps.quotation.status == "PENDING"){
				Alert.warning("Please make payment for quotation");
				hashHistory.replace("/project_setup/quotation");
			}
			this.setState({quotation: ownProps.quotation});
		}
	}

	setLoading = (loading) => this.setState(prevState => Object.assign({}, prevState, { loading }));

	render(){
		let loadingNode = (
			<div className="panel panel-default">
				<div className="panel-heading"><b>Quotation preview</b></div>
				<div className="panel-body">
					<Loading />
				</div>
			</div>
		);
		if(this.state.loading == true){
			return loadingNode;
		}
		else if(this.state.quotation == {}){
			return loadingNode;
		}

		let {industry, problem_statement, sample_questionnaire_type, audit_locations, amount, gst_amount, gst, discount, payable_amount} = this.state.quotation;

		let audit_location_options = [];
		if(audit_locations){
			for(let location of audit_locations){
				audit_location_options.push(
					<tr key={location.id}>
						<td className="text-center">
							{location.city.name}
						</td>
						<td className="text-center">
							{location.count}
						</td>
						<td className="text-center">
							{location.audit_fee}
						</td>
					</tr>);
			}
		}
		return(
			<div className="panel panel-default">
				<div className="panel-heading"><b>Quotation preview</b></div>
				<div className="panel-body">
					<table className="table table-bordered table-responsive">
						<thead>
							<tr>
								<th className="text-center">
									Industry category
								</th>
								<th className="text-center">
									Audit category
								</th>
								<th className="text-center">
									Audit type
								</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td className="text-center">
									{industry.name}
								</td>
								<td className="text-center">
									{problem_statement.name}
								</td>
								<td className="text-center">
									{sample_questionnaire_type.name}
								</td>
							</tr>
						</tbody>
					</table>
					<table className="table table-bordered table-responsive">
						<thead>
							<tr>
								<th className="text-center">
									City
								</th>
								<th className="text-center">
									Audit Count
								</th>
								<th className="text-center">
									Audit Fee
								</th>
							</tr>
						</thead>
						<tbody>
							{audit_location_options}
							<tr>
								<th colSpan={2} className="text-right">
									Total
								</th>
								<td className="text-center">
									{amount}
								</td>
							</tr>
							<tr>
								<th colSpan={2} className="text-right">
									GST({gst}%)
								</th>
								<td className="text-center">
									{gst_amount}
								</td>
							</tr>
							{discount ?
								<tr>
									<th colSpan={2} className="text-right">
										Discount
									</th>
									<td className="text-center">
										{discount}
									</td>
								</tr>
								: null}
							<tr>
								<th colSpan={2} className="text-right">
									Payable amount
								</th>
								<td className="text-center">
									{payable_amount}
								</td>
							</tr>
						</tbody>
					</table>
					<div className="col-md-12 text-center">
						<Link to="/project_setup/store" className="btn btn-primary">Next</Link>
					</div>
				</div>
			</div>
		);
	}
}

var mapStoreToProps = function(store){
	return {
		clientId: store.client.id,
		quotation: store.quotation || {},
	};
};

export default connect(mapStoreToProps)(QuotationPreview);