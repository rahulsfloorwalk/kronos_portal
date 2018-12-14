import React, { Component } from "react";
import PropTypes from "prop-types";

import { Plus, Cross } from "../../../components/Icons.jsx";

export default class OptionBuilder extends Component{
	static propTypes = {
		question_data: PropTypes.object,
		onChange: PropTypes.func,
	};

	constructor(props){
		super(props);

		let question_data = Object.assign({}, {
			version: 1,
			options: [
				{
					sequence: 1,
					value: "Yes",
					marks: 1,
				},
				{
					sequence: 2,
					value: "No",
					marks: 0,
				},
			],
		}, props.question_data);

		this.state = {
			question_data
		};
	}

	componentDidMount(){
		this.notifyOptionsChanged();
	}

	notifyOptionsChanged = () => {
		if(this.props.onChange){
			this.props.onChange(this.state.question_data);
		}
	};

	setOptions = (newOptions) => {
		this.setState((prevState) => {
			return Object.assign({}, prevState, {
				question_data: Object.assign({}, prevState.question_data, {
					options: newOptions
				})
			});
		}, this.notifyOptionsChanged);
	};

	addOption = () => {
		let lastItem = this.state.question_data.options[this.state.question_data.options.length - 1];
		let newOptions = this.state.question_data.options.concat({
			sequence: lastItem && lastItem.sequence + 1 || 0,
			value: "",
			marks: 0,
		});
		this.setOptions(newOptions);
	};

	deleteOption = (index) => {
		let newOptions = this.state.question_data.options.filter((o,i) => i !== index);
		this.setOptions(newOptions);
	};

	setData = (index, key, data) => {
		let newOptions = this.state.question_data.options.map((o, i) => {
			if(i === index){
				o[key] = data;
			}
			return o;
		});
		this.setOptions(newOptions);
	};

	render(){
		let rows = this.state.question_data.options.map((o, i) => {
			return (
				<tr key={i}>
					<td>
						<input className="form-control" type="number" name="sequence" value={o.sequence}
							onChange={(e) => this.setData(i, e.target.name, parseInt(e.target.value))}/>
					</td>
					<td>
						<input className="form-control" type="text" name="value" value={o.value}
							onChange={(e) => this.setData(i, e.target.name, e.target.value)}/>
					</td>
					<td>
						<input className="form-control" type="number" name="marks" value={o.marks}
							onChange={(e) => this.setData(i, e.target.name, parseInt(e.target.value))}/>
					</td>
					<td>
						<button className="btn btn-default pull-right" type="button"
							onClick={() => this.deleteOption(i)}>
							<Cross/>
						</button>
					</td>
				</tr>
			);
		});

		if( rows.length === 0){
			rows.push(<tr><td colSpan={4} className="text-muted text-center">atleast one option is needed</td></tr>);
		}

		return (
			<div className="form-group">
				<table className="table">
					<colgroup>
						<col style={{width:"20%"}}/>
						<col style={{width:"50%"}}/>
						<col style={{width:"20%"}}/>
						<col style={{width:"10%"}}/>
					</colgroup>
					<thead>
						<tr>
							<th>Sequence</th>
							<th>Value</th>
							<th>Marks</th>
							<th>
								<button type="button" className="btn btn-default pull-right" onClick={this.addOption}>
									<Plus/>
								</button>
							</th>
						</tr>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>
			</div>
		);
	}
}
