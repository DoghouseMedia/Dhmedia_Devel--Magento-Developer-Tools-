/**
 * DevelPanelManager
 */
var DevelPanelManager = Class.create();
DevelPanelManager.prototype =
{
	panels: [],
	
	initialize: function(selector, options)
	{
		var panelManager = this;
		panelManager.options = Object.extend({
			left: String($$('body')[0].getWidth()/2) + 'px'
		}, options);

		panelManager.container = $$(selector)[0];
		
		panelManager.grippie = document.createElement('div');
		$(panelManager.grippie).addClassName('devel-grippie');
		panelManager.container.appendChild(panelManager.grippie);
		
		panelManager.buttonContainer = document.createElement('div');
		$(panelManager.buttonContainer).addClassName('devel-panel-buttons');
		panelManager.container.appendChild(panelManager.buttonContainer);

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
		
		panelManager.checkEmpty();
	},
	checkEmpty: function()
	{
		if (this.panels.length && this.buttonContainer.hasClassName('empty')) {
			this.buttonContainer.removeClassName('empty');
		} else if (! this.panels.length && ! this.buttonContainer.hasClassName('empty')) {
			this.buttonContainer.addClassName('empty');
		}
	},
	get: function(panelId)
	{
		return this.panels[panelId];
	},
	create: function(type, title, iconClasses)
	{
		var panelManager = this;

		eval('var panel = new DevelPanel' + type + '(panelManager, title, iconClasses);');
		panelManager.panels[panel.panelId] = panel;
		
		panelManager.container.appendChild(panel.panelDom);
		
		panelManager.addButton(panel.getButton().getDom());
		panelManager.sprites.add(panel.getButton().getDom());
		
		panelManager.checkEmpty();
		
		return panel;
	},
	remove: function(panelId)
	{
		/*
		 * Open the previous tab if this one is open
		 */
		if (this.panels[panelId].isOpen()) {
			var foundPrevious = false;
			var previousPanelId;
			
			for(var _panelId in this.panels) {
				if (this.panels[_panelId].className && this.panels[_panelId].className == 'DevelPanel') {
					if (_panelId == panelId && previousPanelId > 0) {
						this.panels[previousPanelId].open();
						foundPrevious = true;
					}
					previousPanelId = _panelId;
				}
			}
			
			if (! foundPrevious) {
				this.closeAll();
			}
		}
		
		delete this.panels[panelId];
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
		if (lastLeft > 0 || lastLeft === 0 || lastLeft === '0') {
			this.container.setStyle({left: lastLeft + 'px'});
		} else {
			this.container.setStyle({left: this.options.left});
		}
	},
	closeContainer: function()
	{
		this.container.setStyle({
			left: String($$('body')[0].getWidth()) + 'px'
		});

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
	
	initialize: function(panelManager, title, iconClasses) //this function is called as a constructor
	{
		if (!panelManager) return; // stop subclasses from triggering stuff
		
		var panel = this;
		panel.panelManager = panelManager;
		panel.panelDom = document.createElement('div');
		panel.panelDom.addClassName('devel-panel');
		
		panel.panelId = panel.panelManager.panels.length + 1;
		
		panel.button = new DevelPanelButton(panel, title);
		
		if (iconClasses) {
			if (iconClasses.length) {
				panel.button.getDom().addClassName('sprite-small');
			}
		
			iconClasses.each(function(iconClass) {
				panel.button.getDom().addClassName(iconClass);
			});
		}
		
		return panel;
	},
	getButton: function() {
		return this.button;
	},
	load: function(url) {
		if (! this.iframe) {
			this.iframe = document.createElement('iframe');
			this.panelDom.appendChild(this.iframe);
		}
		
		Event.observe(this.iframe, 'load', this.postLoad.bind(this));
		this.preLoad();
		
		this.iframe.src = url;
		
		return this; // chainable
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
		
		return this; // chainable
	},
	postLoad: function() {
		this.loadingProtector.removeClassName('active');
		
		return this; // chainable
	},
	toggle: function() {
		if ($(this.panelDom).hasClassName('active')) {
			this.panelManager.closeAll();
		} else {
			this.open();
		}
		
		return this; // chainable
	},
	isOpen: function()
	{
		return $(this.panelDom).hasClassName('active');
	},
	open: function(url) {
		this.panelManager.closePanels();
		
		$(this.panelDom).addClassName('active');
		this.button.open();

		if (url) {
			this.load(url);
			this.setType('url');
		}
		
		this.panelManager.openContainers();
		
		return this; // chainable
	},
	setType: function(type) {
		if (type == 'content') {
			$(this.panelDom).addClassName('direct-content');
		} else {
			$(this.panelDom).removeClassName('direct-content');
		}
		
		return this; // chainable
	},
	setContent: function(content) {
		this.setType('content');
		
		if (typeof(content) == 'object') {
			$(this.panelDom).appendChild(content);
		} else {
			$(this.panelDom).innerHTML = content;
		}
		
		return this; // chainable
	},
	setTitle: function(title) {
		this.button.setTitle(title);
		
		return this; // chainable
	},
	close: function() {
		$(this.panelDom).removeClassName('active');
		this.button.close();
		
		return this; // chainable
	},
	remove: function() {
		this.panelManager.remove(this.panelId);
		$(this.panelDom).remove();
		this.button.remove();
		delete this;
	}
};

/**
 * DevelPanelButton
 */
var DevelPanelButton = Class.create();
DevelPanelButton.prototype =
{
	initialize: function(panel, title, clickCallback)
	{
		var button = this;
		
		if (! clickCallback) {
			var clickCallback = button.onClick; 
		}
		
		button.panel = panel;
		button.dom = document.createElement('span');
		button.setTitle(title);
		$(button.dom).addClassName('button');
		$(button.dom).observe('click', clickCallback.bind(button));
		
		button.closeBtn = document.createElement('span');
		$(button.closeBtn)
			.addClassName('sprite-small')
			.addClassName('icon-close')
			.addClassName('close')
			.observe('click', this.onCloseClick.bind(button));
		button.panel.panelManager.sprites.add(button.closeBtn);
		button.dom.appendChild(button.closeBtn);
	},
	onClick: function(e)
	{
		this.panel.toggle();
		
		Event.stop(e); // stop the click
	},
	onCloseClick: function(e)
	{
		//if (this.panel.isOpen()) {
		//	this.panel.toggle();
		//} else {
			this.panel.remove();
		//}
			
		Event.stop(e); // stop the click
	},
	getDom: function()
	{
		return this.dom;
	},
	isOpen: function()
	{
		return $(this.getDom()).hasClassName('active');
	},
	open: function()
	{
		$(this.getDom()).addClassName('active');
	},
	close: function()
	{
		$(this.getDom()).removeClassName('active');
	},
	remove: function()
	{
		$(this.getDom()).remove();
	},
	setTitle: function(title)
	{
		this.dom.innerHTML = title;
		this.dom.title = title;
	}
}

/**
 * DevelPanelBrowser
 */
var DevelPanelBrowser = Class.create();
DevelPanelBrowser.prototype = Object.extend(new DevelPanel(),
{
	
});

