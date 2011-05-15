/**
 * DevelHelpers
 */
var DevelHelpers = {};

/**
 * DevelHelpers.Resizeable
 */
DevelHelpers.Resizeable = Class.create();
DevelHelpers.Resizeable.prototype =
{
	initialize: function(selector, options)
	{
		var helper = this;
		helper.elements = [];
		helper.options = Object.extend({
			onResize: function(e){ /* do something by default? */ }
		}, options);
		
		$$(selector).each(function(el) {
			helper.initSliders(el)
			helper.elements.push(el);
		});
	},
	initSliders: function(el) {
		var helper = this;
		el.sliders = {};
		
		if ($(el).getStyle('borderTopWidth') != '0px') {
			el.sliders.top = this.initSlider(el, {
				css: {
					top: 0,
					right: 0,
					left: 0,
					width: '100%',
					height: $(el).getStyle('borderTopWidth'),
					marginTop: (-1 * parseInt($(el).getStyle('borderTopWidth'))) + 'px',
					cursor: 'ns-resize'
				},
				onMouseMove: function(e) {
					console.error("Not implemented! (Trivial)");
					//helper.options.onResize(e);
				}
			});
		}
		if ($(el).getStyle('borderRightWidth') != '0px') {
			el.sliders.right = this.initSlider(el, {
				css: {
					top: 0,
					right: 0,
					bottom: 0,
					width: $(el).getStyle('borderRightWidth'),
					height: '100%',
					marginRight: (-1 * parseInt($(el).getStyle('borderRightWidth'))) + 'px',
					cursor: 'ew-resize'
				},
				onMouseMove: function(e) {
					console.error("Not implemented! (Trivial)");
					//helper.options.onResize(e);
				}
			});
		}
		if ($(el).getStyle('borderBottomWidth') != '0px') {
			el.sliders.bottom = this.initSlider(el, {
				css: {
					right: 0,
					bottom: 0,
					left: 0,
					width: '100%',
					height: $(el).getStyle('borderBottomWidth'),
					marginBottom: (-1 * parseInt($(el).getStyle('borderBottomWidth'))) + 'px',
					cursor: 'ns-resize'
				},
				onMouseMove: function(e) {
					el.setStyle({
						height: (el.viewportOffset().top + el.getHeight() - e.screenY) + 'px'
					});
					helper.options.onResize(e);
				}
			});
		}
		if ($(el).getStyle('borderLeftWidth') != '0px') {
			el.sliders.left = this.initSlider(el, {
				css: {
					top: 0,
					bottom: 0,
					left: 0,
					width: $(el).getStyle('borderLeftWidth'),
					height: '100%',
					marginLeft: (-1 * parseInt($(el).getStyle('borderLeftWidth'))) + 'px',
					cursor: 'ew-resize'
				},
				onMouseMove: function(e) {
					el.setStyle({
						width: (el.viewportOffset().left + el.getWidth() - e.screenX) + 'px'
					});
					helper.options.onResize(e);
				}
			});
		}
	},
	initSlider: function(el, options) {
		return new DevelHelpers.Resizeable.Slider(el, options);
	}
}

/**
 * DevelHelpers.Resizeable.Slider
 */
DevelHelpers.Resizeable.Slider = Class.create();
DevelHelpers.Resizeable.Slider.prototype =
{
	initialize: function(parentElement, options)
	{
		var slider = this;
		slider.parentElement = parentElement;
		slider.options = Object.extend({
			onResize: function(){}
		}, options);
		
		/* Dom element */
		slider.dom = document.createElement('div');
		$(slider.dom).setStyle({
			position: 'absolute'
		});
		$(slider.dom).setStyle(slider.options.css);
		slider.parentElement.appendChild(slider.dom);
		
		/* Document protector */
		slider.documentProtector = document.createElement('div');
		slider.documentProtector.setStyle({
			position: 'fixed',
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
			zIndex: parseInt(slider.parentElement.getStyle('zIndex')) + 1,
			display: 'none'
		});
		$$('body')[0].appendChild(slider.documentProtector);
		
		$(slider.dom).observe('mousedown', slider.onMouseDown.bind(this));
	},
	onMouseDown: function(e) {
		this.documentProtector.setStyle({display: 'block'});
		this.parentElement.addClassName('resizing');
		
		this.boundOnMouseUp = this.onMouseUp.bind(this);
		this.boundOnMouseMove = this.onMouseMove.bind(this);
		
		Element.observe(window, 'mouseup', this.boundOnMouseUp);
		Element.observe(window, 'mousemove', this.boundOnMouseMove);
	},
	onMouseUp: function(e) {
		this.documentProtector.setStyle({display: 'none'});
		this.parentElement.removeClassName('resizing');
		
		Element.stopObserving(window, 'mouseup', this.boundOnMouseUp);
		Element.stopObserving(window, 'mousemove', this.boundOnMouseMove);
	},
	onMouseMove: function(e) {
		this.options.onMouseMove(e);
	}
};

/**
 * DevelHelpers.Window
 * 
 * @todo Make cross-browser (eg. IE uses different ways to get width/height)
 */
DevelHelpers.WindowSize = Class.create({
    width: window.innerWidth,
    height: window.innerHeight
});