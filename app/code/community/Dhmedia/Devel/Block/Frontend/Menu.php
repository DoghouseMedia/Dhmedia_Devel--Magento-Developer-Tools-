<?php

class Dhmedia_Devel_Block_Frontend_Menu extends Mage_Core_Block_Template
{
	protected function _construct()
	{
		parent::_construct();
		$this->setTemplate('devel/frontend/menu.phtml');
	}
	
	public function getShowTemplateHints()
	{
		return false;
	}
}