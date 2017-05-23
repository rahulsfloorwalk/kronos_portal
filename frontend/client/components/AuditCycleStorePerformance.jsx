import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';
import {demo} from '../../config.js';
import {fetchAuditCycleStorePerformance} from '../service/audit_cycle.js';

var AuditCycleStorePerformance = React.createClass({
	getInitialState: function(){
		return null;
	},
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
	create_bars: function(){

    let colors = ["#005d8a", "#0085c6", "#4ca9d7"];
    if (this.state.type === "best"){
      colors = ["#99B864", "#81AA40", "#688833"];
    }
    else if (this.state.type === "worst"){
      colors = ["#D94E47", "#D0231A", "#A61C14"];
    }
		let bar_arr = []
		for(let i=0; i < this.state.labels.length; i++){
			bar_arr.push(<Bar key={i} dataKey={this.state.labels[i]} barSize={20} fill={colors[i]} label/>);
		}
		this.setState({
			'bars': bar_arr,
		});
	},

	reloadData: function(auditType){
		if(!demo){
			let ts = fetchAuditCycleStorePerformance(this.props.auditType).then((reportData) => {
				let ts_structure = this.create_structure(reportData);
				this.setState({
					'data': ts_structure,
					'labels': reportData.columns.reverse(),
					'title': this.props.title,
					'type': this.props.type
				});
				this.create_bars();
			});
		}
	},

	componentDidMount: function(){
		this.reloadData(this.props.auditType);
	},
	componentWillReceiveProps: function(nextProps){
		this.reloadData(nextProps.auditType);
	},

	render : function(){
    const data = [
      {name: 'Welcome & Reception', January: 40, February: 60, March: 70},
      {name: 'Need Analysis', January: 45, February: 40, March: 50, April: 22},
      {name: 'Presentation', January: 60, February: 70, March: 75, April: 29},
      {name: 'Test Drive', January: 70, February: 75, March: 75, April: 20},
      {name: 'Negotiation & Follow up', January: 60, February: 50, March: 70, April: 21},
      {name: 'Facility', January: 30, February: 60, March: 70, April: 25},
      {name: 'Visit Confirmation', January: 50, February: 60, March: 65, April: 21},
    ];
    if (demo){
			console.log('Rendering demo data')
  		return(
  			<div className="container">
  				<div className="row">
  					<br/>
  					<br/>
  					<div className="col-md-12">
            <h1>Q4 - Audit cycle summary</h1>
            <br/>
  					<BarChart width={1000} height={300} data={data} margin={{top: 25, right: 30, left: 20, bottom: 5}}>
  						<XAxis dataKey="name"/>
  						<YAxis/>
  						<Tooltip/>
  						<Legend />
  						<Bar dataKey="January" fill="#4ca9d7" label/>
  						<Bar dataKey="February" fill="#0085c6" label/>
              <Bar dataKey="March" fill="#005d8a" label/>
  					</BarChart>
  					</div>
  				</div>
  			</div>
  		);
    }
    else if (this.state != null){
	console.log('Rendering real store performance data');
	return(
	<div>
		<h3 className="text-center">{this.state.title}</h3>
		<ResponsiveContainer width="100%" aspect={3 / 1}>
		<BarChart width={600} height={300} data={this.state.data} margin={{top: 25, right: 10, left: 10, bottom: 5}}>
			<XAxis dataKey="name"/>
			<YAxis label="Score" domain={[0,100]} tickFormatter={f => f + "%"}/>
			<Tooltip formatter={v => v+"%"}/>
			<Legend />
			{this.state.bars}
		</BarChart>
		</ResponsiveContainer>
	</div>
	);
	}
		else{
			console.debug('demo is false and no data available. hence chart not rendering')
      return null;
		}
	},
});

export default AuditCycleStorePerformance;
