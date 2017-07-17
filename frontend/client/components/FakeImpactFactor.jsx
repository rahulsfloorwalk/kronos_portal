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
				{name: 'Business Visibility', "June": 88},
				{name: 'WOW factor', "June": 46},
				{name: 'Brand Image', "June": 82},
				{name: 'Customer retention', "June": 60},
				{name: 'Operational smoothness', "June": 71},
				{name: 'Staff Loyalty', "June": 82}
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
		} else if(this.state.clientUser && this.state.clientUser.client.id === 9 && this.props.auditType === "WALKIN") {
			let colors = ["#4ca9d7", "#0085c6", "#005d8a"];

			chart = (
			<ResponsiveContainer width="100%" aspect={3 / 1}>
			<BarChart data={this.state.data} margin={{top: 25, right: 5, left: 5, bottom: 30}}>
			<YAxis label="Score" type="number" domain={[0,100]} tickFormatter={f => f + "%"}/>
			<XAxis dataKey="name" type="category" tick={this.tickFunction} interval={0}/>
			<Tooltip formatter={v => v === null ? "N/A" : v+"%"}/>
			<Legend wrapperStyle={{ top: 0}} verticalAlign="top"/>
			<Bar barSize={40} dataKey="June" fill="#4ca9d7" label={v => <Text {...v} children={v.value === null ? "N/A" : v.value+"%"}/>}/>
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
