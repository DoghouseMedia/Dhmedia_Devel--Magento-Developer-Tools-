<?php

class Dhmedia_Devel_Block_Frontend extends Mage_Core_Block_Template
{
	protected function _construct()
	{
		/*
		 * Check Devel is allowed to run
		 */
		if (! Mage::helper('devel/config')->isDevelMode()) {
			return false;
		}
		
		/*
		 * Check the correct Template.php override is being applied
		 */
		if (! in_array(
			realpath('app/code/local/Mage/Core/Block/Template.php'),
			get_included_files()
		)) {
			Mage::getSingleton('core/session')->addError(
				"You NEED to restart PHP (APC, ZendServer, etc...) for hints to display after installing!
			");
		}
		
		parent::_construct();
		$this->insert(new Dhmedia_Devel_Block_Frontend_Menu(), 'menu', null, 'menu');
		
		$this->setTemplate('devel/frontend.phtml');
		
		$this->initKrumo();
	}

	protected function initKrumo()
	{
		require_once(Mage::getBaseDir('lib') . '/krumo/class.krumo.php');
	}
	
	public function getLayoutXml()
	{
		$layout = Mage::getSingleton('core/layout');
		
		$update = $layout->getUpdate();
			
		$update->addHandle('devel_handle');
		
		foreach($update->getHandles() as $handle) {
			$update->fetchPackageLayoutUpdates($handle);
		}
		
		$xml = $update->asSimplexml();
		return $xml->asNiceXml();
	}
	
	public function getShowTemplateHints()
	{
		return false;
	}
}