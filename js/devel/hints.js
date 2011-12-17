/**
 * DevelHints
 */
var DevelHints = Class.create();
DevelHints.prototype =
{
	initialize: function(rootSelector, hintsSelector)
	{
		var hints = this;
		hints.rootSelector = rootSelector;
		hints.hintsSelector = hintsSelector;
		hints.containers = [];
		
		$$(hints.hintsSelector).each(function(domHintContainer){
			hints.containers.push(new DevelHintContainer(domHintContainer));
		});
		
		$$(hints.rootSelector).invoke('addClassName', 'active');
		
		$(document).observe('keydown', function(event) {
			if (event.ctrlKey && event.keyCode == 72) {
				DevelGlobals.DevelHints.toggle();
			}
		});
	},
	toggleStateOn: true,
	toggle: function() {
		if (this.toggleStateOn) {
			$$(this.rootSelector).invoke('removeClassName', 'active');
			this.toggleStateOn=false;
		} else {
			$$(this.rootSelector).invoke('addClassName', 'active');
			this.toggleStateOn=true;
		}
	}
};

/**
 * DevelHintContainer
 */
var DevelHintContainer = Class.create();
DevelHintContainer.prototype =
{
	initialize: function(domHintContainer)
	{
		var hintContainer = this;
		hintContainer.dom = domHintContainer;
		hintContainer.hints = [];
		
		hintContainer.tooltip = $(hintContainer.dom).select('.tooltip')[0];
		$(hintContainer.tooltip).observe('click', 
			hintContainer.clickTooltip.bindAsEventListener(this)
		);
		hintContainer.data = $(hintContainer.dom).select('.data')[0].innerHTML.evalJSON();
		
		var hintsOptions = [
			{className: 'DevelHintTemplate', title: "Template (.phtml)", description: "Change the HTML Code of the template."},
			{className: 'DevelHintLayout', title: "Layout (xml)", description: "Understand what xml code is responsible for this block."},
			{className: 'DevelHintWizardRemove', title: "Remove block", description: "Smart Wizard - Remove this block from the layout"},
			{className: 'DevelHintClass', title: "Class info", description: "View class methods"},
			{className: 'DevelHintDocs', title: "Class documentation", description: "View official class documentation"},
			{className: 'DevelHintKrumo', title: "Captured vars", description: "Vars that were defined in the block during rendering", dom: $(hintContainer.dom).select('.hint[rel="Krumo"]')[0]}
		];

		hintsOptions.each(function(hintOptions) {
			eval("var hint = new " + hintOptions.className + "(hintOptions, hintContainer.data);");
			hintContainer.hints.push(hint);
			hintContainer.dom.appendChild(hint.dom);
		});
		
		hintContainer.dom.addClassName('active');
	},
	clickTooltip: function(e)
	{
		var div = document.createElement('div');
		var h1 = document.createElement('h1');
			h1.innerHTML = this.data.nameInLayout
				+ ' - ' + this.dom.title;
		var ul = document.createElement('ul');
		
		$(this.hints).each(function(hint){
			var li = document.createElement('li');
			var a = document.createElement('a');
			var p = document.createElement('p');
			
			a.innerHTML = hint.getTitle();
			a.href = '#';
			$(a).observe('click', hint.click.bind(hint));
			
			p.innerHTML = hint.getDescription();
			
			li.appendChild(a);
			li.appendChild(p);
			
			ul.appendChild(li);
		});
		
		div.appendChild(h1);
		div.appendChild(ul);
		
		DevelGlobals.PanelManager.create('Browser', 'Block info').setContent(div).open();
		
		Event.stop(e);
	}
};

/**
 * DevelHint
 */
var DevelHint = Class.create();
DevelHint.prototype =
{
	initialize: function(options, data)
	{
		if (! options) return;
		
		this.options = options;
		this.data = data;
		
		if (! this.options.dom) {
			this.options.dom = document.createElement('div');
			$(this.options.dom).addClassName('hint')
				.writeAttribute('rel', this.options.className);
		}
		
		this.dom = this.options.dom;
		
		$(this.dom).hide();
	},
	getTitle: function()
	{
		return this.options.title;
	},
	getDescription: function()
	{
		return this.options.description;
	},
	getData: function()
	{
		return this.data;
	}
};

/**
 * DevelHintLayout
 */
var DevelHintLayout = Class.create();
DevelHintLayout.prototype = Object.extend(new DevelHint(),
{
	click: function(e)
	{	
		var el = e.target;
		
		var name = el.title;
		var content = '';
		var editorIds = [];
		var data = this.getData();
		
		content += '<h1>Block XML</h1>';
		data.xmlLayout.each(function(layout) {
			content += '<h2>' + layout.file + '</h2>';
			content += '<strong>' + layout.handle + '</strong><br />';
			content += '<em>' + layout.path + '</em>';
			content += ' - <a target="devel-editor" href="' + layout.url 
				+ '" onclick="DevelGlobals.PanelManager.create(\'Browser\', this.innerHTML).open(this.href);">Edit</a>';
			
			layout.xml.each(function(xml, i) {
				xml = xml.replace(/\[\[/g, '<');
				xml = xml.replace(/\]\]/g, '>');
				xml = xml.replace(/\'\'/g, '"');

				/**
				 * @todo Change method to ensure id uniqueness without using random 
				 * 
				 * This could have a (global) counter to increment ids
				 * to ensure having a unique id without having to use random.
				 */
				var editorId = 'editor-' + layout.file + '-' + i + '-' + Math.random(0,999);
				
				content += '<textarea class="devel-editor" id="' + editorId +'">';
				content += xml;
				content += '</textarea>';

				editorIds.push(editorId);
			});
		});
		
		var blockXmlPanel = DevelGlobals.PanelManager.create('Browser', 'Block XML')
			.setContent(content);
		
		blockXmlPanel.open();
		
		console.log('HINT BLOCK XML', name, data);
		
		Event.stop(e);
	}
});

/**
 * DevelHintClass
 */
var DevelHintClass = Class.create();
DevelHintClass.prototype = Object.extend(new DevelHint(),
{
	click: function(e)
	{	
		var el = e.target;
		
		var name = el.title;
		var content = '';
		var editorIds = [];
		var data = this.getData();
		
		content += '<h1>Block Class: ' + data.className + '</h1>';
		content += '<h2>Class Methods</h2>';
		content += '<ul>';
		data.classMethods.each(function(method) {
			content += '<li>' + method + '</li>';
		});
		content += '</ul>';
		/*
		 * @todo Print localVars
		 * 
		 * It's an object, so we can't use ".each()".
		 */
		//content += '<h2>Local Vars</h2>';
		//content += '<ul>';
		//data.localVars.each(function(key, val) {
		//	content += '<li>' + key + ': ' + val + '</li>';
		//});
		//content += '</ul>';
		
		var blockXmlPanel = DevelGlobals.PanelManager.create('Browser', 'Block class')
			.setContent(content).open();
		
		console.log('HINT BLOCK CLASS', name, data);
		
		Event.stop(e);
	}
});

/**
 * DevelHintTemplate
 */
var DevelHintTemplate = Class.create();
DevelHintTemplate.prototype = Object.extend(new DevelHint(),
{
	click: function(e)
	{	
		var el = e.target;
		var name = el.title;
		var data = this.getData();

		DevelGlobals.PanelManager.create('Browser', 'Block template').open(data.editorUrl);
		
		console.log('HINT BLOCK TEMPLATE', name, data);
		
		Event.stop(e);
	}
});

/**
 * DevelHintKrumo
 */
var DevelHintKrumo = Class.create();
DevelHintKrumo.prototype = Object.extend(new DevelHint(),
{
	getData: function()
	{
		return $(this.dom).select('.devel-data-json')[0].innerHTML;
	},
	click: function(e)
	{	
		DevelGlobals.PanelManager.create('Browser', 'Block Vars').open()
			.setContent(this.getData());
		
		Event.stop(e);
	}
});

/**
 * DevelHintDocs
 */
var DevelHintDocs = Class.create();
DevelHintDocs.prototype = Object.extend(new DevelHint(),
{
	click: function(e)
	{	
		DevelGlobals.PanelManager.create('Browser', 'Block docs').open(this.getData().classDocsUrl);
	}
});

/**
 * DevelHintWizardRemove
 */
var DevelHintWizardRemove = Class.create();
DevelHintWizardRemove.prototype = Object.extend(new DevelHint(),
{
	click: function(e)
	{
		var handles = [];
		var references = [];
		this.getData().xmlLayout.each(function(layout){
			handles.push(layout.handle);
			layout.references.each(function(reference){
				references.push(reference);
			});
		});
		this.getData().wizardRemove.params.handles_used = handles.uniq();
		this.getData().wizardRemove.params.references = references.uniq();
		this.getData().wizardRemove.params.handles = this.getData().handles;
		
		console.log(this.getData().wizardRemove.params);
		
		var url = this.getData().wizardRemove.url + '?';
		for(var key in this.getData().wizardRemove.params) {
			var val = this.getData().wizardRemove.params[key];
			url += key + '=' + encodeURIComponent(val) + '&';
		};
		
		DevelGlobals.PanelManager.create('Browser', this.getData().wizardRemove.title)
			.open(url);
		
		console.log('HINT REMOVE WIZ', this.getData());
		
		Event.stop(e);
	}
});