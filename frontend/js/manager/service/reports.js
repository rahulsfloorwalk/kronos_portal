import $ from "jquery";
import { url } from "../../../config.js";

export function getAuditorPaymentReports(month, year, payment, client){
	return $.get( url.api_base_path + `manager/reports/auditor_payment/?month=${month}&year=${year}&payment=${payment}&client=${client}`);
}

export function getBillingReports(month, year, client){
	return $.get( url.api_base_path + `manager/reports/billing/?month=${month}&year=${year}&client=${client}`);
}

export function getProfitabilityReports(month, year, client){
	return $.get( url.api_base_path + `manager/reports/profitability/?month=${month}&year=${year}&client=${client}`);
}

export function getProjectCostReports(month, year, client){
	return $.get( url.api_base_path + `manager/reports/project_cost/?month=${month}&year=${year}&client=${client}`);
}

export function getMonthlyPNLReports(year){
	return $.get( url.api_base_path + `manager/reports/monthly_pnl/?year=${year}`);
}