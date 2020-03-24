function update() {
  var map = mymap;
  var data = list;
  // alert(data)
  var svg = d3.select(map.getPanes().overlayPane).select("svg");
  var g = svg.select("g").attr("class", "leaflet-zoom-hide");

  //ボロノイジェネレーター
  var voronoi = d3.geom
    .voronoi()
    .x(function(d) {
      return d.x;
    })
    .y(function(d) {
      return d.y;
    });
  //ピクセルポジション情報保存用
  var positions = [];

  //位置情報→ピクセルポジション変換
  data.forEach(function(d) {
    var latlng = new L.LatLng(d.lat, d.lon);
    positions.push({
      x: map.latLngToLayerPoint(latlng).x,
      y: map.latLngToLayerPoint(latlng).y
    });
  });

  // //前サークルを削除
  // d3.selectAll('.AEDpoint').remove();
  // //サークル要素を追加
  // var circle = g.selectAll("circle")
  //   .data(positions)
  //   .enter()
  //   .append("circle")
  //   .attr("class", "AEDpoint")
  //   .attr({
  //     "cx":function(d, i) { return d.x; },
  //     "cy":function(d, i) { return d.y; },
  //     "r":4,
  //     fill:"red"
  //   });

  //ボロノイ変換関数
  var polygons = voronoi(positions);
  polygons.forEach(function(v) {
    v.cell = v;
  });

  //前ボロノイPathを削除
  svg.selectAll(".volonoi").remove();
  //path要素を追加
  svg
    .selectAll("path")
    .data(polygons)
    .enter()
    .append("svg:path")
    .attr("class", "volonoi")
    .attr({
      d: function(d) {
        if (!d) return null;
        return "M" + d.cell.join("L") + "Z";
      },
      stroke: "black",
      fill: "none"
    });
}

function initVoronoiMap(map, list) {
  var svg = d3.select(map.getPanes().overlayPane).append("svg");
  var g = svg.append("g").attr("class", "leaflet-zoom-hide");
  svg.attr({ width: "4000px", height: "4000px" });
  map.on("viewreset moveend", update);
  // map.on("zoom", d3.event.transform);
}

L.Control.LookUp = L.Control.extend({
  options: {
    // topright, topleft, bottomleft, bottomright
    position: "topright",
    placeholder: "Search..."
  },
  initialize: function(options /*{ data: {...}  }*/) {
    // constructor
    L.Util.setOptions(this, options);
  },
  onAdd: function(map) {
    // happens after added to map
    var container = L.DomUtil.create("div", "search-container");
    this.form = L.DomUtil.create("form", "form", container);
    var group = L.DomUtil.create("div", "form-group", this.form);
    this.input = L.DomUtil.create("input", "form-control input-sm", group);
    this.input.type = "text";
    this.input.placeholder = this.options.placeholder;
    this.results = L.DomUtil.create("div", "list-group", group);
    // L.DomEvent.addListener(this.input, 'keyup', _.debounce(this.keyup, 300), this);
    L.DomEvent.addListener(this.form, "submit", this.submit, this);
    L.DomEvent.disableClickPropagation(container);
    return container;
  },
  onRemove: function(map) {
    // when removed
    L.DomEvent.removeListener(this._input, "keyup", this.keyup, this);
    L.DomEvent.removeListener(form, "submit", this.submit, this);
  },
  // keyup: function(e) {
  //   if (e.keyCode === 38 || e.keyCode === 40) {
  //     // do nothing
  //   } else {
  //     this.results.innerHTML = '';
  //     if (this.input.value.length > 2) {
  //       var value = this.input.value;
  //       var results = _.take(_.filter(this.options.data, function(x) {
  //         return x.feature.properties.park.toUpperCase().indexOf(value.toUpperCase()) > -1;
  //       }).sort(sortParks), 10);
  //       _.map(results, function(x) {
  //         var a = L.DomUtil.create('a', 'list-group-item');
  //         a.href = '';
  //         a.setAttribute('data-result-name', x.feature.properties.park);
  //         a.innerHTML = x.feature.properties.park;
  //         this.results.appendChild(a);
  //         L.DomEvent.addListener(a, 'click', this.itemSelected, this);
  //         return a;
  //       }, this);
  //     }
  //   }
  // },
  itemSelected: function(e) {
    L.DomEvent.preventDefault(e);
    var elem = e.target;
    var value = elem.innerHTML;
    this.input.value = elem.getAttribute("data-result-name");
    var feature = _.find(
      this.options.data,
      function(x) {
        return x.feature.properties.park === this.input.value;
      },
      this
    );
    if (feature) {
      this._map.fitBounds(feature.getBounds());
    }
    this.results.innerHTML = "";
  },
  submit: function(e) {
    L.DomEvent.preventDefault(e);
    search(this.input.value);
  }
});

L.control.lookup = function(id, options) {
  return new L.Control.LookUp(id, options);
};

L.Control.List = L.Control.extend({
  options: {
    // topright, topleft, bottomleft, bottomright
    position: "topright"
    // placeholder: 'Search...'
  },
  initialize: function(options /*{ data: {...}  }*/) {
    // constructor
    L.Util.setOptions(this, options);
  },
  onAdd: function(map) {
    // happens after added to map
    var container = L.DomUtil.create("div", "list-container");
    // this.form = L.DomUtil.create('form', 'form', container);
    var group = L.DomUtil.create("div", "list-group", container);
    this.input = L.DomUtil.create("div", "list-item", group);
    this.input.type = "text";
    this.input.placeholder = this.options.placeholder;
    this.results = L.DomUtil.create("div", "list-group", group);
    // L.DomEvent.addListener(this.input, 'keyup', _.debounce(this.keyup, 300), this);
    L.DomEvent.addListener(this.form, "submit", this.submit, this);
    L.DomEvent.disableClickPropagation(container);
    return container;
  },
  onRemove: function(map) {
    // when removed
    L.DomEvent.removeListener(this._input, "keyup", this.keyup, this);
    L.DomEvent.removeListener(form, "submit", this.submit, this);
  },
  // keyup: function(e) {
  //   if (e.keyCode === 38 || e.keyCode === 40) {
  //     // do nothing
  //   } else {
  //     this.results.innerHTML = '';
  //     if (this.input.value.length > 2) {
  //       var value = this.input.value;
  //       var results = _.take(_.filter(this.options.data, function(x) {
  //         return x.feature.properties.park.toUpperCase().indexOf(value.toUpperCase()) > -1;
  //       }).sort(sortParks), 10);
  //       _.map(results, function(x) {
  //         var a = L.DomUtil.create('a', 'list-group-item');
  //         a.href = '';
  //         a.setAttribute('data-result-name', x.feature.properties.park);
  //         a.innerHTML = x.feature.properties.park;
  //         this.results.appendChild(a);
  //         L.DomEvent.addListener(a, 'click', this.itemSelected, this);
  //         return a;
  //       }, this);
  //     }
  //   }
  // },
  itemSelected: function(e) {
    L.DomEvent.preventDefault(e);
    var elem = e.target;
    var value = elem.innerHTML;
    this.input.value = elem.getAttribute("data-result-name");
    var feature = _.find(
      this.options.data,
      function(x) {
        return x.feature.properties.park === this.input.value;
      },
      this
    );
    if (feature) {
      this._map.fitBounds(feature.getBounds());
    }
    this.results.innerHTML = "";
  },
  submit: function(e) {
    L.DomEvent.preventDefault(e);
    console.log(this.input.value);
  }
});

L.control.list = function(id, options) {
  return new L.Control.list(id, options);
};
