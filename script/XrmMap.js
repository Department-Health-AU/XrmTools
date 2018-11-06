 function XrmMap() {
	this.map;
	this._container;	
	this._settings = {};
};

XrmMap.prototype.settings = function(settings) {	
	this._url = window.top.Xrm.Page.context.getClientUrl();	
	this._geoData = JSON.parse(window.top.frames[0].Xrm.Page.getAttribute("tga_geoipdetails").getValue());	
	this._settings = settings;
};

XrmMap.prototype.open = function(id) {	
	var _this = this;
	this._id = id;
	this._container = dom.querySelector("#" + id);	
	this.render(this._url);
};

XrmMap.prototype.render = function(id) {	
	var _this = this;

	ajax.request(_this._url + "/api/data/v8.1/organizations?$select=bingmapsapikey,enablebingmapsintegration" , {
		method: "GET",
		headers: {"Accept": "application/json", 
			"Content-Type": "application/json; charset=utf-8"
		},
		success: function(data) {
			try {
				var lat = _this._geoData.latitude;
				var lng = _this._geoData.longitude;
				var title = _this._geoData.ip;
				var subTitle = _this._geoData.city + " " + _this._geoData.postal_code;
				
				map = new Microsoft.Maps.Map(document.getElementById(_this._id), {
					credentials: data.value[0].bingmapsapikey,
					center: new Microsoft.Maps.Location(lat, lng),
					zoom: 8
				});
				
				var center = map.getCenter();

				//Create custom Pushpin
				var pin = new Microsoft.Maps.Pushpin(map.getCenter(), {
					icon: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="30" height="37" viewBox="0 0 30 37" xml:space="preserve"><rect x="0" y="0" width="30" height="30" fill="{color}"/><polygon fill="{color}" points="10,29 20,29 15,37 10,29"/><text x="15" y="20" style="font-size:16px;font-family:arial;fill:#ffffff;" text-anchor="middle">{text}</text></svg>',
					anchor: new Microsoft.Maps.Point(15, 37),
					color: '#ff0000',
					title: title,
					subTitle: subTitle
				});

				//Add the pushpin to the map
				map.entities.push(pin);
			} catch (e) {
				//console.log(e);
			}

		}
	});
};