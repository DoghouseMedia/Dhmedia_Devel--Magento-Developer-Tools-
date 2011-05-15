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

		panelManager.container = $$(selector)[0];

		panelManager.buttonContainer = document.createElement('div');
		$(panelManager.buttonContainer).addClassName('devel-panel-buttons');
		panelManager.container.appendChild(panelManager.buttonContainer);
		
		$$(options.panel.selector).each(function(panelDom) {
			var panel = new DevelPanel(panelManager, panelDom);
			panelManager.panels[panelDom.id] = panel;
			panelManager.addButton(panel.getButton().getDom());
		});

		var btnClose = new DevelPanelButton('Close [x]', function(e) {
			panelManager.closePanels();
			panelManager.closeContainers();
			Event.stop(e); // stop the form from submitting
		});
		$(btnClose.getDom()).addClassName('close');

		panelManager.addButton(btnClose.getDom());
		
		panelManager.resizeable = new DevelHelpers.Resizeable(selector, {
			onResize: function() {
				panelManager.container.writeAttribute('lastwidth',
					parseInt(panelManager.container.getStyle('width'))
				);
			}
		});
	},
	get: function(panelId)
	{
		return this.panels[panelId];
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
		
		var lastWidth = this.container.readAttribute('lastwidth');
		if (lastWidth > 0) {
			this.container.setStyle({width: lastWidth + 'px'});
		}
	},
	closeContainer: function()
	{
		this.container.setStyle({width: 0});
		
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
		this.panelManager = panelManager;
		this.panelDom = panelDom;
		
		this.button = new DevelPanelButton(panelDom.title, function(e) {
			panelManager.get(panelDom.id).open();
			Event.stop(e); // stop the form from submitting
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
		
		//$(this.loadingProtector).setStyle({display: 'block'});
		//$(this.loadingProtector).setStyle({opacity: '1'});
		this.loadingProtector.addClassName('active');
	},
	postLoad: function() {
		//$(this.loadingProtector).setStyle({opacity: '0'});
		this.loadingProtector.removeClassName('active');
	},
	open: function(url) {
		this.panelManager.closePanels();
		
		$(this.panelDom).addClassName('active');

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