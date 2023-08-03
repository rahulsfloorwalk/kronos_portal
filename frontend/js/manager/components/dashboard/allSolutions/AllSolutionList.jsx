import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";
import { Plus, Pencil, Cross, Paperclip,Star } from "../../../../components/Icons.jsx";
import { findSolutions, deleteSolution, updateSolutionIsActive,updateSolutionIsPopular } from "../../../service/admin_dashboard.js";
import Alert from "react-s-alert";

const FieldErrors = PropTypes.arrayOf(PropTypes.string);
class AllSolutionRow extends React.Component {
	static propTypes = {
		seq: PropTypes.number.isRequired,
		solution: PropTypes.shape({
			id: PropTypes.number,
			name: PropTypes.string,
			url_structure: PropTypes.string,
			price: PropTypes.number,
			overview: PropTypes.string,
			how_it_work: PropTypes.string,
			execution_time: PropTypes.string,
			short_description: PropTypes.string,
			is_active: PropTypes.bool,
			is_popular: PropTypes.bool,
			categories: PropTypes.arrayOf(
				PropTypes.shape({
					value: PropTypes.number,
					label: PropTypes.string,
					name: PropTypes.string,
				})
			),
			tax: PropTypes.object,
		}),
		onDelete: PropTypes.func.isRequired,
		toggleIsActive: PropTypes.func.isRequired,
		toggleIsPopular: PropTypes.func.isRequired,
		errors: PropTypes.shape({
			non_field_errors: PropTypes.arrayOf(PropTypes.string),
			category: FieldErrors,
			tax: FieldErrors,
		}),
	};
	render() {
		const categoryNames = this.props.solution.categories ? this.props.solution.categories.map((category) => category.name).join(", ") : "" ;
		const starClass = this.props.solution.is_popular ? "gold" : "black";
		return (
			<tr>
				<td className="text-right">{this.props.seq}</td>
				<td>{this.props.solution.name}</td>
				<td>{categoryNames}</td>
				<td>{this.props.solution.price}</td>
				<td>
					<span >
						<Link
							to={`/admindashboard/solution/${this.props.solution.id}/edit`}
							className="btn btn-default"><Pencil /></Link>
					</span>
					<button type="button"
						style={{ marginLeft: "1rem" }}
						onClick={() => this.props.onDelete(this.props.solution)}
						className="btn btn-default"><Cross />
					</button>
				</td>
				<td>
					<button
						onClick={() => this.props.toggleIsActive(this.props.solution)}
						className="btn btn-default"
					>
							Archive
					</button>
					<Link to={`/admindashboard/solution/${this.props.solution.id}/question`}>
						<button  className="btn btn-default" style={{marginLeft:"1rem"}}>Question</button>
					</Link>
					<Link to={`/admindashboard/solution/${this.props.solution.id}/details`}>
						<button className="btn btn-default" style={{marginLeft:"1rem"}}>Details</button>
					</Link>
					<Link to={`/admindashboard/solution/${this.props.solution.id}/prooftags`}>
						<button className="btn btn-default" style={{marginLeft:"1rem"}}>Proof tag</button>
					</Link>
					<Link to={`/admindashboard/solution/${this.props.solution.id}/attachment`}>
						<button className="btn btn-default" style={{marginLeft:"1rem"}} title="attachment"><Paperclip/></button>
					</Link>
					<button
						onClick={() => this.props.toggleIsPopular(this.props.solution)}
						className={`btn btn-default ${starClass}`}
						style={{marginLeft:"1rem",outline:"none"}}
						title="Popular"
					>
						<Star/>
					</button>
				</td>
			</tr>
		);
	}
}


export default class AllSolutionList extends React.Component {
	static propTypes = {
		children: PropTypes.node,
		onChange: PropTypes.func,
	};
	state = {
		solutions: [],
	};
	componentDidMount() {
		findSolutions().then((solutions) => {
			this.setState({
				solutions
			});
		});
	}
	componentWillReceiveProps() {
		this.componentDidMount();
	}

	onDelete = (solution) => {
		const updatedSolutions = this.state.solutions.filter(
			(c) => c.id !== solution.id
		);
		this.setState({
			solutions: updatedSolutions
		});
		deleteSolution(solution.id).then(() => {
			this.props.onChange && this.props.onChange();
			Alert.success("SOLUTION DELETED");
		}, () => {
			Alert.warning("SOLUTION CANNOT BE DELETED");
		});
	};
	toggleIsActive = (solution) => {
		const updatedSolution = { ...solution, is_active: false }; // Set is_active to false
		const updatedSolutions = this.state.solutions.map((c) =>
			c.id === solution.id ? updatedSolution : c
		);

		this.setState({
			solutions: updatedSolutions,
		});

		updateSolutionIsActive(solution.id, updatedSolution)
			.then(() => {
				Alert.success("Solution is now Archived");
			})
			.catch(() => {
				Alert.error("Failed to Archive Solution");
			});
	};
	toggleIsPopular = (solution) => {
		const isPopularValue = !solution.is_popular;
		const updatedSolution = { ...solution, is_popular: isPopularValue };
		const updatedSolutions = this.state.solutions.map((c) =>
			c.id === solution.id ? updatedSolution : c
		);
		this.setState({
			solutions: updatedSolutions,
		});
		updateSolutionIsPopular(solution.id, updatedSolution)
			.then(() => {
				Alert.success("Solution is now " + (isPopularValue ? "Stared" : "Unstared"));
			})
			.catch(() => {
				Alert.error("Failed to " + (isPopularValue ? "Star" : "Unstar") + " Solution");
			});
	};
	render() {
		const activeSolutions = this.state.solutions.filter(
			(solution) => solution.is_active
		);

		const rows = activeSolutions.map((c, i) => (
			<AllSolutionRow
				seq={i + 1}
				solution={c}
				key={c.id}
				onDelete={this.onDelete}
				toggleIsActive={this.toggleIsActive}
				toggleIsPopular={this.toggleIsPopular}
			/>
		));

		return (
			<div className="panel panel-default table-responsive">
				<h3 style={{ padding: "2rem", borderBottom: "1px solid #eee" }}>
Solution Table
					<Link
						to="/admindashboard/solution/add"
						className="btn btn-default pull-right"
					>
						<Plus /> Add Solution
					</Link>
				</h3>

				<div style={{ padding: "2rem" }}>
					<table className="table table-striped report_scroll">
						<thead>
							<tr>
								<th className="text-right">#</th>
								<th>Solution Name</th>
								<th>Category</th>
								<th>Price</th>
								<th>Action</th>
								<th>Others</th>
							</tr>
						</thead>
						<tbody>{rows}</tbody>
					</table>
					{this.props.children}
				</div>
			</div>
		);
	}
}