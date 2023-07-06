import $ from "jquery";
import { url } from "../../../config.js";
export function findCategories(){
	return $.get( url.api_base_path + "manager/category");
}

export function findById(categoryId){
	return $.get( url.api_base_path + `manager/category/${categoryId}`);
}

export function addCategory(name){
	return $.ajax({
		url: url.api_base_path + "manager/category",
		method: "POST",
		data: JSON.stringify({
			name,
		}),
		contentType: "application/json"
	});
}

export function updateCategory(categoryId, name){
	return $.ajax({
		url: url.api_base_path + `manager/category/${categoryId}`,
		method: "POST",
		data: JSON.stringify({
			name,
		}),
		contentType: "application/json"
	});
}

export function deleteCategory(categoryId){
	return $.ajax({
		url: url.api_base_path + `manager/category/${categoryId}`,
		type: "DELETE"
	});
}
//---------------------------------------------------------------------------------------------
export function findSubCategories(){
	return $.get( url.api_base_path + "manager/subcategory_sub");
}

export function findSubCategoryById(subcategoryId){
	return $.get( url.api_base_path + `manager/subcategory_sub/${subcategoryId}`);
}

export function addSubCategory(name){
	return $.ajax({
		url: url.api_base_path + "manager/subcategory_sub",
		method: "POST",
		data: JSON.stringify({
			name,
		}),
		contentType: "application/json"
	});
}

export function updateSubCategory(subcategoryId, name){
	return $.ajax({
		url: url.api_base_path + `manager/subcategory_sub/${subcategoryId}`,
		method: "POST",
		data: JSON.stringify({
			name,
		}),
		contentType: "application/json"
	});
}

export function deleteSubCategory(subcategoryId){
	return $.ajax({
		url: url.api_base_path + `manager/subcategory_sub/${subcategoryId}`,
		type: "DELETE"
	});
}

//---------------------------------------------------------------------------------------------
export function findTaxes(){
	return $.get( url.api_base_path + "manager/tax");
}

export function findTaxById(taxId){
	return $.get( url.api_base_path + `manager/tax/${taxId}`);
}

export function addTax(name,rate){
	return $.ajax({
		url: url.api_base_path + "manager/tax",
		method: "POST",
		data: JSON.stringify({
			name,
			rate,
		}),
		contentType: "application/json"
	});
}

export function updateTax(taxId, name,rate){
	return $.ajax({
		url: url.api_base_path + `manager/tax/${taxId}`,
		method: "POST",
		data: JSON.stringify({
			name,
			rate,
		}),
		contentType: "application/json"
	});
}

export function deleteTax(taxId){
	return $.ajax({
		url: url.api_base_path + `manager/tax/${taxId}`,
		type: "DELETE"
	});
}

//---------------------------------------------------------------------------------------------
export function findIndustries(){
	return $.get( url.api_base_path + "manager/industry");
}

export function findIndustryById(industryId){
	return $.get( url.api_base_path + `manager/industry/${industryId}`);
}

export function addIndustry(name){
	return $.ajax({
		url: url.api_base_path + "manager/industry",
		method: "POST",
		data: JSON.stringify({
			name,
		}),
		contentType: "application/json"
	});
}

export function updateIndustry(industryId, name){
	return $.ajax({
		url: url.api_base_path + `manager/industry/${industryId}`,
		method: "POST",
		data: JSON.stringify({
			name,
		}),
		contentType: "application/json"
	});
}

export function deleteIndustry(industryId){
	return $.ajax({
		url: url.api_base_path + `manager/industry/${industryId}`,
		type: "DELETE"
	});
}

//---------------------------------------------------------------------------------------------
export function findInterestAreas(){
	return $.get( url.api_base_path + "manager/interested_area");
}

export function findInterestAreaById(interestareaId){
	return $.get( url.api_base_path + `manager/interested_area/${interestareaId}`);
}

export function addInterestArea(name){
	return $.ajax({
		url: url.api_base_path + "manager/interested_area",
		method: "POST",
		data: JSON.stringify({
			name,
		}),
		contentType: "application/json"
	});
}

export function updateInterestArea(interestareaId, name){
	return $.ajax({
		url: url.api_base_path + `manager/interested_area/${interestareaId}`,
		method: "POST",
		data: JSON.stringify({
			name,
		}),
		contentType: "application/json"
	});
}

export function deleteInterestArea(interestareaId){
	return $.ajax({
		url: url.api_base_path + `manager/interested_area/${interestareaId}`,
		type: "DELETE"
	});
}

//---------------------------------------------------------------------------------------------
export function findSolutions(){
	return $.get( url.api_base_path + "manager/solution");
}

export function findSolutionById(solutionId){
	return $.get( url.api_base_path + `manager/solution/${solutionId}`);
}

export function addSolution(solution){
	return $.ajax({
		url: url.api_base_path + "manager/solution",
		method: "POST",
		data: JSON.stringify(solution),
		contentType: "application/json"
	});
}

export function updateSolution(solutionId,solution){
	return $.ajax({
		url: url.api_base_path + `manager/solution/${solutionId}`,
		method: "POST",
		data: JSON.stringify(solution),
		contentType: "application/json"
	});
}


export function deleteSolution(solutionId){
	return $.ajax({
		url: url.api_base_path + `manager/solution/${solutionId}`,
		type: "DELETE"
	});
}