/**
 * DevelPanelManager
 */
var DevelPanelManager = Class.create();
DevelPanelManager.prototype =
{
	initialize: function(selector, options)
	{
		var panelManager = this;
		panelManager.panels = [];
		panelManager.options = Object.extend({
			left: String($$('body')[0].getWidth()/2) + 'px'
		}, options);

		panelManager.container = $$(selector)[0];
		
		panelManager.buttonContainer = document.createElement('div');
		$(panelManager.buttonContainer).addClassName('devel-panel-buttons');
		panelManager.container.appendChild(panelManager.buttonContainer);
		
		$$(panelManager.options.panel.selector).each(function(panelDom) {
			var panel = new DevelPanel(panelManager, panelDom);
			panelManager.panels[panelDom.id] = panel;
			panelManager.addButton(panel.getButton().getDom());
		});

		var btnClose = new DevelPanelButton('Close [x]', function(e) {
			panelManager.closeAll();
			Event.stop(e); // stop the form from submitting
		});
		$(btnClose.getDom()).addClassName('close');

		panelManager.addButton(btnClose.getDom());
		
		panelManager.sprites = new DevelSprites(selector + ' .devel-panel-buttons .button');
		
		panelManager.resizeable = new DevelHelpers.Resizeable(selector, {
			onResize: function() {
				var newWidth = parseInt(panelManager.container.getStyle('width'));
				var newLeft = parseInt(panelManager.container.getStyle('left'));
				
				if (newWidth > 0) {
					$(panelManager.buttonContainer).addClassName('active');
				} else {
					$(panelManager.buttonContainer).removeClassName('active');
				}
				
				panelManager.container.writeAttribute('lastleft', newLeft);
			}
		});
		
		panelManager.container.setStyle(panelManager.options.container.css);
	},
	get: function(panelId)
	{
		return this.panels[panelId];
	},
	closeAll: function() {
		this.closePanels();
		this.closeContainers();
	},
	closePanels: function()
	{
		for(var panelId in this.panels) {
			if (this.panels[panelId].className && this.panels[panelId].className == 'DevelPanel') {
				this.panels[panelId].close();
			}
		}
	},
	openContainers: function()
	{
		this.openButtonContainer();
		this.openContainer();
	},
	closeContainers: function()
	{
		this.closeButtonContainer();
		this.closeContainer();
	},
	addButton: function(button)
	{
		$(this.buttonContainer).appendChild(button);
	},
	openButtonContainer: function()
	{
		$(this.buttonContainer).addClassName('active');
	},
	closeButtonContainer: function()
	{
		$(this.buttonContainer).removeClassName('active');
	},
	openContainer: function()
	{
		$(this.container).addClassName('active');
		
		var lastLeft = this.container.readAttribute('lastleft');
		if (lastLeft > 0 || lastLeft === 0) {
			this.container.setStyle({left: lastLeft + 'px'});
		} else {
			this.container.setStyle({left: this.options.left});
		}
	},
	closeContainer: function()
	{
		this.container.setStyle({left: String($$('body')[0].getWidth()) + 'px'});
		
		$(this.container).removeClassName('active');
	}
};

/**
 * DevelPanel
 */
var DevelPanel = Class.create();
DevelPanel.prototype =
{
	className: 'DevelPanel',
	
	initialize: function(panelManager, panelDom) //this function is called as a constructor
	{
		var panel = this;
		panel.panelManager = panelManager;
		panel.panelDom = panelDom;
		
		panel.button = new DevelPanelButton(panelDom.title, function(e) {
			panelManager.get(panelDom.id).toggle();
			Event.stop(e); // stop the form from submitting
		});
		
		String(panel.panelDom.readAttribute('data-button-class')).split(' ').each(function(className) {
			panel.button.getDom().addClassName(className);
		});
	},
	getButton: function() {
		return this.button;
	},
	load: function(url) {
		var iframe = $(this.panelDom).select('iframe')[0];
		
		this.preLoad();
		Event.observe(iframe, 'load', this.postLoad.bind(this));
		
		iframe.src = url;
	},
	preLoad: function() {
		if (! this.loadingProtector) {
			this.loadingProtector = document.createElement('div');
			$(this.loadingProtector).setStyle({
				position: 'absolute',
				top: 0,
				right: 0,
				bottom: 0,
				left: 0,
				zIndex: parseInt(this.panelDom.getStyle('zIndex')) + 1,
				backgroundColor: 'white',
				opacity: '0.90',
				fontSize: 'larger',
				padding: '2em'
			});
			this.loadingProtector.addClassName('protector');
			this.loadingProtector.innerHTML = 'Loading...';
			this.panelDom.appendChild(this.loadingProtector);
		}
		
		this.loadingProtector.addClassName('active');
	},
	postLoad: function() {
		this.loadingProtector.removeClassName('active');
	},
	toggle: function() {
		if ($(this.panelDom).hasClassName('active')) {
			this.panelManager.closeAll();
		} else {
			this.open();
		}
	},
	open: function(url) {
		this.panelManager.closePanels();
		
		$(this.panelDom).addClassName('active');
		$(this.button.getDom()).addClassName('active');

		if (url) {
			this.load(url);
		}
		
		this.panelManager.openContainers();
	},
	setContent: function(content) {
		$(this.panelDom).addClassName('direct-content');
		$(this.panelDom).innerHTML = content;
	},
	close: function() {
		$(this.panelDom).removeClassName('active');
		$(this.button.getDom()).removeClassName('active');
	}
};

/**
 * DevelPanelButton
 */
var DevelPanelButton = Class.create();
DevelPanelButton.prototype =
{
	initialize: function(title, clickCallback) {
		this.dom = document.createElement('span');
		this.dom.innerHTML = title;
		$(this.dom).addClassName('button');
		$(this.dom).observe('click', clickCallback);
	},
	getDom: function() {
		return this.dom;
	}
}