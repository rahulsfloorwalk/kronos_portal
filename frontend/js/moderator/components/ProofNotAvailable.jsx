import React from "react";
import { Tasks } from "../../components/Icons.jsx";
import PropTypes from "prop-types";

export default class ProofNotAvailable extends React.Component {
	static propTypes = {
		proof_not_available: PropTypes.array.isRequired,
	};

	render() {
		return (
			<div>
				<h3 className="page-header">
					<Tasks /> Proof Not Available Details
				</h3>
				<div className="col-md-12">
					<div className="panel panel-default">
						<table className="table table-striped table-bordered">
							<thead >
								<tr className="" style={{backgroundColor:"#fafafa"}}>
									<th className="text-center">Proof Tag Name</th>
									<th className="text-center">Reason for Unavailability</th>
								</tr>
							</thead>
							<tbody>
								{this.props.proof_not_available.map((proof,index) => {
									return (
										<tr key={proof.id} style={{ backgroundColor: index % 2 === 0 ? "#ffffff" : "#fafafa", }}>
											<td className="text-center">{proof.proof_tag_name}</td>
											<td className="text-center">{proof.description}</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		);
	}
}