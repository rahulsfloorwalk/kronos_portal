import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Text} from 'recharts';

import {demo} from '../../config.js';

import Loading from '../../js/components/Loading.jsx';

import { fetchUser } from '../service/user.js';

var FakeImpactFactor = React.createClass({
	getInitialState: function(){
		return {
			clientUser: null,
			labels: [],
			data: [
				{name: 'Business Visibility', "April 2017": 50.4, "May 2017": 53.27},
				{name: 'WOW Factor', "April 2017": 50, "May 2017": 71.53},
				{name: 'Brand Image', "April 2017": 73.67, "May 2017": 86.41},
				{name: 'Customer Retention', "April 2017": 56.54, "May 2017": 60.64},
				{name: 'Operational Smoothness', "April 2017": 68.62, "May 2017": 75},
				{name: 'Staff Loyalty', "April 2017": 52.33, "May 2017": 90.49},
			],
			data_18: [
				{name: 'WOW Factor', "August 2017": 71},
				{name: 'Customer Retention', "August 2017": 66},
				{name: 'Brand Image', "August 2017": 75},
				{name: 'Operational Smoothness', "August 2017": 70},
			],
			data_9: [
				{
					name: 'Business Visibility',
					"July 2017": 88,
					"August 2017": 94,
				},
				{
					name: 'WOW Factor',
					"July 2017": 45,
					"August 2017": 62,
				},
				{
					name: 'Brand Image',
					"July 2017": 82,
					"August 2017": 90,
				},
				{
					name: 'Customer Retention',
					"July 2017": 60,
					"August 2017": 73,
				},
				{
					name: 'Operational Smoothness',
					"July 2017": 71,
					"August 2017": 78,
				},
				{
					name: 'Code of Conduct',
					"July 2017": 82,
					"August 2017": 87,
				},
			],
		};
	},
	setLoading: function(loading){
		this.setState( prevState => {
			return Object.assign({}, prevState, {
				loading
			});
		});
	},

	componentDidMount: function(){
		this.setLoading(true);
		fetchUser().then((clientUser)=>{
			this.setState({
				clientUser
			});
		}).always(() => this.setLoading(false));
	},

	tickFunction: function( values){
		// lol hack
		let count = this.state.data && this.state.data.length > 0 ? this.state.data.length : 1;
		return (<Text {...values} width={values.width / count}>{values.payload.value}</Text>);
	},

	render : function(){
		let chart;
		if(this.state.loading){
			chart = <Loading/>;
		} else if(this.state.clientUser && this.state.clientUser.client.id === 5 && this.props.auditType === "WALKIN") {
			let colors = ["#fcf2cf", "#f6d96f", "#f0bf0f", "#907309"];
			let colors1 = ["#ffad33", "#ff9900", "#cc7a00"];
			let colors2 = ["#dc4c46", "#eb9794"];
			chart = (
			<ResponsiveContainer width="100%" aspect={3 / 1}>
			<BarChart data={this.state.data} margin={{top: 25, right: 5, left: 5, bottom: 30}}>
			<YAxis label="Score" type="number" domain={[0,100]} tickFormatter={f => f + "%"}/>
			<XAxis dataKey="name" type="category" tick={this.tickFunction} interval={0}/>
			<Tooltip formatter={v => v === null ? "N/A" : v+"%"}/>
			<Legend wrapperStyle={{ top: 0}} verticalAlign="top"/>
			<Bar barSize={40} dataKey="April 2017" fill={colors1[1]} label={v => <Text {...v} children={v.value === null ? "N/A" : v.value+"%"}/>}/>
			<Bar barSize={40} dataKey="May 2017" fill={colors1[2]} label={v => <Text {...v} children={v.value === null ? "N/A" : v.value+"%"}/>}/>
			</BarChart>
			</ResponsiveContainer>
			);
		} else if(this.state.clientUser && this.state.clientUser.client.id === 18 && this.props.auditType === "WALKIN") {
			let colors = ["#fcf2cf", "#f6d96f", "#f0bf0f", "#907309"];
			let colors1 = ["#ffad33", "#ff9900", "#cc7a00"];
			let colors2 = ["#dc4c46", "#eb9794"];
			chart = (
			<ResponsiveContainer width="100%" aspect={3 / 1}>
			<BarChart data={this.state.data_18} margin={{top: 25, right: 5, left: 5, bottom: 30}}>
			<YAxis label="Score" type="number" domain={[0,100]} tickFormatter={f => f + "%"}/>
			<XAxis dataKey="name" type="category" tick={this.tickFunction} interval={0}/>
			<Tooltip formatter={v => v === null ? "N/A" : v+"%"}/>
			<Legend wrapperStyle={{ top: 0}} verticalAlign="top"/>
			<Bar barSize={40} dataKey="August 2017" fill={colors1[1]} label={v => <Text {...v} children={v.value === null ? "N/A" : v.value+"%"}/>}/>
			</BarChart>
			</ResponsiveContainer>
			);
		} else if(this.state.clientUser && this.state.clientUser.client.id === 9 && this.props.auditType === "WALKIN") {
			let colors = ["#fcf2cf", "#f6d96f", "#f0bf0f", "#907309"];
			let colors1 = ["#ffad33", "#ff9900", "#cc7a00"];
			let colors2 = ["#dc4c46", "#eb9794"];
			chart = (
			<ResponsiveContainer width="100%" aspect={3 / 1}>
			<BarChart data={this.state.data_9} margin={{top: 25, right: 5, left: 5, bottom: 30}}>
			<YAxis label="Score" type="number" domain={[0,100]} tickFormatter={f => f + "%"}/>
			<XAxis dataKey="name" type="category" tick={this.tickFunction} interval={0}/>
			<Tooltip formatter={v => v === null ? "N/A" : v+"%"}/>
			<Legend wrapperStyle={{ top: 0}} verticalAlign="top"/>
			<Bar barSize={40} dataKey="July 2017" fill={colors1[1]} label={v => <Text {...v} children={v.value === null ? "N/A" : v.value+"%"}/>}/>
			<Bar barSize={40} dataKey="August 2017" fill={colors1[2]} label={v => <Text {...v} children={v.value === null ? "N/A" : v.value+"%"}/>}/>
			</BarChart>
			</ResponsiveContainer>
			);
		} else {
			return null;
		}
		return(
			<div>
				<h3 className="text-center">Impact Factor Analysis</h3>
				{chart}
			</div>
		);
	},
});

export default FakeImpactFactor;
