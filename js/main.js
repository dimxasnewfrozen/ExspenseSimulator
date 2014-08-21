Number.prototype.formatMoney = function(decPlaces, thouSeparator, decSeparator) {
    var n = this,
        decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
        decSeparator = decSeparator == undefined ? "." : decSeparator,
        thouSeparator = thouSeparator == undefined ? "," : thouSeparator,
        sign = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return sign + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");
};


$(document).ready(function () {


	/***************************************************************/
	// Main template that shows the expenses in a list
	var templateSource     = $("#results-template").html();
	var template 		   = Handlebars.compile(templateSource);
	var resultsPlaceholder = $("#results");
	/***************************************************************/


	/***************************************************************/
	// Right sidebar template that shows the total figures
	var templateSource2     = $("#right-template").html();
	var template2 		   = Handlebars.compile(templateSource2);
	var resultsPlaceholder2 = $("#right-results");
	/***************************************************************/	

	/***************************************************************/
	// Right sidebar template that shows the total figures
	var templateSource3     = $("#edit-modal-template").html();
	var template3 		   = Handlebars.compile(templateSource3);
	var resultsPlaceholder3 = $("#edit-modal-results");
	/***************************************************************/


	var total_debt = 0;
	var total_monthly_payments = 0;
	var total_income = 3500;
	var monthly_leftovers = 0;
	var edit_expense_key;
	/*
	var data = {"data":[
				    {"name":"Car Payment", 	 "monthly_amount":289, "total_amount": 8025, "active": 1}, 
				    {"name":"Student Loans", "monthly_amount":274, "total_amount": 16300, "active": 1}, 
				    {"name":"Rent", "monthly_amount":1300, "total_amount": 0 , "active": 1}, 
				    {"name":"Netflix", "monthly_amount":7.99, "total_amount": 0 , "active": 1}, 
				    {"name":"Car Insurance", "monthly_amount":90, "total_amount": 0 , "active": 1}, 
				    {"name":"Renters Insurance", "monthly_amount":17, "total_amount": 0 , "active": 1}, 
				    {"name":"Internet Bill", "monthly_amount":72, "total_amount": 0 , "active": 1}, 
				    {"name":"Hulu", "monthly_amount":8, "total_amount": 0 , "active": 1}, 
				    {"name":"Credit Card", "monthly_amount":75, "total_amount": 3500 , "active": 1}, 
				    {"name":"Phone", "monthly_amount":160, "total_amount": 0 , "active": 1}, 
				    {"name":"Food", "monthly_amount":60, "total_amount": 0 , "active": 1}, 
				    {"name":"Gas", "monthly_amount":60, "total_amount": 0 , "active": 1}, 
				]};	
	*/
	var data = {"data":[
		    {"name":"Car Payment", 	 "monthly_amount":310, "total_amount": 16000, "active": 1},
		    {"name":"Mortgage", 	 "monthly_amount":1110, "total_amount": 150000, "active": 1},
		    {"name":"Food, Beer, Coffee", "monthly_amount":60, "total_amount": 0, "active": 1},
		    {"name":"Gas", "monthly_amount":60, "total_amount": 0, "active": 1}
		]};

	//localStorage.clear();

	if(typeof(Storage) !== "undefined") {

    	if (localStorage.getItem("expense_data") || localStorage.getItem("total_income"))
    	{	
    		data 		 = JSON.parse(localStorage.getItem("expense_data"));
    		total_income = (localStorage.getItem("total_income") != null) ? localStorage.getItem("total_income") : 0;
    		total_income = parseFloat(total_income);
    	}
	} 

	// the initial display of data
	displayData();

	$(".add_modal").click(function () {
		setTimeout(function () {
			$("#expense_label_add").focus();
		}, 500);
	});	

	$(".income_modal").click(function () {

		if (total_income != 0)
			$("#monthly_income").val(total_income);

		setTimeout(function () {
			$("#monthly_income").focus();
		}, 500);
	});


	// load expense modal data
	$("body").on("click", ".exspense_item", function () {

		edit_expense_key  = $(this).attr("expense_id");
		var expense_data = data.data[edit_expense_key];

		resultsPlaceholder3.html(template3(expense_data));

		// there's some delay when the template is generating. jQuery doesn't know the element exists yet
		// add some timining in between so jquery knows the element exists so it can set focus.
		setTimeout(function () {
			$("#monthly_payment").select().focus();
		}, 500);
	});


	// save the edit expense
	$("#save_edit_modal").click(function (){

		var monthly_payment = $("#monthly_payment").val();
		monthly_payment = monthly_payment.replace("$", "").replace(",", "");
		monthly_payment = parseFloat(monthly_payment);		

		var total_debt = $("#total_debt").val();
		total_debt = total_debt.replace("$", "").replace(",", "");
		total_debt = parseFloat(total_debt);

		// assign the values
		data.data[edit_expense_key].name		   = $("#expense_label").val();
		data.data[edit_expense_key].monthly_amount = monthly_payment;
		data.data[edit_expense_key].total_amount   = total_debt;
		data.data[edit_expense_key].active 		   = parseInt(($('#expense_active').prop('checked') == true) ? 1 : 0);

		// reset the edit key
		edit_expense_key = 0;

		// redisplay the results
		displayData();

		$('#editModal').modal('hide');
		return true;

	});


	// save the income
	$("#save_income_modal").click(function (){

		var monthly_income = $("#monthly_income").val();
		monthly_income 	   = monthly_income.replace("$", "").replace(",", "");
		total_income 	   = parseFloat(monthly_income);		

		// reset the edit key
		edit_expense_key = 0;

		// redisplay the results
		displayData();

		$('#incomeModal').modal('hide');
		return true;

	});

	$("#delete_edit_modal").click(function () {

		data.data.splice(edit_expense_key, 1);
		// reset the edit key
		edit_expense_key = 0;

		// redisplay the results
		displayData();

		$('#editModal').modal('hide');
		return true;
	});


	// add new expense
	$("#save_add_modal").click(function (){

		var monthly_payment_add = $("#monthly_payment_add").val();
		monthly_payment_add = monthly_payment_add.replace("$", "").replace(",", "");
		monthly_payment_add = parseFloat(monthly_payment_add);		

		var total_debt_add = $("#total_debt_add").val();
		total_debt_add = total_debt_add.replace("$", "").replace(",", "");
		total_debt_add = parseFloat(total_debt_add);

		var new_object = {"name": $("#expense_label_add").val(), "monthly_amount":monthly_payment_add, "total_amount": total_debt_add, "active": 1};
		data.data.push( new_object );

		//reset the fields:
		$("#expense_label_add").val("");
		$("#monthly_payment_add").val("");
		$("#total_debt_add").val("");

		// redisplay the results
		displayData();

		$('#addModal').modal('hide');
		return true;
	});


	$("body").on("keypress", ".form-horizontal", function (e) {

	   if ( e.keyCode == 13 ) 
	   {

	   	var id = $(this).attr("id");

	   	switch(id)
	   	{
	   		case "income_form":
	   			$("#save_income_modal").trigger("click");
	   		break;

	   		case "edit_expense_form":
	   			$("#save_edit_modal").trigger("click");
	   		break;

	   		case "add_expense_form":
	   			$("#save_add_modal").trigger("click");
	   		break;

	   		default:
	   			return false;
	   	}

	   	e.preventDefault();
	   	return false;
	   }

	 });

	$(".reset").click(function () {

		localStorage.clear();
		location.reload();

	})
	function displayData() 
	{	

		total_debt = 0;
		total_monthly_payments = 0;
		monthly_leftovers = 0;


		// preform calculations to get totals
		total_debt = preformCalcs(data);

		// pass the expense data to the template
		resultsPlaceholder.html(template(data));

		// pass the total data to the template
		resultsPlaceholder2.html(template2({"total_debt": total_debt.formatMoney(2,',','.'), 
											"total_monthly_payments": total_monthly_payments.formatMoney(2,',','.'),
											"monthly_leftovers": monthly_leftovers.formatMoney(2,',','.'),
											"monthly_income": total_income.formatMoney(2,',','.'),
										  }));

		if(typeof(Storage) !== "undefined") {
    		localStorage.setItem("expense_data", JSON.stringify(data));
    		localStorage.setItem("total_income", total_income);
		} 
		
	}
	

	function preformCalcs(data)
	{	
		for (i in data.data)
		{
			if (data.data[i].active == 1)
			{
		  		total_debt 			   += data.data[i].total_amount;
		 		total_monthly_payments += data.data[i].monthly_amount;
		 	}

		  if (data.data[i].total_amount != 0)
		 	data.data[i].months_left = Math.ceil(data.data[i].total_amount / data.data[i].monthly_amount);
		}

		monthly_leftovers = total_income - total_monthly_payments;
		return total_debt;
    }

})