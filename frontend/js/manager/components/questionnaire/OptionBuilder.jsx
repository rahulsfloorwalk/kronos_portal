import React, { Component } from "react";
import PropTypes from "prop-types";

import { Plus, Cross } from "../../../components/Icons.jsx";

export default class OptionBuilder extends Component{
	static propTypes = {
		options: PropTypes.arrayOf(PropTypes.shape({
			sequence: PropTypes.number,
			value: PropTypes.string,
			marks: PropTypes.number,
		})),
		onChange: PropTypes.func.isRequired,
	};

	static defaultOptions = [
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
	];

	constructor(props){
		super(props);

		this.state = {
			options: props.options.length > 0 ? props.options : OptionBuilder.defaultOptions,
		};
	}

	componentDidMount(){
		this.notifyOptionsChanged();
	}

	notifyOptionsChanged = () => {
		this.props.onChange(this.state.options);
	};

	setOptions = (newOptions) => {
		this.setState((prevState) => {
			return Object.assign({}, prevState, {
				options: newOptions,
			});
		}, this.notifyOptionsChanged);
	};

	addOption = () => {
		const lastItem = this.state.options[this.state.options.length - 1];
		this.setOptions([...this.state.options, {
			sequence: lastItem && lastItem.sequence + 1 || 0,
			value: "",
			marks: 0,
		}]);
	};

	deleteOption = (index) => {
		this.setOptions(this.state.options.filter((o,i) => i !== index));
	};

	setData = (index, key, data) => {
		this.setOptions(this.state.options.map((o, i) => {
			if(i === index){
				o[key] = data;
			}
			return o;
		}));
	};

	render(){
		const rows = this.state.options.map((o, i) => {
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
			rows.push(<tr key="empty"><td colSpan={4} className="text-muted text-center">atleast one option is needed</td></tr>);
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
