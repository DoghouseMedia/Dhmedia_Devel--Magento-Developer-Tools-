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
			onResize: function(e){ /* do something by default? */ },
			windowContained: true
		}, options);
		
		$$(selector).each(function(el) {
			helper.absolutize(el);
			helper.initSliders(el)
			helper.elements.push(el);
		});
		
		if (helper.options.windowContained) {
			Element.observe(window, 'resize', function(e){
				helper.elements.each(function(el) {
					var newHeight = window.innerHeight 
						- $('dhmedia_devel_block_frontend').getHeight();
					
					el.setStyle({
						height: String(newHeight) + 'px'
					});
				});
			});
		}
	},
	getDimensions: function(el, update) {
		if (! el.getHeight())
			update = true;
		
		if (update) {
			return {
				innerWidth: (
						parseInt(el.getOffsetParent().getStyle('width')) 
						- parseInt(el.getStyle('right')) 
						- parseInt(el.getStyle('left'))
					)
					- parseInt(el.getStyle('marginLeft'))
					- parseInt(el.getStyle('marginRight'))
					- parseInt(el.getStyle('borderLeftWidth'))
					- parseInt(el.getStyle('borderRightWidth')),
				innerHeight: (
						parseInt(el.getOffsetParent().getStyle('height')) 
						- parseInt(el.getStyle('bottom')) 
						- parseInt(el.getStyle('top'))
					)
					- parseInt(el.getStyle('marginTop'))
					- parseInt(el.getStyle('marginBottom'))
					- parseInt(el.getStyle('borderTopWidth'))
					- parseInt(el.getStyle('borderBottomWidth'))
			};
		} else {
			return {
				innerWidth: el.getWidth()
					- parseInt(el.getStyle('marginLeft'))
					- parseInt(el.getStyle('marginRight'))
					- parseInt(el.getStyle('borderLeftWidth'))
					- parseInt(el.getStyle('borderRightWidth')),
				innerHeight: el.getHeight()
					- parseInt(el.getStyle('marginTop'))
					- parseInt(el.getStyle('marginBottom'))
					- parseInt(el.getStyle('borderTopWidth'))
					- parseInt(el.getStyle('borderBottomWidth'))
			};
		}
	},
	setHeight: function(el, update) {
		el.dimensions = this.getDimensions(el, update);
		el.setStyle({
			height: String(el.dimensions.innerHeight) + 'px'
		});
	},
	absolutize: function(el) {
		el.parentDimensions = this.getDimensions(el.getOffsetParent());
		
		el.absolutize();
		
		el.setStyle({
			top: String(el.positionedOffset().top) + 'px',
			right: String(el.parentDimensions.innerWidth - el.positionedOffset().left - el.getWidth()) + 'px',
			bottom: String(el.parentDimensions.innerHeight - el.positionedOffset().top - el.getHeight()) + 'px',
			left: String(el.positionedOffset().left) + 'px',
			width: 'auto'
		});
		
		this.setHeight(el);
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
				onMouseMove: function(e, slider) {
					el.parentDimensions = helper.getDimensions(el.getOffsetParent());
					
					var newTop = e.clientY
						- (el.getOffsetParent().viewportOffset().top
							+ parseInt(el.getOffsetParent().getStyle('marginTop'))
							+ parseInt(el.getOffsetParent().getStyle('borderTopWidth'))
						)
						- slider.grabPos.top;
				
					var maxTop = (
						el.parentDimensions.innerHeight 
						- parseInt(el.getStyle('bottom')) 
						- parseInt(el.getStyle('borderBottomWidth'))
						- parseInt(el.getStyle('borderTopWidth'))
					);
					
					if (newTop < 0) newTop = 0; // contain min
					if (newTop > maxTop) newTop = maxTop; // contain
					
					el.setStyle({top: newTop + 'px'});
					
					helper.setHeight(el, true);
					
					helper.options.onResize(e);
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
				onMouseMove: function(e, slider) {
					el.parentDimensions = helper.getDimensions(el.getOffsetParent());
					
					var newRight = 
						(el.getOffsetParent().viewportOffset().left
							+ parseInt(el.getOffsetParent().getStyle('marginLeft'))
							+ parseInt(el.getOffsetParent().getStyle('borderLeftWidth'))
							+ el.parentDimensions.innerWidth
						)
						- e.clientX
						- slider.grabPos.right;
					
					var maxRight = (
						el.parentDimensions.innerWidth 
						- parseInt(el.getStyle('left')) 
						- parseInt(el.getStyle('borderLeftWidth'))
						- parseInt(el.getStyle('borderRightWidth'))
					);
						
					if (newRight < 0) newRight = 0; // contain min
					if (newRight > maxRight) newRight = maxRight; // contain max
					
					el.setStyle({right: newRight + 'px'});
					
					helper.options.onResize(e);
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
				onMouseMove: function(e, slider) {
					el.parentDimensions = helper.getDimensions(el.getOffsetParent());
					
					var newBottom = 
						(el.getOffsetParent().viewportOffset().top
							+ parseInt(el.getOffsetParent().getStyle('marginTop'))
							+ parseInt(el.getOffsetParent().getStyle('borderTopWidth'))
							+ el.parentDimensions.innerHeight
							//+ parseInt(el.getOffsetParent().getStyle('marginBottom'))
							//+ parseInt(el.getOffsetParent().getStyle('borderBottomWidth'))
						)
						- e.clientY
						- slider.grabPos.bottom;
					
					var maxBottom = (
						el.parentDimensions.innerHeight 
						- parseInt(el.getStyle('top')) 
						- parseInt(el.getStyle('borderTopWidth'))
						- parseInt(el.getStyle('borderBottomWidth'))
					);
					
					if (newBottom < 0) newBottom = 0; // contain min
					if (newBottom > maxBottom) newBottom = maxBottom; // contain max
					
					el.setStyle({bottom: newBottom + 'px'});
					
					helper.setHeight(el, true);
					
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
				onMouseMove: function(e, slider) {
					el.parentDimensions = helper.getDimensions(el.getOffsetParent());
					
					var newLeft = e.clientX 
						- slider.grabPos.left
						- (el.getOffsetParent().viewportOffset().left 
							+ parseInt(el.getOffsetParent().getStyle('marginLeft'))
							+ parseInt(el.getOffsetParent().getStyle('borderLeftWidth'))
						);
					
					var maxLeft = (
						el.parentDimensions.innerWidth
						- parseInt(el.getStyle('right')) 
						- parseInt(el.getStyle('borderRightWidth'))
						- parseInt(el.getStyle('borderLeftWidth'))
					);
					
					if (newLeft < 0) newLeft = 0; // contain
					if (newLeft > maxLeft) newLeft = maxLeft; // contain
					
					el.setStyle({left: newLeft + 'px'});
					
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
		this.parentElement.removeClassName('resized');
		this.parentElement.addClassName('resizing');
		
		this.grabPos = {
			top: e.layerY,
			right: this.dom.getWidth() - e.layerX,
			bottom: this.dom.getHeight() - e.layerY,
			left: e.layerX
		};
		
		this.boundOnMouseUp = this.onMouseUp.bind(this);
		this.boundOnMouseMove = this.onMouseMove.bind(this);
		
		Element.observe(window, 'mouseup', this.boundOnMouseUp);
		Element.observe(window, 'mousemove', this.boundOnMouseMove);
	},
	onMouseUp: function(e) {
		this.documentProtector.setStyle({display: 'none'});
		this.parentElement.removeClassName('resizing');
		this.parentElement.addClassName('resized');
		
		Element.stopObserving(window, 'mouseup', this.boundOnMouseUp);
		Element.stopObserving(window, 'mousemove', this.boundOnMouseMove);
	},
	onMouseMove: function(e) {
		this.options.onMouseMove(e, this);
	}
};