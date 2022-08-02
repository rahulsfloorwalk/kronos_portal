import React, { Component } from "react";
import { connect } from "react-redux";
import { hashHistory } from "react-router";
import PropTypes from "prop-types";
import Select from "react-select";

import { Cross, Envelope, Earphone } from "../../../components/Icons.jsx";

import { affectInputEventToComponent } from "../../../react_utils.js";
import { fetchCities, fetchStates } from "../../actions/location.js";
import { fetchQuotationPreview, addQuotation } from "../../service/quotation.js";
import { fetchIndustry, fetchProblemStatements, fetchSampleQuestionnaireType } from "../../service/questionnaire.js";
import Loading from "../../../components/Loading.jsx";
import AuditorProfileForm from "./AuditorProfileForm.jsx";
import QuotationPaymentForm from "./QuotationPaymentForm.jsx";
import FormSelect from "../../../components/FormSelect.jsx";
import FormGroup from "../../../components/FormGroup.jsx";
import StateSelector from "../../../components/StateSelector.jsx";
import Modal from "../../../components/Modal.jsx";


export class CustomizeQuotationAlert extends Component{
	static propTypes = {
		onClose: PropTypes.func,
	};
	render(){
		return(
			<Modal onClose={this.props.onClose} modalTitle="Customize Quotation alert">
				<div className="row">
					<p className="text-center" style={{fontSize: "15px"}}>Hello there&#33; If you&#39;d like for us to customize the audits for you, Please write to us and we will reach out to you in next 24 hours and help you customize this.</p>
					<br/>
					<div className="text-center">
						<button className="btn btn-primary">Send Enquiry</button>
					</div>
				</div>
			</Modal>
		);
	}
}

export class BulkQuotationAlert extends Component{
	static propTypes = {
		onClose: PropTypes.func,
	};

	render(){
		return(
			<Modal onClose={this.props.onClose} modalTitle="Need more audits?">
				<div className="row">
					<p className="text-center" style={{fontSize: "15px"}}>Talk to us for custom, high volume pricing.</p>
					<p className="text-center" style={{fontSize: "15px"}}><Envelope/> <a href="mailto:sourabh@floorwalk.in">sourabh@floorwalk.in</a></p>
					<p className="text-center" style={{fontSize: "15px"}}><Earphone/> <a href="tel:+917836066777">+917836066777</a></p>
				</div>
			</Modal>
		);
	}
}

export class QuotationCategoryForm extends Component{
	static propTypes = {
		stepComplete: PropTypes.bool,
		onQuotationChange: PropTypes.func,
		industry: PropTypes.string,
		problemStatement: PropTypes.string,
		sampleQuestionnaireType: PropTypes.string,
	};

	state = {
		industryList: [],
		problemStatementList: [],
		sampleQuestionnaireTypeList: [],
		industry: "",
		problemStatement: "",
		sampleQuestionnaireType: "",
		loading: false,
		customize_alert: false,
	};

	componentDidMount(){
		this.setLoading(true);
		fetchIndustry().then((industryList) => {
			this.setState({
				industryList,
				loading: false,
			});
		}).catch(()=>this.setLoading(false));
	}

	componentWillReceiveProps(ownProps){
		if(ownProps.industry && ownProps.problemStatement && ownProps.sampleQuestionnaireType){
			this.setState({
				industry: ownProps.industry,
				problemStatement: ownProps.problemStatement,
				sampleQuestionnaireType: ownProps.sampleQuestionnaireType,
				loading: false,
			});
			fetchProblemStatements(ownProps.industry).then((problemStatementList) => {
				this.setState({
					problemStatementList
				});
			});

			fetchSampleQuestionnaireType(ownProps.problemStatement).then((sampleQuestionnaireTypeList) => {
				this.setState({
					sampleQuestionnaireTypeList
				});
			});
		}
	}

	onModalClose = () => {
		this.setState((prevState)=>{
			return {
				...prevState,
				customize_alert: !prevState.customize_alert,
			};
		});
	};

	fieldChanged = (e) => {
		affectInputEventToComponent(e, this);
	};

	onSubmit = () => {
		if(this.state.industry == "" || this.state.problemStatement == "" || this.state.sampleQuestionnaireType == ""){
			alert("Please select all fields");
			return false;
		}
		if(this.state.industry == "18" || this.state.problemStatement == "6" || this.state.sampleQuestionnaireType == "14"){
			this.setState((prevState)=>{
				return {
					...prevState,
					customize_alert: !prevState.customize_alert,
				};
			});
			return false;
		}
		let quotation = {
			industry: this.state.industry,
			problemStatement: this.state.problemStatement,
			sampleQuestionnaireType: this.state.sampleQuestionnaireType,
		};
		this.props.onQuotationChange(quotation);
	};

	onIndustryChanged = (e) => {
		this.fieldChanged(e);
		if(e.target.value){
			fetchProblemStatements(e.target.value).then((problemStatementList) => {
				this.setState({
					problemStatementList
				});
			});
		}
	};

	onProblemStatementChanged = (e) => {
		this.fieldChanged(e);
		if(e.target.value){
			fetchSampleQuestionnaireType(e.target.value).then((sampleQuestionnaireTypeList) => {
				this.setState({
					sampleQuestionnaireTypeList
				});
			});
		}
	};

	setLoading = (loading) => this.setState(prevState => Object.assign({}, prevState, { loading }));

	render(){
		if(this.state.loading){
			return <Loading />;
		}
		let industryOptions = [];
		let problemStatementOptions = [];
		let sampleQuestionnaireTypeOptions = [];

		for(let i of this.state.industryList){
			industryOptions.push(<option key={i.id} value={i.id}>{i.name}</option>);
		}

		for(let i of this.state.problemStatementList){
			problemStatementOptions.push(<option key={i.id} value={i.id}>{i.name}</option>);
		}

		for(let i of this.state.sampleQuestionnaireTypeList){
			sampleQuestionnaireTypeOptions.push(<option key={i.id} value={i.id}>{i.name}</option>);
		}
		return (
			<div className="panel panel-default">
				<div className="panel-heading"><b>Build your audit program</b></div>
				<div className="panel-body">
					<div className="col-md-4">
						<FormSelect label="Select Industry" value={this.state.industry} name="industry" onChange={this.onIndustryChanged} disabled={this.props.stepComplete}>
							<option value="">----</option>
							{industryOptions}
						</FormSelect>
					</div>
					<div className="col-md-4">
						<FormSelect label="Select Audit Category" value={this.state.problemStatement} name="problemStatement" onChange={this.onProblemStatementChanged} disabled={this.props.stepComplete}>
							<option value="">----</option>
							{problemStatementOptions}
						</FormSelect>
					</div>
					<div className="col-md-4">
						<FormSelect label="Select Audit Type" value={this.state.sampleQuestionnaireType} name="sampleQuestionnaireType" onChange={this.fieldChanged} disabled={this.props.stepComplete}>
							<option value="">----</option>
							{sampleQuestionnaireTypeOptions}
						</FormSelect>
					</div>
					{this.props.stepComplete == false ?
						<div className="col-md-12 text-center">
							<button className="btn btn-primary" onClick={this.onSubmit}>Next</button>
						</div>
						: null}
					{this.state.customize_alert == true ?
						<CustomizeQuotationAlert onClose={this.onModalClose} />
						: null}
				</div>
			</div>
		);
	}
}

class QuotationCitySelectForm extends Component{
	static propTypes = {
		stepComplete: PropTypes.bool,
		dispatch: PropTypes.func,
		states: PropTypes.object,
		cities: PropTypes.array,
		onQuotationChange: PropTypes.func,
		prevStep: PropTypes.func,
		selectedCities: PropTypes.array,
	};

	state = {
		state: "",
		cities: [],
		selectedCities: [],
		error: "",
		show_bulk_alert: false,
	};

	componentDidMount(){
		this.props.dispatch(fetchStates());
	}

	componentWillReceiveProps(ownProps){
		if(ownProps.selectedCities){
			this.setState({selectedCities: ownProps.selectedCities});
		}
	}

	onStateChanged = (e) => {
		affectInputEventToComponent(e, this);
		this.props.dispatch(fetchCities(e.target.value));
	};

	onCityChange = (cities) => {
		let city_list = cities.map(value=>value.value);
		this.setState({
			cities: city_list
		});
	};

	addSelectedCities = () =>{
		let cities = this.state.cities;
		cities.sort((a, b) => a - b);

		let selectedCities = this.state.selectedCities;

		for(let i of cities){
			if(selectedCities.some(obj => obj.id == i) == false){
				let city = this.props.cities.find(obj => obj.id == i);
				selectedCities.push({
					id: city.id,
					name: city.name,
					tier: Number(city.tier),
					audit_count: ""
				});
			}
		}
		this.setState({
			cities: [],
			selectedCities
		});
	};

	onSubmit = () => {
		let selectedCities = document.getElementsByClassName("audit_count_input");
		let totalAuditCount = 0;
		for(var i = 0; i < selectedCities.length; i++){
			if(selectedCities[i].value == "" || selectedCities[i].value < 1){
				alert("Please add audit count for all cities");
				return false;
			}
			else{
				totalAuditCount += Number(selectedCities[i].value);
			}
		}
		if(totalAuditCount.toFixed(0) >= 100){
			this.setState({
				show_bulk_alert: true,
			});
			return false;
		}
		let quotation = {
			selectedCities: this.state.selectedCities,
		};
		this.props.onQuotationChange(quotation);
	};

	onChangeAuditCount = (city_id, audit_count) => {
		if(city_id != "" && audit_count != ""){
			let selectedCities = this.state.selectedCities;
			for(let city of selectedCities){
				if(city.id == city_id){
					city.audit_count = Number(audit_count).toFixed(0);
					break;
				}
			}
			this.setState({
				selectedCities,
			});
		}
	};

	onRemoveCity = (city_id) => {
		if(city_id){
			this.setState((prevState) => {
				return {
					...prevState,
					selectedCities: prevState.selectedCities.filter(obj => obj.id != city_id),
				};
			});
		}
	};

	onModalClose = () => {
		this.setState((prevState) => {
			return {
				...prevState,
				show_bulk_alert: !prevState.show_bulk_alert,
			};
		});
	};

	render(){
		let cityOptions = [];
		let cityRows = [];
		for(let s of this.props.cities){
			cityOptions.push({
				"value": s.id,
				"label": s.name
			});
		}
		if(this.state.selectedCities){
			for(let j of this.state.selectedCities){
				cityRows.push(
					<div className="col-md-2" style={{marginBottom: "2%"}} key={j.id}>
						<label>{j.name}</label>
						<div className="input-group">
							<input type="number" placeholder="count" min={1} value={j.audit_count} style={{zIndex: 0}} className="form-control audit_count_input" disabled={this.props.stepComplete} onChange={(e)=>this.onChangeAuditCount(j.id, e.target.value)} />
							<span className="input-group-btn">
								<button className="btn btn-default" type="button" style={{zIndex: 0}} onClick={()=>this.onRemoveCity(j.id)} disabled={this.props.stepComplete}><Cross /></button>
							</span>
						</div>
					</div>
				);
			}
		}

		return(
			<div className="panel panel-default">
				<div className="panel-heading"><b>Add Audit Locations</b></div>
				<div className="panel-body">
					<div className="col-md-3">
						<StateSelector onChange={this.onStateChanged} value={this.state.state} disabled={this.props.stepComplete} />
					</div>
					<div className="col-md-7">
						<FormGroup>
							<label>Select cities</label>
							<Select
								name="cities"
								value={this.state.cities ? cityOptions.filter(obj => this.state.cities.includes(obj.value) === true) : null}
								onChange={this.onCityChange}
								options={cityOptions}
								isMulti={true}
								closeMenuOnSelect={false}
								isDisabled={this.props.stepComplete}/>
						</FormGroup>
					</div>
					<div className="col-md-2">
						<br/>
						<button className="btn btn-primary" onClick={this.addSelectedCities} disabled={this.state.cities.length == 0}>Insert</button>
					</div>
					<div className="row col-md-12">
						<hr style={{marginTop: "0px"}}/>
					</div>
					<div className="row col-md-12">
						{cityRows.length > 0 ? <p className="col-md-12"><b>Enter audit count for each cities</b></p> : null}
						{cityRows}
					</div>
					{this.props.stepComplete == false ?
						<div className="col-md-12">
							<hr/>
							<div className="col-md-12 text-center">
								<button className="btn btn-primary" onClick={this.props.prevStep} disabled={this.state.selectedCities.length == 0}>Back</button>&nbsp;&nbsp;
								<button className="btn btn-primary" onClick={this.onSubmit} disabled={this.state.selectedCities.length == 0}>Next</button>
							</div>
						</div>
						: null}
					{this.state.show_bulk_alert == true ?
						<BulkQuotationAlert onClose={this.onModalClose}/>
						: null}
				</div>
			</div>
		);
	}
}

export class QuotationPreview extends Component{
	static propTypes = {
		quotation: PropTypes.shape({
			industry: PropTypes.string.isRequired,
			problemStatement: PropTypes.string.isRequired,
			sampleQuestionnaireType: PropTypes.string.isRequired,
			profile: PropTypes.object.isRequired,
			selectedCities: PropTypes.arrayOf(PropTypes.shape({
				id: PropTypes.number.isRequired,
				name: PropTypes.string.isRequired,
				audit_count: PropTypes.string.isRequired,
			})).isRequired,
		}).isRequired,
		stepComplete: PropTypes.bool.isRequired,
		clientId: PropTypes.number.isRequired,
		prevStep: PropTypes.func.isRequired,
		openPaymentForm: PropTypes.func.isRequired,
		onQuotationChange: PropTypes.func.isRequired,
	};

	state = {
		loading: false,
		quotation: {
			industry: "",
			problem_statement: "",
			sample_questionnaire_type: "",
			audit_locations: "",
			quotation_fee: "",
			gst_amount: "",
			gst: "",
			discount: "",
			payable_amount: "",
		},
		auditor_profile: {}
	};

	componentDidMount(){
		this.setLoading(true);
		if(this.props.quotation){
			let payload = {
				industry: this.props.quotation.industry,
				problem_statement: this.props.quotation.problemStatement,
				sample_questionnaire_type: this.props.quotation.sampleQuestionnaireType,
				audit_locations: this.props.quotation.selectedCities,
				auditor_profile: this.props.quotation.profile,
			};
			fetchQuotationPreview(payload).then((quotation) => this.setState({quotation, auditor_profile: this.props.quotation.profile, loading: false}));
		}
	}

	componentWillReceiveProps(ownProps){
		if(ownProps.quotation){
			this.setLoading(true);
			let payload = {
				industry: ownProps.quotation.industry,
				problem_statement: ownProps.quotation.problemStatement,
				sample_questionnaire_type: ownProps.quotation.sampleQuestionnaireType,
				audit_locations: ownProps.quotation.selectedCities,
				auditor_profile: ownProps.quotation.profile,
			};
			fetchQuotationPreview(payload).then((quotation) => this.setState({quotation, auditor_profile:ownProps.quotation.profile, loading: false}));
		}
	}

	setLoading = (loading) => this.setState(prevState => Object.assign({}, prevState, { loading }));

	onBack = () => {
		this.props.prevStep();
	};

	makePayment = () => {
		let t_and_c = document.getElementById("t_and_c");
		if(t_and_c.checked == false){
			alert("Please accept terms and conditions.");
			return false;
		}
		else{
			const {industry, problem_statement, sample_questionnaire_type, audit_locations, quotation_fee, gst, discount, payable_amount} = this.state.quotation;
			let payload = {
				industry: industry.id,
				problem_statement: problem_statement.id,
				sample_questionnaire_type: sample_questionnaire_type.id,
				audit_locations: audit_locations.map((obj)=> ({
					id: obj.id,
					audit_count: obj.audit_count,
					audit_fee: obj.audit_fee,
				})),
				payable_amount: payable_amount,
				quotation_fee: quotation_fee,
				gst: gst,
				discount: discount,
				auditor_profile: this.state.auditor_profile,
			};
			addQuotation(this.props.clientId, payload).then((quotation) => this.props.openPaymentForm(quotation.id, quotation.payable_amount));
		}
	};

	render(){
		if(this.state.loading == true){
			return(
				<div className="panel panel-default">
					<div className="panel-heading"><b>Quotation preview</b></div>
					<div className="panel-body">
						<Loading />
					</div>
				</div>
			);
		}
		let {industry, problem_statement, sample_questionnaire_type, audit_locations, quotation_fee, gst_amount, gst, discount, payable_amount} = this.state.quotation;

		let audit_location_options = [];
		if(audit_locations){
			for(let location of audit_locations){
				audit_location_options.push(
					<tr key={location.id}>
						<td className="text-center">
							{location.name}
						</td>
						<td className="text-center">
							{location.audit_count}
						</td>
						<td className="text-center">
							{location.audit_fee}
						</td>
					</tr>);
			}
		}
		return(
			<div className="panel panel-default">
				<div className="panel-heading"><b>Quotation preview</b></div>
				<div className="panel-body">
					<table className="table table-bordered table-responsive">
						<thead>
							<tr>
								<th className="text-center">
									Industry category
								</th>
								<th className="text-center">
									Audit category
								</th>
								<th className="text-center">
									Audit type
								</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td className="text-center">
									{industry.name}
								</td>
								<td className="text-center">
									{problem_statement.name}
								</td>
								<td className="text-center">
									{sample_questionnaire_type.name}
								</td>
							</tr>
						</tbody>
					</table>
					<table className="table table-bordered table-responsive">
						<thead>
							<tr>
								<th className="text-center">
									City
								</th>
								<th className="text-center">
									Audit Count
								</th>
								<th className="text-center">
									Audit Fee
								</th>
							</tr>
						</thead>
						<tbody>
							{audit_location_options}
							<tr>
								<th colSpan={2} className="text-right">
									Total
								</th>
								<td className="text-center">
									{quotation_fee}
								</td>
							</tr>
							<tr>
								<th colSpan={2} className="text-right">
									GST({gst}%)
								</th>
								<td className="text-center">
									{gst_amount}
								</td>
							</tr>
							{discount ?
								<tr>
									<th colSpan={2} className="text-right">
										Discount
									</th>
									<td className="text-center">
										{discount}
									</td>
								</tr>
								: null}
							<tr>
								<th colSpan={2} className="text-right">
									Payable amount
								</th>
								<td className="text-center">
									{payable_amount}
								</td>
							</tr>
						</tbody>
					</table>
					<div className="col-md-12 text-center">
						<p>
							<input type="checkbox" id="t_and_c" defaultChecked={false} disabled={this.props.stepComplete}/>
							&nbsp;&nbsp;&nbsp;
							<a href="" target="_blank" style={{ textDecoration: "none" }}><b>Read terms and conditions</b></a>
						</p>
						<button className="btn btn-primary" onClick={this.onBack} disabled={this.props.stepComplete}>Back</button>&nbsp;&nbsp;
						<button className="btn btn-primary" onClick={this.makePayment} disabled={this.props.stepComplete}>Make payment</button>
					</div>
				</div>
			</div>
		);
	}
}


class QuotationDetail extends Component {
	static propTypes = {
		clientId: PropTypes.number,
		quotation: PropTypes.object,
		client: PropTypes.object,
		states: PropTypes.object,
		cities: PropTypes.array,
		dispatch: PropTypes.func.isRequired,
	};

	state = {
		quotation: {},
		step: 1,
	};

	componentDidMount(){
		if(this.props.clientId && Object.keys(this.props.quotation).length > 0){
			let quotation = this.props.quotation;
			if(quotation.status == "PAID"){
				hashHistory.replace("/project_setup/quotation_preview");
			}
			let quotation_payload = {
				industry: quotation.industry.id,
				problemStatement: quotation.problem_statement.id,
				sampleQuestionnaireType: quotation.sample_questionnaire_type.id,
				selectedCities: quotation.audit_locations.map((obj)=>({
					id: obj.city.id,
					name: obj.city.name,
					audit_count: obj.count,
					tier: obj.city.tier,
				})),
				payable_amount: quotation.payable_amount,
				auditor_profile: quotation.quotation_data.auditor_profile,
				quotationId: quotation.id
			};
			this.setState({loading: false, quotation: quotation_payload, step: 5});
		}
	}

	componentWillReceiveProps(ownProps){
		if(Object.keys(ownProps.quotation).length > 0){
			let quotation = ownProps.quotation;
			if(quotation.status == "PAID"){
				hashHistory.replace("/project_setup/quotation_preview");
			}

			let quotation_payload = {
				industry: quotation.industry.id,
				problemStatement: quotation.problem_statement.id,
				sampleQuestionnaireType: quotation.sample_questionnaire_type.id,
				selectedCities: quotation.audit_locations.map((obj)=>({
					id: obj.city.id,
					name: obj.city.name,
					audit_count: obj.count,
					tier: obj.city.tier,
				})),
				payable_amount: quotation.payable_amount,
				auditor_profile: quotation.quotation_data.auditor_profile,
				quotationId: quotation.id
			};
			this.setState({loading: false, quotation: quotation_payload, step: 5});
		}
	}

	onQuotationChange = (quotation) => {
		this.setState((prevState) => {
			return Object.assign({}, prevState, {
				quotation: Object.assign({}, prevState.quotation, quotation),
			});
		});
		this.nextStep();
	};

	nextStep = () => {
		this.setState((prevState) => ({
			step: prevState.step + 1
		}));
	};

	prevStep = () => {
		this.setState((prevState) => ({
			step: prevState.step - 1
		}));
	};

	openPaymentForm = (quotationId, payable_amount) => {
		this.onQuotationChange({quotationId,payable_amount});
	};

	render(){
		return (
			<div className="col-md-12">
				<QuotationCategoryForm stepComplete={this.state.step != 1} onQuotationChange={this.onQuotationChange} industry={this.state.quotation.industry} problemStatement={this.state.quotation.problemStatement} sampleQuestionnaireType={this.state.quotation.sampleQuestionnaireType} />
				<AuditorProfileForm isFormDisabled={this.state.step != 2} prevStep={this.prevStep} onSubmit={this.onQuotationChange} auditorProfile={this.state.quotation.auditor_profile}/>
				<QuotationCitySelectForm stepComplete={this.state.step != 3} prevStep={this.prevStep} dispatch={this.props.dispatch} states={this.props.states} cities={this.props.cities} onQuotationChange={this.onQuotationChange} selectedCities={this.state.quotation.selectedCities} />
				{(this.state.step == 4 || this.state.step == 5) && this.state.quotation ?
					<QuotationPreview clientId={this.props.clientId} stepComplete={this.state.step != 4} prevStep={this.prevStep} nextStep={this.nextStep} quotation={this.state.quotation} onQuotationChange={this.onQuotationChange} openPaymentForm={this.openPaymentForm}/>
					: null}
				{this.state.step == 5 && this.state.quotation && this.state.quotation.quotationId ?
					<QuotationPaymentForm client={this.props.client} quotationId={this.state.quotation.quotationId} payable_amount={this.state.quotation.payable_amount}/>
					: null}
			</div>
		);
	}
}

var mapStoreToProps = function(store){
	return {
		clientId: store.client.id,
		quotation: store.quotation,
		client: store.client,
		states: store.states,
		cities: store.cities,
	};
};

export default connect(mapStoreToProps)(QuotationDetail);