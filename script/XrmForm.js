 function XrmForm() {
	this._url = "";	
	this._optionSets = {};
	this._id;
	this._container;	
	this._settings = {};
	this._data = {};
};

XrmForm.prototype.settings = function(settings) {	
	this._settings = settings;
};

XrmForm.prototype.open = function(id) {	
	var _this = this;
	this._id = id;
	this._container = dom.querySelector("#" + id);	
	this.buildUrl();
	this.render(this._url);
};

XrmForm.prototype.buildUrl = function() {	
	var _this = this;
	this._url = "";	
	this._url = this._settings.clientUrl + "/api/data/v8.2/" + this._settings.entity + "s";
	if (this._settings.id) {
		this._url += "(" + this._settings.id + ")";
	}
	return this._url;	
}

XrmForm.prototype.render = function(url)
{
	var _this = this;

	//Load optionsets
	ajax.request(this._settings.clientUrl + "/api/data/v8.2/GlobalOptionSetDefinitions" , {
		method: "GET",
		headers: {"Accept": "application/json", "Content-Type": "application/json; charset=utf-8"},		 
		success: function(data) {
			_this._optionSets = data;
			dom.dispatchCustomEvent(_this._container, "formOptionSetsLoaded", _this);
			
			//Load form
			ajax.request(url , {
				method: "GET",
				headers: {"Accept": "application/json", 
					"Content-Type": "application/json; charset=utf-8", 
					"Prefer": "odata.include-annotations=OData.Community.Display.V1.FormattedValue"
				},
				success: function(data) {
					_this._data = data;
					_this.renderForm(data);
				}, 
				error: function() {
					console.log("ERROR: Load GRID failed.");			
				}
			});				
		},
		error: function() {
			console.log("ERROR: Failed to load optionsets");		
		}
	});			
};	

XrmForm.prototype.getOptionSet = function(name)
{
	var o = [];
	
	this._optionSets.value.forEach(function(opt){
		if (opt.Name == name) {
			o = opt.Options;
		}
	});	
	
	return o;
};

XrmForm.prototype.renderOptionSet = function(field, val)
{
	var _this = this;		
	var options = this.getOptionSet(field.optionSet);
	
	dom.append("#" + field.name + "Field", {
		nodeName: "select",
		id: field.name,
		className: "form-select form-field",
		readOnly: field.readOnly || false,
	});	
				
	options.forEach(function(o) {		
		dom.append("#" + field.name, {
			nodeName: "option",
			value: o.Value,
			text: o.Label.LocalizedLabels[0].Label,
			selected: parseInt(val) == parseInt(o.Value) || parseInt(o.Value) == parseInt(field.value) ? true : false
		});			
	});
}
						
XrmForm.prototype.renderForm = function(data)
{
	var _this = this;	
	dom.empty("#" + this._id);

	dom.dispatchCustomEvent(this._container, "formPreLoad", this);
	
	if (this._settings.title) {
		dom.append("#" + this._id, {
			nodeName: "div",
			id: this._id + "FormHeader",
			className: "form-header",
			style: {
				width: _this._settings.width ? _this._settings.width : "auto"
			},	
			text: this._settings.title
		});
	}

	dom.append("#" + this._id, {
		nodeName: "div",
		id: this._id + "FormContainer",
		className: "form-container",
		style: {
			width: _this._settings.width ? _this._settings.width : "auto"
		}		
	});
		
	this._settings.fields.forEach(function(field) {
		var val;
		var dis;
		
		dom.append("#" + _this._id + "FormContainer", {
			nodeName: "div",
			id: _this._id + "FormRow",
			className: "form-row",				
			childNodes: [{
				nodeName: "label",
				id: field.name + "Label",
				className: "form-label",
				htmlFor: field.name,
				text: field.label ? field.label : field.title
			},{
				nodeName: "div",
				id: field.name + "Field",
				className: "form-field"
			}]
		});
		
		
		switch(field.type) {
			case "optionset":
				//val = data[field.name + "@OData.Community.Display.V1.FormattedValue"];
				val = data[field.name];
				_this.renderOptionSet(field, val);					
				break;
				
			case "datetime":
				val = data[field.name + "@OData.Community.Display.V1.FormattedValue"];
				dom.append("#" + field.name + "Field", {
					nodeName: "input",
					type: "text",
					id: field.name,
					className: "form-input form-field",
					value: val,
					readOnly: field.readOnly || false,
				});					
				break;

			case "date":						
				val = data[field.name + "@OData.Community.Display.V1.FormattedValue"].substr(0, item[field.name + "@OData.Community.Display.V1.FormattedValue"].indexOf(" "));
				dom.append("#" + field.name + "Field", {
					nodeName: "input",
					type: "text",
					id: field.name,
					className: "form-input",
					value: val,
					readOnly: field.readOnly || false,
				});					
				break;

			case "username":
				val = data["_" + field.name + "_value@OData.Community.Display.V1.FormattedValue"];
				dom.append("#" + field.name + "Field", {
					nodeName: "input",
					type: "text",
					id: field.name,
					className: "form-input form-field",
					value: val,
					readOnly: field.readOnly || false,
				});					
				break;
				
			case "lookup":												
				val = data["_" + field.name + "_value@OData.Community.Display.V1.FormattedValue"];
				dom.append("#" + field.name + "Field", {
					nodeName: "input",
					type: "text",
					id: field.name,
					className: "form-input",
					value: val,
					readOnly: field.readOnly || false,
				});					
				break;

			case "textarea":
				val = data[field.name];
				dom.append("#" + field.name + "Field", {
					nodeName: "textarea",
					id: field.name,
					className: "form-textarea form-field",
					text: field.parse ? field.parse(val, _this) : val,
					readOnly: field.readOnly || false,
				});	
				break;
				
			default:
				val = data[field.name];
				dom.append("#" + field.name + "Field", {
					nodeName: "input",
					type: "text",
					id: field.name,
					className: "form-input form-field",
					value: field.parse ? field.parse(val, _this) : val,
					readOnly: field.readOnly || false,
				});				
		} 		
	});
	dom.dispatchCustomEvent(this._container, "formLoaded", this);
}	

	