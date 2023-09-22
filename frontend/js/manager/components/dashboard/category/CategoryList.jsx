import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";
import { Plus, Pencil, Cross, Paperclip } from "../../../../components/Icons.jsx";
import { findCategories, deleteCategory } from "../../../service/admin_dashboard.js";
import Alert from "react-s-alert";

class CategoryRow extends React.Component {
	static propTypes = {
		seq: PropTypes.number.isRequired,
		category_name: PropTypes.shape({
			id: PropTypes.number,
			name: PropTypes.string,
			overview: PropTypes.string,
			short_description: PropTypes.string,
			url_structure: PropTypes.string,
		}),
		onDelete: PropTypes.func.isRequired,
	};
	render() {
		return (
			<tr>
				<td className="text-right">{this.props.seq}</td>
				<td>{this.props.category_name.name}</td>
				<td>{this.props.category_name.url_structure}</td>
				<td>
					<span style={{ marginRight: "2rem" }}>
						<Link
							to={`/admindashboard/category/${this.props.category_name.id}/edit`}
							className="btn btn-default"><Pencil /></Link>
					</span>
					<button type="button"
						onClick={() => this.props.onDelete(this.props.category_name)}
						className="btn btn-default"><Cross /></button>
					<Link to={`/admindashboard/category/${this.props.category_name.id}/attachment`}>
						<button className="btn btn-default" style={{ marginLeft: "1rem" }}><Paperclip /></button>
					</Link>
				</td>
			</tr>
		);
	}
}

export default class CategoryList extends React.Component {
	static propTypes = {
		children: PropTypes.node,
		onChange: PropTypes.func,
		onDelete: PropTypes.func,
	};
	state = {
		category_names: [],
	};
	componentDidMount() {
		findCategories().then((category_names) => {
			this.setState({
				category_names
			});
		});
	}

	componentWillReceiveProps() {
		this.componentDidMount();
	}

	onDelete = (category) => {
		const updatedCategories = this.state.category_names.filter(
			(c) => c.id !== category.id
		);
		this.setState({
			category_names: updatedCategories
		});
		deleteCategory(category.id).then(() => {
			this.props.onChange && this.props.onChange();
			Alert.success("CATEGORY DELETED");
		}, () => {
			Alert.warning("CATEGORY CANNOT BE DELETED");
		});
	};

	render() {
		const rows = this.state.category_names.map((c, i) => <CategoryRow seq={i + 1} category_name={c} key={c.id}
			onDelete={this.onDelete}
		/>);
		return (
			<div className="panel panel-default table-responsive">
				<h3 style={{ padding: "2rem", borderBottom: "1px solid #eee" }}>
					Category Table
					<Link to="/admindashboard/category/add" className="btn btn-default pull-right"><Plus /> Add Category</Link>
				</h3>
				<div style={{ padding: "2rem" }}>
					<table className="table table-striped">
						<thead>
							<tr>
								<th className="text-right">#</th>
								<th>Category</th>
								<th>URL Structure</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{rows}
						</tbody>
					</table>
					{this.props.children}
				</div>
			</div>
		);
	}
}