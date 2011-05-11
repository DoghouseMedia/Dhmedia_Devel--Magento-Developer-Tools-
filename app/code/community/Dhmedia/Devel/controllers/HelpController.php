<?php

class Dhmedia_Devel_HelpController extends Mage_Core_Controller_Front_Action
{
	public function viewAction()
	{
		$this->loadLayout()
			->getLayout()->getBlock('head')->setTitle($this->__('Help'));
		$this->renderLayout();
	}
}