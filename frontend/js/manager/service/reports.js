import $ from "jquery";
import { url } from "../../../config.js";

export function getAuditorPaymentReports(month, year, payment){
	return $.get( url.api_base_path + `manager/reports/auditor_payment/?month=${month}&year=${year}&payment=${payment}`);
}

export function getBillingReports(month, year){
	return $.get( url.api_base_path + `manager/reports/billing/?month=${month}&year=${year}`);
}

export function getProfitabilityReports(month, year){
	return $.get( url.api_base_path + `manager/reports/profitability/?month=${month}&year=${year}`);
}

export function getProjectCostReports(month, year){
	return $.get( url.api_base_path + `manager/reports/project_cost/?month=${month}&year=${year}`);
}
