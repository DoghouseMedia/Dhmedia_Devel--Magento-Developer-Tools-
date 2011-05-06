<?php

class Dhmedia_Devel_Block_Backend extends Mage_Core_Block_Template
{
	protected function _construct()
	{
		parent::_construct();
		$this->setTemplate('devel/backend.phtml');
	}
}