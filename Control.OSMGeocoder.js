L.Control.OSMGeocoder = L.Control.extend({
	options: {
		collapsed: true,
		position: 'topright',
		text: 'Locate',
		bounds: null, // L.LatLngBounds
		email: null, // String
		callback: function (results) {
			console.log(results);
			var bbox = results[0].boundingbox,
				first = new L.LatLng(bbox[0], bbox[2]),
				second = new L.LatLng(bbox[1], bbox[3]),
				bounds = new L.LatLngBounds([first, second]);
			this._map.fitBounds(bounds);
		}
	},

	_callbackId: 0,

	initialize: function (options) {
		L.Util.setOptions(this, options);
	},

	onAdd: function (map) {
		this._map = map;
		var className = 'leaflet-control-geocoder',
			container = this._container = L.DomUtil.create('div', className);

		L.DomEvent.disableClickPropagation(container);

		var form = this._form = L.DomUtil.create('form', className + '-form');

		var input = this._input = document.createElement('input');
		input.type = "text";

		var submit = document.createElement('button');
		submit.type = "submit";
		submit.innerHTML = this.options.text;

		form.appendChild(input);
		form.appendChild(submit);

		L.DomEvent.addListener(form, 'submit', this._geocode, this);

		if (this.options.collapsed) {
			L.DomEvent.addListener(container, 'mouseover', this._expand, this);
			L.DomEvent.addListener(container, 'mouseout', this._collapse, this);

			var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
			link.href = '#';
			link.title = 'Nominatim Geocoder';

			L.DomEvent.addListener(link, L.Browser.touch ? 'click' : 'focus', this._expand, this);

			this._map.on('movestart', this._collapse, this);
		} else {
			this._expand();
		}

		container.appendChild(form);

		return container;
	},

	_geocode : function (event) {
		L.DomEvent.preventDefault(event);
    //http://wiki.openstreetmap.org/wiki/Nominatim
		this._callbackId = "_l_osmgeocoder_" + (this._callbackId++);
		window[this._callbackId] = L.Util.bind(this.options.callback, this);


		/* Set up params to send to Nominatim */
		var params = {
			// Defaults
			q: this._input.value,
			json_callback : this._callbackId,
			format: 'json'
		};
		
		if (this.options.bounds && this.options.bounds != null) {
		    if( this.options.bounds instanceof L.LatLngBounds ) {
			params.viewbox = this.options.bounds.toBBoxString();
			params.bounded = 1;
		    }
		    else {
			console.log('bounds must be of type L.LatLngBounds');
			return;
		    }
		}

		if (this.options.email && this.options.email != null) {
		    if (typeof this.options.email == 'string') {
			params.email = this.options.email;
		    }
		    else{
			console.log('email must be a string');
		    }
		}

		var url = " http://nominatim.openstreetmap.org/search" + L.Util.getParamString(params),
		script = document.createElement("script");




		script.type = "text/javascript";
		script.src = url;
		script.id = this._callbackId;
		document.getElementsByTagName("head")[0].appendChild(script);
	},

	_expand: function () {
		L.DomUtil.addClass(this._container, 'leaflet-control-geocoder-expanded');
	},

	_collapse: function () {
		this._container.className = this._container.className.replace(' leaflet-control-geocoder-expanded', '');
	}
});
