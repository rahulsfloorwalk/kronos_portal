import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Text} from 'recharts';

import {demo} from '../../../config.js';

import { ThList } from '../../components/Icons.jsx';
import Loading from '../../components/Loading.jsx';
import Modal from '../../components/Modal.jsx';
import { getColor } from '../../utils.js';

import {fetchAuditCyclesTimeSeries} from '../service/audit_cycle.js';

var AuditCycleTimeSeries = React.createClass({
	getInitialState: function(){
		return {
			loading: false,
			dataPopup: false,
			labels: [],
			data: [],
			title: ""
		};
	},
	setLoading: function(loading){
		this.setState( prevState => {
			return Object.assign({}, prevState, {
				loading
			});
		});
	},
	toggleModal: function(){
		this.setState( prevState => Object.assign({}, prevState, { dataPopup: !this.state.dataPopup }));
	},
	create_structure: function(ts){
		let data = [];
		for(let i=0; i < ts.section_master.length; i++){
			let obj = {};
			obj['name'] = ts.section_master[i];
			for(let j=0; j < ts.audit_cycle_master.length; j++){
				obj[ts.audit_cycle_master[j]] = ts.values[j][i] ? ts.values[j][i].value : null;
			}
			data.push(obj);
		}
		return data;
	},
	reloadData: function(auditType){
		if(!demo){
			this.setLoading(true);
			let ts = fetchAuditCyclesTimeSeries(auditType).then((reportData) => {
				let ts_structure = this.create_structure(reportData);
				this.setState({
					reportData,
					'data': ts_structure,
					'labels': reportData.audit_cycle_master,
					'title': reportData.title
				});
			}).always( () => this.setLoading(false));
		}
	},

	componentDidMount: function(){
		//console.log("AuditCycleTimeSeries","componentDidMount");
		this.reloadData(this.props.auditType);
	},
	componentWillReceiveProps: function(nextProps){
		//console.log("AuditCycleTimeSeries","componentWillReceiveProps", nextProps.auditType);
		if( this.props.auditType !== nextProps.auditType) {
			this.reloadData(nextProps.auditType);
		}
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
		} else {
			//let colors = ["#9ED5CD", "#44A7CB", "#2E62A1", "#192574"]; // obtained from goo.gl/CKlX3T
			//let colors = ["#add8e6", "#99cfe0", "#86c5da", "#72bcd4"];
			//let colors = ["#dee8eb", "#bed1d8", "#9ebbc6", "#7ea4b3"];
			let colors = ["#4ca9d7", "#0085c6", "#005d8a", "#3C00F5"];
			let bars = [];
			for(let i=0; i < this.state.labels.length; i++){
				bars.push(<Bar key={i} barSize={30} dataKey={this.state.labels[i]} fill={colors[i]} label={v => <Text {...v} children={v.value === null ? "N/A" : v.value+"%"}/>}/>);
			}
			if (this.state.data.length <= 5){
				chart = (
					<ResponsiveContainer width="100%" aspect={3 / 1}>
				    <BarChart data={this.state.data} margin={{top: 25, right: 5, left: 5, bottom: 30}} onClick={(active)=>active&&this.toggleModal()}>
				        <YAxis label="Score" type="number" domain={[0,100]} tickFormatter={f => f + "%"}/>
				        <XAxis dataKey="name" type="category" tick={this.tickFunction} interval={0}/>
				        <Tooltip formatter={v => v === null ? "N/A" : v+"%"}/>
				        <Legend wrapperStyle={{ top: 0}} verticalAlign="top"/>
				        {bars}
				    </BarChart>
					</ResponsiveContainer>
				);
			}
			else{
				let width = (this.state.data.length*20).toString().concat("%");
				chart = (
					<div style={{ 'width': '100%', 'overflow': 'scroll'}}>
						<ResponsiveContainer width={width} height={300}>
						<BarChart layout="horizontal" data={this.state.data} margin={{top: 25, right: 5, left: 25, bottom: 30}} onClick={(active)=>active&&this.toggleModal()}>
						<YAxis label="Score" type="number" domain={[0,100]} tickFormatter={f => f + "%"}/>
						<XAxis dataKey="name" type="category" tick={this.tickFunction} interval={0}/>
						<Tooltip formatter={v => v === null ? "N/A" : v+"%"}/>
						<Legend wrapperStyle={{ top: 0}} verticalAlign="top"/>
						{bars}
						</BarChart>
						</ResponsiveContainer>
					</div>
				);
			}
		}
		return(
			<div>
			{ ! this.state.loading ? <button className="btn btn-default pull-right" onClick={this.toggleModal} title="View Data"><ThList/></button> : null }
				<h3 className="text-center">{this.state.title}</h3>
				{chart}
				{ this.state.dataPopup ?
					<Modal modalTitle="Section Improvement over time" onClose={this.toggleModal}>
						<table className="table table-striped ">
							<thead>
								<tr>
								<th>Section</th>
								{this.state.labels.map((l) => <th key={l} className="text-right">{l}</th>)}
								</tr>
							</thead>
							<tbody>
								{((reportData) => {
									let trs = [];
									for(let i=0; i < reportData.section_master.length; i++){
										let tds = [];
										tds.push(<td key={reportData.section_master[i]}>{reportData.section_master[i]}</td>);
										for(let j=0; j < reportData.audit_cycle_master.length; j++){
											if(reportData.values[j][i]){
												tds.push(<td className={"text-right "+getColor(reportData.values[j][i].color_code)} key={j+"-"+i}>{reportData.values[j][i].value}%</td>);
											} else {
												tds.push(<td className="text-right" key={j+"-"+i}></td>);
											}
										}
										trs.push(<tr key={reportData.section_master[i]}>{tds}</tr>);
									}
									return trs;
								})(this.state.reportData)}
							</tbody>
						</table>
					</Modal>
				: null }
			</div>
		);
	},
});

export default AuditCycleTimeSeries;
