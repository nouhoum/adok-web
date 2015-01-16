L.Control.Locate=L.Control.extend({options:{position:"topleft",drawCircle:!0,follow:!1,stopFollowingOnDrag:!1,circleStyle:{color:"#136AEC",fillColor:"#136AEC",fillOpacity:.15,weight:2,opacity:.5},markerStyle:{color:"#136AEC",fillColor:"#2A93EE",fillOpacity:.7,weight:2,opacity:.9,radius:5},followCircleStyle:{},followMarkerStyle:{},circlePadding:[0,0],metric:!0,onLocationError:function(a){alert(a.message)},onLocationOutsideMapBounds:function(a){a.stopLocate(),alert(context.options.strings.outsideMapBoundsMsg)},setView:!0,strings:{title:"Show me where I am",popup:"You are within {distance} {unit} from this point",outsideMapBoundsMsg:"You seem located outside the boundaries of the map"},locateOptions:{maxZoom:1/0,watch:!0}},onAdd:function(a){var b=L.DomUtil.create("div","leaflet-control-locate leaflet-bar leaflet-control"),c=this;this._layer=new L.LayerGroup,this._layer.addTo(a),this._event=void 0,this._locateOptions=this.options.locateOptions,L.extend(this._locateOptions,this.options.locateOptions),L.extend(this._locateOptions,{setView:!1});var d={};L.extend(d,this.options.markerStyle,this.options.followMarkerStyle),this.options.followMarkerStyle=d,d={},L.extend(d,this.options.circleStyle,this.options.followCircleStyle),this.options.followCircleStyle=d;var e=L.DomUtil.create("a","leaflet-bar-part leaflet-bar-part-single",b);e.href="#",e.title=this.options.strings.title,L.DomEvent.on(e,"click",L.DomEvent.stopPropagation).on(e,"click",L.DomEvent.preventDefault).on(e,"click",function(){c._active&&(void 0===c._event||a.getBounds().contains(c._event.latlng)||!c.options.setView||j())?m():f()}).on(e,"dblclick",L.DomEvent.stopPropagation);var f=function(){c.options.setView&&(c._locateOnNextLocationFound=!0),c._active||a.locate(c._locateOptions),c._active=!0,c.options.follow&&h(),c._event?k():(L.DomUtil.addClass(c._container,"requesting"),L.DomUtil.removeClass(c._container,"active"),L.DomUtil.removeClass(c._container,"following"))},g=function(a){c._event&&c._event.latlng.lat===a.latlng.lat&&c._event.latlng.lng===a.latlng.lng&&c._event.accuracy===a.accuracy||c._active&&(c._event=a,c.options.follow&&c._following&&(c._locateOnNextLocationFound=!0),k())},h=function(){a.fire("startfollowing",c),c._following=!0,c.options.stopFollowingOnDrag&&a.on("dragstart",i)},i=function(){a.fire("stopfollowing",c),c._following=!1,c.options.stopFollowingOnDrag&&a.off("dragstart",i),k()},j=function(){return void 0===c._event?!1:a.options.maxBounds&&!a.options.maxBounds.contains(c._event.latlng)},k=function(){void 0===c._event.accuracy&&(c._event.accuracy=0);var b=c._event.accuracy;c._locateOnNextLocationFound&&(j()?c.options.onLocationOutsideMapBounds(c):a.fitBounds(c._event.bounds,{padding:c.options.circlePadding,maxZoom:c._locateOptions.maxZoom}),c._locateOnNextLocationFound=!1);var d,e;if(c.options.drawCircle)if(d=c._following?c.options.followCircleStyle:c.options.circleStyle,c._circle){c._circle.setLatLng(c._event.latlng).setRadius(b);for(e in d)c._circle.options[e]=d[e]}else c._circle=L.circle(c._event.latlng,b,d).addTo(c._layer);var f,g;c.options.metric?(f=b.toFixed(0),g="meters"):(f=(3.2808399*b).toFixed(0),g="feet");var h;h=c._following?c.options.followMarkerStyle:c.options.markerStyle;var i=c.options.strings.popup;if(c._circleMarker){c._circleMarker.setLatLng(c._event.latlng).bindPopup(L.Util.template(i,{distance:f,unit:g}))._popup.setLatLng(c._event.latlng);for(e in h)c._circleMarker.options[e]=h[e]}else c._circleMarker=L.circleMarker(c._event.latlng,h).bindPopup(L.Util.template(i,{distance:f,unit:g})).addTo(c._layer);c._container&&(c._following?(L.DomUtil.removeClass(c._container,"requesting"),L.DomUtil.addClass(c._container,"active"),L.DomUtil.addClass(c._container,"following")):(L.DomUtil.removeClass(c._container,"requesting"),L.DomUtil.addClass(c._container,"active"),L.DomUtil.removeClass(c._container,"following")))},l=function(){c._active=!1,c._locateOnNextLocationFound=c.options.setView,c._following=!1};l();var m=function(){a.stopLocate(),a.off("dragstart",i),L.DomUtil.removeClass(c._container,"requesting"),L.DomUtil.removeClass(c._container,"active"),L.DomUtil.removeClass(c._container,"following"),l(),c._layer.clearLayers(),c._circleMarker=void 0,c._circle=void 0},n=function(a){3==a.code&&this._locateOptions.watch||(m(),c.options.onLocationError(a))};return a.on("locationfound",g,c),a.on("locationerror",n,c),this.locate=f,this.stopLocate=m,this.stopFollowing=i,b}}),L.Map.addInitHook(function(){this.options.locateControl&&(this.locateControl=L.control.locate(),this.addControl(this.locateControl))}),L.control.locate=function(a){return new L.Control.Locate(a)};
