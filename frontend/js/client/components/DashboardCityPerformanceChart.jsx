import React from "react";
import PropTypes from "prop-types";
import { ResponsiveContainer, BarChart, CartesianGrid, Bar, Cell, XAxis, YAxis, Tooltip, Legend, Label} from "recharts";
import { Text } from "recharts";

import {demo} from "../../../config.js";

import domtoimage from "dom-to-image";
import fileDownload from "js-file-download";

// import {fetchCityWisePerformance} from "../service/dashboard.js";
import {fetchCityWisePerformanceByAuditCycleId} from "../service/dashboard.js";

// import { getColor, getColorbyValue } from "../../utils.js";
import { getColorbyValue } from "../../utils.js";

import Loading from "../../components/Loading.jsx";
import Jumbotron from "../../components/Jumbotron.jsx";
import Modal from "../../components/Modal.jsx";
import { ThList, Download } from "../../components/Icons.jsx";

class CityWisePerformanceChart extends React.Component{
	static propTypes = {
		title: PropTypes.string.isRequired,
		type: PropTypes.oneOf(["best", "worst", "all"]).isRequired,
		reportData: PropTypes.shape({
			data: PropTypes.array.isRequired,
			columns: PropTypes.arrayOf(PropTypes.string).isRequired,
		}).isRequired,
		auditCycle: PropTypes.shape({
			id: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
			start_date: PropTypes.string.isRequired,
			end_date: PropTypes.string.isRequired,
		}).isRequired,
	};

	static defaultProps = {
		type: "best",
	};

	state = {
		dataPopup: false,
	};

	toggleModal = () => {
		this.setState( prevState => Object.assign({}, prevState, { dataPopup: !this.state.dataPopup }));
	};

	create_structure = (input_data) => {
		let data_arr = input_data.data;
		// let label_arr = input_data.columns;
		let size = this.props.type === "all" ? data_arr.length : 5;

		if(this.props.type === "worst"){
			data_arr = data_arr.slice().reverse();
		}
		let data = [];
		// for(let i=0; i < size; i++){
		// 	let obj = {};
		// 	obj["name"] = data_arr[i][0].name;
		// 	for(let j=0; j < label_arr.length; j++){
		// 		obj[label_arr[j]] = data_arr[i][1][j] ? data_arr[i][1][j].value : null;
		// 	}
		// 	data.push(obj);
		// }

		for(let i=0; i < size; i++){
			let obj = {};
			obj["name"] = data_arr[i][0].name;
			obj["Score"] = data_arr[i][1][0] ? data_arr[i][1][0].value : null;

			data.push(obj);
		}
		return data;
	};

	tickFunction = ( values) => {
		// lol hack
		let count = this.props.reportData && this.props.reportData.data.length > 0 ? this.props.reportData.data.length : 1;
		return (<Text {...values} width={values.width / count}>{values.payload.value}</Text>);
	};

	downloadFile = () =>{
		let audit_cycle_name = this.props.auditCycle.name;
		domtoimage.toBlob(document.getElementById(`city_performance_${this.props.type}`), {bgcolor: "white"})
			.then(function (blob) {
				fileDownload(blob,  audit_cycle_name + " City Wise Performance.jpg");
			});
	};

	render(){
		// let colors = ["#005d8a", "#0085c6", "#4ca9d7"];
		// if (this.props.type === "best" || this.props.type === "all"){
		// 	colors = ["#688833", "#30AD23", "#11772D"];
		// }
		// else if (this.props.type === "worst"){
		// 	colors = ["#D94E47", "#D0231A", "#A61C14"];
		// }
		// let bars = [];

		// let labels = this.props.reportData.columns;
		// for(let i=0; i < labels.length; i++){
		// 	bars.push(<Bar key={i} dataKey={labels[i]} barSize={20} fill={colors[i]} label={v => <Text {...v}>{v.value === null ? "N/A" : v.value+"%"}</Text>}/>);
		// }

		let data = this.create_structure(this.props.reportData);
		let bars;
		bars = (
			<Bar dataKey="Score" barSize={20} label={v => <Text {...v}>{v.value === null ? "N/A" : v.value+"%"}</Text>} isAnimationActive={false} >
				{
					data.map((entry, index) => (
						<Cell key={`cell-${index}`} fill={getColorbyValue(entry["Score"])} />
					))
				}
			</Bar>
		);

		let chart = (
			<ResponsiveContainer width="100%" aspect={3 / 1} id={`city_performance_${this.props.type}`}>
				<BarChart width={600} height={300} data={data} margin={{top: 25, right: 10, left: 10, bottom: 5}} onClick={(active)=>active&&this.toggleModal()}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="name" tick={this.tickFunction} interval={0}>
						<Label value="City List" offset={0} position="insideBottomRight" />
					</XAxis>
					<YAxis domain={[0,100]} tickFormatter={f => f + "%"}>
						<Label value="Score" angle={-90} offset={0} position="left" />
					</YAxis>
					<Tooltip formatter={v => v === null ? "N/A" : v+"%"}/>
					<Legend wrapperStyle={{ top: 0}} verticalAlign="top"/>
					{bars}
				</BarChart>
			</ResponsiveContainer>
		);
		return(
			<div>
				<button className="btn btn-default pull-right" onClick={this.downloadFile} title="Download">Download <Download/></button>
				<button className="btn btn-default pull-right" onClick={this.toggleModal} title="View Data"><ThList/></button>
				<h3 className="text-center">{this.props.title}</h3>
				{chart}
				{ this.state.dataPopup ?
					<Modal modalTitle={this.props.title} onClose={this.toggleModal}>
						<table className="table table-striped ">
							<thead>
								<tr>
									<th>City</th>
									{this.props.reportData.columns.map((l) => <th key={l} className="text-right">{l}</th>)}
								</tr>
							</thead>
							<tbody>
								{((reportData) => {
									let trs = [];
									let data = reportData.data;
									if(this.props.type === "worst"){
										data = data.slice().reverse();
									}
									for(let i=0; i < data.length; i++){
										let tds = [];
										tds.push(<td key={data[i][0].name}>{data[i][0].name}</td>);
										for(let j=0; j < reportData.columns.length; j++){
											if(data[i][1][j]){
												tds.push(<td key={i+"."+j} className="text-right" style={{backgroundColor:getColorbyValue(data[i][1][j].value)}}>{data[i][1][j].value}%</td>);
											} else {
												tds.push(<td className="text-right" key={j+"-"+i}></td>);
											}
										}
										trs.push(<tr key={data[i][0].name}>{tds}</tr>);
									}
									return trs;
								})(this.props.reportData)}
							</tbody>
						</table>
					</Modal>
					: null }
			</div>
		);
	}
}

export default class CityWisePerformanceChartWrapper extends React.Component{
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
		reportData: null,
	};

	setLoading = (loading) => {
		this.setState( prevState => {
			return Object.assign({}, prevState, {
				loading
			});
		});
	};

	reloadData = (questionnaireTypeId, auditCycleId) => {
		if(!demo){
			this.setLoading(true);
			fetchCityWisePerformanceByAuditCycleId(questionnaireTypeId, auditCycleId).then((reportData) => {
				this.setState({
					"reportData": reportData
				});
			}).always(() => this.setLoading(false));
		}
	};

	componentDidMount(){
		//console.log("AuditCycleStorePerformance","componentDidMount");
		this.reloadData(this.props.questionnaireType.id, this.props.auditCycle.id);
	}

	componentWillReceiveProps(nextProps){
		//console.log("AuditCycleStorePerformance","componentWillReceiveProps", nextProps.questionnaireType);
		if(this.props.auditCycle !== nextProps.auditCycle){
			this.reloadData(nextProps.questionnaireType.id, nextProps.auditCycle.id);
		}
		if( this.props.questionnaireType !== nextProps.questionnaireType) {
			this.reloadData(nextProps.questionnaireType.id, nextProps.auditCycle.id);
		}
	}

	render(){
		if(this.state.loading || ! this.state.reportData ){
			return <Loading/>;
		} else if(this.state.reportData.data.length === 0 ){
			return (
				<div>
					<h3 className="text-center">City Wise Performance</h3>
					<Jumbotron heading="" para="chart will be visible once reports are completed"/>
				</div>
			);
		} else if(this.state.reportData.data.length > 10) {
			return (
				<div className="row">
					<div className="col-md-6">
						<CityWisePerformanceChart title="Best Performing Cities" type="best" reportData={this.state.reportData} auditCycle={this.props.auditCycle}/>
					</div>
					<div className="col-md-6">
						<CityWisePerformanceChart title="Worst Performing Cities" type="worst" reportData={this.state.reportData} auditCycle={this.props.auditCycle}/>
					</div>
				</div>
			);
		} else {
			return (
				<CityWisePerformanceChart title="City Wise Performance" type="all" reportData={this.state.reportData} auditCycle={this.props.auditCycle}/>
			);
		}
	}
}

