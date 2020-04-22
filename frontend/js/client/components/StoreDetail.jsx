import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";

import { fetchStore } from "../service/store.js";
import { fetchQuestionnaireTypesForProofComparison } from "../service/questionnaire_type.js";

import { File, Stats } from "../../components/Icons.jsx";
import Loading from "../../components/Loading.jsx";
import NavLink from "../../components/NavLink.jsx";
import { getColor } from "../../utils.js";

export default class StoreDetail extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			storeId: PropTypes.oneOfType([PropTypes.number,PropTypes.string])
		}),
		children: PropTypes.node,
	};

	state = {
		questionnaireTypes: []
	};

	componentDidMount() {
		fetchStore(this.props.params.storeId).then((store) => {
			this.setState({
				store
			});
		});
		fetchQuestionnaireTypesForProofComparison(this.props.params.storeId).then((questionnaireTypes) =>{
			this.setState({
				questionnaireTypes
			});
		});
	}

	render() {
		if(! this.state.store){
			return <Loading/>;
		}
		let proof_comparison_menu;
		if(this.state.questionnaireTypes.length > 0){
			proof_comparison_menu = (<NavLink to={`/store/${this.props.params.storeId}/proof_comparison`}><File/> Proof Comparison</NavLink>);
		}
		return (
			<div>
				<ol className="breadcrumb">
					<li><Link to="/store">Stores</Link></li>
					<li className="active">{this.state.store.name}</li>
				</ol>
				{/*<h2 className="page-header"> { this.state.store.name } </h2>*/}
				<div className="row">
					<div className="col-md-12">
						<div className="panel panel-default">
							<table className="table table-striped table-bordered">
								<tbody>
									<tr>
										{ this.state.store.code ? <td className="">Code</td> : null }
										<td className="">Name</td>
										{ this.state.store.type ? <td className="">Type</td> : null }
										{ this.state.store.priority ? <td className="">Priority</td> : null }
										<td className="">Address</td>
										<td className="">City</td>
										<td className="">Total Score Till Date</td>
									</tr>
									<tr>
										{ this.state.store.code ? <td><b>{ this.state.store.code }</b></td> : null }
										<td><b>{ this.state.store.name }</b></td>
										{ this.state.store.type ? <td><b>{ this.state.store.type }</b></td> : null }
										{ this.state.store.priority ? <td><b>{ this.state.store.priority }</b></td> : null }
										<td><b>{ this.state.store.address }</b></td>
										<td><b>{ this.state.store.city.name }</b></td>
										<td className={getColor(this.state.store.get_total_percentage.color)}><b>{this.state.store.get_total_percentage.score === null ? "N/A" : this.state.store.get_total_percentage.score+"%"}</b></td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
				<ul className="nav nav-tabs">
					<NavLink to={`/store/${this.props.params.storeId}/trends`}><Stats/> Trends</NavLink>
					<NavLink to={`/store/${this.props.params.storeId}/reports`}><File/> Reports</NavLink>
					{proof_comparison_menu}
				</ul>
				{this.props.children}
			</div>
		);
	}
}
