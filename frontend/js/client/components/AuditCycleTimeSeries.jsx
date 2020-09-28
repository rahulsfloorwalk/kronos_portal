import React from "react";
import PropTypes from "prop-types";
// import { ResponsiveContainer, BarChart, CartesianGrid, Bar, Cell, XAxis, YAxis, Tooltip, Legend, Text, Label, LineChart, Line} from "recharts";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Text, Label} from "recharts";

import {demo} from "../../../config.js";

import { ThList } from "../../components/Icons.jsx";
import Loading from "../../components/Loading.jsx";
import Modal from "../../components/Modal.jsx";
// import { getColor, getColorbyValue  } from "../../utils.js";
import { getColorbyValue  } from "../../utils.js";

// import {fetchAuditCyclesTimeSeries} from "../service/dashboard.js";
import {fetchAuditCyclesTimeSeriesByAuditCycleId} from "../service/dashboard.js";

export default class AuditCycleTimeSeries extends React.Component{
	static propTypes = {
		questionnaireType: PropTypes.shape({
			id: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
			is_default: PropTypes.bool.isRequired,
			client_id: PropTypes.number.isRequired,
		}).isRequired,
		auditCycle: PropTypes.shape({
			id: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
			start_date: PropTypes.string.isRequired,
			end_date: PropTypes.string.isRequired,
		}).isRequired,
	};

	state = {
		loading: false,
		dataPopup: false,
		labels: [],
		data: [],
		title: ""
	};

	setLoading = (loading) => {
		this.setState( prevState => {
			return Object.assign({}, prevState, {
				loading
			});
		});
	};

	toggleModal = () => {
		this.setState( prevState => Object.assign({}, prevState, { dataPopup: !this.state.dataPopup }));
	};

	create_structure = (ts) => {
		let data = [];
		// for(let i=0; i < ts.section_master.length; i++){
		// 	let obj = {};
		// 	obj["name"] = ts.section_master[i];
		// 	for(let j=0; j < ts.audit_cycle_master.length; j++){
		// 		obj[ts.audit_cycle_master[j]] = ts.values[j][i] ? ts.values[j][i].value : null;
		// 	}
		// 	data.push(obj);
		// }

		for(let i=0; i < ts.section_master.length; i++){
			let obj = {};
			obj["name"] = ts.section_master[i];
			// obj["Section Score"] = ts.values[0][i].value;
			obj["Section Score"] = ts.values[0][i] ? ts.values[0][i].value : null;
			data.push(obj);
		}
		return data;
	};

	reloadData = (questionnaireTypeId, auditCycleId) => {
		if(!demo){
			this.setLoading(true);
			fetchAuditCyclesTimeSeriesByAuditCycleId(questionnaireTypeId, auditCycleId).then((reportData) => {
				let ts_structure = this.create_structure(reportData);
				this.setState({
					reportData,
					"data": ts_structure,
					"labels": reportData.audit_cycle_master,
					"title": reportData.title
				});
			}).always( () => this.setLoading(false));
		}
	};

	componentDidMount(){
		//console.log("AuditCycleTimeSeries","componentDidMount");
		this.reloadData(this.props.questionnaireType.id, this.props.auditCycle.id);
	}

	componentWillReceiveProps(nextProps){
		//console.log("AuditCycleTimeSeries","componentWillReceiveProps", nextProps.questionnaireType);
		if(this.props.auditCycle !== nextProps.auditCycle) {
			this.reloadData(nextProps.questionnaireType.id, nextProps.auditCycle.id);
		}
		if( this.props.questionnaireType !== nextProps.questionnaireType) {
			this.reloadData(nextProps.questionnaireType.id, nextProps.auditCycle.id);
		}
	}

	tickFunction = ( values) => {
		// lol hack
		let count = this.state.data && this.state.data.length > 0 ? this.state.data.length : 1;
		return (<Text {...values} width={values.width / count}>{values.payload.value}</Text>);
	};

	render(){
		// let chart;
		let line_chart;
		if(this.state.loading){
			line_chart = <Loading/>;
		} else {
			//let colors = ["#9ED5CD", "#44A7CB", "#2E62A1", "#192574"]; // obtained from goo.gl/CKlX3T
			//let colors = ["#add8e6", "#99cfe0", "#86c5da", "#72bcd4"];
			//let colors = ["#dee8eb", "#bed1d8", "#9ebbc6", "#7ea4b3"];
			// let colors = ["#4ca9d7", "#0085c6", "#005d8a", "#3C00F5"];
			// let bars = [];
			// for(let i=0; i < this.state.labels.length; i++){
			// 	bars.push(<Bar key={i} barSize={30} dataKey={this.state.labels[i]} fill={colors[i]} label={v => <Text {...v}>{v.value === null ? "N/A" : v.value+"%"}</Text>}/>);
			// }
			const data = this.state.data;
			// let bars;
			let lines;
			// bars = (
			// 	<Bar dataKey="Section Score" barSize={30} label={v => <Text {...v}>{v.value === null ? "N/A" : v.value+"%"}</Text>} isAnimationActive={false}>
			// 		{
			// 			data.map((entry, index) => (
			// 				<Cell key={`cell-${index}`} fill={getColorbyValue(entry["Section Score"])} />
			// 			))
			// 		}
			// 	</Bar>
			// );
			lines = (
				<Line type="monotone" dataKey="Section Score" stroke="#2387ea" label={v => <Text {...v}>{v.value === null ? "N/A" : v.value+"%"}</Text>} isAnimationActive={false} />
			);

			if (this.state.data.length <=7){
				// chart = (
				// 	<ResponsiveContainer width="100%" aspect={3 / 1}>
				// 		<BarChart data={data} margin={{top: 25, right: 5, left: 5, bottom: 30}} onClick={(active)=>active&&this.toggleModal()}>
				// 			<CartesianGrid strokeDasharray="3 3" />
				// 			<YAxis type="number" domain={[0,100]} tickFormatter={f => f + "%"}>
				// 				<Label value="Score" offset={0} angle={-90} position="left" />
				// 			</YAxis>
				// 			<XAxis dataKey="name" type="category" tick={this.tickFunction} interval={0}>
				// 				<Label value="Section List" offset={0} position="bottom" />
				// 			</XAxis>
				// 			<Tooltip formatter={v => v === null ? "N/A" : v+"%"}/>
				// 			<Legend wrapperStyle={{ top: 0}} verticalAlign="top"/>
				// 			{bars}
				// 		</BarChart>
				// 	</ResponsiveContainer>
				// );
				line_chart = (
					<ResponsiveContainer width="100%" aspect={3 / 1}>
						<LineChart data={data} margin={{top: 25, right: 50, left: 5, bottom: 30}} onClick={(active)=>active&&this.toggleModal()}>
							<CartesianGrid strokeDasharray="3 3" />
							<YAxis type="number" domain={[0,100]} tickFormatter={f => f + "%"}>
								<Label value="Score" offset={0} angle={-90} position="left" />
							</YAxis>
							<XAxis dataKey="name" type="category" tick={this.tickFunction} interval={0}>
								<Label value="Section List" offset={0} position="bottom" />
							</XAxis>
							<Tooltip formatter={v => v === null ? "N/A" : v+"%"}/>
							<Legend wrapperStyle={{ top: 0}} verticalAlign="top"/>
							{lines}
						</LineChart>
					</ResponsiveContainer>
				);

			}
			else{
				let width = (this.state.data.length*15).toString().concat("%");
				// chart = (
				// 	<div style={{ "width": "100%", "overflow": "scroll"}}>
				// 		<ResponsiveContainer width={width} height={450}>
				// 			<BarChart layout="horizontal" data={data} margin={{top: 25, right: 5, left: 25, bottom: 30}} onClick={(active)=>active&&this.toggleModal()}>
				// 				<CartesianGrid strokeDasharray="3 3" />
				// 				<YAxis type="number" domain={[0,100]} tickFormatter={f => f + "%"}>
				// 					<Label value="Score" offset={0} angle={-90} position="left" />
				// 				</YAxis>
				// 				<XAxis dataKey="name" type="category" tick={this.tickFunction} interval={0}>
				// 					<Label value="Section List" offset={0} position="bottom" />
				// 				</XAxis>
				// 				<Tooltip formatter={v => v === null ? "N/A" : v+"%"}/>
				// 				<Legend wrapperStyle={{ top: 0}} verticalAlign="top"/>
				// 				{bars}
				// 			</BarChart>
				// 		</ResponsiveContainer>
				// 	</div>
				// );

				line_chart = (
					<div style={{ "width": "100%", "overflow": "scroll"}}>
						<ResponsiveContainer width={width} height={440}>
							<LineChart data={data} margin={{top: 25, right: 50, left: 5, bottom: 30}} onClick={(active)=>active&&this.toggleModal()}>
								<CartesianGrid strokeDasharray="3 3" />
								<YAxis type="number" domain={[0,100]} tickFormatter={f => f + "%"}>
									<Label value="Score" offset={0} angle={-90} position="left" />
								</YAxis>
								<XAxis dataKey="name" type="category" tick={this.tickFunction} interval={0}>
									<Label value="Section List" offset={0} position="bottom" />
								</XAxis>
								<Tooltip formatter={v => v === null ? "N/A" : v+"%"}/>
								<Legend wrapperStyle={{ top: 0}} verticalAlign="top"/>
								{lines}
							</LineChart>
						</ResponsiveContainer>
					</div>
				);
			}
		}
		return(
			<div>
				{ ! this.state.loading ? <button className="btn btn-default pull-right" onClick={this.toggleModal} title="View Data"><ThList/></button> : null }
				<h3 className="text-center">{this.state.title}</h3>
				{/* {chart} */}
				{line_chart}
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
												tds.push(<td className="text-right" style={{backgroundColor:getColorbyValue(reportData.values[j][i].value)}} key={j+"-"+i}>{reportData.values[j][i].value}%</td>);
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
	}
}

