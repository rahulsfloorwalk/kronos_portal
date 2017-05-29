import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';

import {demo} from '../../config.js';

import {fetchCityWisePerformance} from '../service/dashboard.js';

import Loading from '../../js/components/Loading.jsx';

var CityWisePerformanceChart = React.createClass({
	create_structure: function(input_data){
    let data_arr = input_data.data;
    let label_arr = input_data.columns
    if(this.props.type === "worst"){
      data_arr.reverse();
    }
		let data = [];
    let size = Math.min(5, data_arr.length);
		for(let i=0; i < size; i++){
			let obj = {};
			obj['name'] = data_arr[i][0].name;
			for(let j=0; j < label_arr.length; j++){
				obj[label_arr[j]] = data_arr[i][1][j];
			}
			data.push(obj);
		}
		return data;
	},

	render : function(){
		let colors = ["#005d8a", "#0085c6", "#4ca9d7"];
		if (this.props.type === "best"){
			colors = ["#688833", "#30AD23", "#11772D"];
		}
		else if (this.props.type === "worst"){
			colors = ["#D94E47", "#D0231A", "#A61C14"];
		}
		let bars = [];

		let labels = this.props.reportData.columns;
		for(let i=0; i < labels.length; i++){
			bars.push(<Bar key={i} dataKey={labels[i]} barSize={20} fill={colors[i]} label/>);
		}

		let data = this.create_structure(this.props.reportData);

		let chart = (
		<ResponsiveContainer width="100%" aspect={3 / 1}>
		<BarChart width={600} height={300} data={data} margin={{top: 25, right: 10, left: 10, bottom: 5}}>
		<XAxis dataKey="name"/>
		<YAxis label="Score" domain={[0,100]} tickFormatter={f => f + "%"}/>
		<Tooltip formatter={v => v+"%"}/>
		<Legend />
		{bars}
		</BarChart>
		</ResponsiveContainer>
		);
		return(
			<div>
			<h3 className="text-center">{this.props.title}</h3>
			{chart}
			</div>
		);
	}
});

let CityWisePerformanceChartWrapper = React.createClass({
	getInitialState: function(){
		return {
			loading: false,
			reportData: null,
		};
	},
	setLoading: function(loading){
		this.setState( prevState => {
			return Object.assign({}, prevState, {
				loading
			});
		});
	},
	reloadData: function(auditType){
		if(!demo){
			this.setLoading(true);
			let ts = fetchCityWisePerformance(this.props.auditType).then((reportData) => {
				this.setState({
					'reportData': reportData
				});
			}).always(() => this.setLoading(false));
		}
	},
	componentDidMount: function(){
		//console.debug("AuditCycleStorePerformance","componentDidMount");
		this.reloadData(this.props.auditType);
	},
	componentWillReceiveProps: function(nextProps){
		//console.debug("AuditCycleStorePerformance","componentWillReceiveProps", nextProps.auditType);
		this.reloadData(nextProps.auditType);
	},
	render: function(){
		if(this.state.loading || ! this.state.reportData ){
			return <Loading/>;
		} else if(this.state.reportData.data.length > 10) {
			return (
			<div className="row">
				<div className="col-md-6">
					<CityWisePerformanceChart title="Best Performing Cities" type="best" reportData={this.state.reportData}/>
				</div>
				<div className="col-md-6">
					<CityWisePerformanceChart title="Worst Performing Cities" type="worst" reportData={this.state.reportData}/>
				</div>
			</div>
			);
		} else {
			return (
			<CityWisePerformanceChart title="City Wise Performance" type="best" reportData={this.state.reportData}/>
			);
		}
	}
});

export default CityWisePerformanceChartWrapper;
