import React from "react";
import PropTypes from "prop-types";

import Loading from "../../../components/Loading.jsx";
import Jumbotron from "../../../components/Jumbotron.jsx";
import { findTrainerSummary } from "../../service/trainer.js";


export class TrainerSummary extends React.Component {
	static propTypes = {
		children: PropTypes.node,
	};


	state = {
		trainers: [],
		isLoading: true,
	};

	componentDidMount() {
		findTrainerSummary().then((trainers) => {
			this.setState({
				trainers
			});
		}).always(() => this.setState({ isLoading: false }));
	}


	render() {

		if (this.state.isLoading) {
			return <Loading />;
		}

		const rightAlign = {
			textAlign: "right",
		};

		const rows = [];

		for (const trainer of this.state.trainers) {
			rows.push(<tr key={trainer.id}>
				<td style={rightAlign}>{trainer.name}</td>
				<td style={rightAlign}>{trainer.email}</td>
				<td style={rightAlign}>{trainer.total_audit_count}</td>
				<td style={rightAlign}>{trainer.total_report_count}</td>
			</tr>);
		}
		if (rows.length === 0) {
			return (<div>
				&nbsp;
				<Jumbotron key="empty" heading="No Data here" para="assign a report to a Trainer to make it visible here" />
			</div>);
		}


		return (<div className="table-responsive">
			&nbsp;
			<table className="table table-bordered table-striped">
				<thead>
					<tr>
						<th className="text-right">Trainer</th>
						<th className="text-right">Trainer Email</th>
						<th className="text-right">Total Audit Count</th>
						<th className="text-right">Total Report Count</th>
					</tr>
				</thead>
				<tbody>
					{rows}
				</tbody>
			</table>
			{this.props.children}
		</div>);
	}
}


export default TrainerSummary;