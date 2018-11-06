function XrmGrid() {
	this._start = 0;
	this._count = 0;
	this._total = 0;
	this._nextLinks = [];
	this._hidePageNavigation = false;
	
	this._url = "";	
	this._select = [];
	this._orderby = [];
	this._filter = [];
	this._expand = [];

	this._id;
	this._container;	
	this._settings = {};
	this._header = [];
	this._data;
};

XrmGrid.prototype.settings = function(settings) {	
	this._settings = settings;
	this._count = this._settings.rows || 10;
	this._hidePageNavigation = settings.hidePageNavigation ? settings.hidePageNavigation : false;
	//console.log(this._settings);
};

XrmGrid.prototype.open = function(id) {	
	var _this = this;
	this._id = id;
	this._container = dom.querySelector("#" + id);	
	this.buildUrl();
	this._nextLinks.push(this._url);
	this.render(this._url);

};

XrmGrid.prototype.buildUrl = function() {	
	var _this = this;
	this._url = "";	
	this._select = [];
	this._orderby = [];
	this._filter = [];
	this._expand = [];	
	
	this._url = this._settings.clientUrl + "/api/data/v8.2/" + this._settings.entity + "s";
	
	if (this._settings.id) {
		this._url += "(" + this._settings.id + ")";
		
		if (this._settings.relationship) {
			this._url += "/" + this._settings.relationship;
		}
	}
	this._url += "?"
	
	this._settings.columns.forEach(function(item, index) {
		if (item.name) {
			var val;
			switch(item.type) {
				case "username":
				case "lookup":												
					val = "_" + item.name + "_value";
					break;
				
				default:
					val = item.name;
			}

			_this._select.push(val);
			
			if (_this._settings.relationship || !_this._settings.id) {
				if (item.orderby) {
					if (item.orderby.length > 0) {
						_this._orderby.push(item.name + " " + item.orderby);
					}
				}
			}
				
			if (item.title) {
				_this._header.push({name: item.name, title: item.title});
			}
		}		
	});
	
	var params = ["$count=true"];
	
	if (this._select.length > 0) {
		params.push("$select=" + encodeURI(this._select.join(",")));
	}
	if (this._orderby.length > 0) {
		params.push("$orderby=" + encodeURI(this._orderby.join(",")));
	}	
	if (this._settings.filter) {
		params.push("$filter=" + encodeURI(this._settings.filter));
	}	
	this._url += params.join("&");
	
	return this._url;
};
 
XrmGrid.prototype.orderbyIcon = function(column)
{
	if (column.orderby) {
		if (column.orderby.toLowerCase() == "asc") {
			return "&nbsp; &#8593;";
		}
		if (column.orderby.toLowerCase() == "desc") {
			return "&nbsp; &#8595;";
		}
	}
	return "";
};

XrmGrid.prototype.orderby = function(name)
{
	var _this = this;
	this._settings.columns.forEach(function(column) {
		if (column.name == name) {
			switch(column.orderby) {
				case "asc":
					column.orderby = "desc";
					break;
				case "desc":
					column.orderby = "asc";
					break;
				default:
					column.orderby = "asc";
					break;					
			}
		} else {
			column.orderby = "";
		}
	});
};

XrmGrid.prototype.render = function(url)
{
	var _this = this;
		
	ajax.request(url , {
		method: "GET",
		headers: {"Accept": "application/json", 
			"Content-Type": "application/json; charset=utf-8", 
			"Prefer": "odata.maxpagesize=" + this._count + ", odata.include-annotations=OData.Community.Display.V1.FormattedValue"
		},
		success: function(data) {
			_this._data = data;
			_this._total = data["@odata.count"];
			dom.empty("#" + _this._id);

			dom.dispatchCustomEvent(_this._container, "gridPreLoad", _this);
			
			if (_this._settings.title) {
				dom.append("#" + _this._id, {
					nodeName: "div",
					id: _this._id + "GridHeader",
					className: "grid-header",
					text: _this._settings.title,
					style: {
						width: _this._settings.width ? _this._settings.width : "auto"
					}					
				});
			}
				
			dom.append("#" + _this._id, {
                nodeName: "div",
				id: _this._id + "GridContainer",
                className: "grid-container",
				style: {
					width: _this._settings.width ? _this._settings.width : "auto",
					minHeight: _this._settings.flex ? "0" : ((_this._count+1) * 27) + "px"
				},
				childNodes: [{
					nodeName: "table",
					id: _this._id + "GridTable",
					className: "grid-table",
					style: {
						width: _this._settings.width ? _this._settings.width : "auto"
					}
				}]				
			});

			dom.append("#" + _this._id + "GridTable", {
				nodeName: "thead",
				id: _this._id + "GridTableHeader",
				className: "grid-table-header",	
				childNodes: [{
					nodeName: "tr",
					id: _this._id + "GridTableHeaderRow",
					className: "grid-table-header-row",
					childNodes: _this._settings.select ? [{
						nodeName: "th",
						id: _this._id + "GridTableHeaderCellSelectAll",
						className: "grid-table-header-cell-select",						
						childNodes: [{
							nodeName: "input",
							type: "checkbox",
							id: _this._id + "GridTableHeaderCellSelectAllCheckbox",
							className: "grid-table-header-cell-select-checkbox",
							title: "Select all items",
							checked: _this._settings.selected ? _this._settings.selected : false,
							onchange: function(e) {
								_this._settings.selected = e.target.checked;
								var cb = dom.querySelectorAll("#" + _this._id + " .grid-table-cell-select-checkbox");
								for (var x=0; x < cb.length; x++) {
									if (!cb[x].disabled) {
										cb[x].checked = e.target.checked;
									}
								} 
							}
						}]								
					}] : null					
				}]
			});
				
			_this._settings.columns.forEach(function(column) {
				var hidden = column.hidden ? column.hidden : false;
				if (!hidden) {
					dom.append("#" + _this._id + "GridTableHeaderRow", {
						nodeName: "th",
						className: "grid-table-header-cell",
						style: {maxWidth: column.width ? (isNaN(column.width) ?  column.width : column.width + "px"): "120px",
							textAlign: column.type == "datetime" || column.type == "date" ? "right" : "left"
						},
						text: column.title, 
						title: column.name,
						dataset: {
							name: column.name,
							orderby: column.orderby ? column.orderby : ""
						},
						onclick: function(e) {
							//console.log(e);
							dom.dispatchCustomEvent(this, "gridOrderByClick", e);
							_this.orderby(e.target.dataset.name);
							_this._nextLinks = [_this.buildUrl()];
							_this.render(_this.buildUrl());
						},
						childNodes: [{
							nodeName: "span",
								className: "grid-table-header-orderby-icon",
								innerHTML: _this.orderbyIcon(column)
							}]						
					});
				}				
			});

			dom.append("#" + _this._id + "GridTable", {
                nodeName: "tbody",
				id: _this._id + "GridTableBody",
                className: "grid-table-body"			
			});
			
			data.value.forEach(function(item, index) {
				dom.append("#" + _this._id + "GridTableBody", {
					nodeName: "tr",
					id: _this._id + "GridRow" + index,
					className: "grid-table-row",
					dataset: {
						id: _this._settings.selectId ? item[_this._settings.selectId] : _this._settings.id,
						entity: _this._settings.relationshipEntity ? _this._settings.relationshipEntity : _this._settings.entity,
						item: encodeURI(JSON.stringify(item))
					},
					onclick: function(e){
						dom.dispatchCustomEvent(this, "gridRowClick", e);						
						if (_this._settings.onclick) {
							_this._settings.onclick(e);
						}
					},
					ondblclick: function(e){
						dom.dispatchCustomEvent(this, "gridRowDblClick", e);						
						if (_this._settings.ondblclick) {
							_this._settings.ondblclick(e);
						}
					},					
					childNodes: _this._settings.select ? [{
						nodeName: "td",
						className: "grid-table-cell-select",
						childNodes: [{
							nodeName: "input",
							type: "checkbox",
							id: _this._id + "GridTableCellSelectCheckbox" + index,
							className: "grid-table-cell-select-checkbox",
							checked: _this._settings.selected ? _this._settings.selected : false,							
							dataset: {
								id: _this._settings.id,
								entity: _this._settings.relationshipEntity ? _this._settings.relationshipEntity : _this._settings.entity,
								relationshipId: _this._settings.selectId ? item[_this._settings.selectId] : _this._settings.id,
								relationship: _this._settings.relationship ? _this._settings.relationship : "",
								relationshipEntity: _this._settings.relationshipEntity ? _this._settings.relationshipEntity : ""					
							},
							onclick: function(e) {
								dom.dispatchCustomEvent(this, "gridRowSelected", e);								
								e.stopPropagation();
							}							
						}]								
					}] : null					
				});
				_this._settings.columns.forEach(function(column) {
					var hidden = column.hidden ? column.hidden : false;
					
					var val;
					switch(column.type) {
						case "optionset":						
						case "datetime":
							val = item[column.name + "@OData.Community.Display.V1.FormattedValue"];
							break;

						case "date":						
							val = item[column.name + "@OData.Community.Display.V1.FormattedValue"].substr(0, item[column.name + "@OData.Community.Display.V1.FormattedValue"].indexOf(" "));
							break;

						case "username":
						case "lookup":												
							val = item["_" + column.name + "_value@OData.Community.Display.V1.FormattedValue"];
							break;
						
						default:
							val = item[column.name];
					}
					
					if (!hidden) {
						dom.append("#" + _this._id + "GridRow" + index, {
							nodeName: "td",
							className: "grid-table-cell",
							style: {maxWidth: column.width ? (isNaN(column.width) ?  column.width : column.width + "px"): "120px",
								textAlign: column.type == "datetime" || column.type == "date" ? "right" : "left"
							},
							title: item[column.name],
							innerHTML: column.parse ? column.parse(val, _this) : val,
						});	
					}					
				});
			});


			dom.append("#" + _this._id, {
                nodeName: "div",
				id: _this._id + "GridActionContainer",
                className: "grid-action-container",
				style: {
					width: _this._settings.width ? _this._settings.width : "auto"
				},					
				childNodes: [{
					nodeName: "div",
					id: _this._id + "GridStatus",
					className: "grid-status"					
				},{
					nodeName: "div",
					id: _this._id + "GridActions",
					className: "grid-actions"					
				},{
					nodeName: "div",
					className: "grid-clear-fix"					
				}]				
			});
			
			dom.html("#" + _this._id + "GridStatus", {
				nodeName: "span",
				text: _this._total > 0 ? "Page " + _this._nextLinks.length + " of " + Math.ceil(_this._total/_this._count) : "No entries found"
			});
			
			if (!_this._hidePageNavigation && _this._total > 0) {
				if (_this._nextLinks.length > 1) {
					dom.append("#" + _this._id + "GridActions", {
						nodeName: "a",
						id: _this._id + "GridPreviousAction",
						className: "grid-action",
						text: "Previous",
						onclick: function(e) {
							//console.log(_this);
							_this._nextLinks.pop(); 
							_this.render(_this._nextLinks[_this._nextLinks.length-1]);	
						}
					});	
				} else {
					dom.append("#" + _this._id + "GridActions", {
						nodeName: "span",
						id: _this._id + "GridPreviousAction",
						className: "grid-action grid-action-inactive",
						text: "Previous"
					});					
				}

				dom.append("#" + _this._id + "GridActions", {
					nodeName: "span",
					className: "grid-action-divider",
					text: " | "
				});	
					
				if (data["@odata.nextLink"]) {				
					dom.append("#" + _this._id + "GridActions", {
						nodeName: "a",
						id: _this._id + "GridNextAction",
						className: "grid-action",
						text: "Next",
						onclick: function(e) {
							//console.log(_this);
							_this._nextLinks.push(data["@odata.nextLink"]);
							_this.render(_this._nextLinks[_this._nextLinks.length-1]);							
						}
					});	
				} else {
					dom.append("#" + _this._id + "GridActions", {
						nodeName: "span",
						id: _this._id + "GridNextAction",
						className: "grid-action grid-action-inactive",
						text: "Next"
					});					
				}	
			}
			
			dom.dispatchCustomEvent(_this._container , "gridLoaded", _this);
		}, 
		error: function() {
			console.log("ERROR: Load GRID failed.");			
		}
	});			
};