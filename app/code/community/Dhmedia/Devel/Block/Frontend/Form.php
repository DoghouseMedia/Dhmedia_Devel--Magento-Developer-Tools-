<?php

class Dhmedia_Devel_Block_Frontend_Form extends Mage_Core_Block_Template
{
	protected function _construct()
	{
		parent::_construct();
		$this->setTemplate('devel/frontend/form.phtml');
	}
	
	public function getShowTemplateHints()
	{
		return false;
	}
}