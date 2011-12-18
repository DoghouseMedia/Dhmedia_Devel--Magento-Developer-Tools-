<?php

class Dhmedia_Devel_SelfController extends Mage_Core_Controller_Front_Action
{
	public function hasupdateAction()
	{
		chdir(Mage::getBaseDir() . '/downloader/');
		
		if (version_compare(Mage::getVersion(), '1.5.0.0') >= 0) {
			require_once './Maged/Connect.php';
			$connectModel = new Maged_Model_Connect();
			$connect = $connectModel->connect();
		}
		else {
			require_once './Maged/Pear.php';
			$connectModel = new Maged_Model_Pear();
			$connect = $connectModel->pear();
		}
		
		$connect->run('list-upgrades', array(
			'channel'=>'connect.magentocommerce.com/community'
		));
		
		$this->getResponse()
			->setHeader('Content-type', 'application/json')
			->setBody(Zend_Json::encode($connect->getOutput()));
	}
}