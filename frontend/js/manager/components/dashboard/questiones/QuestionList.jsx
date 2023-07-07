import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";
import { Plus, Cross } from "../../../../components/Icons.jsx";
import { findSolutionById } from "../../../service/admin_dashboard.js";

// class DashQuestionRow extends React.Component {
// 	static propTypes = {
// 		 seq: PropTypes.number.isRequired,
// 		question: PropTypes.shape({
// 			id: PropTypes.number,
// 			question_txt: PropTypes.string,
// 			sequence : PropTypes.number,
// 			max_marks: PropTypes.number,
// 			question_type : PropTypes.string,
// 			comment_required :PropTypes.string,
// 		}),
// 	};
// 	render() {
// 		return (
// 			<tr>
// 				{/* <td className="text-right">{this.props.seq}</td>
// 				<td>{this.props.category_name.name}</td>
// 				<td>
// 				<span style={{marginRight:"2rem"}}>
// 					<Link
// 						to={`/admindashboard/category/${this.props.category_name.id}/edit`}
// 						className="btn btn-default"><Pencil /></Link>
// 			   </span>
// 					<button type="button"
// 						onClick={() => this.props.onDelete(this.props.category_name)}
// 						className="btn btn-default"><Cross /></button>
// 				</td> */}
// 			</tr>
// 		);
// 	}
// }
export default class QuestionList extends React.Component {
	static propTypes = {
		params: PropTypes.shape({
			solutionId: PropTypes.string.isRequired,
		}).isRequired,
		children: PropTypes.node,
	};
	state = {
		loading: false,
		solution:{},
		errors: {
		}
	};
	setLoading = (loadingState) => {
		this.setState((prevState) => {
			return Object.assign({}, prevState, {
				loading: loadingState
			});
		});
	};
	componentDidMount() {
		if (this.props.params.solutionId) {
			this.setLoading(true);
			findSolutionById(this.props.params.solutionId).then((solution) => {
				this.setState({
					solution: Object.assign({}, solution)
				});
			}).always(() => this.setLoading(false));
		}
	}

	// componentWillReceiveProps() {
	//     this.componentDidMount();
	// }

	// onDelete = (category) => {
	//     const updatedCategories = this.state.category_names.filter(
	//         (c) => c.id !== category.id
	//     );
	//     this.setState({
	//         category_names: updatedCategories
	//     });
	//     deleteCategory(category.id).then(() => {
	//         this.props.onChange && this.props.onChange();
	//         Alert.success("CATEGORY DELETED");
	//     }, () => {
	//         Alert.warning("CATEGORY CANNOT BE DELETED");
	//     });
	// };

	render() {
		// const rows = this.state.category_names.map((c, i) => <CategoryRow seq={i + 1} category_name={c} key={c.id}
		//     onDelete={this.onDelete}
		// />);
		return (
			<div className="panel panel-default table-responsive">
				<div style={{display:"flex",justifyContent:"flex-end",padding:"1rem 1rem 0rem 0rem"}}>
					<Link to="/admindashboard/solution">   <Cross/></Link>
				</div>
				<h3 style={{ padding: "2rem",paddingTop:"1rem", borderBottom: "1px solid #eee" }}>
Question Table for <b>{this.state.solution.name}</b>
					<Link to={`/admindashboard/solution/${this.props.params.solutionId}/question/add`} className="btn btn-default pull-right"><Plus /> Add Question</Link>
				</h3>
				<div style={{ padding: "2rem" }}>
					<table className="table table-striped">
						<thead>
							<tr>
								<th className="text-right">#</th>
								<th>Question</th>
								<th>Max. Marks</th>
								<th>Question Type</th>
								<th>Comment Required</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{/* {rows} */}
						</tbody>
					</table>
					{this.props.children}
				</div>
			</div>
		);
	}
}
