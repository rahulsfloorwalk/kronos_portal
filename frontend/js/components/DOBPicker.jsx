import React from 'react';

import moment from 'moment';
import { momentDateFormat }  from '../../config.js';

import FormSelect from './FormSelect.jsx';
import FormErrorList from './FormErrorList.jsx';

export default class DOBPicker extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			year: null,
			month: null,
			date: null,
		};
	}

	static defaultProps = {
		onChange: () => {},
		initialDate: null,
		disabled: false,
		errors: [],
	}

	componentDidMount(){
		if( this.props.initialDate){
			this.setState({
				date: this.props.initialDate.getDate(),
				month: this.props.initialDate.getMonth(),
				year: this.props.initialDate.getFullYear(),
			});
		}
	}

	componentWillReceiveProps(nextProps){
		if( nextProps.initialDate && nextProps.initialDate !== this.props.initialDate){
			this.setState({
				date: nextProps.initialDate.getDate(),
				month: nextProps.initialDate.getMonth(),
				year: nextProps.initialDate.getFullYear(),
			});
		}
	}

	months = {
		0: "January",
		1: "February",
		2: "March",
		3: "April",
		4: "May",
		5: "June",
		6: "July",
		7: "August",
		8: "September",
		9: "October",
		10: "November",
		11: "December",
	}

	dates = {
		0: 31,
		1: 28,
		2: 31,
		3: 30,
		4: 31,
		5: 30,
		6: 31,
		7: 31,
		8: 30,
		9: 31,
		10: 30,
		11: 31,
	}

	dateChanged = (e) => {
		this.setState({
			date: e.target.value,
		}, () => this.props.onChange(this.getSelectedDate()));
	}

	monthChanged = (e) => {
		this.setState({
			month: e.target.value
		}, () => this.props.onChange(this.getSelectedDate()));
	}

	yearChanged = (e) => {
		this.setState({
			year: e.target.value,
		}, () => this.props.onChange(this.getSelectedDate()));
	}

	isValid = () => {
		return !!this.getSelectedDate();
	}

	getSelectedDate = () => {
		if( parseInt(this.state.year) && parseInt(this.state.month) && parseInt(this.state.date)){
			let d =  moment({
				year: parseInt(this.state.year),
				month: parseInt(this.state.month),
				date: parseInt(this.state.date),
			});
			if(d.isValid()){
				return d;
			}
		} 
		return null;
	}

	render(){
		let yearOptions = [];
		for( let y = 2000; y >= 1950; y--){
			yearOptions.push(<option key={y} value={y}>{y}</option>);
		}

		let monthOptions = [];
		for( let m in this.months){
			monthOptions.push(<option key={m} value={m}>{this.months[m]}</option>);
		}

		let days = this.dates[this.state.month];
		if( parseInt(this.state.month) === 1){
			if( moment([this.state.year]).isLeapYear()){
				days = 29;
			}
		}

		let dateOptions = [];
		for( let i = 1; i <= days; i++){
			dateOptions.push(<option key={i} value={i}>{i}</option>);
		}

		return (
			<div className="form-group">
				<table>
				<tbody>
				<tr>
				<td style={{width:"30%"}}>
				<select className="form-control" value={this.state.year} onChange={this.yearChanged} disabled={this.props.disabled}>
					<option value="">Year</option>
					{yearOptions}
				</select>
				</td>
				<td style={{width:"40%"}}>
				<select className="form-control" value={this.state.month} onChange={this.monthChanged} disabled={this.props.disabled}>
					<option value="">Month</option>
					{monthOptions}
				</select>
				</td>
				<td style={{width:"30%"}}>
				<select className="form-control" value={this.state.date} onChange={this.dateChanged} disabled={this.props.disabled}>
					<option value="">Day</option>
					{dateOptions}
				</select>
				</td>
				</tr>
				</tbody>
				</table>
				<FormErrorList errors={this.props.errors}/>
			</div>
		);
	}
}


