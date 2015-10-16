define([
	"../has"
], function (has) {

	var SPRITE_CONTAINER_ID = 'requirejs-dplugins-icons';

	return {
		cache: {}, // stores all required paths
		icons: [], // stores markup of all fetched icons
		spriteContainer: null, // DOM element, parent of svg sprite
		getFilename: getFilename,
		createContainer: createContainer,
		extractIcon: extractIcon,
		generateSprite: generateSprite
	};

	// takes a path and returns the filename
	function getFilename(filepath) {
		return filepath.replace(/.*\/(.*)\.svg$/g, "$1");
	}

	// Creates the sprite container. This method should be executed once only.
	function createContainer() {
		var div = document.createElement("div");
		div.setAttribute("id", SPRITE_CONTAINER_ID);
		document.body.appendChild(div);
		return div;
	}

	// Makes a symbol out of an svg icon
	function extractIcon(svg, filename, cheerio /* SVG parser */) {
		var icon, id, viewBox;
		if (has("builder") && cheerio) { // server side SVG parsing
			var $ = cheerio.load(svg);
			icon = $("svg").html();
			id = filename || "";
			viewBox = $("svg").attr("viewbox") || "";
		} else { // client side SVG parsing
			var div = document.createElement("div");
			div.innerHTML = svg;
			svg = div.querySelector("svg");
			icon = _innerSVG(svg);
			id = filename || "";
			viewBox = svg.getAttribute("viewBox") || "";
		}
		return _generateSymbol(id, icon, viewBox);
	}

	// Makes a sprite from a list of symbols
	function generateSprite(symbols) {
		return "<svg xmlns='http://www.w3.org/2000/svg' " +
			"version='1.1' style='display: none'>\n" + symbols.join("\n") + "\n" + "</svg>";
	}

	function _generateSymbol(id, icon, viewBox) {
		return "<symbol viewBox='" + viewBox + "' id='" + id + "'>" + icon + "</symbol>";
	}

	// This compensates for the fact that <svg>.innerHTML doesn't work in the browser
	function _innerSVG(element) {
		var div = document.createElement("div");

		for (var i = 0, l = element.childNodes.length; i < l; i++) {
			var node = element.childNodes[i];
			div.appendChild(node.cloneNode(true));
		}
		return div.innerHTML;
	}

});
