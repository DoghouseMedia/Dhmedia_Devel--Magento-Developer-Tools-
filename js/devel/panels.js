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
		console.log(this.container);

		panelManager.moveHandle = new DevelPanelMoveHandle();
		
		panelManager.buttonContainer = document.createElement('div');
		$(panelManager.buttonContainer).addClassName('devel-panel-buttons');
		$$('body')[0].appendChild(panelManager.buttonContainer);
		
		$$(options.panel.selector).each(function(panelDom) {
			var panel = new DevelPanel(panelManager, panelDom);

			panelManager.panels[panelDom.id] = panel;

			panelManager.addButton(panel.getButton());
		});

		var btnClose = document.createElement('span');
		btnClose.innerHTML = 'Close [x]';
		$(btnClose).addClassName('button').addClassName('close');
		$(btnClose).observe('click', function(e) {
			panelManager.closeAll();
			Event.stop(e); // stop the form from submitting
		});

		panelManager.addButton(btnClose);
	},
	get: function(panelId)
	{
		return this.panels[panelId];
	},
	closeAll: function()
	{
		for(var panelId in this.panels) {
			if (this.panels[panelId].className && this.panels[panelId].className == 'DevelPanel') {
				this.panels[panelId].close();
			}
		}
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
	},
	closeContainer: function()
	{
		$(this.container).removeClassName('active');
	}
};


/**
 * DevelPanelMoveHandle
 */
var DevelPanelMoveHandle = Class.create();
DevelPanelMoveHandle.prototype =
{
	initialize: function()
	{

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
		this.panelDom = panelDom;
		
		this.button = document.createElement('span');
		this.button.innerHTML = panelDom.title;
		$(this.button).addClassName('button');
		$(this.button).observe('click', function(e) {
			panelManager.closeAll();			
			panelManager.get(panelDom.id).open();
			panelManager.openButtonContainer();
			panelManager.openContainer();
			Event.stop(e); // stop the form from submitting
		});
	},
	getButton: function() {
		return this.button;
	},
	load: function(url) {
		$(this.panelDom).select('iframe')[0].src = url;
	},
	open: function(url) {
		$(this.panelDom).addClassName('active');

		if (url) {
			this.load(url);
		}
	},
	setContent: function(content) {
		$(this.panelDom).addClassName('direct-content');
		$(this.panelDom).innerHTML = content;
	},
	close: function() {
		$(this.panelDom).removeClassName('active');
	}
};