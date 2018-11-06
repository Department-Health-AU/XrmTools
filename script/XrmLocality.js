 function XrmLocality() {
	this._url;
	this._field;	
	this._settings = {};
};

XrmLocality.prototype.settings = function(settings) {	
	this._settings = settings;
};

XrmLocality.prototype.attach = function(field) {	
	/* Sample JavaScript code to demonstrate the auto-completion feature.
	   This sample configures the auto-complete feature for the "Account Name"
	   field in the account form. */
	_this = this;
	this._field = field;
	
	function suggestAccounts() {

		// List of sample account names to suggest
		accounts = [
	  { name: 'A. Datum Corporation', code: 'A01' },
	  { name: 'Adventure Works Cycles', code: 'A02' },
	  { name: 'Alpine Ski House', code: 'A03' },
	  { name: 'Bellows College', code: 'A04' },
	  { name: 'Best For You Organics Company', code: 'A05' },
	  { name: 'Blue Yonder Airlines', code: 'A06' },
	  { name: 'City Power & Light', code: 'A07' },
	  { name: 'Coho Vineyard', code: 'A08' },
	  { name: 'Coho Winery', code: 'A09' },
	  { name: 'Coho Vineyard & Winery', code: 'A10' },
	  { name: 'Contoso, Ltd.', code: 'A11' },
	  { name: 'Contoso Pharmaceuticals', code: 'A12' },
	  { name: 'Contoso Suites', code: 'A13' },
	  { name: 'Consolidated Messenger', code: 'A14' },
	  { name: '​Fabrikam, Inc.', code: 'A15' },
	  { name: 'Fabrikam Residences', code: 'A16' },
	  { name: '​First Up Consultants', code: 'A17' },
	  { name: 'Fourth Coffee', code: 'A18' },
	  { name: 'Graphic Design Institute', code: 'A19' },
	  { name: 'Humongous Insurance', code: 'A20' },
	  { name: 'Lamna Healthcare Company', code: 'A21' },
	  { name: 'Litware, Inc.', code: 'A22' },
	  { name: 'Liberty Delightful Sinful Bakery & Cafe', code: 'A23' },
	  { name: 'Lucerne Publishing', code: 'A24' },
	  { name: 'Margie Travel', code: 'A25' },
	  { name: '​Munson Pickles and Preserves Farm', code: 'A26' },
	  { name: 'Nod Publishers', code: 'A27' },
	  { name: 'Northwind Electric Cars', code: 'A28' },
	  { name: 'Northwind Traders', code: 'A29' },
	  { name: 'Proseware, Inc.', code: 'A30' },
	  { name: 'Relecloud', code: 'A31' },
	  { name: 'School of Fine Art', code: 'A32' },
	  { name: 'Southridge Video', code: 'A33' },
	  { name: 'Tailspin Toys', code: 'A34' },
	  { name: 'Trey Research', code: 'A35' },
	  { name: 'The Phone Company', code: 'A36' },
	  { name: 'VanArsdel, Ltd.', code: 'A37' },
	  { name: 'Wide World Importers', code: 'A38' },
	  { name: '​Wingtip Toys', code: 'A39' },
	  { name: 'Woodgrove Bank', code: 'A40' }    
		];

		var keyPressFcn = function (ext) {
			try {
				var userInput = Xrm.Page.getControl(field).getValue();
				resultSet = {
					results: new Array(),
					commands: {
						id: "sp_commands",
						label: "",
						action: function () {
							// Specify what you want to do when the user
							// clicks the "Learn More" link at the bottom
							// of the auto-completion list.
							// For this sample, we are just opening a page
							// that provides information on working with
							// accounts in CRM.
							//window.open("http://www.microsoft.com/en-us/dynamics/crm-customer-center/create-or-edit-an-account.aspx");
						}
					}
				};

				var userInputLowerCase = userInput.toLowerCase();
				for (i = 0; i < accounts.length; i++) {
					if (userInputLowerCase === accounts[i].name.substring(0, userInputLowerCase.length).toLowerCase()) {
						resultSet.results.push({
							id: i,
							fields: [accounts[i].name]
						});
					}
					if (resultSet.results.length >= 10) break;
				}

				if (resultSet.results.length > 0) {
					ext.getEventSource().showAutoComplete(resultSet);
				} else {
					ext.getEventSource().hideAutoComplete();
				}
			} catch (e) {
				// Handle any exceptions. In the sample code,
				// we are just displaying the exception, if any.
				console.log(e);
			}
		};

		Xrm.Page.getControl("name").addOnKeyPress(keyPressFcn);    
	}
};